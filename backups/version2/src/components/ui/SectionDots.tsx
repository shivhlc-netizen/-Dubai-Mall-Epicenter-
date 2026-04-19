'use client';
import { motion } from 'framer-motion';
import clsx from 'clsx';

const FOCUSED_SECTIONS = [
  { id: 'hero', label: 'Home' },
  { id: 'directory', label: 'Directory' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'wow', label: 'Wow Facts' }
];

interface Props {
  active: string;
  onNavigate: (id: string) => void;
}

export default function SectionDots({ active, onNavigate }: Props) {
  return (
    <div className="fixed right-6 lg:right-10 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col gap-6">
      {FOCUSED_SECTIONS.map((s) => (
        <button
          key={s.id}
          onClick={() => onNavigate(s.id)}
          className="group flex items-center justify-end gap-4"
        >
          <span className={clsx(
            "text-[10px] uppercase tracking-[0.3em] font-sans transition-all duration-300 opacity-0 group-hover:opacity-100",
            active === s.id ? "text-gold opacity-100" : "text-white/40"
          )}>
            {s.label}
          </span>
          <div className="relative flex items-center justify-center w-3 h-3">
            <motion.div 
              animate={{ 
                scale: active === s.id ? [1, 1.5, 1] : 1,
                opacity: active === s.id ? 1 : 0.3
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className={clsx(
                "w-1.5 h-1.5 rounded-full transition-colors duration-500",
                active === s.id ? "bg-gold shadow-[0_0_10px_rgba(201,160,82,0.8)]" : "bg-white/40"
              )} 
            />
          </div>
        </button>
      ))}
    </div>
  );
}
