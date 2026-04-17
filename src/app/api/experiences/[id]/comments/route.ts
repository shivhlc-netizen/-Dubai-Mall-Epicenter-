import { NextRequest, NextResponse } from 'next/server';
import { execute, query } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { z } from 'zod';

const commentSchema = z.object({
  comment: z.string().min(1).max(1000),
  guestName: z.string().max(100).optional(),
});

// GET /api/experiences/[id]/comments - Get comments for an experience
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);
  try {
    const comments = await query(`
      SELECT c.*, COALESCE(u.name, c.user_name, 'Guest') as user_name
      FROM experience_comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.experience_id = ? AND c.status = 'published'
      ORDER BY c.created_at ASC
    `, [id]);
    return NextResponse.json(comments);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/experiences/[id]/comments - Add a comment
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  const experience_id = parseInt(params.id);

  try {
    const body = await req.json();
    const parsed = commentSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

    const { comment, guestName } = parsed.data;
    const userId = session ? session.user.id : null;
    const userName = session ? session.user.name : (guestName || 'Guest');

    await execute(
      'INSERT INTO experience_comments (experience_id, user_id, user_name, comment) VALUES (?, ?, ?, ?)',
      [experience_id, userId, userName, comment]
    );

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
