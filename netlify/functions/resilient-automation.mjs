// Netlify Functions v2 — ESM format
// Schedule: @daily (configured in netlify.toml)
// Health-check + system status reporter

export default async () => {
  const mem = process.memoryUsage();

  const status = {
    timestamp: new Date().toISOString(),
    service: 'Dubai Mall Epicenter',
    version: '2.0',
    status: 'OPTIMAL',
    uptime_seconds: process.uptime(),
    memory: {
      heap_used_mb: (mem.heapUsed / 1024 / 1024).toFixed(2),
      heap_total_mb: (mem.heapTotal / 1024 / 1024).toFixed(2),
      rss_mb: (mem.rss / 1024 / 1024).toFixed(2),
    },
    checks: {
      gemini_key: !!process.env.GEMINI_API_KEY,
      db_host: !!process.env.DB_HOST,
      smtp: !!process.env.SMTP_USER,
      nextauth_secret: !!process.env.NEXTAUTH_SECRET,
    },
    automation_hooks: [
      'PULSE_CRON_ACTIVE',
      'WEEKLY_DIGEST_READY',
      'TOKEN_CLEANUP_READY',
      'CACHE_REFRESH_READY',
    ],
  };

  const allChecksGreen = Object.values(status.checks).every(Boolean);
  status.status = allChecksGreen ? 'OPTIMAL' : 'DEGRADED';

  console.log('[AUTOMATION]', JSON.stringify(status, null, 2));

  return new Response(JSON.stringify({ ok: true, data: status }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
