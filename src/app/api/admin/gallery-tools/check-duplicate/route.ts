/**
 * Duplicate checker — 2-step:
 *   1. SHA-256 hash check (free, instant — catches exact copies)
 *   2. Claude visual check (max_tokens=2 — "Y" or "N" — only if hash misses)
 *
 * POST body: { imageBase64: string; mimeType: string }
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { query } from '@/lib/db';
import { recordUsage } from '@/lib/aiUsageTracker';
import { getClaudeBudgetStatus } from '@/lib/claudeFallback';
import Anthropic from '@anthropic-ai/sdk';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const GALLERY_DIR = path.join(process.cwd(), 'public', 'gallery');

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { imageBase64, mimeType } = await req.json();
  if (!imageBase64 || !mimeType) {
    return NextResponse.json({ error: 'imageBase64 and mimeType required' }, { status: 400 });
  }

  // ── Step 1: SHA-256 hash check (free) ────────────────────────────────────
  const buf  = Buffer.from(imageBase64, 'base64');
  const hash = crypto.createHash('sha256').update(buf).digest('hex');

  const existing = await query<{ id: number; title: string; path: string }>(
    'SELECT id, title, path FROM gallery_images WHERE fingerprint = ? LIMIT 1',
    [hash]
  );

  if (existing.length) {
    return NextResponse.json({
      isDuplicate: true,
      method: 'hash',
      confidence: 'exact',
      matchId: existing[0].id,
      matchTitle: existing[0].title,
      matchPath: existing[0].path,
      tokensUsed: 0,
      message: 'Exact duplicate found (SHA-256 match)',
    });
  }

  // ── Step 2: Claude visual check (max_tokens=2 → "Y" or "N") ─────────────
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ isDuplicate: false, method: 'hash', confidence: 'no-hash-match', tokensUsed: 0 });
  }

  // Check Claude budget before calling
  const budget = await getClaudeBudgetStatus();
  if (budget.remaining < 50) {
    return NextResponse.json({
      isDuplicate: false,
      method: 'hash',
      confidence: 'no-hash-match',
      tokensUsed: 0,
      warning: 'Claude budget too low for visual check — hash check only',
    });
  }

  // Get sample of existing gallery fingerprints to compare thumbnails
  // We pass the new image and ask Claude for a simple yes/no
  const client = new Anthropic({ apiKey });

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mimeType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
                data: imageBase64,
              },
            },
            {
              type: 'text',
              // Tight prompt — forces single letter answer to stay at 1-2 tokens
              text: 'Is this image a near-duplicate or visually identical to a common stock photo of Dubai Mall, shopping mall interior, or generic tourism image? Reply with only the single letter Y or N.',
            },
          ],
        },
      ],
    });

    const inputTokens  = response.usage.input_tokens;
    const outputTokens = response.usage.output_tokens;
    const totalTokens  = inputTokens + outputTokens;

    await recordUsage({ provider: 'claude', inputTokens, outputTokens, totalTokens, success: true });

    const answer = response.content[0].type === 'text' ? response.content[0].text.trim().toUpperCase() : 'N';
    const isVisualDup = answer.startsWith('Y');

    return NextResponse.json({
      isDuplicate: isVisualDup,
      method: 'claude',
      confidence: 'visual',
      tokensUsed: totalTokens,
      outputTokens,
      answer,
      message: isVisualDup
        ? 'Claude flagged this as a potential visual duplicate'
        : 'No duplicate detected',
    });
  } catch (err: any) {
    await recordUsage({ provider: 'claude', inputTokens: 0, outputTokens: 0, totalTokens: 0, success: false });
    return NextResponse.json({
      isDuplicate: false,
      method: 'claude-error',
      confidence: 'unknown',
      tokensUsed: 0,
      warning: err.message,
    });
  }
}
