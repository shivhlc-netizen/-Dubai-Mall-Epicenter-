import { NextRequest, NextResponse } from 'next/server';
import { execute, queryOne } from '@/lib/db';
import { z } from 'zod';

const verifySchema = z.object({
  email: z.string().email(),
  code: z.string().length(6, 'Code must be 6 digits'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = verifySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { email, code } = parsed.data;

    const user = await queryOne(
      'SELECT id, verification_code FROM users WHERE email = ? LIMIT 1',
      [email.toLowerCase()]
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.verification_code !== code) {
      return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 });
    }

    // Mark as verified
    await execute(
      'UPDATE users SET active = 1, email_verified_at = NOW(), verification_code = NULL WHERE id = ?',
      [user.id]
    );

    return NextResponse.json({ ok: true, message: 'Account verified successfully' });
  } catch (error: any) {
    console.error('Verification error:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
