'use client';
import { SECTIONS } from '@/lib/data';
import clsx from 'clsx';

interface Props {
  active: string;
  onNavigate: (id: string) => void;
}

export default function SectionDots({ active, onNavigate }: Props) {
  return (
    <nav className="fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col gap-4">
      {SECTIONS.map((s) => (
        <button
          key={s.id}
          onClick={() => onNavigate(s.id)}
          className="group flex items-center gap-3 justify-end"
          aria-label={s.label}
        >
          <span className={clsx(
            'text-[10px] font-sans uppercase tracking-widest transition-all duration-300 opacity-0 group-hover:opacity-100',
            active === s.id ? 'text-gold opacity-100' : 'text-white/40'
          )}>
            {s.label}
          </span>
          <span className={clsx(
            'block rounded-full transition-all duration-300',
            active === s.id
              ? 'w-3 h-3 bg-gold shadow-[0_0_8px_rgba(201,160,82,0.8)]'
              : 'w-1.5 h-1.5 bg-white/30 group-hover:bg-gold/60'
          )} />
        </button>
      ))}
    </nav>
  );
}
