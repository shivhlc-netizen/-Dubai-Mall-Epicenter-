'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, Shield, TrendingUp, BarChart, 
  ArrowUpRight, Download, Printer, 
  FileSearch, Loader2, Sparkles
} from 'lucide-react';

interface Brief {
  objective: string;
  intelligence: string[];
  metrics: { label: string; value: string; trend: 'up' | 'down' | 'stable' }[];
  recommendation: string;
}

export default function SmartAdminModule({ label, icon: Icon }: { label: string; icon: any }) {
  const [brief, setBrief] = useState<Brief | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/smart-brief', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ moduleName: label })
    })
    .then(r => r.json())
    .then(data => {
      if (data.error) setError(data.message || data.error);
      else setBrief(data);
    })
    .catch(() => setError('Failed to connect to Intelligence System'))
    .finally(() => setLoading(false));
  }, [label]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
      <Loader2 size={30} className="animate-spin text-gold" />
      <p className="text-[10px] uppercase tracking-[0.3em] text-white/30">Consulting Epicenter Brain...</p>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-6">
      <div className="text-red-500/50 mb-4 font-mono text-xs uppercase tracking-widest">{error}</div>
      <button 
        onClick={() => window.location.reload()}
        className="text-[10px] text-gold border border-gold/20 px-4 py-2 hover:bg-gold hover:text-black transition-all"
      >
        Retry Intelligence Request
      </button>
    </div>
  );

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex gap-4 items-center">
          <div className="w-12 h-12 bg-gold/10 border border-gold/20 flex items-center justify-center text-gold">
            <Icon size={24} />
          </div>
          <div>
            <h1 className="font-display text-3xl text-white uppercase tracking-tight">{label}</h1>
            <p className="text-gold/40 text-[9px] font-sans tracking-[0.3em] uppercase">Intelligence Node _014</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="p-2 border border-white/5 text-white/20 hover:text-white transition-colors"><Printer size={16} /></button>
          <button className="p-2 border border-white/5 text-white/20 hover:text-white transition-colors"><Download size={16} /></button>
        </div>
      </div>

      {/* AI Objective */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 border-gold/10 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-4">
          <Sparkles size={20} className="text-gold/20" />
        </div>
        <div className="flex items-center gap-3 text-gold mb-3">
          <Zap size={14} />
          <span className="text-[10px] uppercase font-bold tracking-[0.2em]">Strategic Objective</span>
        </div>
        <p className="text-xl text-white/80 font-display leading-relaxed">
          "{brief?.objective}"
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Metrics */}
        <div className="lg:col-span-1 space-y-4">
          {brief?.metrics.map((m, i) => (
            <div key={i} className="glass-card p-6 border-white/5 hover:border-gold/20 transition-all">
              <div className="text-[10px] text-white/30 uppercase tracking-widest mb-2 font-sans">{m.label}</div>
              <div className="flex items-end justify-between">
                <div className="text-2xl font-display text-white">{m.value}</div>
                <div className={`text-[10px] font-mono ${m.trend === 'up' ? 'text-green-500' : 'text-gold'}`}>
                  {m.trend === 'up' ? '▲' : '◆'} {m.trend}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Intelligence List */}
        <div className="lg:col-span-2 glass-card p-8 border-white/5">
          <div className="flex items-center gap-3 text-white/40 mb-6 border-b border-white/5 pb-4">
            <BarChart size={16} />
            <h2 className="text-xs uppercase tracking-[0.3em]">AI Intelligence Feed</h2>
          </div>
          <div className="space-y-6">
            {brief?.intelligence.map((item, i) => (
              <div key={i} className="flex gap-4 group">
                <div className="text-gold/30 font-mono text-xs">{i + 1}.</div>
                <p className="text-sm text-white/60 group-hover:text-white transition-colors font-sans leading-relaxed">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommendation */}
      <div className="glass-card p-8 border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-3 text-gold/60 mb-4">
          <Shield size={16} />
          <h2 className="text-xs uppercase tracking-[0.3em]">Executive Recommendation</h2>
        </div>
        <div className="flex items-center justify-between gap-8">
          <p className="text-sm text-white/50 italic border-l-2 border-gold/30 pl-6">
            {brief?.recommendation}
          </p>
          <button className="flex items-center gap-2 px-6 py-3 bg-gold text-black text-[10px] font-bold uppercase tracking-widest hover:bg-white transition-all whitespace-nowrap">
            Authorize Directive <ArrowUpRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
