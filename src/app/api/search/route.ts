import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const q = searchParams.get('q');

    if (!q || q.length < 2) {
      return NextResponse.json({ results: [] });
    }

    // Search across Retail Shops and Experiences
    const results = await query(
      `
      (SELECT name, 'shop' as type, '/retail' as link FROM retail_shops WHERE name LIKE ?)
      UNION
      (SELECT title as name, 'attraction' as type, '/attractions' as link FROM user_experiences WHERE title LIKE ?)
      LIMIT 10
      `,
      [`%${q}%`, `%${q}%`]
    );

    return NextResponse.json({ results });
  } catch (err: any) {
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
