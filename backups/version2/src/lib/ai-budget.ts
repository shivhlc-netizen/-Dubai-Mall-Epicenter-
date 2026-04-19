import { queryOne, execute } from './db';

/**
 * AI Budget Utility
 * Ensures users stay within their allotted token budget.
 */
export async function checkAndDeducedBudget(userId: number, tokens: number = 100): Promise<{ allowed: boolean; remaining: number; error?: string }> {
  try {
    const user = await queryOne<{ api_budget: number; api_used: number }>(
      'SELECT api_budget, api_used FROM users WHERE id = ?',
      [userId]
    );

    if (!user) {
      return { allowed: false, remaining: 0, error: 'User not found' };
    }

    if (user.api_used + tokens > user.api_budget) {
      return { 
        allowed: false, 
        remaining: user.api_budget - user.api_used, 
        error: `Insufficient API budget. Required: ${tokens}, Available: ${user.api_budget - user.api_used}` 
      };
    }

    // Deduced budget and update timestamp
    await execute(
      'UPDATE users SET api_used = api_used + ?, last_api_request = NOW() WHERE id = ?',
      [tokens, userId]
    );

    return { allowed: true, remaining: user.api_budget - (user.api_used + tokens) };
  } catch (err: any) {
    console.error('AI Budget Check Error:', err.message);
    return { allowed: false, remaining: 0, error: 'System error checking budget' };
  }
}

export async function getRemainingBudget(userId: number): Promise<number> {
  const user = await queryOne<{ api_budget: number; api_used: number }>(
    'SELECT api_budget, api_used FROM users WHERE id = ?',
    [userId]
  );
  return (user?.api_budget || 0) - (user?.api_used || 0);
}
