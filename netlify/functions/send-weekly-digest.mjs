// Netlify Functions v2 — Weekly Digest (Scheduled)
// Schedule: Monday 9am UTC (configured in netlify.toml)
// Sends a weekly highlights digest to registered subscribers

import nodemailer from 'nodemailer';
import mysql from 'mysql2/promise';
import { GoogleGenerativeAI } from '@google/generative-ai';

const FALLBACK_CONTENT = {
  headline: 'Your Weekly Dubai Mall Highlights',
  intro: 'Experience the pinnacle of luxury retail, world-class dining, and unforgettable entertainment.',
  highlights: [
    { title: 'Fashion Avenue', desc: 'Discover the latest arrivals from 150+ luxury brands.' },
    { title: 'Dubai Aquarium', desc: '33,000 marine animals await your visit.' },
    { title: 'Fountain Shows', desc: 'Evening shows every 30 minutes from 6pm.' },
  ],
};

async function generateDigestContent(apiKey) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `Generate a weekly highlights digest for The Dubai Mall.
Return ONLY valid JSON (no markdown):
{
  "headline": "An enticing subject line (max 10 words)",
  "intro": "A 1-2 sentence warm welcome for the week.",
  "highlights": [
    { "title": "Category name", "desc": "1 sentence highlight" },
    { "title": "Category name", "desc": "1 sentence highlight" },
    { "title": "Category name", "desc": "1 sentence highlight" }
  ]
}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const match = text.match(/\{[\s\S]*?\}/);
    if (match) return JSON.parse(match[0]);
  } catch {}
  return FALLBACK_CONTENT;
}

function buildDigestEmail(content, unsubToken) {
  const highlights = content.highlights
    .map(h => `
      <div style="margin-bottom:20px;padding:16px;border-left:2px solid #c9a052">
        <div style="color:#c9a052;font-weight:bold;letter-spacing:0.1em;text-transform:uppercase;font-size:0.85em">${h.title}</div>
        <div style="color:#ccc;margin-top:4px">${h.desc}</div>
      </div>`)
    .join('');

  return `
    <div style="font-family:sans-serif;background:#050505;color:#fff;padding:40px;max-width:600px;margin:0 auto;border:1px solid #1a1a1a">
      <div style="text-align:center;margin-bottom:32px">
        <div style="color:#c9a052;font-size:1.2em;letter-spacing:0.3em;text-transform:uppercase">The Dubai Mall</div>
        <div style="color:#555;font-size:0.7em;letter-spacing:0.4em;text-transform:uppercase;margin-top:4px">Weekly Epicenter Digest</div>
      </div>
      <h1 style="color:#fff;font-size:1.4em;font-weight:300;letter-spacing:0.1em;border-bottom:1px solid #222;padding-bottom:20px">${content.headline}</h1>
      <p style="color:#aaa;line-height:1.7">${content.intro}</p>
      <div style="margin:32px 0">${highlights}</div>
      <div style="text-align:center;margin:40px 0">
        <a href="https://dubai-mall-epicenter.netlify.app" style="background:#c9a052;color:#000;text-decoration:none;padding:12px 32px;font-size:0.85em;letter-spacing:0.2em;text-transform:uppercase">Explore Now</a>
      </div>
      <hr style="border:0;border-top:1px solid #1a1a1a;margin:32px 0"/>
      <p style="color:#444;font-size:0.7em;text-align:center">
        You're receiving this because you're a Dubai Mall Epicenter member.<br/>
        <a href="https://dubai-mall-epicenter.netlify.app/unsubscribe?token=${unsubToken}" style="color:#666">Unsubscribe</a>
      </p>
    </div>
  `;
}

export default async () => {
  console.log('[DIGEST] Weekly digest START', new Date().toISOString());

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('[DIGEST] No SMTP config — skipping');
    return new Response(JSON.stringify({ ok: false, reason: 'no_smtp' }), { status: 200 });
  }

  // Generate content
  const content = process.env.GEMINI_API_KEY
    ? await generateDigestContent(process.env.GEMINI_API_KEY)
    : FALLBACK_CONTENT;

  // Fetch subscribers from DB
  let subscribers = [];
  if (process.env.DB_HOST && process.env.DB_USER) {
    try {
      const conn = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
      });
      const [rows] = await conn.execute(
        "SELECT email, unsub_token FROM users WHERE is_subscribed = 1 AND status = 'active' LIMIT 500"
      );
      await conn.end();
      subscribers = rows;
    } catch (dbErr) {
      console.error('[DIGEST] DB fetch failed:', dbErr.message);
    }
  }

  if (subscribers.length === 0) {
    console.log('[DIGEST] No subscribers — done');
    return new Response(JSON.stringify({ ok: true, sent: 0 }), { status: 200 });
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  let sent = 0;
  for (const sub of subscribers) {
    try {
      await transporter.sendMail({
        from: `"Dubai Mall Epicenter" <${process.env.SMTP_USER}>`,
        to: sub.email,
        subject: content.headline,
        html: buildDigestEmail(content, sub.unsub_token || ''),
      });
      sent++;
    } catch (err) {
      console.error('[DIGEST] Failed for', sub.email, err.message);
    }
  }

  console.log(`[DIGEST] Sent to ${sent}/${subscribers.length} subscribers`);
  return new Response(JSON.stringify({ ok: true, sent, total: subscribers.length }), { status: 200 });
};
