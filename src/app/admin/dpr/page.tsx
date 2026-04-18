'use client';
import { motion } from 'framer-motion';
import { Shield, Zap, Cpu, Layout, Layers, Globe, Database, Server } from 'lucide-react';

export default function DPRPage() {
  const sections = [
    {
      title: '1. Executive Summary',
      icon: <Globe className="text-gold" />,
      content: 'The Dubai Seven Wonders - Hybrid (Epicenter Pro) is a high-performance, "7-star" digital twin dashboard for the Dubai Mall. It leverages Next.js 14 and a serverless architecture to deliver immersive luxury storytelling with extreme operational stability.',
    },
    {
      title: '2. Architectural Foundation',
      icon: <Layers className="text-gold" />,
      content: 'The system uses a "Static Headless" pattern for gallery and content delivery, bypassing traditional database bottlenecks in serverless environments. It employs Framer Motion for cinematic interaction design and Tailwind CSS for responsive luxury aesthetics.',
    },
    {
      title: '3. Technical Stability (Netlify Optimizations)',
      icon: <Shield className="text-gold" />,
      content: 'Key stability measures include: Downgraded Next.js for Netlify plugin compatibility, relaxed Content-Security-Policy for external AI assets, and a client-side hydration guard to eliminate layout shifts.',
    },
    {
      title: '4. AI Integration Strategy',
      icon: <Cpu className="text-gold" />,
      content: 'Integrated with Google Gemini and Anthropic Claude for dynamic content generation. Implemented "AI Budgeting" and usage tracking to ensure cost-efficiency and performance governance.',
    },
    {
      title: '5. Scalability & Expandability',
      icon: <Zap className="text-gold" />,
      content: 'Modular section-based design allows for seamless addition of new "Wonders" or features without core refactoring. The codebase is CMS-ready, supporting easy transition to headless data sources.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8 lg:p-20 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="text-center mb-16">
          <h1 className="font-display text-4xl lg:text-6xl text-gold mb-4 uppercase tracking-[0.2em]">Detailed Project Report</h1>
          <p className="text-white/40 tracking-[0.4em] uppercase text-xs font-sans">The Epicenter — Phase 1 Documentation</p>
          <div className="mt-8 h-px bg-gold/20 w-32 mx-auto" />
        </div>

        <div className="space-y-12">
          {sections.map((section, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="group border border-white/5 bg-white/[0.02] p-8 hover:border-gold/30 transition-all duration-500 rounded-sm"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-gold/5 rounded-sm group-hover:bg-gold/10 transition-colors">
                  {section.icon}
                </div>
                <h2 className="font-display text-xl text-white tracking-widest uppercase">{section.title}</h2>
              </div>
              <p className="text-white/50 leading-relaxed font-sans text-sm tracking-wide">
                {section.content}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="mt-20 border-t border-gold/10 pt-10 text-center">
          <p className="text-[10px] text-white/20 uppercase tracking-[0.5em] font-sans">
            © 2026 Emaar Malls Digital Architecture · PhD Thesis Documentation
          </p>
        </div>
      </motion.div>
    </div>
  );
}
