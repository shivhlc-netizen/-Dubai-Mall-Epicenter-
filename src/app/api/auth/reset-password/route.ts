import { NextRequest, NextResponse } from 'next/server';
import { execute, queryOne } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const resetSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[0-9]/, 'Must contain a number')
    .regex(/[^a-zA-Z0-9]/, 'Must contain a special character'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = resetSchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message || 'Invalid input';
      return NextResponse.json({ error: msg }, { status: 400 });
    }
    const { token, password } = parsed.data;

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
