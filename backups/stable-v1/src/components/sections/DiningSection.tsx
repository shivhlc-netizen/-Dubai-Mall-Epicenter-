'use client';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Image from 'next/image';
import { DINING_HIGHLIGHTS } from '@/lib/data';

export default function DiningSection() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 40 },
    animate: inView ? { opacity: 1, y: 0 } : {},
    transition: { duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] },
  });

  return (
    <section id="dining" className="snap-section relative flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920&q=75"
          alt="Fine dining"
          fill
          className="object-cover object-center opacity-15"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#050505] via-[#050505]/85 to-[#0A0806]/90" />
        {/* Warm amber glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_70%_40%,rgba(244,162,97,0.06)_0%,transparent_70%)]" />
      </div>

      <div ref={ref} className="relative z-10 w-full max-w-[1400px] mx-auto px-6 lg:px-10 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-start">

          {/* Left */}
          <div>
            <motion.div {...fadeUp(0)} className="flex items-center gap-3 mb-6">
              <div className="h-px w-8 bg-[#F4A261]" />
              <span className="text-[10px] tracking-[0.5em] uppercase font-sans text-[#F4A261]">Dining & Lifestyle</span>
            </motion.div>

            <motion.h2 {...fadeUp(0.1)} className="font-display text-[clamp(2rem,5vw,4rem)] leading-tight text-white mb-6">
              Food as a<br />
              <span style={{ background: 'linear-gradient(135deg, #F4A261, #E8C97A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Destination
              </span>
            </motion.h2>

            <motion.p {...fadeUp(0.2)} className="text-white/40 text-base leading-relaxed mb-10 max-w-lg font-sans">
              200+ restaurants spanning 60 global cuisines. From Michelin-starred fine dining
              with Burj Khalifa views to authentic street food markets. Dining here is not a
              pause between shopping — it is the event.
            </motion.p>

            {/* Quick stats */}
            <motion.div {...fadeUp(0.3)} className="grid grid-cols-3 gap-4 mb-10">
              {[
                { v: '200+', l: 'Restaurants' },
                { v: '60+', l: 'Cuisines' },
                { v: '5,000+', l: 'Outdoor Seats' },
              ].map((s, i) => (
                <div key={i} className="border border-[#F4A261]/20 p-4 rounded-sm text-center">
                  <div className="font-display text-2xl text-[#F4A261]">{s.v}</div>
                  <div className="text-[10px] tracking-wider uppercase text-white/30 mt-1 font-sans">{s.l}</div>
                </div>
              ))}
            </motion.div>

            {/* Featured */}
            <motion.div {...fadeUp(0.4)}>
              <div className="text-[10px] tracking-widest uppercase text-white/25 font-sans mb-4">Featured Restaurants</div>
              <div className="flex flex-wrap gap-3">
                {['Thiptara', 'Din Tai Fung', 'The Cheesecake Factory', 'Shake Shack',
                  'PF Chang\'s', 'Nobu', 'Zuma', 'La Petite Maison'].map((r, i) => (
                  <span key={i} className="text-xs font-sans text-white/40 border border-white/10 px-3 py-1.5 hover:text-[#F4A261] hover:border-[#F4A261]/40 transition-colors">
                    {r}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right — dining cards */}
          <div className="space-y-4">
            {DINING_HIGHLIGHTS.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 40 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.2 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                className="glass-card p-6 rounded-sm border border-[#F4A261]/10 hover:border-[#F4A261]/30 transition-all group"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-display text-lg text-white group-hover:text-[#F4A261] transition-colors">
                    {item.name}
                  </h3>
                  <span className="text-[10px] tracking-wider uppercase text-[#F4A261]/70 font-sans border border-[#F4A261]/20 px-2 py-1">
                    {item.count}
                  </span>
                </div>
                <p className="text-white/40 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Waterfall feature */}
        <motion.div
          {...fadeUp(0.6)}
          className="mt-16 relative overflow-hidden border border-[#F4A261]/15 rounded-sm"
        >
          <div className="relative h-56 md:h-72">
            <Image
              src="https://images.unsplash.com/photo-1538197944622-1a1f3e39c74e?w=1920&q=75"
              alt="Dubai Fountain view"
              fill
              className="object-cover opacity-40"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/90 via-[#050505]/50 to-transparent" />
          </div>
          <div className="absolute inset-0 flex items-center px-10">
            <div className="max-w-lg">
              <div className="text-[9px] tracking-[0.6em] uppercase text-[#F4A261] font-sans mb-3">Signature Experience</div>
              <h3 className="font-display text-3xl text-white mb-3">The Waterfall Terrace</h3>
              <p className="text-white/50 text-sm leading-relaxed">
                Al fresco dining alongside the world's largest choreographed fountain, with the Burj Khalifa
                as your backdrop. The most photographed dining terrace on Earth.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
