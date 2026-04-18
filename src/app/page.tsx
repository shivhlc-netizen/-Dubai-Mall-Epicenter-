'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navigation from '@/components/Navigation';
import SectionDots from '@/components/ui/SectionDots';
import HeroSection from '@/components/sections/HeroSection';
import GallerySection from '@/components/sections/GallerySection';
import WowFactsSection from '@/components/sections/WowFactsSection';
import FountainDivider from '@/components/ui/FountainDivider';
import { SECTIONS } from '@/lib/data';

export default function Home() {
  const [activeSection, setActiveSection] = useState('hero');
  const [openModule, setOpenModule] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [password, setPassword] = useState('');
  const [greeting, setGreeting] = useState('Welcome');

  // Filter sections to focus only on stable core ones
  const FOCUSED_SECTIONS = SECTIONS.filter(s => ['hero', 'gallery', 'wow'].includes(s.id));

  useEffect(() => {
    setHasMounted(true);
    setLoaded(true);
    
    if (process.env.NODE_ENV === 'development') {
      setIsAuthorized(true);
    }

    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  if (!hasMounted) return <div className="fixed inset-0 bg-black" />;

  // Password Guard (Stable)
  if (!isAuthorized && process.env.NODE_ENV === 'production') {
    return (
      <div className="fixed inset-0 z-[1000] bg-[#050505] flex items-center justify-center p-6 font-sans">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center"
        >
          <div className="mb-12">
            <h1 className="font-display text-3xl text-gold mb-2 uppercase tracking-[0.3em]">The Epicenter</h1>
            <p className="text-white/20 text-[10px] font-sans tracking-[0.5em] uppercase">Private Executive Preview</p>
          </div>
          
          <div className="relative group mb-6">
            <input 
              type="password" 
              placeholder="ACCESS KEY" 
              className="w-full bg-white/5 border border-gold/10 p-5 text-white text-center font-sans tracking-[0.8em] focus:outline-none focus:border-gold/40 transition-all rounded-sm placeholder:tracking-widest"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && password === 'DUBAI2026' && setIsAuthorized(true)}
            />
            <div className="absolute inset-0 border border-gold/20 scale-105 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
          </div>

          <button 
            onClick={() => {
              if (password === 'DUBAI2026') setIsAuthorized(true);
              else alert('Invalid Access Key');
            }}
            className="text-[10px] text-gold/40 uppercase tracking-[0.4em] hover:text-gold transition-colors py-2"
          >
            Authorize Entry
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <AnimatePresence>
        {!loaded && (
          <motion.div
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] bg-[#050505] flex flex-col items-center justify-center"
          >
            <div className="font-display text-2xl tracking-[0.3em] uppercase text-white mb-1 text-shimmer-gold">The Dubai Mall</div>
          </motion.div>
        )}
      </AnimatePresence>

      <Navigation active={activeSection} onNavigate={(id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })} onModuleOpen={setOpenModule} />
      <SectionDots active={activeSection} onNavigate={(id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })} />

      <main className="bg-[#050505]">
        <HeroSection onScrollDown={() => document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' })} greeting={greeting} />
        
        <FountainDivider />
        
        <section id="gallery" className="relative bg-[#050505]">
          <GallerySection />
        </section>

        <FountainDivider />

        <section id="wow" className="relative bg-[#050505]">
          <WowFactsSection />
        </section>
      </main>

      <footer className="bg-[#050505] border-t border-gold/10 py-20 px-6 text-center">
        <div className="font-display text-xl tracking-[0.2em] uppercase text-white mb-2 text-shimmer-gold">The Dubai Mall</div>
        <div className="text-[9px] tracking-[0.5em] uppercase text-gold/40 font-sans mb-10">The Epicenter</div>
        <p className="text-[10px] text-white/10 font-sans tracking-widest uppercase">
          © 2026 Emaar Malls · Phase 1 Stable Build
        </p>
      </footer>
    </>
  );
}
