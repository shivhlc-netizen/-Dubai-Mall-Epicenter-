'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Activity } from 'lucide-react';

const VIBGYOR = [
  '#8B00FF', // Violet
  '#4B0082', // Indigo
  '#0000FF', // Blue
  '#00FF00', // Green
  '#FFFF00', // Yellow
  '#FF7F00', // Orange
  '#FF0000', // Red
];

export default function VibgyorCounter() {
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const fetchCount = async () => {
    try {
      const res = await fetch('/api/stats/visits');
      const data = await res.json();
      setCount(data.count ?? 0);
    } catch (e) {
      console.error('Counter fetch error:', e);
      setCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 15000); // Faster refresh (15s)
    return () => clearInterval(interval);
  }, []);

  const digits = (loading ? 0 : count).toString().padStart(6, '0').split('');

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex flex-col items-end gap-3 group"
    >
      <div className="flex items-center gap-1.5 p-1.5 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-lg shadow-[0_8px_32px_rgba(255,255,255,0.05)]">
        <AnimatePresence mode="popLayout">
          {digits.map((digit, i) => (
            <motion.div
              key={`${i}-${digit}`}
              initial={{ y: 15, opacity: 0, rotateX: 90 }}
              animate={{ y: 0, opacity: 1, rotateX: 0 }}
              exit={{ y: -15, opacity: 0, rotateX: -90 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="w-10 h-14 flex items-center justify-center bg-white/[0.03] border border-white/10 rounded-md relative group/digit overflow-hidden"
              style={{ perspective: '1000px' }}
            >
              {/* VIBGYOR Light Beam effect */}
              <div 
                className="absolute inset-0 opacity-10 blur-xl group-hover/digit:opacity-30 transition-opacity duration-700"
                style={{ backgroundColor: VIBGYOR[i % VIBGYOR.length] }}
              />
              
              {/* Glossy top highlight */}
              <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
              
              {/* Sidebar color strip */}
              <div 
                className="absolute left-0 top-0 w-0.5 h-full opacity-60" 
                style={{ backgroundColor: VIBGYOR[i % VIBGYOR.length] }} 
              />

              <span 
                className="font-display text-2xl font-black relative z-10"
                style={{ 
                  color: VIBGYOR[i % VIBGYOR.length], 
                  filter: `drop-shadow(0 0 5px ${VIBGYOR[i % VIBGYOR.length]}40)`,
                  WebkitTextStroke: `0.5px ${VIBGYOR[i % VIBGYOR.length]}20`
                }}
              >
                {digit}
              </span>

              {/* Grid overlay for 16-bit texture */}
              <div className="absolute inset-0 grid-overlay opacity-[0.03] pointer-events-none" />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-2 px-2">
        <div className="flex gap-1">
          {VIBGYOR.map((color, i) => (
            <motion.div 
              key={i}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
              className="w-1 h-1 rounded-full shadow-[0_0_5px_currentColor]"
              style={{ backgroundColor: color, color: color }}
            />
          ))}
        </div>
        <span className="text-[9px] tracking-[0.5em] uppercase text-white/40 font-sans font-medium flex items-center gap-2">
          Global Epicenter <Activity size={10} className="text-gold" />
        </span>
      </div>
    </motion.div>
  );
}
