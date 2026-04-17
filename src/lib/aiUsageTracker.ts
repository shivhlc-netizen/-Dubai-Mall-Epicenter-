import { execute, query } from './db';

/**
 * Centralized AI usage tracker for Gemini.
 */

export type Provider = 'gemini' | 'claude';

export interface UsageEntry {
  provider: Provider;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  success: boolean;
  errorType?: string;
}

export async function recordUsage({ provider, inputTokens, outputTokens, totalTokens, success, errorType }: UsageEntry) {
  try {
    await execute(
      `INSERT INTO ai_usage (provider, input_tokens, output_tokens, total_tokens, success, error_type)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [provider, inputTokens, outputTokens, totalTokens, success ? 1 : 0, errorType || null]
    );
  } catch (err: any) {
    console.error('Failed to record AI usage:', err.message);
  }
}

export async function getUsageSummary() {
  try {
    // 1. Hourly timeline for the last 24h
    const hourly = await query<{
      hour_start: string;
      provider: string;
      calls_success: number;
      calls_failed: number;
      total_tokens: number;
    }>(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m-%d %H:00:00') AS hour_start,
        provider,
        SUM(IF(success=1, 1, 0)) AS calls_success,
        SUM(IF(success=0, 1, 0)) AS calls_failed,
        SUM(total_tokens) AS total_tokens
      FROM ai_usage
      WHERE created_at >= NOW() - INTERVAL 24 HOUR
      GROUP BY hour_start, provider
      ORDER BY hour_start ASC
    `);

    // 2. Global totals
    const summaries = await query<{
      provider: string;
      total_calls: number;
      total_tokens: number;
    }>(`
      SELECT provider, COUNT(*) as total_calls, SUM(total_tokens) as total_tokens
      FROM ai_usage
      GROUP BY provider
    `);

    // 3. Today's totals (since midnight)
    const today = await query<{
      provider: string;
      calls: number;
      tokens: number;
    }>(`
      SELECT provider, COUNT(*) as calls, SUM(total_tokens) as tokens
      FROM ai_usage
      WHERE DATE(created_at) = CURDATE()
      GROUP BY provider
    `);

    const formattedToday = {
      gemini: { calls: 0, tokens: 0 },
      claude: { calls: 0, tokens: 0 },
    };
    today.forEach(r => {
      if (r.provider === 'gemini') formattedToday.gemini = { calls: r.calls, tokens: r.tokens };
      if (r.provider === 'claude') formattedToday.claude = { calls: r.calls, tokens: r.tokens };
    });

    return { hourly, summaries, today: formattedToday };
  } catch (err: any) {
    console.error('Failed to get AI usage summary:', err.message);
    return {
      hourly: [],
      summaries: [],
      today: { gemini: { calls: 0, tokens: 0 } },
    };
  }
}

export async function rollupOldHourlyData(): Promise<{ rolled: boolean; weeksProcessed: number }> {
  try {
    const old = await query<{ week_start: string; provider: string; calls_success: number; calls_failed: number; total_tokens: number }>(`
      SELECT
        DATE_FORMAT(created_at, '%Y-%u') AS week_start,
        provider,
        SUM(IF(success=1,1,0)) AS calls_success,
        SUM(IF(success=0,1,0)) AS calls_failed,
        SUM(total_tokens) AS total_tokens
      FROM ai_usage
      WHERE created_at < NOW() - INTERVAL 7 DAY
      GROUP BY week_start, provider
    `);
    if (!old.length) return { rolled: false, weeksProcessed: 0 };
    for (const row of old) {
      await execute(
        `INSERT INTO ai_usage_summary (week_start, provider, calls_success, calls_failed, total_tokens)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           calls_success = calls_success + VALUES(calls_success),
           calls_failed  = calls_failed  + VALUES(calls_failed),
           total_tokens  = total_tokens  + VALUES(total_tokens)`,
        [row.week_start, row.provider, row.calls_success, row.calls_failed, row.total_tokens]
      );
    }
    await execute(`DELETE FROM ai_usage WHERE created_at < NOW() - INTERVAL 7 DAY`, []);
    const weeks = new Set(old.map(r => r.week_start)).size;
    return { rolled: true, weeksProcessed: weeks };
  } catch (err: any) {
    console.error('rollupOldHourlyData failed:', err.message);
    return { rolled: false, weeksProcessed: 0 };
  }
}
