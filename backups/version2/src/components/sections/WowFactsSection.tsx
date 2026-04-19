'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const WOW_FACTS = [
  {
    id: 1,
    number: '01',
    headline: 'A Mall With Its Own Postal Code',
    subhead: 'DUBAI MALL, PO BOX 126577',
    body: "The Dubai Mall is so vast it has its own dedicated postal code — a rare privilege typically reserved for cities. With 18.6 million square feet of gross floor area, it is larger than 50 Wimbledon tennis centres. If you visited every store for just 10 minutes, it would take you more than 8 continuous days.",
    stat: '18.6M SQ FT',
    color: '#C9A052',
    tag: 'Scale',
  },
  {
    id: 2,
    number: '02',
    headline: 'The Waterfall Has Its Own Weather System',
    subhead: 'INDOOR CLIMATE ENGINEERING',
    body: "The Dubai Mall's indoor waterfall — a 24-metre cascade of stainless steel sculptures — requires a dedicated HVAC microclimate to prevent condensation and maintain the 22°C ambient temperature. The mall's total cooling capacity (135,000 TR) is enough to air-condition a city of 300,000 people.",
    stat: '135,000 TR COOLING',
    color: '#48CAE4',
    tag: 'Engineering',
  },
  {
    id: 3,
    number: '03',
    headline: 'More Searched on Google Than the Eiffel Tower',
    subhead: 'GLOBAL DIGITAL FOOTPRINT',
    body: "In 2023, 'Dubai Mall' surpassed 'Eiffel Tower' and 'Times Square' as global Google search terms in the travel & shopping category. With 8M+ social followers and 200M+ annual digital impressions, The Dubai Mall is not just a physical destination — it is the most digitally influential shopping address on Earth.",
    stat: '200M+ DIGITAL IMPRESSIONS',
    color: '#7B2FBE',
    tag: 'Digital Power',
  },
  {
    id: 4,
    number: '04',
    headline: 'The Only Mall Visible From Space',
    subhead: 'ARCHITECTURAL LANDMARK',
    body: "The Dubai Mall's rooftop solar array — 10,000 panels spanning 250,000 sq ft — is one of the few commercial structures in the Middle East visible via satellite imagery. The gold-clad exterior facade, spanning 1.2km of frontage, is a recognised landmark in Dubai's DWC approach flight path, seen by 90M+ annual passengers.",
    stat: '10,000 SOLAR PANELS',
    color: '#F77F00',
    tag: 'Landmark',
  },
  {
    id: 5,
    number: '05',
    headline: 'NYE Countdown Seen by More People Than the Moon Landing',
    subhead: 'GLOBAL BROADCAST RECORD',
    body: "The Dubai Mall's New Year's Eve fireworks and drone show is broadcast to 500M+ viewers worldwide — surpassing the live viewership of the Apollo 11 Moon Landing (500M in 1969, unadjusted). In 2024, 2 million people stood in Downtown Dubai, making it the world's most attended live NYE event for the 6th consecutive year.",
    stat: '500M+ LIVE VIEWERS',
    color: '#E8C97A',
    tag: 'Global Stage',
  },
];

export default function WowFactsSection() {
  const [active, setActive] = useState(0);
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  const fact = WOW_FACTS[active];

  return (
    <section id="wow" className="snap-section relative flex items-center overflow-hidden bg-[#050505]">
      {/* Subtle radial glow */}
      <div
        className="absolute inset-0 transition-all duration-700"
        style={{
          background: `radial-gradient(ellipse 60% 50% at 60% 50%, ${fact.color}08 0%, transparent 70%)`,
        }}
      />
      <div className="absolute inset-0 grid-overlay opacity-15" />

      <div ref={ref} className="relative z-10 w-full max-w-[1400px] mx-auto px-6 lg:px-10 py-20 lg:py-32">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px w-8 bg-gold/60" />
            <span className="text-[10px] tracking-[0.5em] uppercase font-sans text-gold">
              5 Things That Will Amaze You
            </span>
          </div>
          <h2 className="font-display text-[clamp(2rem,5vw,4rem)] text-white leading-tight">
            Show The World<br />
            <span className="text-gold-gradient">You Are Inside!!</span>
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-[300px_1fr] gap-8 lg:gap-16 items-start">
          {/* Tab list */}
          <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            {WOW_FACTS.map((f, i) => (
              <button
                key={f.id}
                onClick={() => setActive(i)}
                className={`flex-shrink-0 lg:flex-shrink text-left px-4 py-4 border transition-all duration-300 rounded-sm ${
                  active === i
                    ? 'border-opacity-60 bg-white/3'
                    : 'border-white/5 hover:border-white/15'
                }`}
                style={active === i ? { borderColor: `${f.color}50` } : {}}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="font-display text-2xl transition-colors"
                    style={{ color: active === i ? f.color : 'rgba(255,255,255,0.2)' }}
                  >
                    {f.number}
                  </span>
                  <div>
                    <div
                      className={`text-[9px] tracking-widest uppercase font-sans transition-colors ${
                        active === i ? 'text-white/80' : 'text-white/30'
                      }`}
                    >
                      {f.tag}
                    </div>
                    <div
                      className={`text-sm font-sans leading-tight mt-0.5 transition-colors hidden lg:block ${
                        active === i ? 'text-white' : 'text-white/40'
                      }`}
                    >
                      {f.headline.split(' ').slice(0, 4).join(' ')}...
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Fact content panel */}
          <div className="relative min-h-[400px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={fact.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="border rounded-sm p-8 lg:p-12"
                style={{ borderColor: `${fact.color}20` }}
              >
                {/* Tag */}
                <div
                  className="inline-block text-[9px] tracking-[0.5em] uppercase font-sans border px-2 py-1 mb-6"
                  style={{ color: fact.color, borderColor: `${fact.color}40` }}
                >
                  {fact.tag}
                </div>

                {/* Headline */}
                <h3 className="font-display text-[clamp(1.5rem,3vw,2.5rem)] text-white leading-tight mb-2">
                  {fact.headline}
                </h3>
                <div
                  className="text-[10px] tracking-widest uppercase font-sans mb-6"
                  style={{ color: fact.color }}
                >
                  {fact.subhead}
                </div>

                {/* Body */}
                <p className="text-white/50 text-base leading-relaxed mb-8 max-w-2xl font-sans">
                  {fact.body}
                </p>

                {/* Stat badge */}
                <div
                  className="inline-flex items-center gap-3 border px-5 py-3 rounded-sm"
                  style={{ borderColor: `${fact.color}30`, background: `${fact.color}08` }}
                >
                  <div className="w-1 h-1 rounded-full" style={{ background: fact.color }} />
                  <span
                    className="font-display text-xl"
                    style={{ color: fact.color }}
                  >
                    {fact.stat}
                  </span>
                </div>

                {/* Nav arrows */}
                <div className="flex items-center gap-4 mt-8">
                  <button
                    onClick={() => setActive(Math.max(0, active - 1))}
                    disabled={active === 0}
                    className="text-[10px] tracking-widest uppercase font-sans text-white/20 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                  >
                    ← Prev
                  </button>
                  <div className="flex gap-1.5">
                    {WOW_FACTS.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActive(i)}
                        className="w-1.5 h-1.5 rounded-full transition-all"
                        style={{ background: active === i ? fact.color : 'rgba(255,255,255,0.2)' }}
                      />
                    ))}
                  </div>
                  <button
                    onClick={() => setActive(Math.min(WOW_FACTS.length - 1, active + 1))}
                    disabled={active === WOW_FACTS.length - 1}
                    className="text-[10px] tracking-widest uppercase font-sans text-white/20 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                  >
                    Next →
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
