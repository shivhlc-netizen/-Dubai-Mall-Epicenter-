'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wand2, Plus, GripVertical, Trash2, Loader2, Sparkles, Youtube, Video } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  onOptimized: () => void;
}

const MODELS = ['TLBO', 'SMC', 'GA', 'PSO', 'SA', 'ABC', 'DE', 'ACO', 'GWO', 'BBO'];

export default function MpcOptimizerModal({ open, onClose, onOptimized }: Props) {
  const [model, setModel] = useState('SMC');
  const [luxuryMode, setLuxuryMode] = useState(false);
  const [urls, setUrls] = useState<string[]>(['']);
  const [optimizing, setOptimizing] = useState(false);

  const handleAddUrl = () => setUrls([...urls, '']);
  const handleUrlChange = (index: number, val: string) => {
    const newUrls = [...urls];
    newUrls[index] = val;
    setUrls(newUrls);
  };
  const handleRemoveUrl = (index: number) => {
    setUrls(urls.filter((_, i) => i !== index));
  };

  const handleOptimize = async () => {
    setOptimizing(true);
    try {
      const res = await fetch('/api/gallery/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrls: urls.filter(u => u.trim() !== ''), luxuryMode, model }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || 'Layout optimized successfully!');
        onOptimized();
        onClose();
      } else {
        alert('Failed to optimize: ' + data.error);
      }
    } catch (e: any) {
      alert('Error during optimization: ' + e.message);
    } finally {
      setOptimizing(false);
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div 
          initial={{ scale: 0.95, y: 16 }} 
          animate={{ scale: 1, y: 0 }}
          className="bg-[#090909] border border-gold/20 w-full max-w-xl p-8 shadow-2xl relative"
          onClick={e => e.stopPropagation()}
        >
          <button onClick={onClose} className="absolute top-6 right-6 text-white/30 hover:text-white transition-colors">
            <X size={20} />
          </button>

          <div className="flex items-center gap-3 mb-6">
            <Sparkles size={24} className="text-gold" />
            <h2 className="font-display text-3xl text-white">MPC Layout Optimizer</h2>
          </div>
          
          <p className="text-white/40 text-sm font-sans mb-8 leading-relaxed">
            Smartly arranges gallery pictures and embedded videos considering image sizes, luxury theme, and event mode. Constraints: no overlap, fit container, 16:9 videos. Cost: overlap + theme mismatch + load speed.
          </p>

          <div className="space-y-6">
            {/* Model Selection */}
            <div>
              <label className="block text-[10px] tracking-widest uppercase text-white/50 font-sans mb-2">Optimization Model</label>
              <div className="relative">
                <select 
                  value={model} 
                  onChange={e => setModel(e.target.value)}
                  className="w-full appearance-none bg-[#0A0A0A] border border-gold/15 text-white text-sm px-4 py-3 focus:outline-none focus:border-gold/40 font-sans cursor-pointer"
                >
                  {MODELS.map(m => (
                    <option key={m} value={m}>{m} (Model Predictive Control)</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gold/50">▼</div>
              </div>
            </div>

            {/* Luxury Mode Toggle */}
            <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-4">
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={luxuryMode} 
                  onChange={e => setLuxuryMode(e.target.checked)} 
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-black border border-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white/40 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold"></div>
              </label>
              <div>
                <div className="text-sm text-white font-bold font-sans tracking-wide">Luxury Mode</div>
                <div className="text-[10px] text-white/40 font-sans">Show only the 4-6 highest-performing assets</div>
              </div>
            </div>

            {/* Video Drag/Drop or Input */}
            <div>
              <label className="block text-[10px] tracking-widest uppercase text-white/50 font-sans mb-2">Embed External Videos (YouTube / Vimeo)</label>
              <div className="space-y-3">
                {urls.map((url, i) => (
                  <div key={i} className="flex items-center gap-2 bg-white/5 border border-white/10 p-2">
                    <GripVertical size={16} className="text-white/20 cursor-grab" />
                    {url.includes('youtube') || url.includes('youtu.be') ? <Youtube size={16} className="text-red-500" /> : <Video size={16} className="text-blue-400" />}
                    <input 
                      type="text" 
                      value={url}
                      onChange={e => handleUrlChange(i, e.target.value)}
                      placeholder="Paste video URL here..."
                      className="flex-1 bg-transparent text-sm text-white font-sans focus:outline-none px-2"
                    />
                    <button onClick={() => handleRemoveUrl(i)} className="text-white/20 hover:text-red-400 transition-colors p-2">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
              <button 
                onClick={handleAddUrl}
                className="mt-3 flex items-center gap-2 text-[10px] uppercase tracking-widest text-gold/70 hover:text-gold transition-colors font-sans"
              >
                <Plus size={12} /> Add Another Video
              </button>
            </div>
          </div>

          <div className="mt-10 flex gap-4">
            <button onClick={onClose} disabled={optimizing} className="flex-1 border border-white/10 hover:border-white/30 text-white/50 hover:text-white py-3 text-xs uppercase tracking-widest font-sans transition-all">
              Cancel
            </button>
            <button 
              onClick={handleOptimize} 
              disabled={optimizing}
              className="flex-[2] bg-gold text-black flex items-center justify-center gap-2 py-3 text-xs uppercase tracking-widest font-bold transition-all disabled:opacity-50"
            >
              {optimizing ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
              Run MPC Optimization
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
