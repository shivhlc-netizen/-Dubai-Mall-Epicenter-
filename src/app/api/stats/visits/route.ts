import { NextResponse } from 'next/server';

// In-memory counter for demo purposes
let visitCount = 285000;

export async function GET() {
  visitCount += Math.floor(Math.random() * 5);
  return NextResponse.json({ count: visitCount });
}

export async function POST(req: Request) {
  const { action } = await req.json();
  if (action === 'reset') {
    visitCount = 0;
    return NextResponse.json({ success: true, count: visitCount });
  }
  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
