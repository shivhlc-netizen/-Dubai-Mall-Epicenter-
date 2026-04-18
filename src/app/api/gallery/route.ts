import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireManager } from '@/lib/auth';
import { z } from 'zod';

const updateSchema = z.object({
  title:       z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  alt_text:    z.string().max(300).optional(),
  category_id: z.number().int().positive().optional(),
  sort_order:  z.number().int().min(0).optional(),
  active:      z.boolean().optional(),
});

// GET /api/gallery  — public
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    const page     = Math.max(1, parseInt(searchParams.get('page')  || '1',  10));
    // Public site gallery is capped at 50 (admin curates via gallery-tools)
    const limit    = Math.min(50, parseInt(searchParams.get('limit') || '50', 10));
    const offset   = (page - 1) * limit;

    let where   = 'gi.active = 1';
    const params: unknown[] = [];

    if (category && category !== 'all') {
      where += ' AND gc.slug = ?';
      params.push(category);
    }
    if (featured === '1') {
      where += ' AND gi.featured = 1';
    }

    const imagesPromise = query(
      `SELECT gi.id, gi.filename, gi.path, gi.title, gi.description, gi.alt_text,
              gi.story, gi.emotional_hook, gi.shift_style, gi.featured,
              gi.sort_order, gi.active, gi.visual_config, gi.story_id,
              gi.media_type,
              gc.name AS category_name, gc.slug AS category_slug
       FROM   gallery_images gi
       LEFT JOIN gallery_categories gc ON gi.category_id = gc.id
       WHERE  ${where}
       ORDER BY gi.sort_order ASC, gi.id ASC
       LIMIT  ${Number(limit)} OFFSET ${Number(offset)}`,
      params
    );

    const totalPromise = query<{ total: number }>(
      `SELECT COUNT(*) AS total
       FROM   gallery_images gi
       LEFT JOIN gallery_categories gc ON gi.category_id = gc.id
       WHERE  ${where}`,
      params
    );

    const categoriesPromise = query(
      'SELECT id, name, slug FROM gallery_categories ORDER BY sort_order ASC'
    );

    const [images, totalResults, categories] = await Promise.all([
      imagesPromise,
      totalPromise,
      categoriesPromise
    ]);

    const { total } = totalResults[0] || { total: 0 };

    return NextResponse.json({ images, categories, total, page, limit });
  } catch (err: any) {
    console.error('Gallery Fetch Error:', err.message);
    return NextResponse.json({ error: 'Failed to load gallery' }, { status: 500 });
  }
}

// PATCH /api/gallery  — bulk update sort order (manager)
export async function PATCH(req: NextRequest) {
  const session = await requireManager();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const body = await req.json();
    const items = z.array(z.object({ id: z.number(), sort_order: z.number() })).parse(body);

    await Promise.all(
      items.map(({ id, sort_order }) =>
        query('UPDATE gallery_images SET sort_order = ? WHERE id = ?', [sort_order, id])
      )
    );
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

// POST /api/gallery  — bulk update visual config (manager)
export async function POST(req: NextRequest) {
  const session = await requireManager();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const body = await req.json();
    const { items } = z.object({
      items: z.array(z.object({
        id: z.number(),
        visual_config: z.record(z.string(), z.any())
      }))
    }).parse(body);

    await Promise.all(
      items.map(({ id, visual_config }) =>
        query(
          'UPDATE gallery_images SET visual_config = ? WHERE id = ?',
          [JSON.stringify(visual_config), id]
        )
      )
    );
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
