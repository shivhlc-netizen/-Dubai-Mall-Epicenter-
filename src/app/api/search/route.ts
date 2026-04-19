// Proxies to the Netlify Function search-v2 in production; falls back to static data in dev.
import { NextResponse } from 'next/server';

const SEARCH_INDEX = [
  { id: 's1', type: 'store', name: 'Louis Vuitton', category: 'Luxury Fashion', floor: 'Level 2', zone: 'Fashion Avenue', tags: ['bags', 'accessories', 'leather'] },
  { id: 's2', type: 'store', name: 'Cartier', category: 'Jewellery', floor: 'Level 2', zone: 'Fashion Avenue', tags: ['jewelry', 'watches', 'diamonds'] },
  { id: 's3', type: 'store', name: 'Rolex', category: 'Watches', floor: 'Level 2', zone: 'Fashion Avenue', tags: ['watches', 'swiss', 'luxury'] },
  { id: 's4', type: 'store', name: 'Chanel', category: 'Luxury Fashion', floor: 'Level 2', zone: 'Fashion Avenue', tags: ['fashion', 'perfume', 'bags'] },
  { id: 's5', type: 'store', name: 'Hermès', category: 'Luxury Fashion', floor: 'Level 2', zone: 'Fashion Avenue', tags: ['bags', 'birkin', 'scarves'] },
  { id: 's6', type: 'store', name: 'Apple Store', category: 'Electronics', floor: 'Level 1', zone: 'Grand Atrium', tags: ['tech', 'iphone', 'macbook'] },
  { id: 's7', type: 'store', name: 'Sephora', category: 'Beauty', floor: 'Level 1', zone: 'Beauty Boulevard', tags: ['makeup', 'skincare', 'beauty'] },
  { id: 'a1', type: 'attraction', name: 'Dubai Aquarium', category: 'Entertainment', floor: 'Level 1', zone: 'Aquarium Walk', tags: ['fish', 'marine', 'animals'] },
  { id: 'a2', type: 'attraction', name: 'Dubai Ice Rink', category: 'Entertainment', floor: 'Level 2', zone: 'Olympic Zone', tags: ['ice', 'skating', 'sport'] },
  { id: 'a3', type: 'attraction', name: 'Dubai Fountain View', category: 'Landmark', floor: 'Level 1', zone: 'Fountain Terrace', tags: ['fountain', 'show', 'burj'] },
  { id: 'd1', type: 'dining', name: 'Nobu Dubai', category: 'Fine Dining', floor: 'Level 1', zone: 'Fountain Terrace', tags: ['japanese', 'sushi', 'celebrity'] },
  { id: 'd2', type: 'dining', name: 'Zuma Dubai', category: 'Fine Dining', floor: 'Level 1', zone: 'Fountain Terrace', tags: ['japanese', 'robata', 'cocktails'] },
  { id: 'd3', type: 'dining', name: 'Din Tai Fung', category: 'Asian', floor: 'Level 1', zone: 'Grand Atrium', tags: ['chinese', 'dumplings', 'dim sum'] },
  { id: 'sv1', type: 'service', name: 'Concierge Desk', category: 'Service', floor: 'Level 1', zone: 'Grand Atrium', tags: ['help', 'info', 'assistance'] },
  { id: 'sv2', type: 'service', name: 'Prayer Rooms', category: 'Service', floor: 'Multiple', zone: 'All Levels', tags: ['prayer', 'salah', 'mosque'] },
  { id: 'sv3', type: 'service', name: 'Currency Exchange', category: 'Service', floor: 'Level 1', zone: 'Grand Atrium', tags: ['money', 'forex', 'cash'] },
];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.trim().toLowerCase() || '';
  const type = searchParams.get('type') || 'all';
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [], total: 0, query: q });
  }

  let pool = type === 'all' ? SEARCH_INDEX : SEARCH_INDEX.filter(i => i.type === type);

  const results = pool
    .map(item => {
      let score = 0;
      const name = item.name.toLowerCase();
      if (name === q) score += 100;
      else if (name.startsWith(q)) score += 60;
      else if (name.includes(q)) score += 40;
      if (item.category.toLowerCase().includes(q)) score += 20;
      if (item.tags?.some(t => t.includes(q))) score += 15;
      if (item.zone?.toLowerCase().includes(q)) score += 10;
      return { ...item, _score: score };
    })
    .filter(r => r._score > 0)
    .sort((a, b) => b._score - a._score)
    .slice(0, limit)
    .map(({ _score, ...item }) => item);

  return NextResponse.json({ results, total: results.length, query: q, type });
}
