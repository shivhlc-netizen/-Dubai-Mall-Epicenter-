import { NextRequest, NextResponse } from 'next/server';
import { requireManager } from '@/lib/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { recordUsage } from '@/lib/aiUsageTracker';
import { checkAndDeducedBudget } from '@/lib/ai-budget';

export async function POST(req: NextRequest) {
  const session = await requireManager();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const { moduleName } = await req.json();
    if (!moduleName) return NextResponse.json({ error: 'Module name required' }, { status: 400 });

    // Governance: Deduct 50 tokens for a brief
    const budget = await checkAndDeducedBudget(parseInt(session.user.id, 10), 50);
    if (!budget.allowed) {
      return NextResponse.json({ error: 'out_of_budget', message: budget.error }, { status: 403 });
    }

    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey || geminiKey === 'your_gemini_api_key_here') {
      return NextResponse.json({ error: 'service_unavailable' }, { status: 503 });
    }

    const genAI = new GoogleGenerativeAI(geminiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
      You are the AI Operating System for THE DUBAI MALL.
      Generate a 7-star strategic intelligence brief for the management module: "${moduleName}".
      
      Return ONLY valid JSON with:
      {
        "objective": "A cinematic one-sentence objective for this module.",
        "intelligence": [
          "Key strategic insight 1 (luxury toned)",
          "Key strategic insight 2",
          "Key strategic insight 3"
        ],
        "metrics": [
          {"label": "Metric A", "value": "98.2%", "trend": "up"},
          {"label": "Metric B", "value": "AED 4.2M", "trend": "stable"}
        ],
        "recommendation": "A high-level directive for the executive team."
      }
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const match = text.match(/\{[\s\S]*\}/);
    
    if (!match) throw new Error('Failed to parse AI response');

    await recordUsage({
      provider: 'gemini',
      model: 'gemini-1.5-flash',
      endpoint: 'admin/smart-brief',
      inputTokens: 100,
      outputTokens: 200,
      totalTokens: 300,
      success: true
    });

    return NextResponse.json(JSON.parse(match[0]));
  } catch (err: any) {
    console.error('Smart Brief Error:', err.message);
    return NextResponse.json({ error: 'Failed to generate intelligence' }, { status: 500 });
  }
}
