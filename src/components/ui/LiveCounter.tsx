'use client';

import { useState, useEffect } from 'react';
import CountUp from 'react-countup';
import { Users, Activity, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LiveCounter() {
  const [stats, setStats] = useState({ count: 0, live: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/stats/visits');
        const data = await res.json();
        
        // Simulate "Live" users based on recent activity + a base number for effect
        // 1000+ users "always live" as per user requirement
        const simulatedLive = Math.floor(Math.random() * 50) + 1240; 
        
        setStats({
          count: Math.floor((data.count || 0) / 2),
          live: simulatedLive
        });
      } catch (err) {
        console.error('Failed to fetch visit stats:', err);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Update every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-10 border-t border-gold/10">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center text-center p-6 glass-card border-gold/5"
      >
        <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center text-gold mb-4">
          <Globe size={20} />
        </div>
        <div className="text-3xl font-display text-white mb-1">
          <CountUp end={stats.count} separator="," duration={2.5} />
        </div>
        <div className="text-[10px] tracking-[0.3em] uppercase text-white/30 font-sans font-bold">Total Epicenter Visits</div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col items-center text-center p-6 glass-card border-gold/10 relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 p-2">
           <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        </div>
        <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 mb-4">
          <Users size={20} />
        </div>
        <div className="text-3xl font-display text-white mb-1">
          <CountUp end={stats.live} separator="," duration={4} />
          <span className="text-gold text-lg ml-1">+</span>
        </div>
        <div className="text-[10px] tracking-[0.3em] uppercase text-green-500/60 font-sans font-bold">Always Live Users</div>
        <div className="mt-2 text-[8px] text-white/10 uppercase tracking-widest">Global Synchronization Active</div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col items-center text-center p-6 glass-card border-gold/5"
      >
        <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 mb-4">
          <Activity size={20} />
        </div>
        <div className="text-3xl font-display text-white mb-1">
          <CountUp end={99.9} decimals={1} duration={2} />
          <span className="text-sm ml-0.5">%</span>
        </div>
        <div className="text-[10px] tracking-[0.3em] uppercase text-white/30 font-sans font-bold">Uptime Reliability</div>
      </motion.div>
    </div>
  );
}
