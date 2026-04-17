// Netlify scheduled function — runs every hour
// Triggers the weekly rollup check via internal API call
export const config = {
  schedule: '0 * * * *', // every hour
};

export default async function handler(req) {
  const siteUrl = process.env.URL || process.env.NEXTAUTH_URL || 'http://localhost:5001';
  const secret  = process.env.CRON_SECRET || '';

  try {
    const res = await fetch(`${siteUrl}/api/admin/ai-usage/aggregate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-cron-secret': secret,
      },
    });
    const data = await res.json();
    console.log('[cron] ai-usage aggregate:', data.message);
  } catch (err) {
    console.error('[cron] ai-usage aggregate failed:', err);
  }
}
