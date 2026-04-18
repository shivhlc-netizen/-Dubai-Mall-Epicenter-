const { GoogleGenerativeAI } = require('@google/generative-ai');
const mysql = require('mysql2/promise');

// Netlify Scheduled Function (Cron)
// This will run twice a week (Tuesday and Friday at Midnight)
// Configuration is handled via Netlify Dashboard or netlify.toml

exports.handler = async (event, context) => {
  console.log('--- CRON: GEMINI PULSE UPDATE START ---');
  
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  
  const prompt = `
    You are the AI Concierge for The Dubai Mall. 
    Generate a fresh, exciting update about what's happening at the mall this week.
    Focus on one of these categories: "Luxury Fashion", "Dining", "Entertainment", or "Lifestyle".
    
    Return a JSON object with:
    - title: A catchy headline.
    - content: A 2-3 sentence description.
    - category: The chosen category.
    - ai_insight: A unique perspective on why this matters (1 sentence).
    
    Make it sound ultra-premium and exclusive.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const update = JSON.parse(response.text().match(/\{[\s\S]*\}/)[0]);

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
    console.log('✓ Pulse update saved to database.');

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, update })
    };
  } catch (error) {
    console.error('✗ Cron failed:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
