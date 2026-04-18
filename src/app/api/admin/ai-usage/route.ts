import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { getUsageSummary } from '@/lib/aiUsageTracker';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { searchParams } = req.nextUrl;
  const live = searchParams.get('live') === '1';

  try {
    if (live) {
      // Lightweight live-pulse — last 60 seconds only
      const [last60, lastCall] = await Promise.all([
        query<{ calls: number; tokens: number; failed: number }>(`
          SELECT COUNT(*) AS calls,
                 SUM(total_tokens) AS tokens,
                 SUM(IF(success=0,1,0)) AS failed
          FROM ai_usage_log
          WHERE created_at >= NOW() - INTERVAL 60 SECOND
        `),
        query<{ endpoint: string; total_tokens: number; success: number; created_at: string }>(`
          SELECT endpoint, total_tokens, success, created_at
          FROM ai_usage_log
          ORDER BY id DESC LIMIT 1
        `),
      ]);

      return NextResponse.json({
        live: true,
        last60: {
          calls:  last60[0]?.calls  ?? 0,
          tokens: last60[0]?.tokens ?? 0,
          failed: last60[0]?.failed ?? 0,
        },
        lastCall: lastCall[0] ?? null,
      });
    }

    const summary = await getUsageSummary();
    return NextResponse.json(summary);
  } catch (err: any) {
    return NextResponse.json({
      today: { gemini: { calls: 0, tokens: 0 } },
      hourly: [],
      summaries: [],
      _error: err.message,
    });
  }
}
