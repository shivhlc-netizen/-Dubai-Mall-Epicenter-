export const SECTIONS = [
  { id: 'hero', label: 'Home' },
  { id: 'why', label: 'Overview' },
  { id: 'retail', label: 'Retail' },
  { id: 'luxury', label: 'Luxury' },
  { id: 'dining', label: 'Dining' },
  { id: 'pulse', label: 'Pulse' },
  { id: 'attractions', label: 'Attractions' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'experience', label: 'Scrapbook' },
  { id: 'events', label: 'Events' },
  { id: 'wow', label: '5 Facts' },
];

export const STATS = [
  { value: 100, suffix: 'M+', label: 'Annual Visitors', sublabel: 'More than all of New York City' },
  { value: 1200, suffix: '+', label: 'World-Class Stores', sublabel: 'Across 5.9M sq ft of retail' },
  { value: 200, suffix: '+', label: 'Dining Experiences', sublabel: 'From street food to Michelin stars' },
  { value: 180, suffix: '+', label: 'Nationalities', sublabel: 'Global reach, local heart' },
];

export const WHY_STATS = [
  { value: 100, suffix: 'M+', label: 'Annual Visitors' },
  { value: 18.6, suffix: 'M', label: 'Sq Ft Destination', decimals: 1 },
  { value: 1200, suffix: '+', label: 'Stores & Brands' },
  { value: 180, suffix: '+', label: 'Nationalities Served' },
];

export const LUXURY_BRANDS = [
  'CHANEL', 'LOUIS VUITTON', 'HERMÈS', 'DIOR', 'GUCCI', 'PRADA',
  'VALENTINO', 'BURBERRY', 'CARTIER', 'TIFFANY & CO.', 'ROLEX', 'PATEK PHILIPPE',
  'BOTTEGA VENETA', 'SAINT LAURENT', 'GIVENCHY', 'VERSACE', 'FENDI', 'BALENCIAGA',
  'ALEXANDER MCQUEEN', 'BALMAIN', 'CELINE', 'LOEWE', 'MIU MIU', 'STELLA MCCARTNEY',
];

export const RETAIL_CATEGORIES = [
  { name: 'Luxury & Fashion', count: '330+', icon: '◈' },
  { name: 'Electronics & Tech', count: '80+', icon: '◉' },
  { name: 'Sports & Outdoor', count: '60+', icon: '◎' },
  { name: 'Beauty & Wellness', count: '120+', icon: '◇' },
  { name: 'Home & Living', count: '70+', icon: '◆' },
  { name: 'Books & Gifts', count: '40+', icon: '◈' },
];

export const DINING_HIGHLIGHTS = [
  { name: 'Fine Dining', desc: 'Michelin-starred chefs and celebrity restaurants with views of the Dubai Fountain', count: '40+ restaurants' },
  { name: 'International Cuisine', desc: 'From authentic Japanese Omakase to Levantine mezze — 60+ global cuisines under one roof', count: '200+ restaurants' },
  { name: 'Café Culture', desc: "Third-wave coffee, artisanal patisseries, and Dubai's most Instagrammed terraces", count: '50+ cafés' },
  { name: 'The Waterfall Terrace', desc: 'Al fresco dining alongside the iconic Dubai Fountain with Burj Khalifa backdrop', count: 'Icon dining' },
];

export const ATTRACTIONS = [
  {
    name: 'Dubai Aquarium & Underwater Zoo',
    desc: "One of the world's largest indoor aquariums. 33,000 living animals. Walk through a 270° tunnel.",
    stat: '33,000+ Marine Animals',
    color: '#0077B6',
  },
  {
    name: 'Dubai Ice Rink',
    desc: 'An Olympic-size ice rink at the heart of the mall. Open year-round for skating, hockey and events.',
    stat: 'Olympic-Size Rink',
    color: '#48CAE4',
  },
  {
    name: 'VR Park',
    desc: 'Over 30 cutting-edge virtual and augmented reality experiences for all ages.',
    stat: '30+ VR Experiences',
    color: '#7B2FBE',
  },
  {
    name: 'KidZania Dubai',
    desc: 'An interactive city where children explore 70+ career experiences in a safe, fun environment.',
    stat: '70+ Career Roles',
    color: '#F77F00',
  },
  {
    name: 'Reel Cinemas',
    desc: '22-screen cinema complex with IMAX, 4DX, and luxury Gold Class auditoriums.',
    stat: '22 Screens — IMAX + 4DX',
    color: '#C9A052',
  },
  {
    name: 'Dubai Fountain',
    desc: "The world's largest choreographed fountain. 275m long. Visible from 27km away.",
    stat: "World's Largest Fountain",
    color: '#2EC4B6',
  },
];

export const EVENTS_DATA = [
  { name: 'Dubai Shopping Festival', desc: "The world's largest shopping festival. 35 days of sales, events and entertainment.", attendees: '4M+' },
  { name: 'NYE Grand Fireworks', desc: 'Globally-watched New Year countdown, broadcast to 500M+ viewers worldwide.', attendees: '2M+ Live' },
  { name: 'Fashion Shows & Runway', desc: "International fashion weeks, brand launches, and exclusive designer showcases.", attendees: '50+ Shows/Year' },
  { name: 'Brand Activations', desc: "BMW, Apple, Samsung, and the world's top brands choose Dubai Mall for global launches.", attendees: '200+ Activations' },
  { name: 'Celebrity Appearances', desc: 'Book signings, athlete meet-and-greets, and exclusive live performances.', attendees: '100+ Stars/Year' },
  { name: 'Art & Culture Exhibitions', desc: 'Rotating gallery installations, UAE National Day celebrations, and cultural festivals.', attendees: '500K+ Visitors' },
];

export const SPONSORSHIP_TIERS = [
  {
    tier: 'DIAMOND',
    price: 'AED 5M+',
    color: '#B9F2FF',
    perks: [
      'Naming rights on a landmark zone',
      'Exclusive activation space (5,000+ sq ft)',
      'Premium digital display network',
      'VIP event access & co-branding',
      'Dedicated audience data dashboard',
      'Celebrity appearance priority',
    ],
  },
  {
    tier: 'PLATINUM',
    price: 'AED 1M–5M',
    color: '#C9A052',
    perks: [
      'Category exclusivity rights',
      'Branded activation pop-up (2,000 sq ft)',
      'Digital screen package',
      'Event co-sponsorship (3 events)',
      'Monthly performance reports',
    ],
  },
  {
    tier: 'GOLD',
    price: 'AED 250K–1M',
    color: '#E8C97A',
    perks: [
      'Digital advertising package',
      'Pop-up kiosk space (500 sq ft)',
      '1 co-branded event',
      'Social media amplification',
      'Quarterly audience insights',
    ],
  },
];

export const LEASING_PATHS = [
  {
    category: 'Luxury & Designer',
    sqft: '1,500–10,000 sq ft',
    desc: "The Fashion Avenue — Dubai's most exclusive retail address. Neighbouring LVMH, Richemont, and Kering brands.",
    highlight: 'Flagship positioning',
    color: '#C9A052',
  },
  {
    category: 'Premium Retail',
    sqft: '500–5,000 sq ft',
    desc: 'High-footfall ground and first floor locations. Direct access from metro, valet, and hotel bridge.',
    highlight: '100M annual passers-by',
    color: '#E8C97A',
  },
  {
    category: 'F&B Concepts',
    sqft: '200–3,000 sq ft',
    desc: 'From fast-casual to fine dining. Priority given to global brand launches and regionally exclusive concepts.',
    highlight: 'Fountain terrace available',
    color: '#F4A261',
  },
  {
    category: 'Pop-Up & Activation',
    sqft: '50–1,000 sq ft',
    desc: 'Short-term leasing from 1 week to 12 months. Flexible locations across 5 anchor zones.',
    highlight: 'Launch your concept',
    color: '#2EC4B6',
  },
];

export const GALLERY_DATA = [
  {
    id: 1,
    url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&q=80&w=2000',
    title: 'The Burj Khalifa View',
    description: 'Iconic views from the heart of Downtown Dubai.',
    media_type: 'image',
    is_featured: true,
  },
  {
    id: 2,
    url: 'https://images.unsplash.com/photo-1582650625119-3a31f8fa2699?auto=format&fit=crop&q=80&w=2000',
    title: 'Fashion Avenue',
    description: 'The epicenter of global luxury and haute couture.',
    media_type: 'image',
    is_featured: true,
  },
  {
    id: 3,
    url: 'https://images.unsplash.com/photo-1617854818583-09e7f077a156?auto=format&fit=crop&q=80&w=2000',
    title: 'Dubai Aquarium',
    description: 'A 10-million liter marine experience.',
    media_type: 'image',
    is_featured: true,
  },
  {
    id: 4,
    url: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&q=80&w=2000',
    title: 'The Waterfall',
    description: 'Human divers sculpted into a continuous stream of light.',
    media_type: 'image',
    is_featured: false,
  },
  {
    id: 5,
    url: 'https://images.unsplash.com/photo-1546412414-8035e1776c9a?auto=format&fit=crop&q=80&w=2000',
    title: 'Dubai Fountain',
    description: 'A choreographed water dance at the base of the world tallest tower.',
    media_type: 'image',
    is_featured: false,
  },
  {
    id: 6,
    url: 'https://images.unsplash.com/photo-1578922746465-3a8052147cbb?auto=format&fit=crop&q=80&w=2000',
    title: 'The Souk',
    description: 'Traditional aesthetics meeting modern luxury.',
    media_type: 'image',
    is_featured: false,
  },
];
