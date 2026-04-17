# The Dubai Mall — The Epicenter

A world-class, fully interactive brand experience for The Dubai Mall. Built as a luxury Digideck-style interactive overview, deployable on Netlify.

## Tech Stack

- **Framework**: Next.js 14 (App Router, Static Export)
- **Styling**: Tailwind CSS + custom CSS animations
- **Animations**: Framer Motion
- **Scroll detection**: react-intersection-observer
- **Counters**: react-countup
- **Icons**: Lucide React
- **Fonts**: Playfair Display (display) + Inter (body)
- **Deployment**: Netlify (static export)

## Project Structure

```
src/
├── app/
│   ├── globals.css        # Design system, animations, utilities
│   ├── layout.tsx         # App shell + fonts + SEO metadata
│   └── page.tsx           # Main orchestrator — sections + module state
├── components/
│   ├── Navigation.tsx     # Fixed nav, section dots, mobile menu
│   ├── sections/
│   │   ├── HeroSection.tsx        # Cinematic opening with particle canvas
│   │   ├── WhySection.tsx         # Location/stats overview
│   │   ├── RetailSection.tsx      # 1,200+ stores + categories + brand marquee
│   │   ├── LuxurySection.tsx      # The Fashion Avenue
│   │   ├── DiningSection.tsx      # 200+ restaurants
│   │   ├── AttractionsSection.tsx # Entertainment anchors
│   │   └── EventsSection.tsx      # Global stage + venue capabilities
│   ├── modules/                   # Phase 2 — sliding drawer sub-modules
│   │   ├── EventsModule.tsx       # Event hosting CTA + past highlights
│   │   ├── SponsorshipModule.tsx  # Tiers + audience data
│   │   └── LeasingModule.tsx      # Leasing paths + process
│   └── ui/
│       ├── AnimatedCounter.tsx    # Scroll-triggered number counters
│       └── SectionDots.tsx        # Right-side navigation dots
└── lib/
    └── data.ts                    # All content data (brands, stats, events, etc.)
```

## Phase 1 Sections

| # | Section | Content |
|---|---------|---------|
| 1 | Hero | Cinematic intro, key stats, CTAs |
| 2 | Why Dubai Mall | Location, footfall, demographics |
| 3 | Retail | 1,200+ stores, categories, brand marquee |
| 4 | Luxury | The Fashion Avenue, 140+ maisons |
| 5 | Dining | 200+ restaurants, Waterfall Terrace |
| 6 | Attractions | Aquarium, Ice Rink, VR Park, Cinema |
| 7 | Events | Global stage, venue capabilities |

## Phase 2 Modules (Expandable Drawers)

- **Events Module** — Hosting capabilities, past highlights, booking CTA
- **Sponsorship Module** — Partnership tiers, audience data, activation examples
- **Leasing Module** — Segmented leasing paths, process, enquiry CTA

## Setup & Run

```bash
# Install dependencies
npm install

# Development
npm run dev

# Production build (static)
npm run build
```

## Netlify Deployment

### Option 1: Netlify CLI
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=out
```

### Option 2: Netlify UI
1. Push to GitHub
2. Connect repo in Netlify dashboard
3. Build command: `npm run build`
4. Publish directory: `out`

The `netlify.toml` is pre-configured for zero-config deployment.

## Environment

No environment variables required. All content is static data in `src/lib/data.ts`.

## Design Principles

- **Luxury-first UI**: Dark backgrounds, gold accents, Playfair Display typography
- **Non-linear navigation**: Section dots + top nav + mobile drawer
- **Video-first intent**: Background images with cinematic overlays (swap for video with `<video>` tags)
- **Performance**: Static export, lazy images, no external JS deps beyond npm packages
- **Responsive**: Full desktop + tablet support, mobile-friendly
