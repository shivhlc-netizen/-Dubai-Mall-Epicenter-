import { NextRequest, NextResponse } from 'next/server';
import { execute, queryOne } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { sendVerificationEmail } from '@/lib/email';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[0-9]/, 'Must contain a number')
    .regex(/[^a-zA-Z0-9]/, 'Must contain a special character'),
  consent: z.literal(true).refine(v => v === true, { message: 'You must consent to store your name and profile picture.' }),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = signupSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return NextResponse.json({ 
        error: `${firstError.path.join('.')}: ${firstError.message}` 
      }, { status: 400 });
    }

    const { name, email, password } = parsed.data;

    // Check if user exists
    const existing = await queryOne('SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    await execute(
      'INSERT INTO users (name, email, password_hash, role, active, verification_code, consent_given) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, email.toLowerCase(), passwordHash, 'user', 0, verificationCode, 1]
    );

    // Send verification email
    try {
      await sendVerificationEmail(email.toLowerCase(), verificationCode);
    } catch (emailErr) {
      console.error('Email delivery failed:', emailErr);
      // We still created the user, they can retry verification later or check console logs in dev
    }

    return NextResponse.json({ 
      ok: true, 
      message: 'Account created. Please check your email for verification code.',
      email: email.toLowerCase()
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: error.message || 'Signup failed' }, { status: 500 });
  }
}
