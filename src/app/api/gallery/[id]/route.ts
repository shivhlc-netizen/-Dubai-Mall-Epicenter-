import { NextRequest, NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';
import { requireManager } from '@/lib/auth';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';

const patchSchema = z.object({
  title:          z.string().min(1).max(200).optional(),
  description:    z.string().max(1000).optional(),
  alt_text:       z.string().max(300).optional(),
  story:          z.string().max(2000).optional(),
  emotional_hook: z.string().max(300).optional(),
  shift_style:    z.enum(['spotlight','story','filmstrip','mosaic','editorial']).optional(),
  category_id:    z.number().int().positive().nullable().optional(),
  story_id:       z.number().int().positive().nullable().optional(),
  visual_config:  z.record(z.string(), z.any()).nullable().optional(),
  sort_order:     z.number().int().min(0).optional(),
  active:         z.boolean().optional(),
  featured:       z.boolean().optional(),
});

// GET /api/gallery/[id]
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id, 10);
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

  const rows = await query(
    `SELECT gi.*, gc.name AS category_name, gc.slug AS category_slug
     FROM gallery_images gi
     LEFT JOIN gallery_categories gc ON gi.category_id = gc.id
     WHERE gi.id = ?`,
    [id]
  );
  if (!rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(rows[0]);
}

// PATCH /api/gallery/[id] — manager
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireManager();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const id = parseInt(params.id, 10);
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

  try {
    const body  = await req.json();
    const data  = patchSchema.parse(body);
    const sets: string[] = [];
    const vals: unknown[] = [];

    if (data.title          !== undefined) { sets.push('title = ?');          vals.push(data.title); }
    if (data.description    !== undefined) { sets.push('description = ?');    vals.push(data.description); }
    if (data.alt_text       !== undefined) { sets.push('alt_text = ?');       vals.push(data.alt_text); }
    if (data.story          !== undefined) { sets.push('story = ?');          vals.push(data.story); }
    if (data.emotional_hook !== undefined) { sets.push('emotional_hook = ?'); vals.push(data.emotional_hook); }
    if (data.shift_style    !== undefined) { sets.push('shift_style = ?');    vals.push(data.shift_style); }
    if (data.category_id    !== undefined) { sets.push('category_id = ?');    vals.push(data.category_id); }
    if (data.story_id       !== undefined) { sets.push('story_id = ?');       vals.push(data.story_id); }
    if (data.visual_config  !== undefined) { sets.push('visual_config = ?');  vals.push(data.visual_config ? JSON.stringify(data.visual_config) : null); }
    if (data.sort_order     !== undefined) { sets.push('sort_order = ?');     vals.push(data.sort_order); }
    if (data.active         !== undefined) { sets.push('active = ?');         vals.push(data.active ? 1 : 0); }
    if (data.featured       !== undefined) { sets.push('featured = ?');       vals.push(data.featured ? 1 : 0); }

    if (!sets.length) return NextResponse.json({ error: 'No fields to update' }, { status: 400 });

    vals.push(id);
    await execute(`UPDATE gallery_images SET ${sets.join(', ')} WHERE id = ?`, vals);
    const updated = await query('SELECT * FROM gallery_images WHERE id = ?', [id]);
    return NextResponse.json(updated[0]);
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: e.issues }, { status: 400 });
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}

// DELETE /api/gallery/[id] — manager: hard delete from DB + remove file from disk
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireManager();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const id = parseInt(params.id, 10);
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

  const rows = await query<{ filename: string; path: string }>('SELECT filename, path FROM gallery_images WHERE id = ?', [id]);
  if (!rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Remove physical file
  const abs = path.join(process.cwd(), 'public', rows[0].path);
  try { if (fs.existsSync(abs)) fs.unlinkSync(abs); } catch { /* file already gone */ }

  await execute('DELETE FROM gallery_images WHERE id = ?', [id]);
  return NextResponse.json({ ok: true });
}
