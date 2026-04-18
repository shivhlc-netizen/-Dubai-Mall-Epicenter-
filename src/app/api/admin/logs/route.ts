import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireManager } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await requireManager();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = 50;
  const offset = (page - 1) * limit;
  const pathFilter = searchParams.get('path') || '';
  const ipFilter = searchParams.get('ip') || '';

  try {
    const whereConditions: string[] = [];
    const params: (string | number)[] = [];

    if (pathFilter) {
      whereConditions.push('path LIKE ?');
      params.push(`%${pathFilter}%`);
    }
    if (ipFilter) {
      whereConditions.push('ip_address LIKE ?');
      params.push(`%${ipFilter}%`);
    }

    const whereClause = whereConditions.length > 0
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    const [logs, [countRow]] = await Promise.all([
      query<{
        id: number;
        ip_address: string;
        user_agent: string;
        path: string;
        referrer: string;
        created_at: string;
      }>(`
        SELECT id, ip_address, user_agent, path, referrer, created_at
        FROM site_visits
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `, params),
      query<{ total: number }>(`SELECT COUNT(*) AS total FROM site_visits ${whereClause}`, params),
    ]);

    return NextResponse.json({
      logs,
      total: countRow?.total || 0,
      page,
      pages: Math.ceil((countRow?.total || 0) / limit),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
