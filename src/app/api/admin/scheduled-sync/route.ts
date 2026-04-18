import { NextRequest, NextResponse } from 'next/server';
import { query, execute, queryOne } from '@/lib/db';
import { requireManager } from '@/lib/auth';

// GET - Fetch sync schedule state + token estimate
export async function GET() {
  const session = await requireManager();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    // Count pending items to estimate sync tokens
    const [pendingImages] = await query<{ count: number }>(
      `SELECT COUNT(*) AS count FROM gallery_images WHERE description IS NULL OR description = ''`
    );
    const [pendingExperiences] = await query<{ count: number }>(
      `SELECT COUNT(*) AS count FROM user_experiences WHERE status = 'pending'`
    );

    // Estimate: ~400 tokens per image desc (Gemini), ~0 for experiences
    const estimatedTokens = (pendingImages?.count || 0) * 400;
    const estimatedCostUSD = (estimatedTokens / 1_000_000) * 0.075; // Gemini 1.5 Flash pricing

    // Read schedule config from sync_schedule table (create if not exists)
    await execute(`
      CREATE TABLE IF NOT EXISTS sync_schedule (
        id INT PRIMARY KEY DEFAULT 1,
        enabled TINYINT(1) DEFAULT 1,
        run_hour INT DEFAULT 19,
        run_minute INT DEFAULT 0,
        postponed_until DATETIME NULL,
        last_run DATETIME NULL,
        last_run_status VARCHAR(20) DEFAULT NULL,
        last_run_tokens INT DEFAULT 0,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    let schedule = await queryOne<any>('SELECT * FROM sync_schedule WHERE id = 1');
    if (!schedule) {
      await execute(
        'INSERT INTO sync_schedule (id, enabled, run_hour, run_minute) VALUES (1, 1, 19, 0)'
      );
      schedule = { id: 1, enabled: 1, run_hour: 19, run_minute: 0, postponed_until: null, last_run: null, last_run_status: null, last_run_tokens: 0 };
    }

    // Determine if sync is due today
    const now = new Date();
    const scheduledToday = new Date();
    scheduledToday.setHours(schedule.run_hour, schedule.run_minute, 0, 0);

    const isPostponed = schedule.postponed_until && new Date(schedule.postponed_until) > now;
    const isDue = !isPostponed && now >= scheduledToday && (
      !schedule.last_run || new Date(schedule.last_run).toDateString() !== now.toDateString()
    );

    return NextResponse.json({
      schedule: {
        ...schedule,
        nextRun: scheduledToday.toISOString(),
        isDue,
        isPostponed,
      },
      estimate: {
        pendingImages: pendingImages?.count || 0,
        pendingExperiences: pendingExperiences?.count || 0,
        estimatedTokens,
        estimatedCostUSD: estimatedCostUSD.toFixed(4),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH - Update schedule settings (enable/disable, postpone, change time)
export async function PATCH(req: NextRequest) {
  const session = await requireManager();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const body = await req.json();
    const { action, run_hour, run_minute, enabled } = body;

    if (action === 'postpone_day') {
      const until = new Date();
      until.setDate(until.getDate() + 1);
      until.setHours(0, 0, 0, 0);
      await execute('UPDATE sync_schedule SET postponed_until = ? WHERE id = 1', [until]);
      return NextResponse.json({ ok: true, message: 'Sync postponed until tomorrow.' });
    }

    if (action === 'postpone_week') {
      const until = new Date();
      until.setDate(until.getDate() + 7);
      until.setHours(0, 0, 0, 0);
      await execute('UPDATE sync_schedule SET postponed_until = ? WHERE id = 1', [until]);
      return NextResponse.json({ ok: true, message: 'Sync postponed for 1 week.' });
    }

    if (action === 'approve') {
      await execute('UPDATE sync_schedule SET postponed_until = NULL WHERE id = 1');
      return NextResponse.json({ ok: true, message: 'Sync approved for next scheduled time.' });
    }

    // Update schedule settings
    const sets: string[] = [];
    const vals: any[] = [];

    if (run_hour !== undefined && run_hour >= 0 && run_hour <= 23) {
      sets.push('run_hour = ?'); vals.push(run_hour);
    }
    if (run_minute !== undefined && run_minute >= 0 && run_minute <= 59) {
      sets.push('run_minute = ?'); vals.push(run_minute);
    }
    if (enabled !== undefined) {
      sets.push('enabled = ?'); vals.push(enabled ? 1 : 0);
    }

    if (sets.length === 0) return NextResponse.json({ error: 'No changes.' }, { status: 400 });

    // Clear postpone when re-enabling
    if (enabled) { sets.push('postponed_until = NULL'); }

    vals.push(1);
    await execute(`UPDATE sync_schedule SET ${sets.join(', ')} WHERE id = 1`, vals);
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Execute the sync now
export async function POST() {
  const session = await requireManager();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    let tokensUsed = 0;
    let imagesProcessed = 0;
    let errors = 0;

    // Sync 1: Tag gallery images missing descriptions (batch up to 20 per run)
    const pendingImages = await query<{ id: number; path: string; title: string }>(
      `SELECT id, path, title FROM gallery_images WHERE (description IS NULL OR description = '') LIMIT 20`
    );

    for (const img of pendingImages) {
      try {
        const res = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/ai/describe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imagePath: img.path, title: img.title }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.description) {
            await execute('UPDATE gallery_images SET description = ? WHERE id = ?', [data.description, img.id]);
            tokensUsed += data.tokensUsed || 400;
            imagesProcessed++;
          }
        }
      } catch {
        errors++;
      }
    }

    // Mark last run
    await execute(
      `UPDATE sync_schedule SET last_run = NOW(), last_run_status = ?, last_run_tokens = ?, postponed_until = NULL WHERE id = 1`,
      [errors === 0 ? 'success' : 'partial', tokensUsed]
    );

    return NextResponse.json({
      ok: true,
      imagesProcessed,
      tokensUsed,
      errors,
      message: `Sync complete. ${imagesProcessed} images processed, ${tokensUsed.toLocaleString()} tokens used.`,
    });
  } catch (error: any) {
    await execute(
      `UPDATE sync_schedule SET last_run = NOW(), last_run_status = 'error' WHERE id = 1`
    ).catch(() => {});
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
