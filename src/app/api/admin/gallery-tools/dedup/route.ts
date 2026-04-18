/**
 * Dedup API
 * GET  /api/admin/gallery-tools/dedup         — scan, hash all files, return duplicate groups + orphans
 * POST /api/admin/gallery-tools/dedup         — delete duplicates (keep specified ids, remove rest from group)
 * DELETE /api/admin/gallery-tools/dedup/orphans — remove orphaned DB records (no file on disk)
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { query, execute } from '@/lib/db';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const GALLERY_DIR = path.join(process.cwd(), 'public', 'gallery');

function hashFile(filePath: string): string {
  const buf = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(buf).digest('hex');
}

export async function GET(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const ignoreFolders = searchParams.get('ignore')?.split(',').map(s => s.trim()).filter(Boolean) || [];

  const images = await query<{ id: number; filename: string; path: string; title: string; active: number; featured: number }>(
    'SELECT id, filename, path, title, active, featured FROM gallery_images ORDER BY id ASC'
  );

  const orphans: typeof images = [];
  const hashMap: Record<string, typeof images> = {};
  let scanned = 0;
  let ignored = 0;

  for (const img of images) {
    // Check if path is in ignored folders
    if (ignoreFolders.some(folder => img.path.includes(`/${folder}/`) || img.path.startsWith(`${folder}/`) || img.path.startsWith(`/${folder}/`))) {
      ignored++;
      continue;
    }

    // Normalize path for disk access: remove leading slash if present
    const normalizedPath = img.path.startsWith('/') ? img.path.substring(1) : img.path;
    const diskPath = path.join(process.cwd(), 'public', normalizedPath);

    if (!fs.existsSync(diskPath) || fs.lstatSync(diskPath).isDirectory()) {
      orphans.push(img);
      continue;
    }
    try {
      const hash = hashFile(diskPath);
      // Also update fingerprint in DB
      await execute('UPDATE gallery_images SET fingerprint = ? WHERE id = ? AND (fingerprint IS NULL OR fingerprint = "")', [hash, img.id]);
      if (!hashMap[hash]) hashMap[hash] = [];
      hashMap[hash].push(img);
      scanned++;
    } catch {
      orphans.push(img); // unreadable file treated as orphan
    }
  }

  // Only return groups with duplicates
  const duplicateGroups = Object.entries(hashMap)
    .filter(([, group]) => group.length > 1)
    .map(([hash, group]) => ({ hash, count: group.length, images: group }))
    .sort((a, b) => b.count - a.count);

  const totalDuplicates = duplicateGroups.reduce((sum, g) => sum + g.count - 1, 0); // extra copies

  return NextResponse.json({
    scanned,
    orphans,
    ignored,
    duplicateGroups,
    totalDuplicates,
    summary: {
      total: images.length,
      onDisk: scanned,
      orphaned: orphans.length,
      ignored,
      uniqueFiles: Object.keys(hashMap).length,
      duplicateFiles: duplicateGroups.length,
      extraCopies: totalDuplicates,
    }
  });
}

// POST — keep one per group, delete the rest (also delete files from disk)
export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { keepIds, deleteIds } = await req.json() as { keepIds: number[]; deleteIds: number[] };
  if (!deleteIds?.length) return NextResponse.json({ error: 'No ids to delete' }, { status: 400 });

  // 1. Fetch paths of images to be deleted
  const toDelete = await query<{ id: number; path: string }>(
    `SELECT id, path FROM gallery_images WHERE id IN (${deleteIds.map(() => '?').join(',')})`,
    deleteIds
  );

  // 2. Identify ALL paths currently in DB that we are NOT deleting
  // This ensures we don't delete a file if it's still referenced by a "keep" record or any other record
  const allKeepPaths = await query<{ path: string }>(
    `SELECT path FROM gallery_images WHERE id NOT IN (${deleteIds.map(() => '?').join(',')})`,
    deleteIds
  );
  const keepPathSet = new Set(allKeepPaths.map(r => r.path));

  let filesDeleted = 0;
  const processedFiles = new Set<string>();

  for (const row of toDelete) {
    // Only attempt to delete from disk if no other record in DB points to this path
    if (!keepPathSet.has(row.path) && !processedFiles.has(row.path)) {
      const normalizedPath = row.path.startsWith('/') ? row.path.substring(1) : row.path;
      const diskPath = path.join(process.cwd(), 'public', normalizedPath);
      
      if (fs.existsSync(diskPath)) {
        try { 
          fs.unlinkSync(diskPath); 
          filesDeleted++; 
          processedFiles.add(row.path);
        } catch { /* ignore */ }
      }
    }
  }

  // 3. Remove from DB
  await execute(
    `DELETE FROM gallery_images WHERE id IN (${deleteIds.map(() => '?').join(',')})`,
    deleteIds
  );

  return NextResponse.json({ ok: true, dbRemoved: deleteIds.length, filesDeleted });
}

// DELETE — remove orphaned DB records
export async function DELETE(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const images = await query<{ id: number; path: string }>(
    'SELECT id, path FROM gallery_images'
  );

  const orphanIds: number[] = [];
  for (const img of images) {
    const diskPath = path.join(process.cwd(), 'public', img.path);
    if (!fs.existsSync(diskPath)) orphanIds.push(img.id);
  }

  if (!orphanIds.length) return NextResponse.json({ ok: true, removed: 0 });

  await execute(
    `DELETE FROM gallery_images WHERE id IN (${orphanIds.map(() => '?').join(',')})`,
    orphanIds
  );

  return NextResponse.json({ ok: true, removed: orphanIds.length });
}
