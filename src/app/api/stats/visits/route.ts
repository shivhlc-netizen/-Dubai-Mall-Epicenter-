import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';

export async function GET() {
  try {
    // Parallelize analytical queries for performance
    const [totalRow, activePages, recentActivity] = await Promise.all([
      // 1. Get total visits
      queryOne<{ total: number }>('SELECT COUNT(*) as total FROM site_visits'),
      
      // 2. Get active pages in last hour
      query<{ path: string, count: number }>(`
        SELECT path, COUNT(*) as count 
        FROM site_visits 
        WHERE created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)
        GROUP BY path
        ORDER BY count DESC
        LIMIT 10
      `),

      // 3. Get recent activity paths only
      query<{ path: string, created_at: string }>(`
        SELECT path, created_at
        FROM site_visits
        ORDER BY created_at DESC
        LIMIT 5
      `)
    ]);

    return NextResponse.json({ 
      count: Math.floor((totalRow?.total || 0) / 2),
      activePages,
      recentActivity
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
