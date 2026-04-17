/**
 * Site Curation API — enforces 10-50 published image limit
 * GET  /api/admin/gallery-tools/curate — published images + library images
 * POST /api/admin/gallery-tools/curate — publish/unpublish batch with limit validation
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { query, execute } from '@/lib/db';

const SITE_MIN = 10;
const SITE_MAX = 50;

export async function GET(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const published = await query(
    `SELECT gi.id, gi.path, gi.title, gi.emotional_hook, gi.shift_style, gi.featured,
            gi.sort_order, gi.media_type, gc.name AS category_name
     FROM gallery_images gi LEFT JOIN gallery_categories gc ON gi.category_id = gc.id
     WHERE gi.active = 1
     ORDER BY gi.sort_order ASC, gi.id ASC`
  );

  const library = await query(
    `SELECT gi.id, gi.path, gi.title, gi.emotional_hook, gi.shift_style, gi.featured,
            gi.media_type, gc.name AS category_name
     FROM gallery_images gi LEFT JOIN gallery_categories gc ON gi.category_id = gc.id
     WHERE gi.active = 0
     ORDER BY gi.id DESC
     LIMIT 200`
  );

  return NextResponse.json({
    published,
    library,
    publishedCount: (published as any[]).length,
    min: SITE_MIN,
    max: SITE_MAX,
  });
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { publish, unpublish } = await req.json() as { publish?: number[]; unpublish?: number[] };

  // Get current published count
  const [{ cnt }] = await query<{ cnt: number }>('SELECT COUNT(*) AS cnt FROM gallery_images WHERE active = 1');
  let current = Number(cnt);

  if (publish?.length) {
    const newCount = current + publish.length;
    if (newCount > SITE_MAX)
      return NextResponse.json({ error: `Cannot publish: would exceed maximum of ${SITE_MAX} images (currently ${current}, adding ${publish.length}).` }, { status: 422 });
    await execute(
      `UPDATE gallery_images SET active = 1 WHERE id IN (${publish.map(() => '?').join(',')})`,
      publish
    );
    current = newCount;
  }

  if (unpublish?.length) {
    const newCount = current - unpublish.length;
    if (newCount < SITE_MIN)
      return NextResponse.json({ error: `Cannot unpublish: would drop below minimum of ${SITE_MIN} images (currently ${current}, removing ${unpublish.length}).` }, { status: 422 });
    await execute(
      `UPDATE gallery_images SET active = 0 WHERE id IN (${unpublish.map(() => '?').join(',')})`,
      unpublish
    );
    current = newCount;
  }

  return NextResponse.json({ ok: true, publishedCount: current });
}
