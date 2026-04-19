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

export const PROJECT_DIRECTORY = [
  {
    id: 'leasing',
    title: 'Retail Leasing',
    sub: '1,200+ Opportunities',
    desc: 'From high-street flagships to exclusive boutiques in Fashion Avenue.',
    link: '#leasing',
    image: 'https://images.unsplash.com/photo-1582650625119-3a31f8fa2699?w=800&q=80',
    type: 'Commercial',
  },
  {
    id: 'events',
    title: 'Event Venues',
    sub: 'Concerts & Activations',
    desc: 'Bespoke spaces for global product launches and world-class performances.',
    link: '#events',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80',
    type: 'Experience',
  },
  {
    id: 'sponsorship',
    title: 'Brand Partnership',
    sub: 'Global Visibility',
    desc: 'Direct exposure to 100M+ annual visitors through multi-channel networks.',
    link: '#sponsorship',
    image: 'https://images.unsplash.com/photo-1617854818583-09e7f077a156?w=800&q=80',
    type: 'Marketing',
  },
  {
    id: 'metrics',
    title: 'Pulse Metrics',
    sub: 'Real-time Insights',
    desc: 'Deep-dive into visitor demographics and real-time footfall analytics.',
    link: '#pulse',
    image: 'https://images.unsplash.com/photo-1546412414-8035e1776c9a?w=800&q=80',
    type: 'Data',
  },
];

export const GALLERY_DATA = [
  {
    id: 1,
    url: '/gallery/the-dubai-mall.webp',
    title: 'The Dubai Mall — Icon of the World',
    description: 'The world\'s most visited retail destination, rising beside the Burj Khalifa.',
    story: 'More than a mall — a city within a city. 5.9 million square feet of unrivalled luxury, dining, and entertainment.',
    media_type: 'image',
    is_featured: true,
  },
  {
    id: 2,
    url: '/gallery/fashion-avenue-home.jpg',
    title: 'Fashion Avenue',
    description: 'The global epicenter of luxury retail — home to 150+ of the world\'s most coveted brands.',
    story: 'An architectural promenade where every storefront tells a story of heritage, craft, and exclusivity.',
    media_type: 'image',
    is_featured: true,
  },
  {
    id: 3,
    url: '/gallery/dubai-fountain.webp',
    title: 'The Dubai Fountain',
    description: 'The world\'s largest choreographed fountain — 275 metres of dancing water and light.',
    story: 'Every evening, 22,000 gallons of water soar 150 metres into the sky, set to music that moves the soul.',
    media_type: 'image',
    is_featured: true,
  },
  {
    id: 4,
    url: '/gallery/aquarium.jpg',
    title: 'Dubai Aquarium & Underwater Zoo',
    description: '10 million litres of water housing 33,000 living animals — one of the world\'s largest indoor aquariums.',
    story: 'Walk through a 270° tunnel as sharks, rays, and thousands of marine creatures glide silently overhead.',
    media_type: 'image',
    is_featured: true,
  },
  {
    id: 5,
    url: '/gallery/fashion-avenue.jpg',
    title: 'Luxury Brand Universe',
    description: 'Chanel, Louis Vuitton, Hermès, Gucci, Cartier — every luxury desire fulfilled under one roof.',
    story: 'The largest collection of luxury flagships outside Paris, curated for the world\'s most discerning shoppers.',
    media_type: 'image',
    is_featured: true,
  },
  {
    id: 6,
    url: '/gallery/louis-vuitton.jpg',
    title: 'Louis Vuitton Flagship',
    description: 'Iconic French maison — where heritage craftsmanship meets contemporary design.',
    story: 'The Dubai Mall flagship is among the largest Louis Vuitton stores in the world, spanning two floors of excellence.',
    media_type: 'image',
    is_featured: false,
  },
  {
    id: 7,
    url: '/gallery/ice-rink.jpg',
    title: 'Dubai Ice Rink',
    description: 'An Olympic-standard ice rink in the heart of the desert — open to all ages and skill levels.',
    story: 'Where the impossible becomes everyday: world-class skating surrounded by luxury retail in the UAE.',
    media_type: 'image',
    is_featured: false,
  },
  {
    id: 8,
    url: '/gallery/jewellery.jpg',
    title: 'Jewellery & Timepieces',
    description: 'Cartier, Rolex, Tiffany & Co., Patek Philippe — timeless treasures from the world\'s finest houses.',
    story: 'The ultimate destination for rare gems, bespoke pieces, and horological masterpieces.',
    media_type: 'image',
    is_featured: false,
  },
  {
    id: 9,
    url: '/gallery/dubai-fountain-v2.webp',
    title: 'Fountain at Dusk',
    description: 'As twilight descends, the Dubai Fountain transforms the waterfront into pure spectacle.',
    story: 'The golden hour view from the Fountain Terrace is one of the most photographed moments in the world.',
    media_type: 'image',
    is_featured: false,
  },
  {
    id: 10,
    url: '/gallery/dubai-mall-expansion.webp',
    title: 'The Grand Expansion',
    description: 'Dubai Mall continues to grow — new wings, new brands, new experiences on the horizon.',
    story: 'The next chapter in retail history is being written here, expanding the world\'s most visited destination.',
    media_type: 'image',
    is_featured: false,
  },
  {
    id: 11,
    url: '/gallery/shopping.jpg',
    title: 'A Shopper\'s Paradise',
    description: 'From global high-street to bespoke luxury — 1,200+ stores across every category imaginable.',
    story: 'Whether searching for the rarest haute couture or the latest streetwear, every desire is met here.',
    media_type: 'image',
    is_featured: false,
  },
  {
    id: 12,
    url: '/gallery/cover.jpg',
    title: 'The Dubai Mall Experience',
    description: 'Beyond shopping — a cultural destination that defines modern Arabia.',
    story: 'Every visit reveals something new: art installations, pop-ups, performances, and world premieres.',
    media_type: 'image',
    is_featured: false,
  },
];
