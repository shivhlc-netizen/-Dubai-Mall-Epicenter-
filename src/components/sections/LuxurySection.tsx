'use client';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Image from 'next/image';
import { LUXURY_BRANDS } from '@/lib/data';

export default function LuxurySection() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 40 },
    animate: inView ? { opacity: 1, y: 0 } : {},
    transition: { duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] },
  });

  return (
    <section id="luxury" className="snap-section relative flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920&q=75"
          alt="Luxury fashion"
          fill
          className="object-cover object-center opacity-15"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-[#050505]/80 to-[#050505]" />
        {/* Gold vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_50%,rgba(201,160,82,0.06)_0%,transparent_70%)]" />
      </div>

      <div ref={ref} className="relative z-10 w-full max-w-[1400px] mx-auto px-6 lg:px-10 py-20 lg:py-32">
        {/* Header */}
        <div className="text-center mb-20">
          <motion.div {...fadeUp(0)} className="flex items-center justify-center gap-4 mb-8">
            <div className="h-px flex-1 max-w-24 bg-gradient-to-r from-transparent to-gold/60" />
            <span className="text-[9px] tracking-[0.8em] uppercase font-sans text-gold">The Fashion Avenue</span>
            <div className="h-px flex-1 max-w-24 bg-gradient-to-l from-transparent to-gold/60" />
          </motion.div>

          <motion.h2 {...fadeUp(0.1)} className="font-display text-[clamp(2.5rem,7vw,6rem)] leading-none text-white mb-6 tracking-tight">
            Elevated.<br />
            <em className="text-gold-gradient not-italic">Exclusive.</em>
          </motion.h2>

          <motion.p {...fadeUp(0.2)} className="text-white/40 text-base max-w-lg mx-auto leading-relaxed font-sans">
            140+ of the world's most coveted luxury houses curated under one roof.
            Dubai's most exclusive retail corridor — where heritage meets aspiration.
          </motion.p>
        </div>

        {/* Luxury experience pillars */}
        <motion.div {...fadeUp(0.3)} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {[
            { title: 'Personal Shopping', desc: 'Dedicated concierge and personal shoppers available at every tier. White-glove from arrival to delivery.' },
            { title: 'VIP Suites', desc: 'Private client lounges, bespoke tailoring suites, and exclusive in-store events for preferred guests.' },
            { title: 'Global Delivery', desc: 'Same-day delivery across the UAE, international shipping to 120+ countries through a dedicated luxury logistics network.' },
          ].map((pillar, i) => (
            <div key={i} className="border border-gold/15 p-8 rounded-sm gold-hover">
              <div className="w-8 h-px bg-gold mb-6" />
              <h3 className="font-display text-xl text-white mb-3">{pillar.title}</h3>
              <p className="text-white/40 text-sm leading-relaxed">{pillar.desc}</p>
            </div>
          ))}
        </motion.div>

        {/* Brand wall */}
        <motion.div {...fadeUp(0.4)}>
          <div className="text-center mb-8">
            <span className="text-[10px] tracking-[0.6em] uppercase text-gold/50 font-sans">Resident Maisons</span>
          </div>
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {LUXURY_BRANDS.map((brand, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.5 + i * 0.025 }}
                className="border border-gold/10 px-3 py-3 text-center hover:border-gold/40 hover:bg-gold/5 transition-all duration-300 group"
              >
                <span className="text-[9px] tracking-widest text-white/30 group-hover:text-gold/80 transition-colors uppercase font-sans leading-tight block">
                  {brand}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Bottom stat */}
        <motion.div {...fadeUp(0.6)} className="mt-16 text-center">
          <div className="inline-flex items-center gap-6 border-t border-b border-gold/15 py-6 px-10">
            <div className="text-center">
              <div className="font-display text-4xl text-gold">140+</div>
              <div className="text-[10px] tracking-widest uppercase text-white/30 mt-1 font-sans">Luxury Maisons</div>
            </div>
            <div className="h-8 w-px bg-gold/20" />
            <div className="text-center">
              <div className="font-display text-4xl text-gold">1.2M+</div>
              <div className="text-[10px] tracking-widest uppercase text-white/30 mt-1 font-sans">Sq Ft Luxury Retail</div>
            </div>
            <div className="h-8 w-px bg-gold/20" />
            <div className="text-center">
              <div className="font-display text-4xl text-gold">#1</div>
              <div className="text-[10px] tracking-widest uppercase text-white/30 mt-1 font-sans">GCC Luxury Address</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
