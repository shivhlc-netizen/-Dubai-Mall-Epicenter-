import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const featured = searchParams.get('featured');
    
    let sql = 'SELECT * FROM retail_shops';
    const params: any[] = [];

    if (featured === 'true') {
      sql += ' WHERE is_featured = 1';
    }

    sql += ' ORDER BY name ASC';

    const shops = await query(sql, params);
    return NextResponse.json(shops);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch shops' }, { status: 500 });
  }
}
