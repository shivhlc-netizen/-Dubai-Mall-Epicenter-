import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';

export async function GET() {
  try {
    // 1. Get total visits
    const totalRow = await queryOne<{ total: number }>('SELECT COUNT(*) as total FROM site_visits');
    
    // 2. Get active pages in last hour
    const activePages = await query<{ path: string, count: number }>(`
      SELECT path, COUNT(*) as count 
      FROM site_visits 
      WHERE created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)
      GROUP BY path
      ORDER BY count DESC
      LIMIT 10
    `);

    // 3. Get recent user activity (UX tracking)
    const recentActivity = await query<{ path: string, created_at: string, user_agent: string }>(`
      SELECT path, created_at, user_agent 
      FROM site_visits 
      ORDER BY created_at DESC 
      LIMIT 5
    `);

    return NextResponse.json({ 
      count: Math.floor((totalRow?.total || 0) / 2),
      activePages,
      recentActivity
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
