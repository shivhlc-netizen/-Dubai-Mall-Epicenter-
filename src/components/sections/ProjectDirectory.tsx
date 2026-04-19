'use client';
import { motion } from 'framer-motion';
import { PROJECT_DIRECTORY } from '@/lib/data';
import { ArrowUpRight, ShieldCheck, Globe, Zap, BarChart3 } from 'lucide-react';
import Image from 'next/image';

export default function ProjectDirectory() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
  };

  const icons = {
    Commercial: <Globe size={18} className="text-gold" />,
    Experience: <Zap size={18} className="text-gold" />,
    Marketing: <ShieldCheck size={18} className="text-gold" />,
    Data: <BarChart3 size={18} className="text-gold" />,
  };

  return (
    <section id="directory" className="py-24 px-6 lg:px-10 bg-[#050505] border-y border-gold/5 relative overflow-hidden">
      <div className="absolute inset-0 grid-overlay opacity-10 pointer-events-none" />
      
      <div className="max-w-[1400px] mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
          <div className="max-w-2xl">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-3 mb-4"
            >
              <div className="h-px w-8 bg-gold/60" />
              <span className="text-[10px] tracking-[0.5em] uppercase text-gold font-sans">Project Infrastructure</span>
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-display text-4xl lg:text-5xl text-white uppercase tracking-wider"
            >
              The Epicenter <span className="text-shimmer-gold">Directory.</span>
            </motion.h2>
          </div>
          <motion.p 
             initial={{ opacity: 0 }}
             whileInView={{ opacity: 1 }}
             viewport={{ once: true }}
             className="text-white/30 text-xs font-sans tracking-widest uppercase mb-2"
          >
            Phase 1 Deployment · 2026 Ready
          </motion.p>
        </div>

        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {PROJECT_DIRECTORY.map((dir, idx) => (
            <motion.div
              key={idx}
              variants={item}
              className="group relative h-[450px] overflow-hidden border border-white/5 bg-white/[0.02] hover:border-gold/30 transition-all duration-700"
            >
              {/* Image background with zoom on hover */}
              <div className="absolute inset-0 transition-transform duration-1000 group-hover:scale-110">
                <Image 
                  src={dir.image} 
                  alt={dir.title} 
                  fill 
                  className="object-cover opacity-40 group-hover:opacity-60 grayscale group-hover:grayscale-0 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
              </div>

              {/* Content Overlay */}
              <div className="absolute inset-0 p-8 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div className="p-3 bg-black/40 backdrop-blur-md border border-white/10 rounded-sm">
                    {icons[dir.type as keyof typeof icons]}
                  </div>
                  <div className="text-[9px] tracking-[0.3em] uppercase text-white/40 font-mono">0{idx + 1}</div>
                </div>

                <div>
                  <h3 className="font-display text-2xl text-white mb-1 uppercase tracking-wider group-hover:text-gold transition-colors">{dir.title}</h3>
                  <p className="text-gold/60 text-[10px] font-sans tracking-[0.3em] uppercase mb-4">{dir.sub}</p>
                  <p className="text-white/40 text-xs font-sans leading-relaxed mb-8 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                    {dir.desc}
                  </p>
                  
                  <a 
                    href={dir.link} 
                    className="inline-flex items-center gap-2 text-[10px] tracking-[0.3em] uppercase text-white group-hover:text-gold transition-colors border-b border-white/10 group-hover:border-gold/40 pb-1"
                  >
                    Enter Module <ArrowUpRight size={14} />
                  </a>
                </div>
              </div>

              {/* Shine effect on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-10 pointer-events-none transition-opacity duration-700 bg-gradient-to-br from-white via-transparent to-transparent" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
