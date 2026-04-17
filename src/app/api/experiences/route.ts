import { NextRequest, NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { z } from 'zod';

const experienceSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(2000),
  image_url: z.string().url().optional().or(z.literal('')),
  guestName: z.string().max(100).optional(),
});

// GET /api/experiences - Public feed
export async function GET() {
  const session = await getSession();
  const isAdmin = session?.user.role === 'admin' || session?.user.role === 'manager';

  try {
    // Admins see all for moderation, guests see only published
    const experiences = await query<any>(`
      SELECT e.*, COALESCE(u.name, e.user_name, 'Guest') as user_name 
      FROM user_experiences e
      LEFT JOIN users u ON e.user_id = u.id
      WHERE ${isAdmin ? '1=1' : "e.status = 'published'"}
      ORDER BY e.created_at DESC
      LIMIT 50
    `);

    // Fetch comments for these experiences
    const experienceIds = experiences.map(e => e.id);
    let comments: any[] = [];
    if (experienceIds.length > 0) {
      comments = await query(`
        SELECT c.*, COALESCE(u.name, c.user_name, 'Guest') as user_name
        FROM experience_comments c
        LEFT JOIN users u ON c.user_id = u.id
        WHERE c.experience_id IN (${experienceIds.join(',')})
        AND c.status = 'published'
        ORDER BY c.created_at ASC
      `);
    }

    // Attach comments to experiences
    const enriched = experiences.map(e => ({
      ...e,
      comments: comments.filter(c => c.experience_id === e.id)
    }));

    return NextResponse.json(enriched);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/experiences - Create new (Allows guest)
export async function POST(req: NextRequest) {
  const session = await getSession();

  try {
    const body = await req.json();
    const parsed = experienceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { title, description, image_url, guestName } = parsed.data;
    const userId = session ? session.user.id : null;
    const userName = session ? session.user.name : (guestName || 'Guest');
    
    // Default status: published for admin/manager, pending for others
    const isAdmin = session?.user.role === 'admin' || session?.user.role === 'manager';
    const status = isAdmin ? 'published' : 'pending';

    await execute(
      'INSERT INTO user_experiences (user_id, user_name, title, description, image_url, status) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, userName, title, description, image_url || null, status]
    );

    return NextResponse.json({ 
      ok: true, 
      message: isAdmin ? 'Experience published.' : 'Experience submitted for moderation.' 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
