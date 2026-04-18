import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function generatePulseUpdate() {
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
    const text = response.text();
    
    // Attempt to parse JSON from the response (sometimes Gemini wraps it in code blocks)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Could not parse AI response');
  } catch (error) {
    console.error('Gemini generation failed:', error);
    return {
      title: 'Experience the Grandeur',
      content: 'Dubai Mall continues to set the standard for global retail and entertainment. Visit us for an unforgettable experience.',
      category: 'Lifestyle',
      ai_insight: 'Consistency is the hallmark of true luxury.'
    };
  }
}
