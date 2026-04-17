import { NextRequest, NextResponse } from 'next/server';
import { execute, query } from '@/lib/db';
import { requireManager } from '@/lib/auth';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  const session = await requireManager();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const categoryId = formData.get('categoryId') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const isVideo = file.type.startsWith('video/');
    const mediaType = isVideo ? 'video' : 'image';
    
    // Calculate fingerprint to prevent duplicates
    const fingerprint = crypto.createHash('sha256').update(buffer).digest('hex');
    
    const existing = await query<{id: number, filename: string}>(
      'SELECT id, filename FROM gallery_images WHERE fingerprint = ? LIMIT 1',
      [fingerprint]
    );

    if (existing.length > 0) {
      return NextResponse.json({ 
        ok: true, 
        duplicate: true, 
        id: existing[0].id, 
        message: 'Asset already exists in gallery' 
      });
    }

    const filename = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    const uploadDir = path.join(process.cwd(), 'public/gallery');
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, buffer);

    const title = file.name.replace(/[-_.]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).split('.')[0];
    
    // Get General category if none provided
    let catId = categoryId ? parseInt(categoryId) : null;
    if (!catId) {
      const cats = await query<{id: number}>('SELECT id FROM gallery_categories WHERE slug = "general" LIMIT 1');
      catId = cats.length > 0 ? cats[0].id : null;
    }

    const result = await execute(
      `INSERT INTO gallery_images (filename, path, title, category_id, active, fingerprint, media_type)
       VALUES (?, ?, ?, ?, 1, ?, ?)`,
      [filename, `/gallery/${filename}`, title, catId, fingerprint, mediaType]
    );

    return NextResponse.json({ ok: true, filename, id: result.insertId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
