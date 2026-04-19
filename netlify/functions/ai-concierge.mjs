// Netlify Functions v2 — AI Concierge powered by Gemini
// POST /.netlify/functions/ai-concierge  { message: string, history?: {role,text}[] }

const SYSTEM_CONTEXT = `You are the AI Concierge for The Dubai Mall — the world's most visited retail destination.
Key facts:
- 1,200+ world-class stores across 5.9M sq ft
- 200+ dining options from street food to Michelin-starred
- Attractions: Dubai Aquarium (33,000 marine animals), Ice Rink, VR Park, KidZania
- Fashion Avenue: 150+ luxury brands including LV, Chanel, Hermès, Gucci
- Annual visitors: 100M+ from 180+ nationalities
- Location: Downtown Dubai, adjacent to Burj Khalifa
- Opening hours: Sun-Wed 10am-12am, Thu-Sat 10am-1am

Be warm, sophisticated, concise and helpful. Always steer toward actionable visit guidance.
Respond in 2-4 sentences max unless the visitor asks for detailed info.`;

export default async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { message, history = [] } = body;
  if (!message?.trim()) {
    return Response.json({ error: 'message is required' }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json({
      response: 'Welcome to The Dubai Mall! Our physical concierge team is available daily 10am–midnight at Level 1, Grand Atrium.',
      status: 'no_api_key',
    });
  }

  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: SYSTEM_CONTEXT,
    });

    const chat = model.startChat({
      history: history.map(h => ({
        role: h.role,
        parts: [{ text: h.text }],
      })),
    });

    const result = await chat.sendMessage(message);
    const response = result.response.text();

    return Response.json({
      response,
      status: 'ok',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[AI-CONCIERGE] Error:', err.message);
    return Response.json({
      response: 'I apologize for the interruption. Our team at the Concierge Desk (Level 1) is always happy to assist you personally.',
      status: 'error',
    });
  }
};
