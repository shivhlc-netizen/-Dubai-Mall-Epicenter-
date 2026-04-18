'use client';
import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Database, Plus } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import VibgyorCounter from '@/components/ui/VibgyorCounter';
import CinematicAdmin from '@/components/admin/CinematicAdmin';

const HERO_STATS = [
  { value: '100M+', label: 'Annual Visitors' },
  { value: '1,200+', label: 'World-Class Stores' },
  { value: '#1', label: "UAE's Top Destination" },
];

interface Props {
  onScrollDown: () => void;
  isManaging: boolean;
  onToggleManage: () => void;
}

export default function HeroSection({ onScrollDown, isManaging, onToggleManage }: Props) {
  const { data: session } = useSession();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: { x: number; y: number; vx: number; vy: number; size: number; alpha: number }[] = [];
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.4 + 0.1,
      });
    }

    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201, 160, 82, ${p.alpha})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();

    const onResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); };
  }, []);

  const container = { hidden: {}, show: { transition: { staggerChildren: 0.15, delayChildren: 0.8 } } };
  const item = { hidden: { opacity: 0, y: 50 }, show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } } };

  return (
    <section id="hero" className="snap-section relative flex flex-col justify-center items-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1920&q=85"
          alt="Dubai skyline"
          fill
          priority
          className="object-cover object-center opacity-25"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/60 via-[#050505]/40 to-[#050505]" />
      </div>

      {/* Cinematic Counter Bottom Right */}
      <div className="absolute bottom-10 right-6 lg:right-10 z-20">
        <VibgyorCounter />
      </div>

      {/* Cinematic Admin Floating Button */}
      {session && (session.user.role === 'admin' || session.user.role === 'manager') && (
        <CinematicAdmin isManaging={isManaging} onToggleManage={onToggleManage} />
      )}

      {/* Grid overlay */}
      <div className="absolute inset-0 grid-overlay opacity-30" />

      {/* Particles */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      {/* Gold horizontal line top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

      {/* Content */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 text-center px-6 max-w-6xl mx-auto"
      >
        {/* Eyebrow */}
        <motion.div variants={item} className="flex items-center justify-center gap-4 mb-8">
          <div className="h-px w-12 bg-gold/60" />
          <span className="text-[10px] tracking-[0.6em] uppercase font-sans text-gold">
            Downtown Dubai · UAE
          </span>
          <div className="h-px w-12 bg-gold/60" />
        </motion.div>

        {/* Main headline */}
        <motion.h1 variants={item} className="font-display leading-none mb-4">
          <span className="block text-[clamp(3rem,10vw,9rem)] tracking-[0.08em] uppercase text-white font-semibold">
            The Dubai
          </span>
          <span className="block text-[clamp(3rem,10vw,9rem)] tracking-[0.08em] uppercase text-white font-semibold">
            Mall
          </span>
        </motion.h1>

        {/* Gold subtitle */}
        <motion.p variants={item} className="text-[clamp(1rem,2.5vw,1.5rem)] tracking-[0.5em] uppercase font-sans text-gold mb-4">
          The Epicenter
        </motion.p>

        {/* Tagline */}
        <motion.p variants={item} className="text-white/40 text-sm md:text-base font-sans tracking-wider max-w-xl mx-auto mb-12">
          The world's most visited retail and entertainment destination.
        </motion.p>

        {/* Stats row */}
        <motion.div variants={item} className="flex flex-wrap justify-center gap-10 md:gap-16 mb-14">
          {HERO_STATS.map((s, i) => (
            <div key={i} className="text-center">
              <div className="font-display text-2xl md:text-3xl text-gold-light font-semibold">{s.value}</div>
              <div className="text-[10px] tracking-widest uppercase text-white/40 mt-1 font-sans">{s.label}</div>
            </div>
          ))}
        </motion.div>

        {/* CTAs */}
        <motion.div variants={item} className="flex flex-wrap gap-4 justify-center">
          <button onClick={onScrollDown} className="btn-gold animate-pulse-gold group relative overflow-hidden">
            <span className="relative z-10">Explore the Experience</span>
            <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 skew-x-[-30deg]" />
          </button>
          {!session ? (
            <Link 
              href="/signup" 
              className="px-8 py-4 bg-white/5 border border-white/10 text-white text-[11px] tracking-[0.2em] uppercase font-sans hover:bg-gold hover:text-black hover:border-gold transition-all duration-500 rounded-sm flex items-center gap-2 group"
            >
              Join the Epicenter <Plus size={14} className="group-hover:rotate-90 transition-transform" />
            </Link>
          ) : (
            <button
              onClick={() => document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' })}
              className="btn-outline"
            >
              For Partners
            </button>
          )}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.button
        onClick={onScrollDown}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30 hover:text-gold transition-colors"
      >
        <span className="text-[9px] tracking-widest uppercase">Scroll</span>
        <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
          <ChevronDown size={16} />
        </motion.div>
      </motion.button>

      {/* Bottom gold line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
    </section>
  );
}
