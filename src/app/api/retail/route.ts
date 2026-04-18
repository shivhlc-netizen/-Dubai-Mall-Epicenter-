import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

// Tier limits: how many stores each role can see
const TIER_LIMIT: Record<string, number> = {
  admin:   100,
  manager: 100,
  premium:  50,
  user:     20,
  guest:    20,
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const featuredOnly = searchParams.get('featured') === 'true';

    // Determine user role
    let role = 'guest';
    try {
      const session = await getSession();
      if (session?.user) {
        const isPremium = (session.user as any).is_premium;
        const r = session.user.role as string;
        role = (r === 'admin' || r === 'manager') ? r : isPremium ? 'premium' : 'user';
      }
    } catch { /* unauthenticated — guest */ }

    const limit = TIER_LIMIT[role] ?? 20;

    // Tier boundary: tier 1 = all, tier 2 = premium+, tier 3 = admin only
    let tierMax = 1;
    if (role === 'premium') tierMax = 2;
    if (role === 'admin' || role === 'manager') tierMax = 3;

    let where = 'tier <= ?';
    const params: any[] = [tierMax];

    if (featuredOnly) {
      where += ' AND is_featured = 1';
    }

    const shops = await query(
      `SELECT
         id, fortune_rank, name, category, category_slug, description,
         website_url, floor_level, tier, is_featured,
         offline_rank, online_rank,
         annual_footfall_m, offline_revenue_m, online_revenue_m, yoy_growth
       FROM retail_shops
       WHERE ${where}
       ORDER BY fortune_rank ASC
       LIMIT ?`,
      [...params, limit]
    );

    return NextResponse.json({
      shops,
      meta: {
        role,
        limit,
        tierMax,
        total: shops.length,
      },
    });
  } catch (error: any) {
    console.error('Retail API error:', error.message);
    return NextResponse.json({ error: 'Failed to fetch retail data' }, { status: 500 });
  }
}
