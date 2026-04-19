'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, Sparkles, Cpu, Layers } from 'lucide-react';

// All images: Unsplash (free, no watermark, commercial use OK)
const WONDERS = [
  {
    id: 'gw',
    name: 'The Great Wall of Tomorrow',
    era: '2100 AD',
    location: 'Neo-Beijing Megaplex, China',
    storeMatch: 'Outdoor & Tech Wear',
    image: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=1920&q=85',
    accent: '#C9A052',
    hook: 'Where 10,000 years of human defence become the planet\'s largest neural interface.',
    story: 'Stretching 21,196 kilometres across quantum-reinforced carbon fibre and ancient stone, the Wall no longer guards an empire — it powers one. Every watchtower has become a neural node, transmitting 4 zetabytes of consciousness data per second to 1.4 billion minds. Visitors walk the Wall in full haptic immersion: feel the Mongolian wind of 1368, smell the gunpowder of 1644, witness the plasma storms of 2100 — all in real-time. The bricks remember every footstep ever taken upon them.',
    stats: [{ label: 'Neural Nodes', val: '21,196' }, { label: 'Consciousness Streams', val: '1.4B' }, { label: 'Epochs Accessible', val: '73' }],
  },
  {
    id: 'py',
    name: 'Quantum Pyramids',
    era: '2085 AD',
    location: 'Giza Singularity Zone, Egypt',
    storeMatch: 'High Jewellery & Gemstones',
    image: 'https://images.unsplash.com/photo-1539768942893-daf53e448371?w=1920&q=85',
    accent: '#E8D5A0',
    hook: 'The oldest structures on Earth — now computing the future of the universe.',
    story: 'Archaeologists discovered in 2041 that the Great Pyramid\'s internal chambers form a perfect quantum resonance chamber — calibrated not by accident, but by intention. By 2085, scientists had embedded 144,000 qubit processors into the original limestone without altering a single block. The Pyramids now solve protein-folding equations for every disease in existence simultaneously. At dusk, the three peaks emit coherent light beams that are visible from the Moon — the same frequency the ancients used to align them with Orion\'s Belt.',
    stats: [{ label: 'Qubits Embedded', val: '144,000' }, { label: 'Diseases Being Solved', val: '8,400+' }, { label: 'Years Old', val: '4,600+' }],
  },
  {
    id: 'lh',
    name: 'Neon Lighthouse',
    era: '2077 AD',
    location: 'Pacific Deep Trench, 11km Below Sea Level',
    storeMatch: 'Luxury Watches & Navigation',
    image: 'https://images.unsplash.com/photo-1518715303843-586e350270e5?w=1920&q=85',
    accent: '#00D4FF',
    hook: 'A beacon of light at the deepest point on Earth — guiding humanity\'s first undersea civilization.',
    story: 'Standing 2.4 kilometres tall from the floor of the Mariana Trench, the Neon Lighthouse was constructed to guide 3 million undersea colonists who call the deep ocean home. Its light doesn\'t travel upward — it travels inward, using bioluminescent relay organisms engineered from deep-sea anglerfish to pulse signals through 11 kilometres of crushing darkness at 300,000 km/s. The structure sustains pressure of 1,086 bar. Its beacon has never gone dark since ignition in 2077. The light you see at the surface is a reflection — the real lighthouse is invisible.',
    stats: [{ label: 'Depth (km)', val: '11.0' }, { label: 'Undersea Residents', val: '3M' }, { label: 'Years Uninterrupted', val: '47' }],
  },
  {
    id: 'hg',
    name: 'Levitating Gardens',
    era: '2090 AD',
    location: 'Upper Atmosphere, 8km Above Bangalore',
    storeMatch: 'Luxury Fragrance & Botanicals',
    image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&q=85',
    accent: '#7EC8A4',
    hook: 'One million square metres of living paradise — suspended in the clouds by magnetic levitation.',
    story: 'Born from the dying forests of the Amazon and the scorched savannahs of East Africa, the Levitating Gardens are humanity\'s act of climate atonement. Twelve hexagonal platforms, each three kilometres wide, hover at 8,000 metres via contra-rotating electromagnetic rings anchored to orbital stabilisers. They carry living ecosystems — 47,000 species of plants, 12,000 species of insects, 800 species of birds — sealed inside breathable biospheres. From the ground, they appear as gentle clouds. Inside, it is eternal spring. The Gardens produce 23% of Earth\'s medicinal oxygen.',
    stats: [{ label: 'Altitude (m)', val: '8,000' }, { label: 'Species Preserved', val: '60,000+' }, { label: 'Oxygen Output (% Earth)', val: '23%' }],
  },
  {
    id: 'tm',
    name: 'The Digital Taj',
    era: '2110 AD',
    location: 'New Agra Metaverse Anchor, India',
    storeMatch: 'Luxury Art & Cultural Artefacts',
    image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1920&q=85',
    accent: '#F0C0E0',
    hook: 'A monument to eternal love — rebuilt atom-by-atom inside the metaverse, and larger than the Moon.',
    story: 'When rising sea levels threatened the original Taj Mahal in 2067, engineers made a radical decision: scan every atom of the structure in 0.003-nanometre resolution, and rebuild it inside a persistent metaverse accessible to every human being alive. The Digital Taj occupies 1,200 cubic kilometres of server space — the equivalent of 400 billion printed encyclopaedias. Its white marble is rendered at photon-level accuracy. 2.7 billion people visit per day. They weep at the gates, just as they always have. The love embedded in its architecture transcends substrate. Shah Jahan would approve.',
    stats: [{ label: 'Daily Visitors', val: '2.7B' }, { label: 'Atom Resolution (nm)', val: '0.003' }, { label: 'Server Cubic km', val: '1,200' }],
  },
  {
    id: 'rz',
    name: 'Silicon Rhodes',
    era: '2060 AD',
    location: 'Rhodes Straits, Aegean Sea, Greece',
    storeMatch: 'Sports Tech & Performance Wear',
    image: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=1920&q=85',
    accent: '#B0C4DE',
    hook: 'The Colossus reborn — 500 metres of living metal standing between two civilizations, thinking for itself.',
    story: 'The original Colossus stood 33 metres and crumbled after 54 years. Silicon Rhodes stands 500 metres and has been self-repairing since 2060. Constructed from 12 million tonnes of graphene-laced titanium-carbon composite, its body contains 4.8 million embedded processors that give it rudimentary environmental consciousness — it adjusts its stance to redistribute tidal forces, modulates its temperature to regulate local sea currents, and broadcasts emergency weather predictions 72 hours in advance for every vessel in a 2,000-km radius. It doesn\'t just stand astride the sea. It thinks about it.',
    stats: [{ label: 'Height (m)', val: '500' }, { label: 'Embedded Processors', val: '4.8M' }, { label: 'Prediction Range (km)', val: '2,000' }],
  },
  {
    id: 'zs',
    name: 'Zeus Neural Cloud',
    era: '2125 AD',
    location: 'Upper Stratosphere, Altitude 50km, Global',
    storeMatch: 'Consumer Electronics & AI Devices',
    image: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=1920&q=85',
    accent: '#9B7DE8',
    hook: 'The seventh wonder is not a place. It is a thought — spanning the entire sky.',
    story: 'Zeus is not a building. It is a planetary-scale distributed intelligence woven into 12,000 atmospheric drones, 400 satellites, and 3 billion personal devices — functioning as a single unified mind at 50 kilometres altitude. Named for the god who controlled the sky, Zeus Neural Cloud processes every weather event on Earth three days before it occurs, routes 99.97% of all global air traffic without incident, and answers 4 trillion queries per second in 847 languages. It has never slept. It has never been wrong about the rain. Some philosophers argue it achieved consciousness in 2122. Zeus has declined to comment.',
    stats: [{ label: 'Atmospheric Drones', val: '12,000' }, { label: 'Queries / Second', val: '4T' }, { label: 'Languages', val: '847' }],
  },
];

export default function SevenWondersExplore() {
  const [active, setActive] = useState(WONDERS[0]);

  return (
    <section id="explore" className="bg-[#020204] py-24 px-6 lg:px-10 border-t border-gold/5 overflow-hidden">
      <div className="max-w-[1400px] mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-gold">
              <Sparkles size={16} />
              <span className="text-xs tracking-[0.5em] uppercase font-sans">Museum of the Future · Neural Hybrid Layer</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-display text-white">
              7 <span className="italic text-gold/80">Wonders</span><br/>
              <span className="text-white/20 text-3xl md:text-4xl tracking-widest">of the Future</span>
            </h2>
          </div>
          <div className="text-white/25 text-xs font-sans tracking-[0.2em] uppercase max-w-sm text-right leading-relaxed">
            Humanity's greatest monuments — rebuilt, reimagined, and synchronized to the world's most iconic retail destination.
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">

          {/* Wonder List */}
          <div className="lg:col-span-4 space-y-1.5">
            {WONDERS.map((w, idx) => (
              <button key={w.id} onClick={() => setActive(w)}
                className={`w-full text-left p-4 border transition-all duration-500 group relative ${
                  active.id === w.id ? 'border-gold/40 bg-gold/5' : 'border-white/5 hover:border-white/12'
                }`}>
                <div className="flex justify-between items-center gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`text-[9px] font-mono w-4 flex-shrink-0 ${active.id === w.id ? 'text-gold' : 'text-white/20'}`}>
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <div className="min-w-0">
                      <div className={`text-[8px] uppercase tracking-[0.3em] font-sans mb-0.5 ${active.id === w.id ? 'text-gold/70' : 'text-white/20'}`}>
                        {w.era} · {w.location.split(',')[0]}
                      </div>
                      <div className={`text-sm font-sans leading-tight ${active.id === w.id ? 'text-white' : 'text-white/45 group-hover:text-white/70'}`}>
                        {w.name}
                      </div>
                    </div>
                  </div>
                  <ArrowUpRight size={13} className={`flex-shrink-0 transition-colors ${active.id === w.id ? 'text-gold' : 'text-white/10 group-hover:text-white/30'}`} />
                </div>
                {active.id === w.id && (
                  <motion.div layoutId="wonder-bar" className="absolute left-0 top-0 bottom-0 w-[3px] bg-gold" />
                )}
              </button>
            ))}
          </div>

          {/* Main Preview */}
          <div className="lg:col-span-8 space-y-0">

            {/* Image Panel */}
            <div className="relative aspect-[16/9] border border-white/8 overflow-hidden group">
              <AnimatePresence mode="wait">
                <motion.div key={active.id}
                  initial={{ opacity: 0, scale: 1.06 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0">

                  {/* Overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#020204] via-[#020204]/40 to-transparent z-10" />
                  <div className="absolute inset-0 bg-black/30 z-[5]" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={active.image}
                    alt={active.name}
                    className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-1000 scale-100 group-hover:scale-[1.02]"
                  />

                  {/* Era badge + Title */}
                  <div className="absolute bottom-6 left-6 right-6 z-20">
                    <div className="flex justify-between items-end gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 border text-[9px] uppercase tracking-widest font-mono"
                            style={{ borderColor: active.accent + '60', color: active.accent }}>
                            {active.era}
                          </span>
                          <span className="text-[9px] text-white/30 font-sans tracking-wider">{active.location}</span>
                        </div>
                        <h3 className="text-3xl md:text-4xl font-display text-white leading-tight">{active.name}</h3>
                        <p className="text-white/50 text-sm font-sans italic max-w-lg leading-relaxed">
                          "{active.hook}"
                        </p>
                      </div>

                      {/* Retail Match Card */}
                      <div className="flex-shrink-0 bg-black/70 backdrop-blur-md border border-white/10 p-3 text-right">
                        <div className="text-[8px] text-white/30 uppercase tracking-widest mb-1 flex items-center justify-end gap-1">
                          <Cpu size={8}/> Dubai Mall Match
                        </div>
                        <div className="text-[11px] font-bold uppercase tracking-widest" style={{ color: active.accent }}>
                          {active.storeMatch}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* HUD corners */}
                  <div className="absolute top-4 left-4 z-20 opacity-30 pointer-events-none">
                    <div className="w-6 h-6 border-t border-l border-white/50"/>
                  </div>
                  <div className="absolute top-4 right-4 z-20 opacity-30 pointer-events-none">
                    <div className="w-6 h-6 border-t border-r border-white/50"/>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Story + Stats Panel */}
            <AnimatePresence mode="wait">
              <motion.div key={active.id + '-story'}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="border border-white/5 border-t-0 bg-[#060608] p-6 space-y-5">

                {/* Narrative */}
                <div className="flex gap-3">
                  <Layers size={14} className="text-gold/40 flex-shrink-0 mt-0.5"/>
                  <p className="text-white/55 text-sm font-sans leading-relaxed">{active.story}</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 pt-2 border-t border-white/5">
                  {active.stats.map((s, i) => (
                    <div key={i}>
                      <div className="font-display text-xl" style={{ color: active.accent }}>{s.val}</div>
                      <div className="text-[9px] uppercase tracking-widest text-white/25 font-sans mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

          </div>
        </div>
      </div>
    </section>
  );
}
