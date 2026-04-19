// Netlify Functions v2 — ESM format
// Schedule: Tuesday + Friday 00:00 UTC (configured in netlify.toml)
import { GoogleGenerativeAI } from '@google/generative-ai';
import mysql from 'mysql2/promise';

const FALLBACK = {
  title: 'The Pinnacle of Luxury Awaits',
  content: 'Dubai Mall continues to redefine global retail with unparalleled experiences across 5.9M sq ft.',
  category: 'Lifestyle',
  ai_insight: 'True luxury is measured by the memories it creates, not the price tags it carries.',
};

export default async () => {
  console.log('[CRON] gemini-pulse v2 START', new Date().toISOString());

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('[CRON] GEMINI_API_KEY not set — skipping');
    return new Response(JSON.stringify({ ok: false, reason: 'no_api_key' }), { status: 200 });
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `You are the AI Concierge for The Dubai Mall — the world's most visited retail destination.
Generate a fresh, exclusive update for this week.
Choose ONE category: "Luxury Fashion" | "Dining" | "Entertainment" | "Lifestyle" | "Wellness".

Respond ONLY with a valid JSON object (no markdown, no code blocks):
{
  "title": "A short, ultra-premium headline (max 12 words)",
  "content": "2-3 sentences about what makes this week exceptional.",
  "category": "chosen category",
  "ai_insight": "One sentence insight on the significance of this moment."
}`;

  let update = FALLBACK;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const match = text.match(/\{[\s\S]*?\}/);
    if (match) update = JSON.parse(match[0]);
  } catch (err) {
    console.error('[CRON] Gemini generation failed, using fallback:', err.message);
  }

  // Persist to DB if credentials exist
  if (process.env.DB_HOST && process.env.DB_USER) {
    try {
      const conn = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
      });
      await conn.execute(
        'INSERT INTO pulse_news (title, content, category, ai_insight) VALUES (?, ?, ?, ?)',
        [update.title, update.content, update.category, update.ai_insight]
      );
      await conn.end();
      console.log('[CRON] Pulse saved to DB');
    } catch (dbErr) {
      console.error('[CRON] DB write failed (non-fatal):', dbErr.message);
    }
  }

  return new Response(JSON.stringify({ ok: true, update }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
