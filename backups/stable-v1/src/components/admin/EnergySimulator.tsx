'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Sun, Wind, Battery, BarChart3 } from 'lucide-react';

export default function EnergySimulator() {
  const [pvOutput, setPvOutput] = useState(1240); // kW
  const [windOutput, setWindOutput] = useState(450);
  const [mallLoad, setMallLoad] = useState(2100);
  const [efficiency, setEfficiency] = useState(94.5);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <Zap size={18} className="text-[#E8C97A]" />
          <h2 className="text-sm font-sans uppercase tracking-[0.3em] text-white/60">Sustainability Nexus</h2>
        </div>
        <div className="text-[9px] uppercase tracking-widest text-green-500 font-mono">Microgrid Active</div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/[0.02] border border-white/5 p-4 rounded-sm">
          <div className="flex items-center gap-2 text-gold mb-2">
            <Sun size={12} /> <span className="text-[8px] uppercase tracking-widest">Solar PV</span>
          </div>
          <div className="text-xl font-display text-white">{pvOutput} kW</div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 p-4 rounded-sm">
          <div className="flex items-center gap-2 text-blue-400 mb-2">
            <Wind size={12} /> <span className="text-[8px] uppercase tracking-widest">Wind Turbine</span>
          </div>
          <div className="text-xl font-display text-white">{windOutput} kW</div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 p-4 rounded-sm">
          <div className="flex items-center gap-2 text-red-400 mb-2">
            <BarChart3 size={12} /> <span className="text-[8px] uppercase tracking-widest">Grid Load</span>
          </div>
          <div className="text-xl font-display text-white">{mallLoad} kW</div>
        </div>
        <div className="bg-[#C9A052]/10 border border-[#C9A052]/20 p-4 rounded-sm">
          <div className="flex items-center gap-2 text-gold mb-2">
            <Battery size={12} /> <span className="text-[8px] uppercase tracking-widest">System Eff.</span>
          </div>
          <div className="text-xl font-display text-gold">{efficiency}%</div>
        </div>
      </div>

      <div className="p-4 bg-white/[0.01] border border-white/5 rounded-sm">
        <div className="text-[10px] text-white/30 uppercase tracking-[0.3em] mb-4">Live Synchronization</div>
        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="h-full w-1/3 bg-gradient-to-r from-transparent via-gold to-transparent"
          />
        </div>
        <p className="text-[9px] text-white/20 mt-3 italic font-sans">
          Gemini Insight: Optimizing PV tilt based on current solar density in Downtown Dubai.
        </p>
      </div>
    </div>
  );
}
