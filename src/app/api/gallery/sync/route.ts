import { NextRequest, NextResponse } from 'next/server';
import { query, execute, queryOne } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

const GALLERY_DIR = () => path.join(process.cwd(), 'public', 'gallery');

const IMAGE_EXT = /\.(jpg|jpeg|png|webp|gif)$/i;
const VIDEO_EXT = /\.(mp4|webm|mov)$/i;

function detectMediaType(filename: string): 'image' | 'video' {
  return VIDEO_EXT.test(filename) ? 'video' : 'image';
}

function prettyTitle(filename: string) {
  return filename
    .replace(/\.[^.]+$/, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    .trim();
}

// GET — preview: files on disk NOT in DB, plus registered image→user mapping
export async function GET(_req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const dir = GALLERY_DIR();
  if (!fs.existsSync(dir)) return NextResponse.json({ pending: [], registered: [], total: 0 });

  const allFiles = fs.readdirSync(dir).filter(f => IMAGE_EXT.test(f) || VIDEO_EXT.test(f));

  const pending: {
    filename: string;
    path: string;
    size: number;
    sizeKb: string;
    media_type: 'image' | 'video';
    modified: string;
    suggestedTitle: string;
  }[] = [];

  const registered: {
    filename: string;
    path: string;
    title: string;
    media_type: string;
    uploader_id: number | null;
    uploader_name: string | null;
    uploader_email: string | null;
    active: number;
    featured: number;
    created_at: string;
  }[] = [];

  for (const file of allFiles) {
    const filePath = path.join(dir, file);
    const stat     = fs.statSync(filePath);

    const rows = await query<{
      id: number; title: string; media_type: string;
      active: number; featured: number; created_at: string;
      uploader_id: number | null; uploader_name: string | null; uploader_email: string | null;
    }>(
      `SELECT gi.id, gi.title, gi.media_type, gi.active, gi.featured, gi.created_at,
              gi.uploaded_by AS uploader_id,
              u.name         AS uploader_name,
              u.email        AS uploader_email
       FROM gallery_images gi
       LEFT JOIN users u ON u.id = gi.uploaded_by
       WHERE gi.filename = ? LIMIT 1`,
      [file]
    );

    if (rows.length === 0) {
      pending.push({
        filename:      file,
        path:          `/gallery/${file}`,
        size:          stat.size,
        sizeKb:        (stat.size / 1024).toFixed(0) + ' KB',
        media_type:    detectMediaType(file),
        modified:      stat.mtime.toISOString(),
        suggestedTitle: prettyTitle(file),
      });
    } else {
      const r = rows[0];
      registered.push({
        filename:      file,
        path:          `/gallery/${file}`,
        title:         r.title,
        media_type:    r.media_type,
        active:        r.active,
        featured:      r.featured,
        created_at:    r.created_at,
        uploader_id:   r.uploader_id,
        uploader_name: r.uploader_name,
        uploader_email: r.uploader_email,
      });
    }
  }

  // Current admin info
  const adminUser = await queryOne<{ id: number; name: string; email: string }>(
    'SELECT id, name, email FROM users WHERE id = ? LIMIT 1',
    [(session.user as any).id]
  );

  return NextResponse.json({
    pending,
    registered,
    total: allFiles.length,
    pendingCount:    pending.length,
    registeredCount: registered.length,
    willBeOwnedBy: adminUser ? { id: adminUser.id, name: adminUser.name, email: adminUser.email } : null,
  });
}

// POST — sync selected filenames, assign to current admin
export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body      = await req.json();
  const filenames: string[]            = Array.isArray(body.filenames) ? body.filenames : [];
  const categoryId: number | undefined = body.categoryId;

  if (filenames.length === 0) return NextResponse.json({ ok: true, added: 0 });

  const cats = await query<{ id: number }>(
    categoryId
      ? 'SELECT id FROM gallery_categories WHERE id = ? LIMIT 1'
      : 'SELECT id FROM gallery_categories WHERE slug = "general" LIMIT 1',
    categoryId ? [categoryId] : []
  );
  const defaultCatId = cats[0]?.id ?? null;
  const userId       = (session.user as any).id;
  const dir          = GALLERY_DIR();

  let added = 0;
  const skipped: string[] = [];

  for (const file of filenames) {
    const safe = path.basename(file);
    if (!fs.existsSync(path.join(dir, safe))) { skipped.push(safe); continue; }

    const exists = await query('SELECT id FROM gallery_images WHERE filename = ?', [safe]);
    if (exists.length > 0) { skipped.push(safe); continue; }

    const mediaType = detectMediaType(safe);
    await execute(
      `INSERT INTO gallery_images
         (filename, path, title, category_id, active, media_type, uploaded_by)
       VALUES (?, ?, ?, ?, 1, ?, ?)`,
      [safe, `/gallery/${safe}`, prettyTitle(safe), defaultCatId, mediaType, userId]
    );
    added++;
  }

  return NextResponse.json({ ok: true, added, skipped });
}
