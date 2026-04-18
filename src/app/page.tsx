'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navigation from '@/components/Navigation';
import SectionDots from '@/components/ui/SectionDots';
import HeroSection from '@/components/sections/HeroSection';
import WhySection from '@/components/sections/WhySection';
import LiveCounter from '@/components/ui/LiveCounter';
import RetailSection from '@/components/sections/RetailSection';
import LuxurySection from '@/components/sections/LuxurySection';
import DiningSection from '@/components/sections/DiningSection';
import AttractionsSection from '@/components/sections/AttractionsSection';
import GallerySection from '@/components/sections/GallerySection';
import PulseSection from '@/components/sections/PulseSection';
import EventsSection from '@/components/sections/EventsSection';
import WowFactsSection from '@/components/sections/WowFactsSection';
import EventsModule from '@/components/modules/EventsModule';
import SponsorshipModule from '@/components/modules/SponsorshipModule';
import LeasingModule from '@/components/modules/LeasingModule';
import { SECTIONS } from '@/lib/data';

export default function Home() {
  const [activeSection, setActiveSection] = useState('hero');
  const [openModule, setOpenModule] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id); },
        { threshold: 0.4 }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [loaded]);

  const scrollTo = useCallback((id: string) => {
    // If navigating to experience, redirect instead of scrolling
    if (id === 'experience') {
      window.location.href = '/experience';
      return;
    }
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const scrollToNext = useCallback(() => {
    const idx = SECTIONS.findIndex(s => s.id === activeSection);
    const next = SECTIONS[idx + 1];
    if (next) scrollTo(next.id);
  }, [activeSection, scrollTo]);

  return (
    <>
      {/* Loading screen */}
      <AnimatePresence>
        {!loaded && (
          <motion.div
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[999] bg-[#050505] flex flex-col items-center justify-center"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="font-display text-2xl tracking-[0.3em] uppercase text-white mb-1">The Dubai Mall</div>
              <div className="text-[9px] tracking-[0.7em] uppercase text-gold font-sans">The Epicenter</div>
            </motion.div>
            <div className="mt-8 w-48 h-px bg-[#1a1a1a] overflow-hidden">
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ duration: 1.2, ease: 'easeInOut', repeat: Infinity }}
                className="h-full bg-gradient-to-r from-transparent via-gold to-transparent"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nav */}
      <Navigation
        active={activeSection}
        onNavigate={scrollTo}
        onModuleOpen={setOpenModule}
      />

      {/* Section dots */}
      <SectionDots active={activeSection} onNavigate={scrollTo} />

      {/* Main content */}
      <main>
        <HeroSection onScrollDown={scrollToNext} />
        <WhySection />
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <LiveCounter />
        </div>
        <RetailSection onExploreLeasing={() => setOpenModule('leasing')} />
        <LuxurySection />
        <DiningSection />
        <PulseSection />
        <AttractionsSection />
        <GallerySection />
        <EventsSection
          onEventsModule={() => setOpenModule('events')}
          onSponsorModule={() => setOpenModule('sponsorship')}
        />
        <WowFactsSection />
      </main>

      {/* Footer */}
      <footer className="bg-[#050505] border-t border-gold/10 py-12 px-6 lg:px-10">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-10">
            <div>
              <div className="font-display text-xl tracking-[0.2em] uppercase text-white mb-1">The Dubai Mall</div>
              <div className="text-[9px] tracking-[0.5em] uppercase text-gold font-sans">The Epicenter</div>
            </div>
            <div className="grid grid-cols-3 gap-x-12 gap-y-3 text-[11px] tracking-widest uppercase text-white/30 font-sans">
              {['Overview', 'Retail', 'Luxury', 'Dining', 'Attractions', 'Events'].map(s => (
                <button key={s} onClick={() => scrollTo(s.toLowerCase())} className="text-left hover:text-gold transition-colors">
                  {s}
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-2 text-[11px] font-sans text-white/30">
              <button onClick={() => setOpenModule('events')} className="hover:text-gold transition-colors">Host an Event</button>
              <button onClick={() => setOpenModule('sponsorship')} className="hover:text-gold transition-colors">Sponsorship</button>
              <button onClick={() => setOpenModule('leasing')} className="hover:text-gold transition-colors">Leasing</button>
            </div>
          </div>
          <div className="border-t border-gold/8 pt-6 flex flex-col md:flex-row justify-between gap-4">
            <p className="text-[10px] text-white/20 font-sans tracking-wider">
              © {new Date().getFullYear()} Emaar Malls. The Dubai Mall — Downtown Dubai, UAE.
            </p>
            <p className="text-[10px] text-white/20 font-sans tracking-wider">
              Built for Phase 1 Presentation · Deployable on Netlify
            </p>
          </div>
        </div>
      </footer>

      {/* Phase 2 Modules */}
      <EventsModule open={openModule === 'events'} onClose={() => setOpenModule(null)} />
      <SponsorshipModule open={openModule === 'sponsorship'} onClose={() => setOpenModule(null)} />
      <LeasingModule open={openModule === 'leasing'} onClose={() => setOpenModule(null)} />
    </>
  );
}
