import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireManager } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await requireManager();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') || 'all';
  const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 200);

  try {
    const whereClause = status !== 'all' ? `AND c.status = '${status}'` : '';

    const comments = await query<any>(`
      SELECT c.id, c.experience_id, c.user_name, c.comment, c.status, c.created_at,
             e.title AS experience_title
      FROM experience_comments c
      LEFT JOIN user_experiences e ON c.experience_id = e.id
      WHERE 1=1 ${whereClause}
      ORDER BY c.created_at DESC
      LIMIT ${limit}
    `);

    const [counts] = await query<{ pending: number; published: number; total: number }>(`
      SELECT
        SUM(status = 'pending') AS pending,
        SUM(status = 'published') AS published,
        COUNT(*) AS total
      FROM experience_comments
    `);

    return NextResponse.json({ comments, counts });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
