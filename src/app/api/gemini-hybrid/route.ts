import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { recordUsage } from '@/lib/aiUsageTracker';
import { query } from '@/lib/db';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export async function POST(req: NextRequest) {
  try {
    const { prompt, context, userId, language = 'en' } = await req.json();

    // 1. Fetch relevant mall + wonders context from DB
    const [stores, wonders] = await Promise.all([
      query('SELECT name, description, category_name FROM retail_stores LIMIT 5'),
      query('SELECT name, description, era FROM museum_wonders LIMIT 7')
    ]);

    const systemContext = `
      You are the Epicenter AI for DubaiSevenWonders. 
      You handle queries about the Dubai Mall and the 7 Wonders of the Future Museum.
      Current Mall Data: ${JSON.stringify(stores)}
      Museum Wonders: ${JSON.stringify(wonders)}
      Language: ${language}
      Goal: Provide high-luxury, informative, and synchronized responses.
    `;

    const result = await model.generateContent([
      { text: systemContext },
      { text: prompt }
    ]);

    const responseText = result.response.text();

    const usage = result.response.usageMetadata;
    await recordUsage({
      provider: 'gemini',
      model: 'gemini-1.5-flash',
      endpoint: 'gemini-hybrid',
      userId: userId || null,
      inputTokens: usage?.promptTokenCount || 0,
      outputTokens: usage?.candidatesTokenCount || 0,
      totalTokens: (usage?.promptTokenCount || 0) + (usage?.candidatesTokenCount || 0),
      success: true,
    });

    return NextResponse.json({ 
      response: responseText,
      recommendation: "Visit the Luxury Wing near the virtual Great Wall exhibit for an immersive experience.",
      status: "Verified by Gemini"
    });

  } catch (error: any) {
    await recordUsage({
      provider: 'gemini',
      model: 'gemini-1.5-flash',
      endpoint: 'gemini-hybrid',
      inputTokens: 0, outputTokens: 0, totalTokens: 0,
      success: false,
      errorType: error?.status === 429 ? '429' : 'error',
    });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
