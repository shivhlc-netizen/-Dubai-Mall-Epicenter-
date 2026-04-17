'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star, Plus, X, Loader2, Image as ImageIcon,
  Send, Trash2, MessageSquare, Check, ShieldAlert,
  User as UserIcon, Globe, MapPin, Calendar, Heart, Share2, Maximize2,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import Navigation from '@/components/Navigation';

interface Comment {
  id: number;
  user_name: string;
  comment: string;
  created_at: string;
}

interface Experience {
  id: number;
  title: string;
  description: string;
  user_name: string;
  user_id: number | null;
  image_url: string;
  status: 'pending' | 'published' | 'rejected';
  is_featured_on_home: number;
  created_at: string;
  comments: Comment[];
}

export default function ExperiencePage() {
  const { data: session } = useSession();
  const isAdmin = session?.user.role === 'admin' || session?.user.role === 'manager';
  
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({ 
    title: '', 
    description: '', 
    image_url: '', 
    guestName: '' 
  });
  
  // Comment State
  const [activeCommentBox, setActiveCommentBox] = useState<number | null>(null);
  const [newComment, setNewComment] = useState('');
  const [commenting, setCommenting] = useState(false);

  // Lightbox for experience images
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const fetchExperiences = async () => {
    try {
      const res = await fetch('/api/experiences');
      const data = await res.json();
      setExperiences(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setExperiences([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperiences();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Permanently remove this memory?')) return;
    try {
      const res = await fetch(`/api/experiences/${id}`, { method: 'DELETE' });
      if (res.ok) fetchExperiences();
    } catch (e) { console.error(e); }
  };

  const handleModerate = async (id: number, status: 'published' | 'rejected') => {
    try {
      const res = await fetch(`/api/experiences/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) fetchExperiences();
    } catch (e) { console.error(e); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/experiences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || 'Success');
        setShowModal(false);
        setFormData({ title: '', description: '', image_url: '', guestName: '' });
        fetchExperiences();
      }
    } catch (e) { console.error(e); } finally { setSubmitting(false); }
  };

  const handlePostComment = async (experienceId: number) => {
    if (!newComment.trim()) return;
    setCommenting(true);
    try {
      const res = await fetch(`/api/experiences/${experienceId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment: newComment, guestName: session ? undefined : 'Guest' }),
      });
      if (res.ok) {
        setNewComment('');
        setActiveCommentBox(null);
        fetchExperiences();
      }
    } catch (e) { console.error(e); } finally { setCommenting(false); }
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white selection:bg-gold selection:text-black">
      <Navigation active="experience" onNavigate={() => {}} onModuleOpen={() => {}} />

      <div className="pt-32 pb-20 px-6 lg:px-10 max-w-[1400px] mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 gap-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl"
          >
            <div className="flex items-center gap-2 text-gold mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
              <span className="text-[10px] tracking-[0.5em] uppercase font-sans font-bold">The Epicenter Scrapbook</span>
            </div>
            <h1 className="font-display text-6xl md:text-8xl leading-none mb-6 italic">
              7★ <span className="text-gold-gradient non-italic">Memories.</span>
            </h1>
            <p className="text-white/40 text-lg md:text-xl font-sans leading-relaxed">
              A collective narrative of the world&apos;s most extraordinary destination. Share your moments, protect your legacy.
            </p>
          </motion.div>

          <div className="flex flex-col gap-4">
            <button 
              onClick={() => setShowModal(true)}
              className="btn-gold px-10 py-5 flex items-center gap-3 group relative overflow-hidden shadow-2xl shadow-gold/10"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              <Plus size={20} className="relative z-10 group-hover:rotate-180 transition-transform duration-500" />
              <span className="relative z-10 font-bold uppercase tracking-widest text-xs">Add Your Chapter</span>
            </button>
            {!session && (
              <p className="text-[9px] text-white/20 uppercase tracking-widest text-center">Guest contributions allowed</p>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <div className="w-16 h-px bg-gold/20 relative overflow-hidden">
               <motion.div 
                 animate={{ x: ['-100%', '100%'] }} 
                 transition={{ repeat: Infinity, duration: 1.5 }} 
                 className="absolute inset-0 bg-gold"
               />
            </div>
            <span className="text-[9px] tracking-[0.4em] uppercase text-gold/40">Opening Scrapbook...</span>
          </div>
        ) : (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
            {experiences.map((exp, i) => (
              <motion.div
                key={exp.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`break-inside-avoid glass-card flex flex-col rounded-none overflow-hidden group border-white/5 relative ${
                  exp.status === 'pending' ? 'ring-1 ring-amber-500/30' : ''
                }`}
              >
                {/* Moderation Badge */}
                {isAdmin && exp.status === 'pending' && (
                  <div className="absolute top-4 left-4 z-20 bg-amber-500 text-black text-[9px] font-bold px-2 py-1 uppercase tracking-tighter rounded-full flex items-center gap-1">
                    <ShieldAlert size={10} /> Pending Moderation
                  </div>
                )}

                {exp.image_url && (
                  <div className="relative overflow-hidden cursor-zoom-in" onClick={() => setLightboxUrl(exp.image_url)}>
                    <img
                      src={exp.image_url}
                      alt={exp.title}
                      className="w-full h-auto object-cover group-hover:scale-[1.03] transition-transform duration-1000 grayscale-[20%] group-hover:grayscale-0"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-80" />
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-7 h-7 bg-black/60 border border-white/20 flex items-center justify-center">
                        <Maximize2 size={12} className="text-white/70" />
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="p-8 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center text-gold text-xs font-display">
                        {exp.user_name?.[0] || 'G'}
                      </div>
                      <div>
                        <div className="text-white text-sm font-sans font-medium">{exp.user_name}</div>
                        <div className="text-gold/40 text-[9px] uppercase tracking-widest">
                          {exp.user_id ? 'Verified Resident' : 'Guest Contributor'}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {isAdmin && (
                        <>
                          {exp.status === 'pending' && (
                            <button 
                              onClick={() => handleModerate(exp.id, 'published')}
                              className="w-8 h-8 rounded-full bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white transition-all flex items-center justify-center"
                              title="Approve"
                            >
                              <Check size={14} />
                            </button>
                          )}
                          <button 
                            onClick={() => handleDelete(exp.id)}
                            className="w-8 h-8 rounded-full bg-red-500/10 text-red-500/60 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <h3 className="font-display text-2xl mb-4 text-white group-hover:text-gold transition-colors italic">
                    &ldquo;{exp.title}&rdquo;
                  </h3>
                  <p className="text-white/40 text-sm leading-relaxed mb-8 font-sans whitespace-pre-wrap">
                    {exp.description}
                  </p>
                  
                  {/* Comments Section */}
                  <div className="space-y-4 mb-8 pt-6 border-t border-white/5">
                    {exp.comments.map(c => (
                      <div key={c.id} className="text-xs">
                        <span className="text-gold/60 font-bold mr-2 uppercase tracking-tighter text-[10px]">{c.user_name}:</span>
                        <span className="text-white/30 font-sans italic">&ldquo;{c.comment}&rdquo;</span>
                      </div>
                    ))}
                    
                    {activeCommentBox === exp.id ? (
                      <div className="flex flex-col gap-2 pt-2">
                        <textarea 
                          value={newComment}
                          onChange={e => setNewComment(e.target.value)}
                          placeholder="Add to the narrative..."
                          className="w-full bg-white/5 border border-gold/20 p-3 text-xs text-white focus:outline-none focus:border-gold/50 font-sans italic resize-none"
                          rows={2}
                        />
                        <div className="flex justify-end gap-2">
                          <button onClick={() => setActiveCommentBox(null)} className="text-[9px] uppercase text-white/20">Cancel</button>
                          <button 
                            onClick={() => handlePostComment(exp.id)}
                            disabled={commenting || !newComment.trim()}
                            className="text-[9px] uppercase text-gold font-bold flex items-center gap-1 disabled:opacity-30"
                          >
                            {commenting ? <Loader2 size={10} className="animate-spin"/> : <Send size={10}/>}
                            Post Comment
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setActiveCommentBox(exp.id)}
                        className="flex items-center gap-2 text-white/20 hover:text-gold transition-colors text-[10px] uppercase tracking-widest font-bold"
                      >
                        <MessageSquare size={12} /> Add to this story
                      </button>
                    )}
                  </div>

                  <div className="mt-auto flex justify-between items-center pt-4 text-[9px] tracking-[0.2em] uppercase text-white/10 font-sans font-bold">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1"><Calendar size={10} /> {new Date(exp.created_at).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1"><Globe size={10} /> Dubai Mall</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Share Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-[#050505]/95 backdrop-blur-2xl"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="relative z-10 w-full max-w-2xl bg-[#0a0a0a] border border-gold/20 p-10 md:p-16 rounded-none shadow-2xl"
            >
              <button 
                onClick={() => setShowModal(false)}
                className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>

              <div className="text-center mb-12">
                <div className="text-gold text-[10px] tracking-[0.6em] uppercase font-sans mb-4">Add a Chapter</div>
                <h2 className="font-display text-4xl italic">Protect the <span className="text-gold-gradient non-italic">Memory.</span></h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    {!session && (
                      <div>
                        <label className="block text-[10px] tracking-widest uppercase text-white/30 font-sans mb-2">Your Name</label>
                        <div className="relative">
                          <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={14} />
                          <input
                            required
                            value={formData.guestName}
                            onChange={e => setFormData({ ...formData, guestName: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 text-white text-sm pl-10 pr-4 py-3 focus:outline-none focus:border-gold/40 transition-colors"
                            placeholder="How should we address you?"
                          />
                        </div>
                      </div>
                    )}
                    <div>
                      <label className="block text-[10px] tracking-widest uppercase text-white/30 font-sans mb-2">Headline</label>
                      <input
                        required
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 text-white text-sm px-4 py-3 focus:outline-none focus:border-gold/40 transition-colors"
                        placeholder="Title of your experience"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] tracking-widest uppercase text-white/30 font-sans mb-2">Image URL</label>
                      <div className="relative">
                        <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={14} />
                        <input
                          value={formData.image_url}
                          onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 text-white text-sm pl-10 pr-4 py-3 focus:outline-none focus:border-gold/40 transition-colors"
                          placeholder="Link to your visual memory"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] tracking-widest uppercase text-white/30 font-sans mb-2">The Story</label>
                      <textarea
                        required
                        rows={8}
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 text-white text-sm px-4 py-3 focus:outline-none focus:border-gold/40 resize-none h-full transition-colors"
                        placeholder="Detail your 7-star narrative here..."
                      />
                    </div>
                  </div>
                </div>

                <button 
                  disabled={submitting}
                  className="w-full btn-gold py-5 flex items-center justify-center gap-3 disabled:opacity-50 text-xs font-bold tracking-[0.3em] uppercase group"
                >
                  {submitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                  Inject Into Scrapbook
                </button>
                <p className="text-center text-[9px] text-white/20 uppercase tracking-widest">
                  Contributions are subject to moderation by The Epicenter Council.
                </p>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Image Lightbox */}
      <AnimatePresence>
        {lightboxUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-xl flex items-center justify-center"
            onClick={() => setLightboxUrl(null)}
          >
            <motion.img
              key={lightboxUrl}
              src={lightboxUrl}
              alt=""
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="max-h-[90vh] max-w-[90vw] object-contain"
              onClick={e => e.stopPropagation()}
            />
            <button
              onClick={() => setLightboxUrl(null)}
              className="absolute top-5 right-5 w-9 h-9 border border-white/10 hover:border-red-500/40 flex items-center justify-center text-white/30 hover:text-red-400 transition-all"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
