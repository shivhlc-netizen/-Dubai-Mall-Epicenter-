import { NextResponse } from 'next/server';
import { execute } from '@/lib/db';
import { headers } from 'next/headers';

export async function POST(req: Request) {
  try {
    const headersList = headers();
    const ua = headersList.get('user-agent') || 'unknown';
    const ip = headersList.get('x-forwarded-for') || '127.0.0.1';
    
    // Log to DB
    await execute(
      'INSERT INTO site_visits (ip_address, user_agent, path) VALUES (?, ?, ?)',
      [ip, ua, '/']
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[API] log-visit error:', err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
