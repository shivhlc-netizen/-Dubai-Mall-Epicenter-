'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { 
  Cpu, Zap, Globe, Microscope, Activity, 
  ChevronRight, ArrowUpRight, Beaker, Sparkles,
  TrendingUp, ShieldCheck, ZapOff
} from 'lucide-react';

const STRATEGIC_FACTS = [
  {
    id: 'scale',
    tag: 'Scale',
    headline: 'A Mall With Its Own Postal Code',
    subhead: '18.6M SQ FT // DUBAI MALL, PO BOX 126577',
    body: "Larger than 50 Wimbledon tennis centres. If you visited every store for just 10 minutes, it would take you more than 8 continuous days to exit.",
    stat: '18.6M SQ FT',
    color: '#C9A052',
    icon: Globe
  },
  {
    id: 'digital',
    tag: 'Digital Power',
    headline: 'Most Influential Digital Address',
    subhead: '200M+ ANNUAL IMPRESSIONS',
    body: "Surpassed 'Eiffel Tower' and 'Times Square' as a global Google search term. The world's most digitally influential shopping destination.",
    stat: '200M+ IMPRESSIONS',
    color: '#7B2FBE',
    icon: Activity
  },
  {
    id: 'future',
    tag: 'Future Vision',
    headline: 'VIBGYOR: The Neural Transition',
    subhead: '7-ZONE STRATEGIC ROADMAP',
    body: "Experience the transition into the next century through a hybrid of high-luxury management and futuristic synthetic intelligence.",
    stat: 'VISION 2030+',
    color: '#2EC4B6',
    icon: Cpu
  },
  {
    id: 'energy',
    tag: 'Engineering',
    headline: 'The Only Mall Visible From Space',
    subhead: '10,000 SOLAR PANELS // 250K SQ FT',
    body: "135,000 TR cooling capacity — enough to air-condition a city of 300,000 people. A sustainable architectural landmark in the DWC approach.",
    stat: '135K TR CAPACITY',
    color: '#F77F00',
    icon: Zap
  }
];

const FUTURE_ZONES = [
  { name: 'Synthetic Intelligence', color: 'bg-vibgyor-v', icon: Cpu, desc: 'Quantum neural networks.' },
  { name: 'Regenerative Earth', color: 'bg-vibgyor-g', icon: Microscope, desc: 'Restoring biodiversity.' },
  { name: 'Energy Harvesters', color: 'bg-vibgyor-y', icon: Zap, desc: 'Harnessing planetary pulse.' },
  { name: 'Human Expansion', color: 'bg-vibgyor-o', icon: ArrowUpRight, desc: 'Lunar plains and beyond.' },
];

export default function StrategicVision({ isManaging }: { isManaging?: boolean }) {
  const [activeTab, setActiveTab] = useState(0);
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  const activeFact = STRATEGIC_FACTS[activeTab];

  return (
    <section id="vision" className="snap-section relative flex items-center overflow-hidden bg-[#020204] scroll-mt-20">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-gold/5 rounded-full blur-[150px] opacity-20" />
        <div className="absolute inset-0 grid-overlay opacity-10" />
      </div>

      <div ref={ref} className="relative z-10 w-full max-w-[1400px] mx-auto px-6 lg:px-10 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          
          {/* Left: Strategic Content (Ad Strategist) */}
          <div className="space-y-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center gap-3 text-gold mb-4">
                <div className="w-1 h-6 bg-gold" />
                <span className="text-xs tracking-[0.6em] uppercase font-sans">Strategic Intelligence</span>
              </div>
              <h2 className="text-5xl md:text-7xl font-display text-white mb-6 leading-tight">
                Ad Strategist: <br />
                <span className="text-gold-gradient italic">Architecting Tomorrow.</span>
              </h2>
            </motion.div>

            <div className="space-y-4">
              {STRATEGIC_FACTS.map((fact, i) => (
                <motion.button
                  key={fact.id}
                  onClick={() => setActiveTab(i)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: i * 0.1 }}
                  className={`w-full text-left p-5 border transition-all duration-500 group relative overflow-hidden ${
                    activeTab === i ? 'border-gold/40 bg-white/5' : 'border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-4 relative z-10">
                    <div className={`w-10 h-10 rounded-sm flex items-center justify-center border ${
                      activeTab === i ? 'border-gold text-gold' : 'border-white/10 text-white/20'
                    }`}>
                      <fact.icon size={20} />
                    </div>
                    <div>
                      <div className={`text-[9px] tracking-[0.3em] uppercase font-sans transition-colors ${
                        activeTab === i ? 'text-gold' : 'text-white/30'
                      }`}>
                        {fact.tag}
                      </div>
                      <div className={`text-sm font-sans mt-0.5 transition-colors ${
                        activeTab === i ? 'text-white' : 'text-white/50'
                      }`}>
                        {fact.headline}
                      </div>
                    </div>
                  </div>
                  {activeTab === i && (
                    <motion.div 
                      layoutId="active-bar"
                      className="absolute left-0 top-0 bottom-0 w-1 bg-gold shadow-[0_0_10px_#C9A052]" 
                    />
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Right: Vision Display (Technical Roadmap) */}
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeFact.id}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.05, y: -20 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="glass-card p-10 lg:p-14 border-gold/15 relative overflow-hidden"
              >
                {/* 16-bit Population Grid Background */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                  <div className="grid grid-cols-12 h-full">
                    {Array.from({ length: 144 }).map((_, i) => (
                      <div key={i} className="border-[0.5px] border-white/10" />
                    ))}
                  </div>
                </div>

                <div className="relative z-10">
                  <div className="inline-block px-3 py-1 border border-gold/30 text-[9px] tracking-[0.4em] uppercase text-gold mb-8">
                    {activeFact.tag} // Epicenter_Sync
                  </div>
                  
                  <h3 className="text-3xl lg:text-4xl font-display text-white mb-6 leading-tight">
                    {activeFact.headline}
                  </h3>
                  
                  <p className="text-white/40 text-sm leading-relaxed mb-10 font-sans italic">
                    "{activeFact.body}"
                  </p>

                  <div className="flex items-center gap-6 border-t border-white/5 pt-8 mb-10">
                    <div className="font-display text-4xl text-gold-light">
                      {activeFact.stat}
                    </div>
                    <div className="h-10 w-px bg-white/10" />
                    <div className="text-[10px] tracking-widest uppercase text-white/30 font-sans max-w-[120px]">
                      Verified Operational Data
                    </div>
                  </div>

                  {/* Contextual Elements */}
                  {activeTab === 2 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {FUTURE_ZONES.map((zone, i) => (
                        <div key={i} className="p-3 border border-white/5 bg-white/[0.02] flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-sm ${zone.color} flex items-center justify-center text-white scale-75`}>
                            <zone.icon size={16} />
                          </div>
                          <span className="text-[9px] text-white/40 uppercase tracking-tighter leading-none">{zone.name}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 bg-gold/5 border border-gold/10 flex items-center justify-between">
                       <div className="flex items-center gap-3">
                         <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                         <span className="text-[10px] text-green-500/80 font-mono tracking-widest uppercase">Epicenter_Stream_Active</span>
                       </div>
                       <TrendingUp size={14} className="text-gold" />
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Decorative Overlay */}
            <div className="absolute -bottom-6 -right-6 p-6 bg-black border border-white/5 shadow-2xl z-20 hidden md:block">
              <div className="text-gold text-2xl font-display uppercase tracking-widest">Epicenter v2.0</div>
              <div className="text-[8px] text-white/30 uppercase tracking-[0.4em] mt-1 font-mono">Strategic_Protocol_X</div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
