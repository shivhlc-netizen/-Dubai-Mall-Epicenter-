import { NextRequest, NextResponse } from 'next/server';
import { execute, queryOne } from '@/lib/db';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await queryOne<{ id: number, active: number }>(
      'SELECT id, active FROM users WHERE email = ? LIMIT 1',
      [email.toLowerCase()]
    );

    // For security, don't reveal if user exists or not
    if (!user || !user.active) {
      return NextResponse.json({ ok: true, message: 'If an account with that email exists, we have sent a reset link.' });
    }

    // Generate token
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000); // 1 hour

    await execute(
      'UPDATE users SET reset_password_token = ?, reset_password_expires = ? WHERE id = ?',
      [token, expires, user.id]
    );

    await sendPasswordResetEmail(email.toLowerCase(), token);

    return NextResponse.json({ ok: true, message: 'If an account with that email exists, we have sent a reset link.' });
  } catch (error: any) {
    console.error('Forgot password error:', error.message);
    return NextResponse.json({ error: 'Something went wrong. Please try again later.' }, { status: 500 });
  }
}
