import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { rollupOldHourlyData } from '@/lib/aiUsageTracker';

// Called hourly by Netlify scheduled function or manually from admin
export async function POST(req: NextRequest) {
  // Allow internal cron calls with secret header, or admin session
  const cronSecret = req.headers.get('x-cron-secret');
  const validCron = cronSecret && cronSecret === process.env.CRON_SECRET;

  if (!validCron) {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const result = await rollupOldHourlyData();
  return NextResponse.json({
    ...result,
    message: result.rolled
      ? `Rolled up ${result.weeksProcessed} week(s) of data into ai_usage_summary.`
      : 'No data older than 7 days to roll up.',
    timestamp: new Date().toISOString(),
  });
}
