'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, User, ExternalLink } from 'lucide-react';
import clsx from 'clsx';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

// Only use the stable core sections
const FOCUSED_SECTIONS = [
  { id: 'hero', label: 'Home' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'wow', label: 'Wow Facts' }
];

interface Props {
  active: string;
  onNavigate: (id: string) => void;
  onModuleOpen: (module: string) => void;
}

export default function Navigation({ active, onNavigate, onModuleOpen }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();

  useEffect(() => {
    setHasMounted(true);
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  if (!hasMounted) return null;

  const handleNav = (id: string) => {
    if (pathname !== '/') {
      router.push('/#' + id);
    } else {
      onNavigate(id);
    }
    setMobileOpen(false);
  };

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className={clsx(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
          scrolled || pathname !== '/'
            ? 'bg-[#050505]/95 backdrop-blur-xl border-b border-gold/10 py-3'
            : 'bg-transparent py-5'
        )}
      >
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 flex items-center justify-between">
          <Link href="/" className="flex flex-col leading-none">
            <span className="font-display text-white text-lg tracking-[0.2em] uppercase font-semibold">
              The Dubai Mall
            </span>
            <span className="text-[9px] tracking-[0.5em] text-gold uppercase font-sans">
              The Epicenter
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            {FOCUSED_SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => handleNav(s.id)}
                className={clsx(
                  'text-[10px] tracking-widest uppercase font-sans transition-colors duration-200',
                  active === s.id ? 'text-gold' : 'text-white/50 hover:text-white'
                )}
              >
                {s.label}
              </button>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-4">
            {session ? (
              <Link
                href="/admin"
                className="flex items-center gap-2 text-gold text-[10px] tracking-widest uppercase font-sans px-4 py-2 border border-gold/20 hover:bg-gold/5 transition-all"
              >
                <User size={14} /> Admin
              </Link>
            ) : (
              <Link
                href="/login"
                className="text-[10px] tracking-widest uppercase text-white/60 hover:text-white transition-colors"
              >
                Login
              </Link>
            )}
          </div>

          <button className="lg:hidden text-white" onClick={() => setMobileOpen(true)}>
            <Menu size={22} />
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="fixed inset-0 z-[200] bg-[#050505] flex flex-col p-8"
          >
            <div className="flex justify-between items-center mb-12">
              <span className="font-display text-white text-lg tracking-[0.2em] uppercase">The Dubai Mall</span>
              <button onClick={() => setMobileOpen(false)} className="text-white/60"><X size={24} /></button>
            </div>
            <nav className="flex flex-col gap-6">
              {FOCUSED_SECTIONS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleNav(s.id)}
                  className={clsx('text-left text-2xl font-display', active === s.id ? 'text-gold' : 'text-white/60')}
                >
                  {s.label}
                </button>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
