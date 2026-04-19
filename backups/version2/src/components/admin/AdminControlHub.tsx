'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, RefreshCcw, Waves, Image as ImageIcon, X, Loader2, CheckCircle } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface Props {
  showFountains: boolean;
  onToggleFountains: (val: boolean) => void;
}

export default function AdminControlHub({ showFountains, onToggleFountains }: Props) {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!session || !['admin', 'manager', 'user'].includes((session.user as any).role)) return null;

  const roleLabel = (session.user as any).role === 'admin' ? 'Admin Mode' : 
                    (session.user as any).role === 'manager' ? 'HLC Mode' : 'Premium Mode';

  const resetCounter = async () => {
    setLoading('reset');
    try {
      const res = await fetch('/api/stats/visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset' })
      });
      if (res.ok) setSuccess('Counter reset successfully');
    } catch (e) { console.error(e); }
    finally { setLoading(null); setTimeout(() => setSuccess(null), 3000); }
  };

  const addImagesBatch = async () => {
    setLoading('images');
    // Simulate adding 50 images
    const dummyImages = Array.from({ length: 50 }).map((_, i) => ({
      url: `https://images.unsplash.com/photo-${i}`,
      title: `Batch Image ${i}`
    }));

    try {
      const res = await fetch('/api/gallery/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: dummyImages })
      });
      if (res.ok) setSuccess('50 Images added successfully');
    } catch (e) { console.error(e); }
    finally { setLoading(null); setTimeout(() => setSuccess(null), 3000); }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-[100] p-4 bg-gold/10 backdrop-blur-xl border border-gold/30 text-gold rounded-full shadow-[0_0_20px_rgba(201,160,82,0.2)] hover:bg-gold hover:text-black transition-all"
      >
        <Settings size={20} className={isOpen ? 'rotate-90' : ''} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-[#0A0A0A] border border-gold/20 rounded-sm overflow-hidden"
            >
              <div className="p-6 border-b border-white/5 flex justify-between items-center">
                <div>
                  <h2 className="font-display text-xl text-white uppercase tracking-widest">Management Hub</h2>
                  <p className="text-[10px] text-gold/60 font-sans tracking-[0.3em] uppercase mt-1">{roleLabel} — Authorized</p>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 space-y-6">
                {/* Reset Counter */}
                <div className="flex items-center justify-between group">
                  <div>
                    <h3 className="text-sm text-white font-sans font-medium">Visitor Statistics</h3>
                    <p className="text-[10px] text-white/30 font-sans mt-1">Reset the real-time visit counter to zero.</p>
                  </div>
                  <button 
                    onClick={resetCounter}
                    disabled={!!loading}
                    className="p-3 bg-white/5 border border-white/10 rounded-sm hover:border-gold/40 hover:text-gold transition-all"
                  >
                    {loading === 'reset' ? <Loader2 size={16} className="animate-spin" /> : <RefreshCcw size={16} />}
                  </button>
                </div>

                {/* Toggle Fountains */}
                <div className="flex items-center justify-between group">
                  <div>
                    <h3 className="text-sm text-white font-sans font-medium">Static Fountains</h3>
                    <p className="text-[10px] text-white/30 font-sans mt-1">Enable or disable section dividers (Fountain Waves).</p>
                  </div>
                  <button 
                    onClick={() => onToggleFountains(!showFountains)}
                    className={`p-3 rounded-sm border transition-all ${showFountains ? 'bg-gold/10 border-gold/40 text-gold' : 'bg-white/5 border-white/10 text-white/40'}`}
                  >
                    <Waves size={16} />
                  </button>
                </div>

                {/* Batch Add Images */}
                <div className="flex items-center justify-between group">
                  <div>
                    <h3 className="text-sm text-white font-sans font-medium">Gallery Expansion</h3>
                    <p className="text-[10px] text-white/30 font-sans mt-1">Batch-add up to 50 cinematic image assets.</p>
                  </div>
                  <button 
                    onClick={addImagesBatch}
                    disabled={!!loading}
                    className="p-3 bg-white/5 border border-white/10 rounded-sm hover:border-gold/40 hover:text-gold transition-all"
                  >
                    {loading === 'images' ? <Loader2 size={16} className="animate-spin" /> : <ImageIcon size={16} />}
                  </button>
                </div>
              </div>

              {/* Success Notification */}
              <AnimatePresence>
                {success && (
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 20, opacity: 0 }}
                    className="absolute bottom-6 left-6 right-6 bg-green-500/10 border border-green-500/20 p-4 flex items-center gap-3 rounded-sm"
                  >
                    <CheckCircle size={16} className="text-green-500" />
                    <span className="text-[10px] text-green-500 font-sans uppercase tracking-widest font-bold">{success}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="p-6 bg-white/[0.02] text-center border-t border-white/5">
                <p className="text-[9px] text-white/10 uppercase tracking-[0.4em] font-sans">
                  The Epicenter Security Protocol · v1.0.4
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
