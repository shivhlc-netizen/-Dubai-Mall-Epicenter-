'use client';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Image from 'next/image';
import { EVENTS_DATA } from '@/lib/data';

export default function EventsSection({
  onEventsModule,
  onSponsorModule,
}: {
  onEventsModule: () => void;
  onSponsorModule: () => void;
}) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.08 });

  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 40 },
    animate: inView ? { opacity: 1, y: 0 } : {},
    transition: { duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] },
  });

  return (
    <section id="events" className="snap-section relative flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1920&q=70"
          alt="Concert event"
          fill
          className="object-cover object-center opacity-12"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-[#050505]/85 to-[#050505]" />
        {/* Purple concert glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_30%,rgba(123,47,190,0.08)_0%,transparent_60%)]" />
      </div>

      <div ref={ref} className="relative z-10 w-full max-w-[1400px] mx-auto px-6 lg:px-10 py-20 lg:py-32">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div {...fadeUp(0)} className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px w-8 bg-gold/60" />
            <span className="text-[10px] tracking-[0.5em] uppercase font-sans text-gold">Events & Platform</span>
            <div className="h-px w-8 bg-gold/60" />
          </motion.div>

          <motion.h2 {...fadeUp(0.1)} className="font-display text-[clamp(2.5rem,7vw,5.5rem)] leading-none text-white mb-4">
            The Global<br />
            <span className="text-gold-gradient">Stage</span>
          </motion.h2>

          <motion.p {...fadeUp(0.2)} className="text-white/40 text-base max-w-xl mx-auto leading-relaxed font-sans">
            A performing arts centre. An exposition hall. A concert venue. A brand activation platform.
            Not a building — an ecosystem.
          </motion.p>
        </div>

        {/* Events stats */}
        <motion.div {...fadeUp(0.3)} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {[
            { v: '1,000+', l: 'Events Per Year' },
            { v: '5M+', l: 'Event Attendees' },
            { v: '500M+', l: 'NYE Broadcast Viewers' },
            { v: '200+', l: 'Brand Activations' },
          ].map((s, i) => (
            <div key={i} className="border border-gold/15 p-6 text-center hover:border-gold/40 transition-colors">
              <div className="font-display text-3xl text-gold mb-2">{s.v}</div>
              <div className="text-[10px] tracking-widest uppercase text-white/30 font-sans">{s.l}</div>
            </div>
          ))}
        </motion.div>

        {/* Events grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
          {EVENTS_DATA.map((event, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 + i * 0.08 }}
              className="glass-card p-6 rounded-sm hover:border-gold/30 transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-6 h-px bg-gold mt-2" />
                <span className="text-[10px] tracking-widest uppercase text-gold/60 font-sans">
                  {event.attendees}
                </span>
              </div>
              <h3 className="font-display text-lg text-white mb-2 group-hover:text-gold transition-colors">
                {event.name}
              </h3>
              <p className="text-white/40 text-sm leading-relaxed">{event.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Venue capabilities */}
        <motion.div {...fadeUp(0.5)} className="border border-gold/15 rounded-sm p-8 md:p-10 mb-12">
          <div className="text-[10px] tracking-[0.6em] uppercase text-gold/60 font-sans mb-6">Venue Capabilities</div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Grand Atrium', cap: '10,000 pax', features: ['Full production rigging', 'LED wall infrastructure', 'Broadcast facilities', 'VIP tiering'] },
              { name: 'Performing Arts', cap: '3,000 seats', features: ['Concert-grade acoustics', 'Backstage facilities', 'Dressing suites', 'Orchestra pit'] },
              { name: 'Exhibition Halls', cap: '50,000 sq m', features: ['Multi-zone configuration', 'Direct truck access', 'Climate controlled', 'Pop-up construction'] },
            ].map((venue, i) => (
              <div key={i}>
                <h4 className="font-display text-xl text-white mb-1">{venue.name}</h4>
                <div className="text-gold text-sm font-sans mb-4">{venue.cap}</div>
                <ul className="space-y-2">
                  {venue.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-white/40 text-sm">
                      <span className="w-1 h-1 rounded-full bg-gold/60 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTAs */}
        <motion.div {...fadeUp(0.6)} className="flex flex-wrap gap-4 justify-center">
          <button onClick={onEventsModule} className="btn-gold">
            Host Your Event →
          </button>
          <button onClick={onSponsorModule} className="btn-outline">
            Explore Sponsorship
          </button>
        </motion.div>
      </div>
    </section>
  );
}
