import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { execute } from '@/lib/db';

// POST /api/admin/gallery-tools/bulk
// body: { ids: number[], action: 'show'|'hide'|'feature'|'unfeature'|'set_event'|'clear_event'|'delete' }
export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { ids, action } = await req.json() as { ids: number[]; action: string };
  if (!ids?.length) return NextResponse.json({ error: 'No ids' }, { status: 400 });

  const idList = ids.map(() => '?').join(',');

  switch (action) {
    case 'show':         await execute(`UPDATE gallery_images SET active=1 WHERE id IN (${idList})`, ids); break;
    case 'hide':         await execute(`UPDATE gallery_images SET active=0 WHERE id IN (${idList})`, ids); break;
    case 'feature':      await execute(`UPDATE gallery_images SET featured=1 WHERE id IN (${idList})`, ids); break;
    case 'unfeature':    await execute(`UPDATE gallery_images SET featured=0 WHERE id IN (${idList})`, ids); break;
    case 'set_event':    await execute(`UPDATE gallery_images SET shift_style='event', active=1, featured=1 WHERE id IN (${idList})`, ids); break;
    case 'clear_event':  await execute(`UPDATE gallery_images SET shift_style='mosaic', featured=0 WHERE id IN (${idList})`, ids); break;
    case 'delete':       await execute(`DELETE FROM gallery_images WHERE id IN (${idList})`, ids); break;
    default: return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  }

  return NextResponse.json({ ok: true, affected: ids.length });
}
