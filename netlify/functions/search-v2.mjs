// Netlify Functions v2 — Full-text search across mall content
// GET /.netlify/functions/search-v2?q=louis&type=store|attraction|dining|all

const INDEX = [
  // Stores
  { id: 's1', type: 'store', name: 'Louis Vuitton', category: 'Luxury Fashion', floor: 'Level 2', zone: 'Fashion Avenue', tags: ['bags', 'accessories', 'leather', 'lv'] },
  { id: 's2', type: 'store', name: 'Cartier', category: 'Jewellery', floor: 'Level 2', zone: 'Fashion Avenue', tags: ['jewelry', 'watches', 'rings', 'diamonds'] },
  { id: 's3', type: 'store', name: 'Rolex', category: 'Watches', floor: 'Level 2', zone: 'Fashion Avenue', tags: ['watches', 'luxury', 'swiss', 'timepiece'] },
  { id: 's4', type: 'store', name: 'Chanel', category: 'Luxury Fashion', floor: 'Level 2', zone: 'Fashion Avenue', tags: ['fashion', 'perfume', 'bags', 'couture'] },
  { id: 's5', type: 'store', name: 'Hermès', category: 'Luxury Fashion', floor: 'Level 2', zone: 'Fashion Avenue', tags: ['bags', 'birkin', 'scarves', 'leather'] },
  { id: 's6', type: 'store', name: 'Gucci', category: 'Luxury Fashion', floor: 'Level 2', zone: 'Fashion Avenue', tags: ['fashion', 'bags', 'shoes', 'accessories'] },
  { id: 's7', type: 'store', name: 'Prada', category: 'Luxury Fashion', floor: 'Level 2', zone: 'Fashion Avenue', tags: ['fashion', 'bags', 'nylon', 'shoes'] },
  { id: 's8', type: 'store', name: 'Apple Store', category: 'Electronics', floor: 'Level 1', zone: 'Grand Atrium', tags: ['tech', 'iphone', 'macbook', 'ipad', 'apple'] },
  { id: 's9', type: 'store', name: 'Samsung Experience', category: 'Electronics', floor: 'Level 1', zone: 'Grand Atrium', tags: ['tech', 'galaxy', 'smartphone', 'samsung'] },
  { id: 's10', type: 'store', name: 'Sephora', category: 'Beauty', floor: 'Level 1', zone: 'Beauty Boulevard', tags: ['makeup', 'skincare', 'beauty', 'perfume'] },
  // Attractions
  { id: 'a1', type: 'attraction', name: 'Dubai Aquarium & Underwater Zoo', category: 'Entertainment', floor: 'Level 1', zone: 'Aquarium Walk', tags: ['aquarium', 'fish', 'shark', 'marine', 'zoo', 'animals'] },
  { id: 'a2', type: 'attraction', name: 'Dubai Ice Rink', category: 'Entertainment', floor: 'Level 2', zone: 'Olympic Zone', tags: ['ice', 'skating', 'rink', 'winter', 'sport'] },
  { id: 'a3', type: 'attraction', name: 'Dubai Fountain View', category: 'Landmark', floor: 'Level 1', zone: 'Fountain Terrace', tags: ['fountain', 'show', 'water', 'burj', 'khalifa', 'view'] },
  { id: 'a4', type: 'attraction', name: 'VR Park', category: 'Entertainment', floor: 'Level 2', zone: 'Entertainment Hub', tags: ['vr', 'virtual reality', 'gaming', 'rides', 'fun'] },
  { id: 'a5', type: 'attraction', name: 'KidZania Dubai', category: 'Family', floor: 'Level 2', zone: 'Family Zone', tags: ['kids', 'children', 'play', 'education', 'family'] },
  // Dining
  { id: 'd1', type: 'dining', name: 'The Cheesecake Factory', category: 'Casual Dining', floor: 'Level 2', zone: 'Fountain Views', tags: ['cheesecake', 'american', 'casual', 'brunch'] },
  { id: 'd2', type: 'dining', name: 'Nobu Dubai', category: 'Fine Dining', floor: 'Level 1', zone: 'Fountain Terrace', tags: ['japanese', 'sushi', 'fine dining', 'nobu', 'celebrity'] },
  { id: 'd3', type: 'dining', name: 'Zuma Dubai', category: 'Fine Dining', floor: 'Level 1', zone: 'Fountain Terrace', tags: ['japanese', 'izakaya', 'robata', 'cocktails', 'upscale'] },
  { id: 'd4', type: 'dining', name: 'Din Tai Fung', category: 'Asian', floor: 'Level 1', zone: 'Grand Atrium', tags: ['chinese', 'dumplings', 'dim sum', 'soup'] },
  { id: 'd5', type: 'dining', name: 'The Foodhall', category: 'Food Court', floor: 'Level 2', zone: 'The Foodhall', tags: ['food court', 'variety', 'fast food', 'international'] },
  // Services
  { id: 'sv1', type: 'service', name: 'Valet Parking', category: 'Service', floor: 'Ground', zone: 'All Entrances', tags: ['parking', 'valet', 'car', 'entrance'] },
  { id: 'sv2', type: 'service', name: 'Concierge Desk', category: 'Service', floor: 'Level 1', zone: 'Grand Atrium', tags: ['help', 'info', 'concierge', 'assistance', 'guide'] },
  { id: 'sv3', type: 'service', name: 'Lost & Found', category: 'Service', floor: 'Level 1', zone: 'Security Office', tags: ['lost', 'found', 'missing', 'security'] },
  { id: 'sv4', type: 'service', name: 'Prayer Rooms', category: 'Service', floor: 'Multiple', zone: 'All Levels', tags: ['prayer', 'mosque', 'muslim', 'salah', 'wudu'] },
  { id: 'sv5', type: 'service', name: 'Currency Exchange', category: 'Service', floor: 'Level 1', zone: 'Grand Atrium', tags: ['money', 'exchange', 'forex', 'currency', 'cash'] },
];

export default async (req) => {
  const url = new URL(req.url);
  const q = url.searchParams.get('q')?.trim().toLowerCase() || '';
  const type = url.searchParams.get('type') || 'all';
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 50);

  if (!q || q.length < 2) {
    return Response.json({ results: [], total: 0, query: q, hint: 'Provide at least 2 characters' });
  }

  let pool = type === 'all' ? INDEX : INDEX.filter(item => item.type === type);

  const results = pool
    .map(item => {
      let score = 0;
      const name = item.name.toLowerCase();
      const cat = item.category.toLowerCase();
      if (name === q) score += 100;
      else if (name.startsWith(q)) score += 60;
      else if (name.includes(q)) score += 40;
      if (cat.includes(q)) score += 20;
      if (item.tags?.some(t => t.includes(q))) score += 15;
      if (item.zone?.toLowerCase().includes(q)) score += 10;
      return { ...item, _score: score };
    })
    .filter(r => r._score > 0)
    .sort((a, b) => b._score - a._score)
    .slice(0, limit)
    .map(({ _score, ...item }) => item);

  return Response.json({
    results,
    total: results.length,
    query: q,
    type,
  });
};
