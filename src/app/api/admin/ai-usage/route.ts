import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { getUsageSummary } from '@/lib/aiUsageTracker';

export async function GET(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
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
