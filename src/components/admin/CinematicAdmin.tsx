'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Upload, Image as ImageIcon, Database, Loader2, CheckCircle2, Settings, Shield, Sparkles } from 'lucide-react';

interface Props {
  isManaging: boolean;
  onToggleManage: () => void;
}

export default function CinematicAdmin({ isManaging, onToggleManage }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pulsing, setPulsing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '1',
    featured: false,
    emotional_hook: '',
    story: '',
  });
  const [file, setFile] = useState<File | null>(null);

  const handleTriggerPulse = async () => {
    setPulsing(true);
    try {
      const res = await fetch('/api/admin/scheduled-sync', { method: 'POST' });
      if (res.ok) alert('Gemini Pulse Triggered Successfully!');
    } catch (err) {
      console.error(err);
    } finally {
      setPulsing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setSubmitting(true);
    try {
      const data = new FormData();
      data.append('file', file);
      data.append('categoryId', formData.category_id);
      
      const uploadRes = await fetch('/api/gallery/upload', {
        method: 'POST',
        body: data,
      });
      
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error);

      // Update the metadata
      await fetch(`/api/gallery/${uploadData.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          emotional_hook: formData.emotional_hook,
          story: formData.story,
          featured: formData.featured,
        }),
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setIsOpen(false);
        setFormData({ title: '', description: '', category_id: '1', featured: false, emotional_hook: '', story: '' });
        setFile(null);
      }, 2000);
    } catch (err) {
      console.error(err);
      alert('Failed to add data');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-10 right-10 z-[100] flex flex-col items-end gap-4">
        {/* Toggle Management Mode */}
        <AnimatePresence>
          {isManaging && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-red-500 text-white text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg mb-2"
            >
              Management Mode Active
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggleManage}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-xl ${
              isManaging ? 'bg-red-500 text-white shadow-red-500/20' : 'bg-white/10 backdrop-blur-md text-white/40 border border-white/10'
            }`}
            title={isManaging ? 'Exit Management Mode' : 'Enter Management Mode'}
          >
            {isManaging ? <Shield size={20} /> : <Settings size={20} />}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="w-16 h-16 rounded-full bg-gold shadow-[0_0_30px_rgba(201,160,82,0.4)] flex items-center justify-center text-black group relative"
          >
            <Database size={24} className="group-hover:rotate-12 transition-transform" />
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center border-2 border-gold">
              <Plus size={12} strokeWidth={3} />
            </div>
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/95 backdrop-blur-2xl"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="relative z-10 w-full max-w-4xl bg-[#0a0a0a] border border-gold/20 rounded-sm overflow-hidden flex flex-col md:flex-row shadow-2xl"
            >
              {/* Left Side: Visual Preview / Branding */}
              <div className="w-full md:w-1/3 bg-gold/5 border-r border-gold/10 p-10 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute inset-0 grid-overlay opacity-10" />
                <div className="relative z-10">
                  <div className="text-gold mb-6"><Database size={40} /></div>
                  <h2 className="font-display text-4xl text-white mb-4">Cinematic <span className="text-gold-gradient">Entry.</span></h2>
                  <p className="text-white/30 text-xs font-sans tracking-widest uppercase leading-loose">
                    Injecting new narratives into the Dubai Mall Epicenter database.
                  </p>
                </div>
                
                <div className="relative z-10 mt-10">
                   <div className="text-[10px] text-white/20 uppercase tracking-[0.4em] font-sans mb-2">Epicenter Status</div>
                   <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                     <span className="text-[10px] text-green-500/80 font-mono tracking-widest">ENCRYPTED_LINK_ACTIVE</span>
                   </div>
                </div>
              </div>

              {/* Right Side: Form */}
              <div className="flex-1 p-8 md:p-12 max-h-[90vh] overflow-y-auto custom-scrollbar">
                <button 
                  onClick={() => setIsOpen(false)}
                  className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>

                {success ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-20">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-gold"
                    >
                      <CheckCircle2 size={80} />
                    </motion.div>
                    <h3 className="font-display text-3xl text-white">Entry Synchronized</h3>
                    <p className="text-white/40 text-sm">The timeline has been updated with your new narrative.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div>
                          <label className="block text-[10px] tracking-widest uppercase text-white/40 font-sans mb-2">Primary Asset</label>
                          <div className="relative group">
                            <input
                              type="file"
                              accept="image/*,video/*"
                              onChange={(e) => setFile(e.target.files?.[0] || null)}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div className="w-full aspect-video bg-white/5 border border-dashed border-white/10 group-hover:border-gold/40 transition-all flex flex-col items-center justify-center gap-3 overflow-hidden">
                              {file ? (
                                <>
                                  {file.type.startsWith('video/') ? (
                                     <video src={URL.createObjectURL(file)} className="w-full h-full object-cover opacity-50" />
                                  ) : (
                                     <div className="text-gold"><ImageIcon size={32} /></div>
                                  )}
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                    <span className="text-[10px] text-white font-bold truncate px-4 bg-black/60 py-1">{file.name}</span>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="text-white/20 group-hover:text-gold transition-colors"><Upload size={32} /></div>
                                  <span className="text-[10px] text-white/20 uppercase tracking-widest">Upload Frame / Video</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] tracking-widest uppercase text-white/40 font-sans mb-2">Headline</label>
                          <input
                            required
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 text-white text-sm px-4 py-3 focus:outline-none focus:border-gold/40 rounded-none transition-colors"
                            placeholder="e.g. The Crystal Plaza Revelation"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] tracking-widest uppercase text-white/40 font-sans mb-2">Emotional Hook</label>
                          <input
                            value={formData.emotional_hook}
                            onChange={e => setFormData({ ...formData, emotional_hook: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 text-white text-sm px-4 py-3 focus:outline-none focus:border-gold/40 rounded-none transition-colors"
                            placeholder="e.g. A moment of pure crystalline silence."
                          />
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <label className="block text-[10px] tracking-widest uppercase text-white/40 font-sans mb-2">The Extended Story</label>
                          <textarea
                            rows={8}
                            value={formData.story}
                            onChange={e => setFormData({ ...formData, story: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 text-white text-sm px-4 py-3 focus:outline-none focus:border-gold/40 rounded-none transition-colors resize-none"
                            placeholder="Detail the narrative arc here..."
                          />
                        </div>

                        <div className="flex items-center gap-6">
                          <label className="flex items-center gap-3 cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={formData.featured}
                              onChange={e => setFormData({ ...formData, featured: e.target.checked })}
                              className="hidden"
                            />
                            <div className={`w-5 h-5 border transition-all flex items-center justify-center ${formData.featured ? 'bg-gold border-gold' : 'border-white/20'}`}>
                              {formData.featured && <div className="w-2 h-2 bg-black rounded-full" />}
                            </div>
                            <span className="text-[10px] uppercase tracking-widest text-white/40 group-hover:text-white transition-colors">Promote to History</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="pt-8 border-t border-white/5 flex justify-between items-center">
                      <button
                        type="button"
                        onClick={handleTriggerPulse}
                        disabled={pulsing}
                        className="flex items-center gap-2 text-[10px] tracking-widest uppercase text-gold/60 hover:text-gold transition-colors disabled:opacity-30"
                      >
                        {pulsing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                        Trigger Gemini Pulse
                      </button>

                      <button 
                        disabled={submitting || !file}
                        className="btn-gold px-12 py-4 flex items-center gap-3 disabled:opacity-30 disabled:cursor-not-allowed group"
                      >
                        {submitting ? <Loader2 className="animate-spin" size={18} /> : <Database size={18} className="group-hover:scale-110 transition-transform" />}
                        Inject Into Epicenter
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
