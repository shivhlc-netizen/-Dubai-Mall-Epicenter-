'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navigation from '@/components/Navigation';
import SectionDots from '@/components/ui/SectionDots';
import HeroSection from '@/components/sections/HeroSection';
import ProjectDirectory from '@/components/sections/ProjectDirectory';
import GallerySection from '@/components/sections/GallerySection';
import WowFactsSection from '@/components/sections/WowFactsSection';
import FountainDivider from '@/components/ui/FountainDivider';
import AdminControlHub from '@/components/admin/AdminControlHub';

export default function Home() {
  const [activeSection, setActiveSection] = useState('hero');
  const [openModule, setOpenModule] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [greeting, setGreeting] = useState('Welcome');
  const [showFountains, setShowFountains] = useState(true);

  useEffect(() => {
    setHasMounted(true);
    setLoaded(true);
    
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    const observers: IntersectionObserver[] = [];
    const sections = ['hero', 'directory', 'gallery', 'wow'];

    sections.forEach((id) => {
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
  }, []);

  if (!hasMounted) return <div className="fixed inset-0 bg-black" />;

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

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

      <Navigation 
        active={activeSection} 
        onNavigate={scrollTo} 
        onModuleOpen={setOpenModule} 
      />
      
      <SectionDots active={activeSection} onNavigate={scrollTo} />

      <main className="bg-[#050505]">
        <HeroSection onScrollDown={() => scrollTo('directory')} greeting={greeting} />
        
        <ProjectDirectory />
        
        {showFountains && <FountainDivider />}
        
        <section id="gallery" className="relative bg-[#050505]">
          <GallerySection />
        </section>

        {showFountains && <FountainDivider />}

        <section id="wow" className="relative bg-[#050505]">
          <WowFactsSection />
        </section>
      </main>

      <footer className="bg-[#050505] border-t border-gold/10 py-20 px-6 text-center">
        <div className="font-display text-xl tracking-[0.2em] uppercase text-white mb-2 text-shimmer-gold">The Dubai Mall</div>
        <div className="text-[9px] tracking-[0.5em] uppercase text-gold/40 font-sans mb-10">The Epicenter</div>
        <p className="text-[10px] text-white/10 font-sans tracking-widest uppercase">
          © 2026 Emaar Malls · Phase 1 Cinematic Build
        </p>
      </footer>

      <AdminControlHub 
        showFountains={showFountains} 
        onToggleFountains={setShowFountains} 
      />
    </>
  );
}
