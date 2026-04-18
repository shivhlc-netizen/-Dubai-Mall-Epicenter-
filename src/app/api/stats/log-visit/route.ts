import { NextRequest, NextResponse } from 'next/server';
import { execute } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const visitPath = String(body.path || '/').slice(0, 500);
    const referrer = String(body.referrer || '').slice(0, 500);
    const ip = (req.headers.get('x-forwarded-for') || '127.0.0.1').split(',')[0].trim().slice(0, 45);
    const ua = (req.headers.get('user-agent') || 'Unknown').slice(0, 512);

    await execute(
      'INSERT INTO site_visits (ip_address, user_agent, path, referrer) VALUES (?, ?, ?, ?)',
      [ip, ua, visitPath, referrer]
    );

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    // Fail silently to not disrupt user experience
    console.error('Visit log error:', error.message);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
