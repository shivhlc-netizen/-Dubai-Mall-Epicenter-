'use client';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Image from 'next/image';
import AnimatedCounter from '@/components/ui/AnimatedCounter';
import { WHY_STATS } from '@/lib/data';
import { MapPin, Users, Globe, TrendingUp } from 'lucide-react';

const ICONS = [Users, TrendingUp, Globe, MapPin];

const WHY_POINTS = [
  { icon: MapPin, label: 'Prime Location', desc: "18 minutes from Dubai International Airport. Connected by Dubai Metro, Sheikh Zayed Road, and the world's best airline hub." },
  { icon: Users, label: 'Unrivalled Footfall', desc: '100 million annual visitors — more than the entire population of France visiting one address every year.' },
  { icon: Globe, label: 'Global Reach', desc: "180+ nationalities shop here. With 90M+ tourists visiting Dubai annually, this is the world's most internationally diverse retail audience." },
  { icon: TrendingUp, label: 'Proven Growth', desc: "Visitor numbers have grown every year for 15+ years. Dubai's GDP growth and global tourism trajectory make this the most future-proof retail investment." },
];

export default function WhySection() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 40 },
    animate: inView ? { opacity: 1, y: 0 } : {},
    transition: { duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] },
  });

  return (
    <section id="why" className="snap-section relative flex items-center overflow-hidden bg-[#050505]">
      {/* Background */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1518684079-3c830dcef090?w=1920&q=70"
          alt="Dubai skyline night"
          fill
          className="object-cover object-center opacity-10"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/90 to-[#050505]/70" />
      </div>
      <div className="absolute inset-0 grid-overlay opacity-20" />

      <div ref={ref} className="relative z-10 w-full max-w-[1400px] mx-auto px-6 lg:px-10 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">

          {/* Left column */}
          <div>
            <motion.div {...fadeUp(0)} className="flex items-center gap-3 mb-6">
              <div className="h-px w-8 bg-gold" />
              <span className="text-[10px] tracking-[0.5em] uppercase font-sans text-gold">Why Dubai Mall</span>
            </motion.div>

            <motion.h2 {...fadeUp(0.1)} className="font-display text-[clamp(2rem,5vw,3.5rem)] leading-tight text-white mb-6">
              The World's Most<br />
              <span className="text-gold-gradient">Visited Destination</span>
            </motion.h2>

            <motion.p {...fadeUp(0.2)} className="text-white/50 text-base leading-relaxed mb-10 max-w-lg font-sans">
              Located at the heart of Downtown Dubai — the most valuable square mile in the Middle East —
              The Dubai Mall is not just a mall. It is a city within a city, a global stage, and the
              planet's most sought-after retail and entertainment address.
            </motion.p>

            {/* Why points */}
            <div className="space-y-6">
              {WHY_POINTS.map((point, i) => (
                <motion.div key={i} {...fadeUp(0.3 + i * 0.1)} className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 border border-gold/30 flex items-center justify-center mt-0.5">
                    <point.icon size={14} className="text-gold" />
                  </div>
                  <div>
                    <div className="text-white text-sm font-semibold tracking-wide mb-1">{point.label}</div>
                    <div className="text-white/40 text-sm leading-relaxed">{point.desc}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right column — stats */}
          <div className="grid grid-cols-2 gap-4 lg:gap-6">
            {WHY_STATS.map((stat, i) => {
              const Icon = ICONS[i];
              return (
                <motion.div
                  key={i}
                  {...fadeUp(0.2 + i * 0.1)}
                  className="glass-card gold-hover p-7 rounded-sm"
                >
                  <Icon size={20} className="text-gold mb-4 opacity-70" />
                  <div className="font-display text-[clamp(2rem,4vw,3rem)] text-gold-light leading-none mb-2">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} decimals={stat.decimals} />
                  </div>
                  <div className="text-[11px] tracking-widest uppercase text-white/40 font-sans">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Location strip */}
        <motion.div
          {...fadeUp(0.6)}
          className="mt-16 pt-8 border-t border-gold/10 flex flex-wrap gap-8 lg:gap-16"
        >
          {[
            { label: 'Address', value: 'Downtown Dubai, UAE' },
            { label: 'Nearest Metro', value: 'Burj Khalifa/Dubai Mall Station' },
            { label: 'Airport', value: '18 min — Dubai International' },
            { label: 'Airport (DWC)', value: '35 min — Al Maktoum International' },
          ].map((item, i) => (
            <div key={i} className="stat-card">
              <div className="text-[10px] tracking-widest uppercase text-gold/60 font-sans mb-1">{item.label}</div>
              <div className="text-sm text-white/70 font-sans">{item.value}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
