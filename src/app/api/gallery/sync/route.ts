import { NextRequest, NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

const GALLERY_DIR = () => path.join(process.cwd(), 'public', 'gallery');

// GET — preview: returns files on disk that are NOT yet in the DB
export async function GET(_req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const dir = GALLERY_DIR();
  if (!fs.existsSync(dir)) return NextResponse.json({ pending: [] });

  const files = fs.readdirSync(dir).filter(f => /\.(jpg|jpeg|png|webp|gif)$/i.test(f));

  const pending: { filename: string; path: string; size: number }[] = [];
  for (const file of files) {
    const rows = await query('SELECT id FROM gallery_images WHERE filename = ?', [file]);
    if (rows.length === 0) {
      const stat = fs.statSync(path.join(dir, file));
      pending.push({ filename: file, path: `/gallery/${file}`, size: stat.size });
    }
  }

  return NextResponse.json({ pending, total: files.length });
}

// POST — sync only the filenames the admin explicitly selected
export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const filenames: string[] = Array.isArray(body.filenames) ? body.filenames : [];

  if (filenames.length === 0) {
    return NextResponse.json({ ok: true, added: 0 });
  }

  const cats = await query<{ id: number }>('SELECT id FROM gallery_categories WHERE slug = "general" LIMIT 1');
  const defaultCatId = cats[0]?.id ?? null;
  const userId = (session.user as any).id;

  let added = 0;
  const dir = GALLERY_DIR();

  for (const file of filenames) {
    // Sanitise — no path traversal
    const safe = path.basename(file);
    if (!fs.existsSync(path.join(dir, safe))) continue;

    const exists = await query('SELECT id FROM gallery_images WHERE filename = ?', [safe]);
    if (exists.length > 0) continue;

    const title = safe.replace(/[-_.]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).split('.')[0];
    await execute(
      'INSERT INTO gallery_images (filename, path, title, category_id, active, uploaded_by) VALUES (?,?,?,?,1,?)',
      [safe, `/gallery/${safe}`, title, defaultCatId, userId]
    );
    added++;
  }

  return NextResponse.json({ ok: true, added });
}
