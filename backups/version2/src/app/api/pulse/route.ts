import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function GET() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
    });

    const [rows]: any = await connection.execute(
      'SELECT * FROM pulse_news ORDER BY created_at DESC LIMIT 5'
    );

    await connection.end();

    return NextResponse.json(rows);
  } catch (error: any) {
    console.error('Failed to fetch pulse news:', error);
    // Return mock data if DB fails or for demo
    return NextResponse.json([
      {
        id: 0,
        title: 'The Peak of Luxury',
        content: 'Experience the new collection at Fashion Avenue, where global style meets Arabian hospitality.',
        category: 'Luxury Fashion',
        ai_insight: 'Exclusive becomes the new standard.',
        created_at: new Date().toISOString()
      }
    ]);
  }
}
