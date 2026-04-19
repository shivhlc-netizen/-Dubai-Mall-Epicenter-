// Netlify Edge Function — Geo-based welcome personalisation
// Runs at CDN edge on every visit to "/", adds geo hint headers

import type { Config, Context } from 'https://edge.netlify.com';

// Maps country codes to languages/greetings for the Dubai Mall audience
const GEO_GREETINGS: Record<string, { greeting: string; lang: string }> = {
  AE: { greeting: 'مرحباً بكم', lang: 'ar' },       // UAE — Arabic
  SA: { greeting: 'مرحباً بكم', lang: 'ar' },       // Saudi Arabia
  GB: { greeting: 'Welcome', lang: 'en' },
  US: { greeting: 'Welcome', lang: 'en' },
  IN: { greeting: 'स्वागत है', lang: 'hi' },        // India
  CN: { greeting: '欢迎光临', lang: 'zh' },          // China
  RU: { greeting: 'Добро пожаловать', lang: 'ru' },  // Russia
  DE: { greeting: 'Willkommen', lang: 'de' },        // Germany
  FR: { greeting: 'Bienvenue', lang: 'fr' },         // France
  JP: { greeting: 'いらっしゃいませ', lang: 'ja' },  // Japan
  KR: { greeting: '환영합니다', lang: 'ko' },        // South Korea
  BR: { greeting: 'Bem-vindo', lang: 'pt' },        // Brazil
  PK: { greeting: 'خوش آمدید', lang: 'ur' },       // Pakistan
  EG: { greeting: 'أهلاً وسهلاً', lang: 'ar' },    // Egypt
};

export default async (req: Request, context: Context) => {
  const response = await context.next();

  const country = context.geo?.country?.code || 'US';
  const city = context.geo?.city || '';
  const geo = GEO_GREETINGS[country] || { greeting: 'Welcome', lang: 'en' };

  // Inject geo hint headers — readable by client JS via response headers
  response.headers.set('X-Visitor-Country', country);
  response.headers.set('X-Visitor-City', encodeURIComponent(city));
  response.headers.set('X-Visitor-Greeting', encodeURIComponent(geo.greeting));
  response.headers.set('X-Visitor-Lang', geo.lang);
  response.headers.set('Vary', 'Accept-Language');

  return response;
};

export const config: Config = {
  path: '/',
  onError: 'bypass',
};
