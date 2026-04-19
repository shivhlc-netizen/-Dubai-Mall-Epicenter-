// Netlify Functions v2 — Refresh pulse news cache every 6 hours
// Pings the /api/pulse endpoint to warm up the DB connection pool
// Schedule: Every 6 hours (configured in netlify.toml)

export default async () => {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://dubai-mall-epicenter.netlify.app';

  try {
    const res = await fetch(`${baseUrl}/api/pulse`, {
      headers: { 'User-Agent': 'Netlify-CacheWarmer/1.0' },
      signal: AbortSignal.timeout(10000),
    });
    const data = await res.json();
    console.log('[CACHE-REFRESH] Pulse warmed —', Array.isArray(data) ? `${data.length} items` : 'ok');
    return new Response(JSON.stringify({ ok: true, items: Array.isArray(data) ? data.length : 0 }), { status: 200 });
  } catch (err) {
    console.error('[CACHE-REFRESH] Failed:', err.message);
    return new Response(JSON.stringify({ ok: false, error: err.message }), { status: 200 });
  }
};
