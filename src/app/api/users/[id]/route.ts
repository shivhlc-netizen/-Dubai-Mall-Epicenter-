import { NextRequest, NextResponse } from 'next/server';
import { query, execute, queryOne } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const patchSchema = z.object({
  name:       z.string().min(2).max(100).optional(),
  email:      z.string().email().max(255).optional(),
  role:       z.enum(['admin', 'user']).optional(),
  active:     z.boolean().optional(),
  api_budget: z.number().int().min(0).max(1000000).optional(),
  password:   z.string().min(8).max(128)
    .regex(/[A-Z]/).regex(/[0-9]/).regex(/[^a-zA-Z0-9]/)
    .optional(),
});

// PATCH /api/users/[id]
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const id = parseInt(params.id, 10);
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

  try {
    const body = await req.json();
    const data = patchSchema.parse(body);

    // Prevent the last admin from being demoted or deactivated
    if (data.role === 'user' || data.active === false) {
      const [{ adminCount }] = await query<{ adminCount: number }>(
        "SELECT COUNT(*) AS adminCount FROM users WHERE role='admin' AND active=1"
      );
      const target = await queryOne<{ role: string; active: number }>(
        'SELECT role, active FROM users WHERE id = ?', [id]
      );
      if (target?.role === 'admin' && adminCount <= 1) {
        return NextResponse.json({ error: 'Cannot remove the last active admin' }, { status: 409 });
      }
    }

    const sets: string[]   = [];
    const vals: unknown[]  = [];

    if (data.name       !== undefined) { sets.push('name = ?');          vals.push(data.name); }
    if (data.email      !== undefined) { sets.push('email = ?');         vals.push(data.email.toLowerCase()); }
    if (data.role       !== undefined) { sets.push('role = ?');          vals.push(data.role); }
    if (data.active     !== undefined) { sets.push('active = ?');        vals.push(data.active ? 1 : 0); }
    if (data.api_budget !== undefined) { sets.push('api_budget = ?');    vals.push(data.api_budget); }
    if (data.password   !== undefined) {
      const hash = await bcrypt.hash(data.password, 12);
      sets.push('password_hash = ?');
      vals.push(hash);
    }

    if (!sets.length) return NextResponse.json({ error: 'No fields to update' }, { status: 400 });

    vals.push(id);
    await execute(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`, vals);

    const updated = await query(
      `SELECT id, name, email, role, active, last_login, created_at, 
              api_budget, api_used, last_api_request 
       FROM users WHERE id = ?`,
      [id]
    );
    return NextResponse.json(updated[0]);
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: e.issues }, { status: 400 });
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}

// DELETE /api/users/[id] — hard delete (admin only, not self)
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const id = parseInt(params.id, 10);
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

  if (String(id) === session.user.id) {
    return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 409 });
  }

  await execute('DELETE FROM users WHERE id = ?', [id]);
  return NextResponse.json({ ok: true });
}
