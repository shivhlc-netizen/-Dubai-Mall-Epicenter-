import { GALLERY_DATA } from '@/lib/data';

export async function GET(req: Request) { 
  const { searchParams } = new URL(req.url);
  const featured = searchParams.get('featured');
  
  let images = GALLERY_DATA;
  if (featured === '1') {
    images = (GALLERY_DATA as any[]).filter(img => img.is_featured);
  }

  return Response.json({ 
    images, 
    total: images.length 
  }) 
}

export async function POST() { return Response.json({ ok: true }) }
export async function PATCH() { return Response.json({ ok: true }) }
