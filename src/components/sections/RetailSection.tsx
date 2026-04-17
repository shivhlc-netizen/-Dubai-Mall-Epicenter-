'use client';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Image from 'next/image';
import AnimatedCounter from '@/components/ui/AnimatedCounter';
import { RETAIL_CATEGORIES } from '@/lib/data';

const RETAIL_STATS = [
  { value: 1200, suffix: '+', label: 'Total Stores' },
  { value: 330, suffix: '+', label: 'Fashion & Luxury Brands' },
  { value: 200, suffix: '+', label: 'Flagship Locations' },
  { value: 5.9, suffix: 'M', label: 'Sq Ft of Retail', decimals: 1 },
];

const FEATURED_BRANDS = [
  'APPLE', 'ZARA', 'H&M', 'NIKE', 'ADIDAS', 'LEGO', 'UNIQLO',
  'SEPHORA', 'MUJI', 'GAP', 'VICTORIA\'S SECRET', 'BATH & BODY WORKS',
  'AMERICAN EAGLE', 'PULL & BEAR', 'MASSIMO DUTTI', 'BERSHKA',
];

export default function RetailSection({ onExploreLeasing }: { onExploreLeasing: () => void }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 40 },
    animate: inView ? { opacity: 1, y: 0 } : {},
    transition: { duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] },
  });

  return (
    <section id="retail" className="snap-section relative flex items-center overflow-hidden">
      {/* BG */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1555529902-5261145633bf?w=1920&q=70"
          alt="Luxury mall interior"
          fill
          className="object-cover object-center opacity-12"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-[#050505]/85 to-[#050505]" />
      </div>

      <div ref={ref} className="relative z-10 w-full max-w-[1400px] mx-auto px-6 lg:px-10 py-20 lg:py-32">
        {/* Header */}
        <div className="text-center mb-16 lg:mb-20">
          <motion.div {...fadeUp(0)} className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px w-8 bg-gold/60" />
            <span className="text-[10px] tracking-[0.5em] uppercase font-sans text-gold">Retail Universe</span>
            <div className="h-px w-8 bg-gold/60" />
          </motion.div>
          <motion.h2 {...fadeUp(0.1)} className="font-display text-[clamp(2.5rem,6vw,5rem)] leading-tight text-white mb-4">
            1,200+ Stores.<br />
            <span className="text-gold-gradient">One Destination.</span>
          </motion.h2>
          <motion.p {...fadeUp(0.2)} className="text-white/40 text-base max-w-xl mx-auto">
            The most comprehensive retail mix on Earth — from global fast fashion to rare luxury collectibles.
          </motion.p>
        </div>

        {/* Stats bar */}
        <motion.div {...fadeUp(0.3)} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {RETAIL_STATS.map((s, i) => (
            <div key={i} className="glass-card p-6 text-center rounded-sm">
              <div className="font-display text-3xl text-gold-light mb-1">
                <AnimatedCounter value={s.value} suffix={s.suffix} decimals={s.decimals} />
              </div>
              <div className="text-[10px] tracking-widest uppercase text-white/40 font-sans">{s.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Categories grid */}
        <motion.div {...fadeUp(0.4)} className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-16">
          {RETAIL_CATEGORIES.map((cat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.4 + i * 0.08 }}
              className="glass-card gold-hover p-6 rounded-sm group cursor-default"
            >
              <div className="text-gold text-2xl mb-3 group-hover:scale-110 transition-transform inline-block">
                {cat.icon}
              </div>
              <div className="text-white font-sans text-sm font-semibold tracking-wide mb-1">{cat.name}</div>
              <div className="text-gold text-xl font-display">{cat.count}</div>
              <div className="text-white/30 text-[10px] uppercase tracking-wider mt-1">stores</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Brand marquee */}
        <motion.div {...fadeUp(0.5)} className="mb-12">
          <div className="text-center mb-6">
            <span className="text-[10px] tracking-widest uppercase text-white/30 font-sans">Featured Brands</span>
          </div>
          <div className="marquee-container py-4 border-y border-gold/10">
            <div className="marquee-track">
              {[...FEATURED_BRANDS, ...FEATURED_BRANDS].map((brand, i) => (
                <span key={i} className="mx-8 text-[11px] tracking-widest uppercase text-white/30 hover:text-gold transition-colors font-sans">
                  {brand}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div {...fadeUp(0.6)} className="text-center">
          <button onClick={onExploreLeasing} className="btn-outline">
            Explore Leasing Opportunities →
          </button>
        </motion.div>
      </div>
    </section>
  );
}
