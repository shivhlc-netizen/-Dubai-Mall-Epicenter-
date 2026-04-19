import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const SYSTEM = `You are the AI Concierge for The Dubai Mall — the world's most visited retail destination with 1,200+ stores, 200+ dining options, and iconic attractions. Be warm, sophisticated, and concise. 2-4 sentences max.`;

const FALLBACK = {
  response: 'Dubai Mall offers a world-class luxury experience across 5.9M sq ft — from Fashion Avenue\'s 150+ luxury brands to the Dubai Aquarium and fountain shows nightly.',
  recommendation: 'Start at Fashion Avenue for luxury retail, then visit the Aquarium before dining at the Fountain Terrace.',
  status: 'Demo Mode',
};

export async function POST(req: Request) {
  let message = '';
  let history: { role: string; text: string }[] = [];

  try {
    const body = await req.json();
    message = body.message || '';
    history = body.history || [];
  } catch {
    return NextResponse.json(FALLBACK);
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || !message.trim()) {
    return NextResponse.json({ ...FALLBACK, status: message ? 'no_api_key' : 'empty_message' });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: SYSTEM,
    });

    const chat = model.startChat({
      history: history.map(h => ({ role: h.role, parts: [{ text: h.text }] })),
    });

    const result = await chat.sendMessage(message);
    const response = result.response.text();

    return NextResponse.json({ response, recommendation: '', status: 'ok' });
  } catch (err: any) {
    console.error('[gemini-hybrid] Error:', err.message);
    return NextResponse.json({ ...FALLBACK, status: 'error' });
  }
}

export const GET = POST;
