'use client';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Image from 'next/image';
import { ATTRACTIONS } from '@/lib/data';

export default function AttractionsSection() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.08 });

  return (
    <section id="attractions" className="snap-section relative overflow-hidden flex items-center">
      {/* Background */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1559825481-12a05cc00344?w=1920&q=70"
          alt="Aquarium"
          fill
          className="object-cover object-center opacity-10"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-[#050505]/88 to-[#050505]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_30%_50%,rgba(0,119,182,0.06)_0%,transparent_70%)]" />
      </div>

      <div ref={ref} className="relative z-10 w-full max-w-[1400px] mx-auto px-6 lg:px-10 py-20 lg:py-32">
        {/* Header */}
        <div className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="flex items-center gap-3 mb-6"
          >
            <div className="h-px w-8 bg-gold/60" />
            <span className="text-[10px] tracking-[0.5em] uppercase font-sans text-gold">Attractions & Entertainment</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-[clamp(2rem,5vw,4.5rem)] leading-tight text-white max-w-2xl"
          >
            Beyond Shopping.{' '}
            <span className="text-gold-gradient">Beyond Imagination.</span>
          </motion.h2>
        </div>

        {/* Attractions grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {ATTRACTIONS.map((attraction, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.2 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="glass-card rounded-sm overflow-hidden group hover:border-opacity-60 transition-all duration-500"
              style={{ borderColor: `${attraction.color}20` }}
            >
              {/* Color accent bar */}
              <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${attraction.color}, transparent)` }} />

              <div className="p-7">
                <div
                  className="text-[10px] tracking-widest uppercase font-sans mb-4 font-semibold"
                  style={{ color: attraction.color }}
                >
                  {attraction.stat}
                </div>

                <h3 className="font-display text-xl text-white mb-3 group-hover:text-gold transition-colors leading-tight">
                  {attraction.name}
                </h3>

                <p className="text-white/40 text-sm leading-relaxed mb-5">
                  {attraction.desc}
                </p>

                <div className="flex items-center gap-2">
                  <div className="w-4 h-px" style={{ background: attraction.color }} />
                  <span className="text-[10px] tracking-wider uppercase font-sans text-white/20">
                    Explore
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom mega-stat */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-px bg-gold/10"
        >
          {[
            { v: '6', l: 'Major Attractions' },
            { v: '22', l: 'Cinema Screens' },
            { v: '30+', l: 'VR Experiences' },
            { v: '270°', l: 'Aquarium Tunnel' },
          ].map((s, i) => (
            <div key={i} className="bg-[#050505] py-8 text-center">
              <div className="font-display text-4xl text-gold mb-2">{s.v}</div>
              <div className="text-[10px] tracking-widest uppercase text-white/30 font-sans">{s.l}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
