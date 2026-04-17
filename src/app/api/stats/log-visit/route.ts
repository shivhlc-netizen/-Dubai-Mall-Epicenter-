import { NextRequest, NextResponse } from 'next/server';
import { execute } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { path, referrer } = await req.json();
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const ua = req.headers.get('user-agent') || 'Unknown';

    await execute(
      'INSERT INTO site_visits (ip_address, user_agent, path, referrer) VALUES (?, ?, ?, ?)',
      [ip, ua, path || '/', referrer || '']
    );

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    // Fail silently to not disrupt user experience
    console.error('Visit log error:', error.message);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
