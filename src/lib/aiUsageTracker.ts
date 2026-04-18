import { execute, query } from './db';

export type Provider = 'gemini' | 'claude';

export interface UsageEntry {
  provider: Provider;
  model?: string;
  endpoint?: string;
  userId?: string | number | null;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  success: boolean;
  errorType?: string;
}

export async function recordUsage({
  provider, model, endpoint, userId,
  inputTokens, outputTokens, totalTokens, success, errorType,
}: UsageEntry) {
  try {
    await execute(
      `INSERT INTO ai_usage_log
         (provider, model, endpoint, user_id, input_tokens, output_tokens, total_tokens, success, error_type)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        provider,
        model || null,
        endpoint || null,
        userId || null,
        inputTokens,
        outputTokens,
        totalTokens,
        success ? 1 : 0,
        errorType || null,
      ]
    );
  } catch (err: any) {
    console.error('Failed to record AI usage:', err.message);
  }
}

export async function getUsageSummary() {
  try {
    // 1. Hourly timeline last 24h
    const hourly = await query<{
      hour_start: string;
      provider: string;
      calls_success: number;
      calls_failed: number;
      input_tokens: number;
      output_tokens: number;
      total_tokens: number;
    }>(`
      SELECT
        DATE_FORMAT(created_at, '%Y-%m-%d %H:00:00') AS hour_start,
        provider,
        SUM(IF(success=1, 1, 0))  AS calls_success,
        SUM(IF(success=0, 1, 0))  AS calls_failed,
        SUM(input_tokens)          AS input_tokens,
        SUM(output_tokens)         AS output_tokens,
        SUM(total_tokens)          AS total_tokens
      FROM ai_usage_log
      WHERE created_at >= NOW() - INTERVAL 24 HOUR
      GROUP BY hour_start, provider
      ORDER BY hour_start ASC
    `);

    // 2. Global totals per provider
    const summaries = await query<{
      provider: string;
      total_calls: number;
      calls_success: number;
      calls_failed: number;
      input_tokens: number;
      output_tokens: number;
      total_tokens: number;
    }>(`
      SELECT
        provider,
        COUNT(*)             AS total_calls,
        SUM(IF(success=1,1,0)) AS calls_success,
        SUM(IF(success=0,1,0)) AS calls_failed,
        SUM(input_tokens)    AS input_tokens,
        SUM(output_tokens)   AS output_tokens,
        SUM(total_tokens)    AS total_tokens
      FROM ai_usage_log
      GROUP BY provider
    `);

    // 3. Today's totals
    const today = await query<{
      provider: string;
      calls: number;
      calls_success: number;
      calls_failed: number;
      input_tokens: number;
      output_tokens: number;
      tokens: number;
    }>(`
      SELECT
        provider,
        COUNT(*)               AS calls,
        SUM(IF(success=1,1,0)) AS calls_success,
        SUM(IF(success=0,1,0)) AS calls_failed,
        SUM(input_tokens)      AS input_tokens,
        SUM(output_tokens)     AS output_tokens,
        SUM(total_tokens)      AS tokens
      FROM ai_usage_log
      WHERE DATE(created_at) = CURDATE()
      GROUP BY provider
    `);

    // 4. Per-endpoint breakdown (all time)
    const byEndpoint = await query<{
      endpoint: string;
      provider: string;
      calls: number;
      success_rate: number;
      total_tokens: number;
      avg_tokens: number;
    }>(`
      SELECT
        COALESCE(endpoint, 'unknown')  AS endpoint,
        provider,
        COUNT(*)                        AS calls,
        ROUND(AVG(success) * 100, 1)    AS success_rate,
        SUM(total_tokens)               AS total_tokens,
        ROUND(AVG(total_tokens), 0)     AS avg_tokens
      FROM ai_usage_log
      GROUP BY endpoint, provider
      ORDER BY calls DESC
    `);

    // 5. Recent calls (last 10)
    const recentCalls = await query<{
      id: number;
      provider: string;
      model: string;
      endpoint: string;
      user_id: number;
      input_tokens: number;
      output_tokens: number;
      total_tokens: number;
      success: number;
      error_type: string;
      created_at: string;
    }>(`
      SELECT id, provider, model, endpoint, user_id,
             input_tokens, output_tokens, total_tokens,
             success, error_type, created_at
      FROM ai_usage_log
      ORDER BY id DESC
      LIMIT 10
    `);

    const zero = { calls: 0, calls_success: 0, calls_failed: 0, input_tokens: 0, output_tokens: 0, tokens: 0 };
    const formattedToday: Record<string, typeof zero> = { gemini: { ...zero }, claude: { ...zero } };
    today.forEach(r => {
      formattedToday[r.provider] = {
        calls: r.calls,
        calls_success: r.calls_success,
        calls_failed: r.calls_failed,
        input_tokens: r.input_tokens,
        output_tokens: r.output_tokens,
        tokens: r.tokens,
      };
    });

    return { hourly, summaries, today: formattedToday, byEndpoint, recentCalls };
  } catch (err: any) {
    console.error('Failed to get AI usage summary:', err.message);
    return {
      hourly: [],
      summaries: [],
      today: { gemini: { calls: 0, calls_success: 0, calls_failed: 0, input_tokens: 0, output_tokens: 0, tokens: 0 } },
      byEndpoint: [],
      recentCalls: [],
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
        SUM(total_tokens)      AS total_tokens
      FROM ai_usage_log
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
    await execute(`DELETE FROM ai_usage_log WHERE created_at < NOW() - INTERVAL 7 DAY`, []);
    const weeks = new Set(old.map(r => r.week_start)).size;
    return { rolled: true, weeksProcessed: weeks };
  } catch (err: any) {
    console.error('rollupOldHourlyData failed:', err.message);
    return { rolled: false, weeksProcessed: 0 };
  }
}
