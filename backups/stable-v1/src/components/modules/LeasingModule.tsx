'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { LEASING_PATHS } from '@/lib/data';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function LeasingModule({ open, onClose }: Props) {
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
                <h2 className="font-display text-2xl text-white">Leasing Opportunities</h2>
              </div>
              <button onClick={onClose} className="text-white/40 hover:text-white transition-colors p-2">
                <X size={20} />
              </button>
            </div>

            <div className="px-8 py-10">
              {/* Intro */}
              <div className="mb-10">
                <p className="text-white/50 text-base leading-relaxed max-w-lg">
                  Every square foot of The Dubai Mall is an opportunity. With 100M annual visitors
                  and the world's most affluent international audience, a lease here is not a cost —
                  it is an investment in global brand visibility.
                </p>
              </div>

              {/* Leasing paths */}
              <div className="space-y-5 mb-12">
                {LEASING_PATHS.map((path, i) => (
                  <div
                    key={i}
                    className="border rounded-sm p-6 hover:bg-white/2 transition-all group"
                    style={{ borderColor: `${path.color}20` }}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-display text-xl text-white group-hover:text-gold transition-colors mb-1">
                          {path.category}
                        </h3>
                        <div className="text-[11px] tracking-wider uppercase font-sans" style={{ color: path.color }}>
                          {path.sqft}
                        </div>
                      </div>
                      <div
                        className="text-[9px] tracking-widest uppercase font-sans border px-2 py-1"
                        style={{ color: path.color, borderColor: `${path.color}40` }}
                      >
                        {path.highlight}
                      </div>
                    </div>
                    <p className="text-white/40 text-sm leading-relaxed">{path.desc}</p>
                  </div>
                ))}
              </div>

              {/* Why lease here */}
              <div className="border border-gold/10 rounded-sm p-6 mb-10">
                <div className="text-[10px] tracking-widest uppercase text-gold/50 font-sans mb-5">Why Lease Here</div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: '100M+ Visitors', sub: 'More than the Eiffel Tower & Times Square combined' },
                    { label: 'Peak Sales', sub: 'Highest revenue per sq ft of any mall in the Middle East' },
                    { label: 'Metro Access', sub: 'Direct Metro link — 400K daily passengers on Red Line' },
                    { label: 'Hotel Bridge', sub: 'Direct connection to Address Hotels — premium stay guests' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-1 h-1 rounded-full bg-gold mt-2 flex-shrink-0" />
                      <div>
                        <div className="text-white text-sm font-semibold font-sans">{item.label}</div>
                        <div className="text-white/30 text-xs mt-0.5">{item.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Process */}
              <div className="mb-10">
                <div className="text-[10px] tracking-widest uppercase text-gold/50 font-sans mb-5">Leasing Process</div>
                <div className="space-y-4">
                  {[
                    { step: '01', title: 'Enquiry', desc: 'Submit your brand profile, preferred zone, and size requirements.' },
                    { step: '02', title: 'Location Shortlist', desc: 'Our leasing team curates 3–5 site options that match your criteria.' },
                    { step: '03', title: 'Commercial Discussion', desc: 'Transparent rental review, terms, and fit-out contribution structure.' },
                    { step: '04', title: 'Lease Execution', desc: 'Legal review, signing, handover. Opening support available.' },
                  ].map((p, i) => (
                    <div key={i} className="flex gap-4 items-start">
                      <div className="font-display text-gold/30 text-2xl flex-shrink-0 w-8">{p.step}</div>
                      <div>
                        <div className="text-white text-sm font-semibold font-sans mb-0.5">{p.title}</div>
                        <div className="text-white/30 text-sm">{p.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="border-t border-gold/10 pt-8">
                <h3 className="font-display text-2xl text-white mb-3">Start the Conversation</h3>
                <p className="text-white/40 text-sm mb-6">
                  Our leasing team responds within 24 hours.
                </p>
                <div className="flex gap-4">
                  <button className="btn-gold">Enquire Now</button>
                  <button className="btn-outline">Leasing Brochure</button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
