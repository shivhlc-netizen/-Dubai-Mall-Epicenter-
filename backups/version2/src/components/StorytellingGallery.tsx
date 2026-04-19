'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { 
  History, Sparkles, ChevronRight, ChevronLeft, 
  Play, Pause, Volume2, VolumeX, Maximize2,
  Info, MapPin, Calendar, Layers, Eye, Trash2, X
} from 'lucide-react';

interface StoryItem {
  id: number;
  path: string;
  title: string;
  description: string;
  story: string;
  emotional_hook: string;
  category_name: string;
  created_at: string;
  visual_config?: any;
}

export default function StorytellingGallery({ isManaging }: { isManaging?: boolean }) {
  const [items, setItems] = useState<StoryItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [autoPlay, setAutoPlay] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const progressTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetch('/api/gallery?featured=1&limit=50')
      .then(r => r.json())
      .then(data => {
        setItems(data.images || []);
        setLoading(false);
      })
      .catch(() => { setItems([]); setLoading(false); });
  }, []);

  useEffect(() => {
    if (autoPlay && items.length > 0) {
      progressTimer.current = setTimeout(() => {
        handleNext();
      }, 8000); // 8 seconds per slide
    }
    return () => {
      if (progressTimer.current) clearTimeout(progressTimer.current);
    };
  }, [currentIndex, autoPlay, items]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to remove this narrative from the Epicenter?')) return;
    
    try {
      const res = await fetch(`/api/gallery/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setItems(prev => {
          const newItems = prev.filter(item => item.id !== id);
          if (currentIndex >= newItems.length) {
            setCurrentIndex(Math.max(0, newItems.length - 1));
          }
          return newItems;
        });
      } else {
        alert('Failed to delete narrative');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting narrative');
    }
  };

  if (loading) return (
    <section id="gallery_story" className="h-screen bg-black flex items-center justify-center scroll-mt-20">
      <div className="text-gold flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        <span className="text-[10px] tracking-[0.4em] uppercase font-sans">Synthesizing History...</span>
      </div>
    </section>
  );

  if (items.length === 0) return (
    <section id="gallery_story" className="h-0 opacity-0 pointer-events-none scroll-mt-20" />
  );

  const currentItem = items[currentIndex];

  return (
    <section id="gallery_story" className="snap-section relative h-screen w-full overflow-hidden bg-black select-none scroll-mt-20">
      {/* Background Layers */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentItem.id}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 1.5, ease: [0.19, 1, 0.22, 1] }}
          className="absolute inset-0 z-0"
        >
          <img 
            src={currentItem.path} 
            alt={currentItem.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/40" />
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />
        </motion.div>
      </AnimatePresence>

      {/* Floating Interactive Widgets (ClassroomScreen style) */}
      <div className="absolute top-10 left-10 z-50 flex flex-col gap-4">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-4 border-gold/20 flex items-center gap-4"
        >
          <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center text-gold">
            <History size={20} />
          </div>
          <div>
            <div className="text-[10px] text-gold tracking-widest uppercase font-sans mb-1">Timeline</div>
            <div className="text-white text-sm font-display">The Continuous Story</div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-4 border-white/5 flex items-center gap-4"
        >
          <div className="text-[10px] text-white/40 tracking-widest uppercase font-sans mr-2">Status</div>
          <div className="flex gap-1">
            {items.map((_, i) => (
              <div 
                key={i}
                className={`w-1 h-6 transition-all duration-500 ${
                  i === currentIndex ? 'bg-gold h-8' : 'bg-white/10'
                }`}
              />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Center Content */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentItem.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="max-w-4xl"
          >
            <div className="flex items-center justify-center gap-3 text-gold mb-6">
              <Sparkles size={16} />
              <span className="text-xs tracking-[0.5em] uppercase font-sans">{currentItem.category_name}</span>
            </div>
            
            <h2 className="text-6xl md:text-8xl font-display text-white mb-8 leading-tight">
              {currentItem.title.split(' ').map((word, i) => (
                <span key={i} className={i % 2 === 1 ? 'text-gold-gradient' : ''}>
                  {word}{' '}
                </span>
              ))}
            </h2>

            <p className="text-white/60 text-lg md:text-xl font-sans max-w-2xl mx-auto leading-relaxed mb-10">
              {currentItem.description}
            </p>

            <div className="flex items-center justify-center gap-6">
              <button 
                onClick={() => setShowDetails(!showDetails)}
                className="btn-gold px-8 py-4 flex items-center gap-3 group"
              >
                <Eye size={18} />
                Explore Narrative
              </button>

              {isManaging && (
                <button 
                  onClick={() => handleDelete(currentItem.id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-red-500/20"
                >
                  <Trash2 size={16} />
                  Remove Frame
                </button>
              )}

              <div className="flex items-center gap-2">
                <button 
                  onClick={handlePrev}
                  className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-white/5 transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  onClick={handleNext}
                  className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-white/5 transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Narrative Drawer */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute top-0 right-0 h-full w-full md:w-[450px] z-[100] bg-black/90 backdrop-blur-2xl border-l border-gold/20 p-12 flex flex-col"
          >
            <button 
              onClick={() => setShowDetails(false)}
              className="absolute top-8 left-8 text-white/40 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            <div className="mt-20 flex-1 overflow-y-auto custom-scrollbar pr-4">
              <div className="flex items-center gap-2 text-gold mb-4">
                <Calendar size={14} />
                <span className="text-[10px] tracking-widest uppercase font-sans">
                  {new Date(currentItem.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
              
              <h3 className="text-4xl font-display text-white mb-8">{currentItem.title}</h3>
              
              <div className="space-y-8">
                <div className="p-6 bg-gold/5 border border-gold/10 rounded-sm italic text-gold/80 font-serif text-lg leading-relaxed">
                  "{currentItem.emotional_hook}"
                </div>

                <div className="prose prose-invert prose-gold">
                  <p className="text-white/60 leading-loose text-lg whitespace-pre-wrap">
                    {currentItem.story || currentItem.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-10 border-t border-white/5">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-white/20 uppercase tracking-widest">Dimension</span>
                    <span className="text-white text-sm font-sans flex items-center gap-2">
                      <Layers size={14} className="text-gold" />
                      {currentItem.category_name}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-white/20 uppercase tracking-widest">Location</span>
                    <span className="text-white text-sm font-sans flex items-center gap-2">
                      <MapPin size={14} className="text-gold" />
                      Dubai Mall, Level 1
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-auto pt-10 border-t border-white/5">
              <button 
                onClick={() => setAutoPlay(!autoPlay)}
                className="flex items-center gap-3 text-white/40 hover:text-gold transition-colors text-xs uppercase tracking-widest font-sans"
              >
                {autoPlay ? <Pause size={14} /> : <Play size={14} />}
                {autoPlay ? 'Pause Narrative' : 'Resume Playback'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-white/5 z-50">
        <motion.div 
          key={currentIndex}
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 8, ease: 'linear' }}
          className="h-full bg-gold shadow-[0_0_10px_rgba(212,175,55,0.5)]"
        />
      </div>
    </section>
  );
}
