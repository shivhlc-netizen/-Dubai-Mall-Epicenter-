import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { queryOne } from '@/lib/db';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const user = await queryOne<{ api_budget: number; api_used: number }>(
      'SELECT api_budget, api_used FROM users WHERE id = ?',
      [parseInt(session.user.id, 10)]
    );

    return NextResponse.json({
      remaining: (user?.api_budget || 0) - (user?.api_used || 0),
      used: user?.api_used || 0,
      total: user?.api_budget || 0
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch budget' }, { status: 500 });
  }
}
