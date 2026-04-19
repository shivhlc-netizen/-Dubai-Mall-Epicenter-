'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface PulseNews {
  id: number;
  title: string;
  content: string;
  category: string;
  ai_insight: string;
  created_at: string;
}

export default function PulseSection() {
  const [news, setNews] = useState<PulseNews[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/pulse')
      .then(res => res.json())
      .then(data => {
        setNews(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <section id="pulse" className="py-20 px-6 lg:px-10 bg-[#080808] overflow-hidden min-h-[400px]">
      <div className="max-w-[1400px] mx-auto">
        {(loading || news.length === 0) ? (
          <div className="flex items-center justify-center py-20">
             <div className="w-8 h-8 border-2 border-gold/20 border-t-gold rounded-full animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col md:flex-row items-center gap-12">
            {/* AI Badge & Label */}
            <div className="w-full md:w-1/3">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gold/30 bg-gold/5 mb-6"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
                <span className="text-[10px] tracking-[0.2em] uppercase text-gold font-sans font-bold">Live AI Insights</span>
              </motion.div>
              
              <h2 className="font-display text-4xl lg:text-5xl text-white mb-4 leading-tight">
                Pulse of <span className="text-gold">The Epicenter</span>
              </h2>
              <p className="text-white/40 font-sans text-sm tracking-wide leading-relaxed">
                Twice a week, our AI Concierge curates the most exclusive updates and trends from across 1,200 brands and experiences.
              </p>
            </div>

            {/* News Card */}
            <div className="w-full md:w-2/3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="relative group bg-white/[0.02] border border-white/10 p-8 lg:p-12 rounded-2xl overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-6">
                  <span className="text-[10px] tracking-widest uppercase text-white/20 font-sans">
                    {new Date(news[0].created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>

                <div className="relative z-10">
                  <div className="text-gold text-[10px] tracking-[0.3em] uppercase mb-4 font-bold">{news[0].category}</div>
                  <h3 className="text-2xl lg:text-3xl text-white font-display mb-6 group-hover:text-gold transition-colors duration-500">
                    {news[0].title}
                  </h3>
                  <p className="text-white/60 font-sans text-lg mb-8 leading-relaxed italic">
                    "{news[0].content}"
                  </p>
                  
                  <div className="flex flex-col gap-4 p-6 bg-white/[0.03] rounded-xl border-l-2 border-gold">
                    <div className="text-[9px] tracking-widest uppercase text-gold/60 font-bold">AI Concierge Perspective</div>
                    <div className="text-white/80 font-sans text-sm leading-relaxed">
                      {news[0].ai_insight}
                    </div>
                  </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-gold/5 blur-[100px] rounded-full" />
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
