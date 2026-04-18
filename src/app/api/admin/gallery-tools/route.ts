/**
 * Gallery Tool Management Kit API
 * GET  /api/admin/gallery-tools          — fetch all images with visibility + feature status
 * POST /api/admin/gallery-tools/bulk     — bulk visibility/feature/event operations
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { query, execute } from '@/lib/db';

export async function GET(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const { searchParams } = req.nextUrl;
    const category = searchParams.get('category') || 'all';
    const view     = searchParams.get('view') || 'all'; // all | active | hidden | featured | event

    let where = '1=1';
    const params: unknown[] = [];

    if (category !== 'all') {
      where += ' AND gc.slug = ?';
      params.push(category);
    }
    if (view === 'active')   { where += ' AND gi.active = 1'; }
    if (view === 'hidden')   { where += ' AND gi.active = 0'; }
    if (view === 'featured') { where += ' AND gi.featured = 1'; }
    if (view === 'event')    { where += ' AND gi.shift_style = "event"'; }

    const imagesPromise = query(
      `SELECT gi.id, gi.filename, gi.path, gi.title, gi.emotional_hook, gi.shift_style,
              gi.active, gi.featured, gi.sort_order, gi.media_type,
              gc.name AS category_name, gc.slug AS category_slug
       FROM gallery_images gi
       LEFT JOIN gallery_categories gc ON gi.category_id = gc.id
       WHERE ${where}
       ORDER BY gi.featured DESC, gi.active DESC, gi.sort_order ASC, gi.id ASC
       LIMIT 500`,
      params
    );

    const statsPromise = query<{ total: number; active: number; featured: number; hidden: number }>(
      `SELECT COUNT(*) AS total,
              SUM(active=1) AS active,
              SUM(featured=1) AS featured,
              SUM(active=0) AS hidden
       FROM gallery_images`
    );

    const categoriesPromise = query(
      `SELECT gc.id, gc.name, gc.slug, COUNT(gi.id) AS count
       FROM gallery_categories gc
       LEFT JOIN gallery_images gi ON gi.category_id = gc.id
       GROUP BY gc.id ORDER BY gc.id`
    );

    const [images, statsResults, categories] = await Promise.all([
      imagesPromise,
      statsPromise,
      categoriesPromise
    ]);

    const stats = statsResults[0] || { total: 0, active: 0, featured: 0, hidden: 0 };

    return NextResponse.json({ images, stats, categories });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH — update a single image (visibility, featured, shift_style)
export async function PATCH(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const { id, active, featured, shift_style, title, sort_order } = body;

  const sets: string[] = [];
  const vals: unknown[] = [];

  if (active   !== undefined) { sets.push('active = ?');      vals.push(active ? 1 : 0); }
  if (featured !== undefined) { sets.push('featured = ?');    vals.push(featured ? 1 : 0); }
  if (shift_style)            { sets.push('shift_style = ?'); vals.push(shift_style); }
  if (title)                  { sets.push('title = ?');       vals.push(title); }
  if (sort_order !== undefined){ sets.push('sort_order = ?'); vals.push(sort_order); }

  if (sets.length === 0) return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
  vals.push(id);

  await execute(`UPDATE gallery_images SET ${sets.join(', ')} WHERE id = ?`, vals);
  return NextResponse.json({ ok: true });
}
