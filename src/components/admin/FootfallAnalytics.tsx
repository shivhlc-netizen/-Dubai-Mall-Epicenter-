'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function FootfallAnalytics() {
  const [view, setView] = useState<'daily' | 'monthly' | 'yearly'>('daily');

  const DATA = {
    daily: [
      { label: '08:00', value: 12400, trend: '+12%' },
      { label: '12:00', value: 45800, trend: '+5%' },
      { label: '16:00', value: 62100, trend: '+18%' },
      { label: '20:00', value: 89300, trend: '+22%' },
      { label: '00:00', value: 15200, trend: '-8%' },
    ],
    monthly: [
      { label: 'Week 1', value: 1850000, trend: '+2%' },
      { label: 'Week 2', value: 2100000, trend: '+4%' },
      { label: 'Week 3', value: 1950000, trend: '-1%' },
      { label: 'Week 4', value: 2450000, trend: '+12%' },
    ],
    yearly: [
      { label: '2023', value: 92000000, trend: '+15%' },
      { label: '2024', value: 105000000, trend: '+14%' },
      { label: '2025 (Proj)', value: 118000000, trend: '+12%' },
    ]
  };

  const currentData = DATA[view];
  const maxVal = Math.max(...currentData.map(d => d.value));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <TrendingUp size={18} className="text-[#48CAE4]" />
          <h2 className="text-sm font-sans uppercase tracking-[0.3em] text-white/60">Footfall Intelligence</h2>
        </div>
        <div className="flex bg-white/5 p-1 rounded-sm border border-white/5">
          {(['daily', 'monthly', 'yearly'] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1 text-[9px] uppercase tracking-widest font-bold transition-all ${
                view === v ? 'bg-gold text-black' : 'text-white/40 hover:text-white'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Bars */}
        <div className="space-y-5">
          {currentData.map((d, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between text-[10px] uppercase tracking-widest font-mono text-white/30">
                <span>{d.label}</span>
                <span className="text-white/60">{d.value.toLocaleString()}</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(d.value / maxVal) * 100}%` }}
                  transition={{ duration: 1, delay: i * 0.1 }}
                  className="h-full bg-gradient-to-r from-[#48CAE4]/40 to-[#48CAE4]"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Highlight Cards */}
        <div className="grid grid-cols-2 gap-4">
           <div className="bg-white/[0.02] border border-white/5 p-4 rounded-sm flex flex-col justify-between">
              <div className="text-[9px] uppercase tracking-widest text-white/20 mb-4">Peak Density</div>
              <div>
                <div className="text-2xl font-display text-white">{(maxVal / (view === 'daily' ? 1000 : 1000000)).toFixed(1)}{view === 'daily' ? 'K' : 'M'}</div>
                <div className="flex items-center gap-1 text-[9px] text-green-400 mt-1">
                   <ArrowUpRight size={10} /> +24% vs Prev.
                </div>
              </div>
           </div>
           <div className="bg-white/[0.02] border border-white/5 p-4 rounded-sm flex flex-col justify-between">
              <div className="text-[9px] uppercase tracking-widest text-white/20 mb-4">Sync Accuracy</div>
              <div>
                <div className="text-2xl font-display text-white">99.9%</div>
                <div className="text-[9px] text-white/20 mt-1 uppercase tracking-widest">Real-time Verified</div>
              </div>
           </div>
           <div className="col-span-2 bg-gold/5 border border-gold/10 p-4 rounded-sm">
              <div className="flex items-center gap-2 mb-2">
                 <Users size={12} className="text-gold" />
                 <span className="text-[10px] uppercase tracking-widest text-gold font-bold">Strategy Insight</span>
              </div>
              <p className="text-[10px] text-white/40 leading-relaxed italic">
                {view === 'daily' && "Peak expected at 20:30 due to Fountain Premiere. Deploy additional security to Zone 4."}
                {view === 'monthly' && "Weekend footfall increased by 18% since the opening of Fashion Avenue Phase 2."}
                {view === 'yearly' && "Targeting 120M annual visitors by EOY 2026 through VIBGYOR Strategic Shift."}
              </p>
           </div>
        </div>
      </div>

      <div className="text-[8px] text-white/10 uppercase tracking-[0.4em] font-mono text-center pt-4">
         Next Update: {view === 'daily' ? 'Tomorrow 08:00' : view === 'monthly' ? 'Next Monday' : 'Jan 1st 2027'}
      </div>
    </div>
  );
}
