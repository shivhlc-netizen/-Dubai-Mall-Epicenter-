import { NextResponse } from 'next/server';
import { generatePulseUpdate } from '@/lib/gemini';
import mysql from 'mysql2/promise';

export async function POST() {
  try {
    const update = await generatePulseUpdate();
    
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
    });

    await connection.execute(
      'INSERT INTO pulse_news (title, content, category, ai_insight) VALUES (?, ?, ?, ?)',
      [update.title, update.content, update.category, update.ai_insight]
    );

    await connection.end();
    
    return NextResponse.json({ ok: true, update });
  } catch (error: any) {
    console.error('Manual pulse trigger failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, schedule: '0 0 * * 2,5' });
}
