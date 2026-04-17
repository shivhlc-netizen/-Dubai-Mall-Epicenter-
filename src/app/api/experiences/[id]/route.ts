import { NextRequest, NextResponse } from 'next/server';
import { execute, queryOne } from '@/lib/db';
import { getSession, requireManager } from '@/lib/auth';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = parseInt(params.id);
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

  try {
    // Check if user is owner or manager/admin
    const experience = await queryOne<{ user_id: number }>(
      'SELECT user_id FROM user_experiences WHERE id = ?',
      [id]
    );

    if (!experience) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const isOwner = Number(experience.user_id) === Number(session.user.id);
    const isManager = session.user.role === 'admin' || session.user.role === 'manager';

    if (!isOwner && !isManager) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await execute('DELETE FROM user_experiences WHERE id = ?', [id]);
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/experiences/[id] - Moderate
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireManager();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const id = parseInt(params.id);
  try {
    const { status, is_featured_on_home } = await req.json();
    const sets: string[] = [];
    const vals: any[] = [];

    if (status !== undefined) { sets.push('status = ?'); vals.push(status); }
    if (is_featured_on_home !== undefined) { sets.push('is_featured_on_home = ?'); vals.push(is_featured_on_home ? 1 : 0); }

    if (sets.length === 0) return NextResponse.json({ error: 'No fields' }, { status: 400 });

    vals.push(id);
    await execute(`UPDATE user_experiences SET ${sets.join(', ')} WHERE id = ?`, vals);
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
