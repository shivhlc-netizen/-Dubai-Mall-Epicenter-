'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Box, Map, Info, ArrowUpRight, Sparkles } from 'lucide-react';

const WONDERS = [
  { id: 'gw', name: 'The Great Wall of Tomorrow', era: '2100 AD', info: 'Virtual neural-link tour.', storeMatch: 'Outdoor Wear', image: '/gallery/1.png' },
  { id: 'py', name: 'Quantum Pyramids', era: '2085 AD', info: 'AR holographic alignment.', storeMatch: 'High Jewelry', image: '/gallery/2a.png' },
  { id: 'lh', name: 'Neon Lighthouse', era: '2077 AD', info: 'Sub-aquatic fiber optics.', storeMatch: 'Luxury Watch', image: '/gallery/3a.png' },
  { id: 'hg', name: 'Levitating Gardens', era: '2090 AD', info: 'Hydro-aero bio-dome.', storeMatch: 'Luxury Fragrance', image: '/gallery/4a.jpg' },
  { id: 'tm', name: 'The Digital Taj', era: '2110 AD', info: 'Meta-crystal structuralism.', storeMatch: 'Art Gallery', image: '/gallery/5a.png' },
  { id: 'rz', name: 'Silicon Rhodes', era: '2060 AD', info: 'Titanium-carbon exo-suit.', storeMatch: 'Sports Tech', image: '/gallery/6a.png' },
  { id: 'zs', name: 'Zeus Neural Cloud', era: '2125 AD', info: 'Planetary data consciousness.', storeMatch: 'Electronics', image: '/gallery/7.png' },
];

export default function SevenWondersExplore() {
  const [active, setActive] = useState(WONDERS[0]);

  return (
    <section id="explore" className="snap-section bg-[#020204] py-24 px-6 lg:px-10 border-t border-gold/5 overflow-hidden">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-gold">
              <Sparkles size={16} />
              <span className="text-xs tracking-[0.5em] uppercase font-sans">Neural Hybrid Layer</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-display text-white">7even <span className="text-gold-gradient">Wonders.</span></h2>
          </div>
          <div className="text-white/30 text-xs font-sans tracking-[0.2em] uppercase max-w-xs text-right">
            Blending the world's epicenter of retail with the future of human legacy.
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* Navigation */}
          <div className="lg:col-span-4 space-y-2">
            {WONDERS.map((w) => (
              <button
                key={w.id}
                onClick={() => setActive(w)}
                className={`w-full text-left p-4 border transition-all duration-500 group relative ${
                  active.id === w.id ? 'border-gold/40 bg-gold/5' : 'border-white/5 hover:border-white/10'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className={`text-[8px] uppercase tracking-[0.3em] font-sans mb-1 ${active.id === w.id ? 'text-gold' : 'text-white/30'}`}>{w.era}</div>
                    <div className={`text-sm font-sans ${active.id === w.id ? 'text-white' : 'text-white/50 group-hover:text-white'}`}>{w.name}</div>
                  </div>
                  <ArrowUpRight size={14} className={active.id === w.id ? 'text-gold' : 'text-white/10'} />
                </div>
                {active.id === w.id && <motion.div layoutId="wonder-bar" className="absolute left-0 top-0 bottom-0 w-1 bg-gold" />}
              </button>
            ))}
          </div>

          {/* Large Preview */}
          <div className="lg:col-span-8 relative aspect-[16/9] border border-gold/10 overflow-hidden group">
            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-[#020204] via-transparent to-transparent z-10" />
                <div className="absolute top-0 left-0 w-full h-full bg-black/40 z-[5]" />
                <img src={active.image} alt={active.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000" />
                
                <div className="absolute bottom-8 left-8 right-8 z-20 space-y-6">
                  <div className="flex justify-between items-end">
                    <div className="space-y-2">
                       <div className="inline-block px-2 py-0.5 border border-gold text-[9px] text-gold uppercase tracking-widest">{active.era} // SYNCHRONIZED</div>
                       <h3 className="text-4xl font-display text-white">{active.name}</h3>
                    </div>
                    <div className="bg-black/60 backdrop-blur-md border border-white/10 p-4">
                       <div className="text-[8px] text-white/40 uppercase tracking-widest mb-1">Retail Match</div>
                       <div className="text-gold text-xs font-bold uppercase">{active.storeMatch}</div>
                    </div>
                  </div>
                  <p className="text-white/40 text-sm font-sans max-w-xl italic leading-relaxed">
                    "{active.info} Gemini Recommendation: Explore the ${active.storeMatch} department on Level 2 after your virtual descent."
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
            
            {/* HUD Overlay */}
            <div className="absolute top-6 right-6 z-20 pointer-events-none opacity-20">
               <div className="grid grid-cols-2 gap-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-10 h-10 border border-white/40" />
                  ))}
               </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
