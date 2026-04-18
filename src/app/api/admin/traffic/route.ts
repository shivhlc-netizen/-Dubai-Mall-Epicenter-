import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireManager } from '@/lib/auth';

export async function GET() {
  const session = await requireManager();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const [hourly, daily, topPages30d, topPages7d, topReferrers, recentIPs, totals] = await Promise.all([
      // Visits per hour last 24h
      query<{ hour: string; count: number }>(`
        SELECT DATE_FORMAT(created_at, '%Y-%m-%d %H:00:00') AS hour,
               COUNT(*) AS count
        FROM site_visits
        WHERE created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)
        GROUP BY hour
        ORDER BY hour ASC
      `),

      // Visits per day last 30d
      query<{ date: string; count: number }>(`
        SELECT DATE(created_at) AS date, COUNT(*) AS count
        FROM site_visits
        WHERE created_at > DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY date
        ORDER BY date ASC
      `),

      // Top pages last 30d
      query<{ path: string; count: number }>(`
        SELECT path, COUNT(*) AS count
        FROM site_visits
        WHERE created_at > DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY path
        ORDER BY count DESC
        LIMIT 15
      `),

      // Top pages last 7d
      query<{ path: string; count: number }>(`
        SELECT path, COUNT(*) AS count
        FROM site_visits
        WHERE created_at > DATE_SUB(NOW(), INTERVAL 7 DAY)
        GROUP BY path
        ORDER BY count DESC
        LIMIT 10
      `),

      // Top referrers
      query<{ referrer: string; count: number }>(`
        SELECT referrer, COUNT(*) AS count
        FROM site_visits
        WHERE referrer != '' AND referrer IS NOT NULL
          AND created_at > DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY referrer
        ORDER BY count DESC
        LIMIT 10
      `),

      // Recent unique IPs
      query<{ ip_address: string; visits: number; last_seen: string }>(`
        SELECT ip_address, COUNT(*) AS visits, MAX(created_at) AS last_seen
        FROM site_visits
        WHERE created_at > DATE_SUB(NOW(), INTERVAL 7 DAY)
        GROUP BY ip_address
        ORDER BY visits DESC
        LIMIT 20
      `),

      // Summary totals
      query<{ total: number; today: number; unique_ips: number; this_week: number }>(`
        SELECT
          COUNT(*) AS total,
          SUM(DATE(created_at) = CURDATE()) AS today,
          COUNT(DISTINCT ip_address) AS unique_ips,
          SUM(created_at > DATE_SUB(NOW(), INTERVAL 7 DAY)) AS this_week
        FROM site_visits
      `),
    ]);

    // Build user-agent device breakdown from recent visits
    const uaRaw = await query<{ user_agent: string }>(`
      SELECT user_agent FROM site_visits
      WHERE created_at > DATE_SUB(NOW(), INTERVAL 30 DAY)
        AND user_agent IS NOT NULL AND user_agent != ''
      LIMIT 5000
    `);

    const deviceCounts: Record<string, number> = { Mobile: 0, Tablet: 0, Desktop: 0, Bot: 0 };
    const browserCounts: Record<string, number> = {};

    for (const { user_agent } of uaRaw) {
      const ua = user_agent.toLowerCase();
      if (ua.includes('bot') || ua.includes('crawler') || ua.includes('spider')) {
        deviceCounts['Bot']++;
      } else if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
        deviceCounts['Mobile']++;
      } else if (ua.includes('tablet') || ua.includes('ipad')) {
        deviceCounts['Tablet']++;
      } else {
        deviceCounts['Desktop']++;
      }

      // Browser detection
      if (ua.includes('edg/')) browserCounts['Edge'] = (browserCounts['Edge'] || 0) + 1;
      else if (ua.includes('opr/') || ua.includes('opera')) browserCounts['Opera'] = (browserCounts['Opera'] || 0) + 1;
      else if (ua.includes('chrome')) browserCounts['Chrome'] = (browserCounts['Chrome'] || 0) + 1;
      else if (ua.includes('safari')) browserCounts['Safari'] = (browserCounts['Safari'] || 0) + 1;
      else if (ua.includes('firefox')) browserCounts['Firefox'] = (browserCounts['Firefox'] || 0) + 1;
      else browserCounts['Other'] = (browserCounts['Other'] || 0) + 1;
    }

    const devices = Object.entries(deviceCounts)
      .map(([device, count]) => ({ device, count }))
      .filter(d => d.count > 0)
      .sort((a, b) => b.count - a.count);

    const browsers = Object.entries(browserCounts)
      .map(([browser, count]) => ({ browser, count }))
      .sort((a, b) => b.count - a.count);

    return NextResponse.json({
      totals: totals[0] || { total: 0, today: 0, unique_ips: 0, this_week: 0 },
      hourly,
      daily,
      topPages30d,
      topPages7d,
      topReferrers,
      recentIPs,
      devices,
      browsers,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
