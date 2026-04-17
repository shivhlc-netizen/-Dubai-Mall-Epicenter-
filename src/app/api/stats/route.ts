import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { requireManager } from '@/lib/auth';

export async function GET() {
  const session = await requireManager();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const [
      [imageStats],
      [userStats],
      [catStats],
      recentImages,
      [visitStats],
      activePages,
      activePages7d,
      recentActivity
    ] = await Promise.all([
      query<{ total: number; active: number; inactive: number }>(
        `SELECT COUNT(*) AS total,
                SUM(active=1) AS active,
                SUM(active=0) AS inactive
         FROM gallery_images`
      ),
      query<{ total: number; admins: number; users: number; active_users: number }>(
        `SELECT COUNT(*) AS total,
                SUM(role='admin') AS admins,
                SUM(role='user')  AS users,
                SUM(active=1)     AS active_users
         FROM users`
      ),
      query<{ total: number }>(
        'SELECT COUNT(*) AS total FROM gallery_categories WHERE slug != "all"'
      ),
      query(
        `SELECT gi.id, gi.filename, gi.path, gi.title, gc.name AS category, gi.created_at
         FROM gallery_images gi
         LEFT JOIN gallery_categories gc ON gi.category_id = gc.id
         ORDER BY gi.created_at DESC LIMIT 6`
      ),
      query<{ total: number }>('SELECT COUNT(*) as total FROM site_visits'),
      query<{ path: string, count: number }>(`
        SELECT path, COUNT(*) as count 
        FROM site_visits 
        WHERE created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)
        GROUP BY path
        ORDER BY count DESC
        LIMIT 5
      `),
      query<{ path: string, count: number }>(`
        SELECT path, COUNT(*) as count 
        FROM site_visits 
        WHERE created_at > DATE_SUB(NOW(), INTERVAL 7 DAY)
        GROUP BY path
        ORDER BY count DESC
        LIMIT 5
      `),
      query<{ path: string, created_at: string, user_agent: string }>(`
        SELECT path, created_at, user_agent 
        FROM site_visits 
        ORDER BY created_at DESC 
        LIMIT 10
      `)
    ]);

    return NextResponse.json({
      images:       imageStats,
      users:        userStats,
      categories:   catStats,
      recentImages,
      visits:       visitStats.total,
      activePages,
      activePages7d,
      recentActivity
    });
  } catch (error: any) {
    console.error('Stats error:', error.message);
    return NextResponse.json({ error: 'Failed to load stats' }, { status: 500 });
  }
}
