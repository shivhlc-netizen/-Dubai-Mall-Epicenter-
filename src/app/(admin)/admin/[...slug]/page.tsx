'use client';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Construction, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ALL_ADMIN_LINKS } from '@/lib/menu-links';
import SmartAdminModule from '@/components/admin/SmartAdminModule';

export default function AdminCatchAll() {
  const pathname = usePathname();
  
  // Find the metadata for this link
  const link = ALL_ADMIN_LINKS.find(l => l.href === pathname);
  
  // 1. If it's a "Coming Soon" item, show the construction screen
  if (link?.status === 'coming_soon') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 rounded-full bg-gold/10 flex items-center justify-center text-gold mb-4"
        >
          <Construction size={40} />
        </motion.div>
        
        <h1 className="font-display text-4xl text-white uppercase">Feature <span className="text-gold-gradient">Coming Soon.</span></h1>
        <p className="text-white/40 max-w-md mx-auto font-sans tracking-wide">
          We are currently architecting the <span className="text-gold">"{link.label}"</span> module to meet the 7-star standards of The Dubai Mall.
          Please check back soon for live intelligence updates.
        </p>

        <Link 
          href="/admin"
          className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 text-white text-xs uppercase tracking-[0.2em] hover:bg-gold hover:text-black transition-all rounded-sm group font-sans"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Return to Command
        </Link>
      </div>
    );
  }

  // 2. If it's any other link that doesn't have a static page, use the Smart AI Module
  if (link) {
    return <SmartAdminModule label={link.label} icon={link.icon} />;
  }

  // 3. Fallback for non-existent links
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-6">
      <div className="text-gold/20 font-display text-9xl tracking-tighter">404</div>
      <h1 className="font-display text-3xl text-white uppercase tracking-widest">Protocol Invalid</h1>
      <p className="text-white/20 font-sans uppercase tracking-[0.3em] text-[10px]">Access to this coordinate is restricted or non-existent.</p>
      <Link href="/admin" className="text-gold hover:text-white transition-colors text-xs font-mono tracking-widest uppercase mt-4">_Re_Route_To_Command</Link>
    </div>
  );
}
