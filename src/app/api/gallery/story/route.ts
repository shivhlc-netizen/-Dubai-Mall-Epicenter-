import { NextRequest, NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { z } from 'zod';

const storySchema = z.object({
  title:     z.string().min(1).max(200).optional(),
  narrative: z.string().max(5000).optional(),
});

// GET /api/gallery/story — public
export async function GET() {
  const rows = await query('SELECT * FROM gallery_story LIMIT 1');
  if (!rows[0]) {
    return NextResponse.json({ title: 'The Dubai Mall Story', narrative: '' });
  }
  return NextResponse.json(rows[0]);
}

// PUT /api/gallery/story — admin upsert
export async function PUT(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const body = await req.json();
    const data = storySchema.parse(body);

    const existing = await query('SELECT id FROM gallery_story LIMIT 1');
    if (existing.length === 0) {
      await execute(
        'INSERT INTO gallery_story (title, narrative) VALUES (?, ?)',
        [data.title ?? 'The Dubai Mall Story', data.narrative ?? '']
      );
    } else {
      const sets: string[] = [];
      const vals: unknown[] = [];
      if (data.title     !== undefined) { sets.push('title = ?');     vals.push(data.title); }
      if (data.narrative !== undefined) { sets.push('narrative = ?'); vals.push(data.narrative); }
      if (sets.length) {
        const id = (existing[0] as any).id;
        await execute(`UPDATE gallery_story SET ${sets.join(', ')} WHERE id = ?`, [...vals, id]);
      }
    }

    const updated = await query('SELECT * FROM gallery_story LIMIT 1');
    return NextResponse.json(updated[0]);
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: e.issues }, { status: 400 });
    return NextResponse.json({ error: 'Save failed' }, { status: 500 });
  }
}
