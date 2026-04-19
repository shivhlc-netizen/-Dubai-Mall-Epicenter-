// Netlify Edge Function — Lightweight rate limiting for API routes
// Limits abusive IPs to 60 requests/minute using Netlify's edge context

import type { Config, Context } from 'https://edge.netlify.com';

// In-memory store (per edge instance — resets on cold start, good enough for basic protection)
const RATE_STORE = new Map<string, { count: number; reset: number }>();
const LIMIT = 60;          // requests per window
const WINDOW_MS = 60_000;  // 1 minute

// Paths that should never be rate-limited
const EXCLUDED = ['/api/auth/', '/api/fn/resilient-automation'];

export default async (req: Request, context: Context) => {
  const url = new URL(req.url);

  if (EXCLUDED.some(p => url.pathname.startsWith(p))) {
    return context.next();
  }

  const ip = context.ip || req.headers.get('x-forwarded-for') || 'unknown';
  const now = Date.now();
  const entry = RATE_STORE.get(ip);

  if (!entry || now > entry.reset) {
    RATE_STORE.set(ip, { count: 1, reset: now + WINDOW_MS });
    return context.next();
  }

  entry.count += 1;

  if (entry.count > LIMIT) {
    const retryAfter = Math.ceil((entry.reset - now) / 1000);
    return new Response(
      JSON.stringify({ error: 'Too many requests', retryAfter }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(retryAfter),
          'X-RateLimit-Limit': String(LIMIT),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(entry.reset / 1000)),
        },
      }
    );
  }

  const response = await context.next();
  response.headers.set('X-RateLimit-Limit', String(LIMIT));
  response.headers.set('X-RateLimit-Remaining', String(Math.max(0, LIMIT - entry.count)));
  return response;
};

export const config: Config = {
  path: '/api/*',
  onError: 'bypass',
};
