import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { recordUsage } from '@/lib/aiUsageTracker';
import { checkAndDeducedBudget, getRemainingBudget } from '@/lib/ai-budget';

// In-memory RPM limiter for Gemini
const rateStore = { count: 0, resetAt: Date.now() + 60_000 };
const RPM_LIMIT = parseInt(process.env.GEMINI_RPM_LIMIT || '15', 10);

const geminiState = { lastAliveAt: 0, lastFailAt: 0 };

function checkGeminiRate(): { allowed: boolean; waitSeconds: number } {
  const now = Date.now();
  if (now > rateStore.resetAt) {
    rateStore.count = 0;
    rateStore.resetAt = now + 60_000;
  }
  if (rateStore.count >= RPM_LIMIT) {
    return { allowed: false, waitSeconds: Math.ceil((rateStore.resetAt - now) / 1000) };
  }
  rateStore.count++;
  return { allowed: true, waitSeconds: 0 };
}

async function tryGemini(
  imageBase64: string,
  mimeType: string,
  apiKey: string
): Promise<{ data: Record<string, string> } | { error: string; waitSeconds?: number }> {
  const rate = checkGeminiRate();
  if (!rate.allowed) {
    return {
      error: `Gemini rate limit — wait ${rate.waitSeconds}s`,
      waitSeconds: rate.waitSeconds,
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const result = await model.generateContent([
      { inlineData: { data: imageBase64, mimeType } },
      `You are the chief curator and storyteller for THE DUBAI MALL — the world's most iconic luxury destination.
      Analyse this image with the eye of a Vogue Arabia editor meets an architect of human desire.

      Return ONLY valid JSON with these fields:
      {
        "title": "cinematic title, max 7 words, evocative and luxury",
        "description": "one sentence, poetic, max 20 words — what the eye first sees",
        "story": "2-3 sentences of rich storytelling narrative — emotion, desire, the WHY this image stops time",
        "emotional_hook": "the single feeling this triggers — e.g. Awe · Desire · Wonder · Serenity · Power",
        "category": "one of: architecture, fashion, dining, retail, art, events, luxury, general",
        "shift_style": "one of: spotlight, story, filmstrip, mosaic, editorial — best display style for this image"
      }`,
    ]);

    geminiState.lastAliveAt = Date.now();
    const usage = result.response.usageMetadata;
    const inputTokens  = usage?.promptTokenCount ?? 0;
    const outputTokens = usage?.candidatesTokenCount ?? 0;
    await recordUsage({ provider: 'gemini', model: 'gemini-1.5-flash', endpoint: 'ai/describe', inputTokens, outputTokens, totalTokens: inputTokens + outputTokens, success: true });

    const text = result.response.text().trim();
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return { error: 'Gemini parse error' };

    return { data: JSON.parse(match[0]) };
  } catch (err: any) {
    geminiState.lastFailAt = Date.now();
    const is429 = err?.status === 429;
    await recordUsage({ provider: 'gemini', model: 'gemini-1.5-flash', endpoint: 'ai/describe', inputTokens: 0, outputTokens: 0, totalTokens: 0, success: false, errorType: is429 ? '429' : 'error' });
    return {
      error: err.message || 'Gemini error',
      waitSeconds: is429 ? 60 : undefined,
    };
  }
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  // ── Budget Check ──────────────────────────────────────────────────────────
  const budget = await checkAndDeducedBudget(parseInt(session.user.id, 10), 100);
  if (!budget.allowed) {
    return NextResponse.json({ 
      error: 'out_of_budget', 
      message: budget.error 
    }, { status: 403 });
  }

  const body = await req.json();
  const { imageBase64, mimeType } = body;
  if (!imageBase64 || !mimeType) {
    return NextResponse.json({ error: 'imageBase64 and mimeType required' }, { status: 400 });
  }

  const geminiKey = process.env.GEMINI_API_KEY;
  const geminiConfigured = geminiKey && geminiKey !== 'your_gemini_api_key_here';

  if (!geminiConfigured) {
      return NextResponse.json({
      error: 'service_unavailable',
      message: 'Gemini is unavailable.',
    }, { status: 503 });
  }

  const geminiResult = await tryGemini(imageBase64, mimeType, geminiKey!);

  if ('data' in geminiResult) {
    return NextResponse.json({ ...geminiResult.data, provider: 'gemini' });
  }

  return NextResponse.json({
    error: 'rate_limit',
    message: `✨ Gemini AI is recharging. Available again in approximately ${geminiResult.waitSeconds} seconds.`,
    waitSeconds: geminiResult.waitSeconds,
  }, { status: 429 });
}

// GET — budget + provider status (admin only)
export async function GET(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const remaining = await getRemainingBudget(parseInt(session.user.id, 10));

  return NextResponse.json({
    remaining_budget: remaining,
    gemini: {
      lastAliveAt: geminiState.lastAliveAt ? new Date(geminiState.lastAliveAt).toISOString() : null,
      lastFailAt: geminiState.lastFailAt ? new Date(geminiState.lastFailAt).toISOString() : null,
    }
  });
}
