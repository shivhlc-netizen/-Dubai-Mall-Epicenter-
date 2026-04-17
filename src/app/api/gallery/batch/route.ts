import { NextRequest, NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';

const MIN_BATCH = 1;
const MAX_BATCH = 20;

const batchPatchSchema = z.object({
  ids:      z.array(z.number().int().positive()).min(MIN_BATCH).max(MAX_BATCH),
  active:   z.boolean().optional(),
  featured: z.boolean().optional(),
});

const batchDeleteSchema = z.object({
  ids: z.array(z.number().int().positive()).min(MIN_BATCH).max(MAX_BATCH),
});

// PATCH /api/gallery/batch — bulk feature / hide (admin)
export async function PATCH(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const body = await req.json();
    const { ids, active, featured } = batchPatchSchema.parse(body);

    if (active === undefined && featured === undefined) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const sets: string[] = [];
    const baseVals: unknown[] = [];
    if (active   !== undefined) { sets.push('active = ?');   baseVals.push(active ? 1 : 0); }
    if (featured !== undefined) { sets.push('featured = ?'); baseVals.push(featured ? 1 : 0); }

    const placeholders = ids.map(() => '?').join(',');
    await execute(
      `UPDATE gallery_images SET ${sets.join(', ')} WHERE id IN (${placeholders})`,
      [...baseVals, ...ids]
    );

    const updated = await query(
      `SELECT id, active, featured FROM gallery_images WHERE id IN (${placeholders})`,
      ids
    );
    return NextResponse.json({ ok: true, updated });
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: e.issues }, { status: 400 });
    return NextResponse.json({ error: 'Batch update failed' }, { status: 500 });
  }
}

// DELETE /api/gallery/batch — hard delete multiple images (admin)
export async function DELETE(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const body = await req.json();
    const { ids } = batchDeleteSchema.parse(body);

    const placeholders = ids.map(() => '?').join(',');
    const rows = await query<{ id: number; path: string }>(
      `SELECT id, path FROM gallery_images WHERE id IN (${placeholders})`,
      ids
    );

    for (const row of rows) {
      const abs = path.join(process.cwd(), 'public', row.path);
      try { if (fs.existsSync(abs)) fs.unlinkSync(abs); } catch { /* already gone */ }
    }

    await execute(`DELETE FROM gallery_images WHERE id IN (${placeholders})`, ids);
    return NextResponse.json({ ok: true, deleted: rows.length });
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: e.issues }, { status: 400 });
    return NextResponse.json({ error: 'Batch delete failed' }, { status: 500 });
  }
}
