import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { images } = await req.json();
    
    if (!Array.isArray(images)) {
      return NextResponse.json({ error: 'Images must be an array' }, { status: 400 });
    }

    if (images.length > 50) {
      return NextResponse.json({ error: 'Maximum 50 images allowed at once' }, { status: 400 });
    }

    // In a real scenario, we would save these to a database
    // For this stable build, we acknowledge receipt
    console.log(`Received ${images.length} images for processing.`);

    return NextResponse.json({ 
      success: true, 
      message: `${images.length} images processed successfully. (Demo Mode: Not persisted to static file)` 
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process images' }, { status: 500 });
  }
}
