import { NextRequest, NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const createSchema = z.object({
  name:     z.string().min(2).max(100),
  email:    z.string().email().max(255),
  password: z.string().min(8).max(128)
    .regex(/[A-Z]/, 'Must contain uppercase')
    .regex(/[0-9]/, 'Must contain a number')
    .regex(/[^a-zA-Z0-9]/, 'Must contain a special character'),
  role:     z.enum(['admin', 'user']).default('user'),
});

// GET /api/users — admin only
export async function GET(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const users = await query(
    `SELECT id, name, email, role, active, last_login, created_at
     FROM users ORDER BY created_at DESC`
  );
  return NextResponse.json(users);
}

// POST /api/users — admin only
export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const body = await req.json();
    const data = createSchema.parse(body);

    const existing = await query('SELECT id FROM users WHERE email = ?', [data.email.toLowerCase()]);
    if (existing.length) return NextResponse.json({ error: 'Email already in use' }, { status: 409 });

    const hash   = await bcrypt.hash(data.password, 12);
    const result = await execute(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [data.name, data.email.toLowerCase(), hash, data.role]
    );

    return NextResponse.json({ id: result.insertId, message: 'User created' }, { status: 201 });
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: e.issues }, { status: 400 });
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
