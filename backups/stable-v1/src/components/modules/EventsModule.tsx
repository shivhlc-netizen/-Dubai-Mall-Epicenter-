'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Users, Mic2, Globe } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
}

const CAPABILITIES = [
  { icon: Users, title: 'Capacity', items: ['Grand Atrium — 10,000 pax standing', 'Performing Arts Centre — 3,000 seats', 'Exhibition Halls — 50,000 sq m', 'Multiple breakout zones'] },
  { icon: Mic2, title: 'Production', items: ['Permanent rigging grid (30T capacity)', 'Broadcast-ready fiber & power', 'In-house AV team & equipment', '4K LED wall infrastructure'] },
  { icon: Calendar, title: 'Event Types', items: ['Concerts & live performances', 'Brand launches & product reveals', 'Fashion shows & runway events', 'Exhibitions & trade shows'] },
  { icon: Globe, title: 'Reach', items: ['100M annual mall visitors', 'Global media coverage', 'Social amplification network', 'PR & press facilitation'] },
];

const PAST_EVENTS = [
  { year: '2024', name: 'New Year\'s Eve Spectacle', desc: 'Record 2M live attendees. 500M+ broadcast viewers globally.', tag: 'Signature Event' },
  { year: '2024', name: 'Dubai Shopping Festival', desc: '35-day festival. 4M+ attendees. 3,000+ brand activations.', tag: 'Annual Festival' },
  { year: '2023', name: 'Coldplay x Dubai', desc: 'Sold-out 3-night residency. First UAE show. 30,000+ attendees.', tag: 'Concert' },
  { year: '2023', name: 'Louis Vuitton SS24 Launch', desc: 'Global brand reveal. 500 VIP guests. 200M+ social reach.', tag: 'Brand Activation' },
];

export default function EventsModule({ open, onClose }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="module-drawer"
          >
            {/* Header */}
            <div className="sticky top-0 bg-[#0A0A0A]/95 backdrop-blur border-b border-gold/10 px-8 py-5 flex justify-between items-center z-10">
              <div>
                <div className="text-[9px] tracking-[0.6em] uppercase text-gold font-sans">Phase 2 Module</div>
                <h2 className="font-display text-2xl text-white">Events & Hosting</h2>
              </div>
              <button onClick={onClose} className="text-white/40 hover:text-white transition-colors p-2">
                <X size={20} />
              </button>
            </div>

            <div className="px-8 py-10">
              {/* Intro */}
              <div className="mb-10">
                <p className="text-white/50 text-base leading-relaxed max-w-lg">
                  The Dubai Mall is not just a venue — it is the world's most watched stage.
                  From intimate brand experiences to globally-broadcast spectaculars, no other
                  property offers this combination of reach, infrastructure, and audience.
                </p>
              </div>

              {/* Capabilities */}
              <div className="grid grid-cols-2 gap-5 mb-12">
                {CAPABILITIES.map((cap, i) => (
                  <div key={i} className="border border-gold/10 p-6 rounded-sm hover:border-gold/30 transition-colors">
                    <cap.icon size={18} className="text-gold mb-4" />
                    <h3 className="font-sans font-semibold text-white text-sm tracking-wide mb-3">{cap.title}</h3>
                    <ul className="space-y-2">
                      {cap.items.map((item, j) => (
                        <li key={j} className="flex items-start gap-2 text-white/40 text-sm">
                          <span className="text-gold mt-1.5 flex-shrink-0">·</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Past highlights */}
              <div className="mb-10">
                <div className="text-[10px] tracking-widest uppercase text-gold/50 font-sans mb-6">Event Highlights</div>
                <div className="space-y-4">
                  {PAST_EVENTS.map((ev, i) => (
                    <div key={i} className="flex gap-6 border-b border-gold/10 pb-5 last:border-0">
                      <div className="text-gold/50 font-display text-2xl flex-shrink-0 w-14">{ev.year}</div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="text-white font-sans font-semibold text-sm">{ev.name}</h4>
                          <span className="text-[9px] tracking-wider uppercase text-gold/50 border border-gold/20 px-2 py-0.5">{ev.tag}</span>
                        </div>
                        <p className="text-white/40 text-sm">{ev.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="border-t border-gold/10 pt-8">
                <h3 className="font-display text-2xl text-white mb-3">Host Your Event</h3>
                <p className="text-white/40 text-sm mb-6">
                  Our events team is available to discuss your requirements, timeline, and creative vision.
                </p>
                <div className="flex gap-4">
                  <button className="btn-gold">Request a Proposal</button>
                  <button className="btn-outline">Download Venue Pack</button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
