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
// import { getClaudeBudgetStatus } from '@/lib/claudeFallback';
// import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
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

  // ── Step 2: Gemini visual check (Fallback from Claude) ────────────────────
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey || geminiKey === 'your_gemini_api_key_here') {
    return NextResponse.json({ isDuplicate: false, method: 'hash', confidence: 'no-hash-match', tokensUsed: 0 });
  }

  try {
    const genAI = new GoogleGenerativeAI(geminiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const result = await model.generateContent([
      { inlineData: { data: imageBase64, mimeType } },
      'Is this image a near-duplicate or visually identical to a common stock photo of Dubai Mall, shopping mall interior, or generic tourism image? Reply with only the single letter Y or N.',
    ]);

    const responseText = result.response.text().trim().toUpperCase();
    const isVisualDup = responseText.startsWith('Y');
    const usage = result.response.usageMetadata;
    const inputTokens = usage?.promptTokenCount ?? 0;
    const outputTokens = usage?.candidatesTokenCount ?? 0;
    const totalTokens = inputTokens + outputTokens;

    await recordUsage({ provider: 'gemini', model: 'gemini-1.5-flash', endpoint: 'gallery-tools/check-duplicate', inputTokens, outputTokens, totalTokens, success: true });

    return NextResponse.json({
      isDuplicate: isVisualDup,
      method: 'gemini',
      confidence: 'visual',
      tokensUsed: totalTokens,
      outputTokens,
      answer: responseText,
      message: isVisualDup
        ? 'Gemini flagged this as a potential visual duplicate'
        : 'No duplicate detected',
    });
  } catch (err: any) {
    console.error('Gemini Check Duplicate Error:', err);
    
    /* 
    // ── Original Anthropic Logic (Muted) ────────────────────────────────────
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (apiKey) {
      const budget = await getClaudeBudgetStatus();
      if (budget.remaining >= 50) {
        const client = new Anthropic({ apiKey });
        const response = await client.messages.create({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 2,
          messages: [{ role: 'user', content: [{ type: 'image', source: { type: 'base64', media_type: mimeType, data: imageBase64 } }, { type: 'text', text: '...' }] }]
        });
        // ... rest of logic
      }
    }
    */

    return NextResponse.json({
      isDuplicate: false,
      method: 'gemini-error',
      confidence: 'unknown',
      tokensUsed: 0,
      warning: err.message,
    });
  }
}
