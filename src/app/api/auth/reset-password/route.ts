import { NextRequest, NextResponse } from 'next/server';
import { execute, queryOne } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ error: 'Token and password are required' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters long' }, { status: 400 });
    }

    const user = await queryOne<{ id: number }>(
      'SELECT id FROM users WHERE reset_password_token = ? AND reset_password_expires > NOW() LIMIT 1',
      [token]
    );

    if (!user) {
      return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await execute(
      'UPDATE users SET password_hash = ?, reset_password_token = NULL, reset_password_expires = NULL, failed_attempts = 0, lock_until = NULL WHERE id = ?',
      [hashedPassword, user.id]
    );

    return NextResponse.json({ ok: true, message: 'Password has been reset successfully' });
  } catch (error: any) {
    console.error('Reset password error:', error.message);
    return NextResponse.json({ error: 'Something went wrong. Please try again later.' }, { status: 500 });
  }
}
