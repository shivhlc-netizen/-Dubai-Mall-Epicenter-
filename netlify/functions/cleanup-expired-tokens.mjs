// Netlify Functions v2 — Cleanup expired verification tokens + stale sessions
// Schedule: Daily 2am UTC (configured in netlify.toml)

import mysql from 'mysql2/promise';

export default async () => {
  console.log('[CLEANUP] Token cleanup START', new Date().toISOString());

  if (!process.env.DB_HOST || !process.env.DB_USER) {
    console.warn('[CLEANUP] No DB config — skipping');
    return new Response(JSON.stringify({ ok: false, reason: 'no_db' }), { status: 200 });
  }

  let conn;
  const stats = { verification_tokens: 0, sessions: 0, pending_experiences: 0 };

  try {
    conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
    });

    // Remove expired OTP verification tokens (older than 1 hour)
    const [tokensResult] = await conn.execute(
      "DELETE FROM verification_tokens WHERE created_at < NOW() - INTERVAL 1 HOUR"
    ).catch(() => [{ affectedRows: 0 }]);
    stats.verification_tokens = tokensResult.affectedRows || 0;

    // Remove stale password reset tokens (older than 24 hours)
    await conn.execute(
      "DELETE FROM password_resets WHERE created_at < NOW() - INTERVAL 24 HOUR"
    ).catch(() => {});

    // Remove very old rejected experiences (older than 30 days)
    const [expResult] = await conn.execute(
      "DELETE FROM experiences WHERE status = 'rejected' AND created_at < NOW() - INTERVAL 30 DAY"
    ).catch(() => [{ affectedRows: 0 }]);
    stats.pending_experiences = expResult.affectedRows || 0;

    console.log('[CLEANUP] Done:', stats);
  } catch (err) {
    console.error('[CLEANUP] DB error:', err.message);
    return new Response(JSON.stringify({ ok: false, error: err.message }), { status: 500 });
  } finally {
    await conn?.end();
  }

  return new Response(JSON.stringify({ ok: true, cleaned: stats, timestamp: new Date().toISOString() }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
