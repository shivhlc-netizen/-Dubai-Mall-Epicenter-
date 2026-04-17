'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { SPONSORSHIP_TIERS } from '@/lib/data';

interface Props {
  open: boolean;
  onClose: () => void;
}

const AUDIENCE_DATA = [
  { label: 'Annual Visitors', value: '100M+' },
  { label: 'Avg Dwell Time', value: '3.2 hrs' },
  { label: 'HHI $100K+', value: '62%' },
  { label: 'International Visitors', value: '58%' },
  { label: 'Aged 18–45', value: '71%' },
  { label: 'Social Followers', value: '8M+' },
];

export default function SponsorshipModule({ open, onClose }: Props) {
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
                <h2 className="font-display text-2xl text-white">Sponsorship & Partnership</h2>
              </div>
              <button onClick={onClose} className="text-white/40 hover:text-white transition-colors p-2">
                <X size={20} />
              </button>
            </div>

            <div className="px-8 py-10">
              {/* Audience data */}
              <div className="mb-12">
                <div className="text-[10px] tracking-widest uppercase text-gold/50 font-sans mb-6">Audience Snapshot</div>
                <div className="grid grid-cols-3 gap-4">
                  {AUDIENCE_DATA.map((d, i) => (
                    <div key={i} className="border border-gold/10 p-4 text-center">
                      <div className="font-display text-2xl text-gold mb-1">{d.value}</div>
                      <div className="text-[10px] tracking-wider uppercase text-white/30 font-sans">{d.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tiers */}
              <div className="mb-10">
                <div className="text-[10px] tracking-widest uppercase text-gold/50 font-sans mb-6">Partnership Tiers</div>
                <div className="space-y-5">
                  {SPONSORSHIP_TIERS.map((tier, i) => (
                    <div
                      key={i}
                      className="border rounded-sm p-6 transition-all hover:bg-white/2"
                      style={{ borderColor: `${tier.color}25` }}
                    >
                      <div className="flex justify-between items-start mb-5">
                        <div>
                          <div
                            className="text-[11px] tracking-[0.4em] uppercase font-sans font-bold mb-1"
                            style={{ color: tier.color }}
                          >
                            {tier.tier}
                          </div>
                          <div className="font-display text-3xl text-white">{tier.price}</div>
                        </div>
                        <div
                          className="w-3 h-3 rounded-full mt-1"
                          style={{ background: tier.color, boxShadow: `0 0 10px ${tier.color}60` }}
                        />
                      </div>
                      <ul className="grid grid-cols-2 gap-2">
                        {tier.perks.map((perk, j) => (
                          <li key={j} className="flex items-start gap-2 text-white/40 text-sm">
                            <span style={{ color: tier.color }} className="mt-1.5 flex-shrink-0">·</span>
                            {perk}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activation examples */}
              <div className="mb-10">
                <div className="text-[10px] tracking-widest uppercase text-gold/50 font-sans mb-6">Activation Examples</div>
                <div className="space-y-3">
                  {[
                    { brand: 'Apple', activation: 'Grand Atrium product launch. 50,000+ walk-by daily.' },
                    { brand: 'BMW', activation: 'Vehicle reveal. 3-week activation. 2M+ eyeballs.' },
                    { brand: 'Rolex', activation: 'Year-round Fashion Avenue boutique sponsorship.' },
                  ].map((ex, i) => (
                    <div key={i} className="flex gap-4 items-start border-b border-gold/8 pb-3 last:border-0">
                      <span className="text-gold font-sans font-bold text-sm w-16 flex-shrink-0">{ex.brand}</span>
                      <span className="text-white/40 text-sm">{ex.activation}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="border-t border-gold/10 pt-8">
                <h3 className="font-display text-2xl text-white mb-3">Become a Partner</h3>
                <p className="text-white/40 text-sm mb-6">
                  Custom packages available. Let us build a sponsorship that matches your brand goals and budget.
                </p>
                <button className="btn-gold">Request Partnership Deck</button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
