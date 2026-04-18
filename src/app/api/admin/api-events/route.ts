import { NextRequest, NextResponse } from 'next/server';
import { query, execute, queryOne } from '@/lib/db';
import { requireManager } from '@/lib/auth';

// Ensure tables exist
async function ensureTables() {
  await execute(`
    CREATE TABLE IF NOT EXISTS api_events (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(200) NOT NULL,
      description TEXT,
      event_type ENUM('festival','concert','sale','vip','premium','custom') DEFAULT 'custom',
      budget_multiplier DECIMAL(4,2) DEFAULT 2.00,
      extra_tokens INT DEFAULT 5000,
      start_date DATETIME NOT NULL,
      end_date DATETIME NOT NULL,
      active TINYINT(1) DEFAULT 1,
      applies_to ENUM('all','premium','selected') DEFAULT 'premium',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await execute(`
    CREATE TABLE IF NOT EXISTS api_event_users (
      event_id INT NOT NULL,
      user_id INT NOT NULL,
      PRIMARY KEY (event_id, user_id)
    )
  `);

  await execute(`
    CREATE TABLE IF NOT EXISTS api_abuse_rules (
      id INT AUTO_INCREMENT PRIMARY KEY,
      rule_name VARCHAR(100) NOT NULL,
      threshold_tokens INT DEFAULT 5000,
      window_hours INT DEFAULT 24,
      action ENUM('warn','reduce_50','block','notify') DEFAULT 'reduce_50',
      active TINYINT(1) DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

// GET - List all events + abuse rules
export async function GET() {
  const session = await requireManager();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    await ensureTables();

    const [events, abuseRules, abusers] = await Promise.all([
      query<any>(`
        SELECT ae.*,
               COUNT(aeu.user_id) AS selected_users
        FROM api_events ae
        LEFT JOIN api_event_users aeu ON ae.id = aeu.event_id
        GROUP BY ae.id
        ORDER BY ae.start_date DESC
      `),
      query<any>('SELECT * FROM api_abuse_rules ORDER BY id'),
      query<any>(`
        SELECT u.id, u.name, u.email, u.api_budget, u.api_used,
               ROUND((u.api_used / GREATEST(u.api_budget, 1)) * 100, 1) AS usage_pct,
               u.role, u.active
        FROM users u
        WHERE u.api_budget > 0
        ORDER BY usage_pct DESC
        LIMIT 20
      `),
    ]);

    // Mark active events
    const now = new Date();
    const enrichedEvents = events.map((e: any) => ({
      ...e,
      isLive: e.active && new Date(e.start_date) <= now && new Date(e.end_date) >= now,
    }));

    return NextResponse.json({ events: enrichedEvents, abuseRules, abusers });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create new event OR abuse rule
export async function POST(req: NextRequest) {
  const session = await requireManager();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    await ensureTables();
    const body = await req.json();

    if (body.type === 'abuse_rule') {
      const { rule_name, threshold_tokens, window_hours, action } = body;
      if (!rule_name) return NextResponse.json({ error: 'rule_name required' }, { status: 400 });

      await execute(
        'INSERT INTO api_abuse_rules (rule_name, threshold_tokens, window_hours, action) VALUES (?, ?, ?, ?)',
        [rule_name, threshold_tokens || 5000, window_hours || 24, action || 'reduce_50']
      );
      return NextResponse.json({ ok: true, message: 'Abuse rule created.' });
    }

    // Create event
    const { name, description, event_type, budget_multiplier, extra_tokens, start_date, end_date, applies_to } = body;
    if (!name || !start_date || !end_date) {
      return NextResponse.json({ error: 'name, start_date, end_date required' }, { status: 400 });
    }

    const result: any = await execute(
      `INSERT INTO api_events (name, description, event_type, budget_multiplier, extra_tokens, start_date, end_date, applies_to)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, description || '', event_type || 'custom', budget_multiplier || 2.0, extra_tokens || 5000, start_date, end_date, applies_to || 'premium']
    );

    // If applies_to === 'premium', auto-enroll premium users
    if (applies_to === 'premium' || applies_to === 'all') {
      const users = await query<{ id: number }>(
        applies_to === 'all' ? 'SELECT id FROM users WHERE active = 1' : 'SELECT id FROM users WHERE active = 1 AND is_premium = 1'
      );
      for (const u of users) {
        await execute('INSERT IGNORE INTO api_event_users (event_id, user_id) VALUES (?, ?)', [result.insertId, u.id]);
      }
    }

    return NextResponse.json({ ok: true, id: result.insertId, message: 'Event created.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH - Apply event to user budgets / enforce abuse action
export async function PATCH(req: NextRequest) {
  const session = await requireManager();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const body = await req.json();
    const { action, event_id, user_id, abuse_action, target_user_id } = body;

    if (action === 'apply_event' && event_id) {
      const event = await queryOne<any>('SELECT * FROM api_events WHERE id = ?', [event_id]);
      if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });

      const users = await query<{ id: number; api_budget: number }>(
        `SELECT u.id, u.api_budget FROM users u
         INNER JOIN api_event_users aeu ON u.id = aeu.user_id
         WHERE aeu.event_id = ? AND u.active = 1`,
        [event_id]
      );

      let updated = 0;
      for (const u of users) {
        const newBudget = Math.round(u.api_budget * event.budget_multiplier) + event.extra_tokens;
        await execute('UPDATE users SET api_budget = ? WHERE id = ?', [newBudget, u.id]);
        updated++;
      }
      return NextResponse.json({ ok: true, message: `Applied to ${updated} users.` });
    }

    if (action === 'abuse_user' && target_user_id && abuse_action) {
      if (abuse_action === 'block') {
        await execute('UPDATE users SET api_budget = 0 WHERE id = ?', [target_user_id]);
        return NextResponse.json({ ok: true, message: 'User API access blocked.' });
      }
      if (abuse_action === 'reduce_50') {
        await execute('UPDATE users SET api_budget = FLOOR(api_budget * 0.5) WHERE id = ?', [target_user_id]);
        return NextResponse.json({ ok: true, message: 'User API budget halved.' });
      }
      if (abuse_action === 'reset') {
        await execute('UPDATE users SET api_budget = 1000, api_used = 0 WHERE id = ?', [target_user_id]);
        return NextResponse.json({ ok: true, message: 'User API budget reset to default.' });
      }
    }

    if (action === 'toggle_event' && event_id) {
      const ev = await queryOne<{ active: number }>('SELECT active FROM api_events WHERE id = ?', [event_id]);
      if (!ev) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      await execute('UPDATE api_events SET active = ? WHERE id = ?', [ev.active ? 0 : 1, event_id]);
      return NextResponse.json({ ok: true });
    }

    if (action === 'toggle_rule' && body.rule_id) {
      const rule = await queryOne<{ active: number }>('SELECT active FROM api_abuse_rules WHERE id = ?', [body.rule_id]);
      if (!rule) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      await execute('UPDATE api_abuse_rules SET active = ? WHERE id = ?', [rule.active ? 0 : 1, body.rule_id]);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Remove event or rule
export async function DELETE(req: NextRequest) {
  const session = await requireManager();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const { searchParams } = new URL(req.url);
    const event_id = searchParams.get('event_id');
    const rule_id = searchParams.get('rule_id');

    if (event_id) {
      await execute('DELETE FROM api_event_users WHERE event_id = ?', [event_id]);
      await execute('DELETE FROM api_events WHERE id = ?', [event_id]);
      return NextResponse.json({ ok: true });
    }
    if (rule_id) {
      await execute('DELETE FROM api_abuse_rules WHERE id = ?', [rule_id]);
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: 'Specify event_id or rule_id' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
