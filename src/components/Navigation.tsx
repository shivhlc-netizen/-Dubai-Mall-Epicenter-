'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { SECTIONS } from '@/lib/data';
import clsx from 'clsx';

interface Props {
  active: string;
  onNavigate: (id: string) => void;
  onModuleOpen: (module: string) => void;
}

export default function Navigation({ active, onNavigate, onModuleOpen }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const navItems = SECTIONS.filter(s => s.id !== 'hero');

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className={clsx(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
          scrolled
            ? 'bg-[#050505]/95 backdrop-blur-xl border-b border-gold/10 py-3'
            : 'bg-transparent py-5'
        )}
      >
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 flex items-center justify-between">
          {/* Logo */}
          <button onClick={() => onNavigate('hero')} className="flex flex-col leading-none">
            <span className="font-display text-white text-lg tracking-[0.2em] uppercase font-semibold">
              The Dubai Mall
            </span>
            <span className="text-[9px] tracking-[0.5em] text-gold uppercase font-sans">
              The Epicenter
            </span>
          </button>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((s) => (
              <button
                key={s.id}
                onClick={() => onNavigate(s.id)}
                className={clsx(
                  'text-[11px] tracking-widest uppercase font-sans transition-colors duration-200',
                  active === s.id ? 'text-gold' : 'text-white/50 hover:text-white'
                )}
              >
                {s.label}
              </button>
            ))}

            {/* Explore dropdown */}
            <div className="relative">
              <button
                onClick={() => setExploreOpen(!exploreOpen)}
                className="text-[11px] tracking-widest uppercase font-sans text-gold hover:text-gold-light transition-colors"
              >
                Explore ▾
              </button>
              <AnimatePresence>
                {exploreOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 top-full mt-3 w-52 glass-card rounded-sm overflow-hidden"
                  >
                    {[
                      { label: 'Events & Hosting', module: 'events' },
                      { label: 'Sponsorship Tiers', module: 'sponsorship' },
                      { label: 'Leasing Opportunities', module: 'leasing' },
                    ].map((item) => (
                      <button
                        key={item.module}
                        onClick={() => { onModuleOpen(item.module); setExploreOpen(false); }}
                        className="block w-full text-left px-5 py-3 text-[11px] tracking-wider uppercase text-white/60 hover:text-gold hover:bg-gold/5 transition-colors border-b border-gold/10 last:border-0"
                      >
                        {item.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>

          {/* Partner CTA */}
          <div className="hidden lg:flex items-center gap-4">
            <button
              onClick={() => onModuleOpen('leasing')}
              className="btn-outline text-[10px] py-2.5 px-5"
            >
              For Partners
            </button>
          </div>

          {/* Mobile menu */}
          <button
            className="lg:hidden text-white"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
        </div>
      </motion.header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed inset-0 z-[200] bg-[#050505] flex flex-col p-8"
          >
            <div className="flex justify-between items-center mb-12">
              <span className="font-display text-white text-lg tracking-[0.2em] uppercase">The Dubai Mall</span>
              <button onClick={() => setMobileOpen(false)} className="text-white/60 hover:text-white">
                <X size={24} />
              </button>
            </div>
            <nav className="flex flex-col gap-6">
              {SECTIONS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => { onNavigate(s.id); setMobileOpen(false); }}
                  className={clsx(
                    'text-left text-2xl font-display transition-colors',
                    active === s.id ? 'text-gold' : 'text-white/60'
                  )}
                >
                  {s.label}
                </button>
              ))}
            </nav>
            <div className="mt-auto flex flex-col gap-4">
              {['Events & Hosting', 'Sponsorship', 'Leasing'].map((label, i) => (
                <button
                  key={i}
                  onClick={() => { onModuleOpen(['events', 'sponsorship', 'leasing'][i]); setMobileOpen(false); }}
                  className="text-left text-[11px] tracking-widest uppercase text-gold/70 hover:text-gold transition-colors"
                >
                  {label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
