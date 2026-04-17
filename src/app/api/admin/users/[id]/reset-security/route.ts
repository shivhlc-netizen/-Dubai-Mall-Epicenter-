import { NextRequest, NextResponse } from 'next/server';
import { execute } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const userId = params.id;

  try {
    await execute(
      'UPDATE users SET failed_attempts = 0, lock_until = NULL WHERE id = ?',
      [userId]
    );

    return NextResponse.json({ ok: true, message: 'Security counters reset' });
  } catch (error: any) {
    console.error('Reset security error:', error.message);
    return NextResponse.json({ error: 'Failed to reset security counters' }, { status: 500 });
  }
}
