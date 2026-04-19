'use client';
import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star, CheckCircle2, XCircle, Trash2, Eye, EyeOff,
  Clock, User, Image, MessageSquare, RefreshCcw, Filter
} from 'lucide-react';
import clsx from 'clsx';

interface Experience {
  id: number;
  user_name: string;
  title: string;
  description: string;
  image_url: string | null;
  status: 'pending' | 'published' | 'rejected';
  is_featured_on_home: number;
  is_public: number;
  created_at: string;
  comments?: { id: number; user_name: string; comment: string; created_at: string }[];
}

const STATUS_COLORS = {
  pending: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  published: 'text-green-400 bg-green-400/10 border-green-400/20',
  rejected: 'text-red-400 bg-red-400/10 border-red-400/20',
};

export default function ExperiencesAdmin() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'published' | 'rejected'>('all');
  const [expanded, setExpanded] = useState<number | null>(null);
  const [acting, setActing] = useState<number | null>(null);

  const fetchExperiences = useCallback(() => {
    setLoading(true);
    fetch('/api/experiences')
      .then(r => r.json())
      .then(d => { setExperiences(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => { fetchExperiences(); }, [fetchExperiences]);

  const filtered = filter === 'all' ? experiences : experiences.filter(e => e.status === filter);

  const counts = {
    all: experiences.length,
    pending: experiences.filter(e => e.status === 'pending').length,
    published: experiences.filter(e => e.status === 'published').length,
    rejected: experiences.filter(e => e.status === 'rejected').length,
  };

  async function moderate(id: number, status: string) {
    setActing(id);
    await fetch(`/api/experiences/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setActing(null);
    fetchExperiences();
  }

  async function toggleFeature(exp: Experience) {
    setActing(exp.id);
    await fetch(`/api/experiences/${exp.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_featured_on_home: !exp.is_featured_on_home }),
    });
    setActing(null);
    fetchExperiences();
  }

  async function deleteExp(id: number) {
    if (!confirm('Permanently delete this experience?')) return;
    setActing(id);
    await fetch(`/api/experiences/${id}`, { method: 'DELETE' });
    setActing(null);
    fetchExperiences();
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="font-display text-4xl text-white mb-2">
            Experience <span className="text-gold-gradient">Moderation.</span>
          </h1>
          <p className="text-white/30 text-xs font-sans tracking-[0.2em] uppercase">
            Review & curate user-submitted stories
          </p>
        </div>
        <button
          onClick={fetchExperiences}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-white/40 text-[10px] uppercase tracking-widest hover:text-white hover:border-gold/30 transition-all"
        >
          <RefreshCcw size={12} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-4">
        {(['all', 'pending', 'published', 'rejected'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={clsx(
              'glass-card p-5 text-left border transition-all',
              filter === s ? 'border-gold/40 bg-gold/5' : 'border-white/5 hover:border-white/20'
            )}
          >
            <div className={clsx('text-3xl font-display mb-1', filter === s ? 'text-gold' : 'text-white')}>
              {counts[s]}
            </div>
            <div className="text-[9px] uppercase tracking-widest text-white/30 font-sans capitalize">{s}</div>
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="glass-card h-20 animate-pulse rounded-sm" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-16 text-center text-white/20 text-sm font-sans tracking-widest uppercase">
          No experiences found
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {filtered.map((exp) => (
              <motion.div
                key={exp.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="glass-card border border-white/5 rounded-sm overflow-hidden"
              >
                {/* Row */}
                <div className="flex items-start gap-4 p-5">
                  {/* Image thumb */}
                  <div className="w-16 h-16 rounded-sm overflow-hidden bg-white/5 flex-shrink-0">
                    {exp.image_url ? (
                      <img src={exp.image_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Image size={20} className="text-white/20" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                      <span className={clsx(
                        'text-[9px] uppercase tracking-widest px-2 py-0.5 border rounded-sm font-sans font-bold',
                        STATUS_COLORS[exp.status]
                      )}>
                        {exp.status}
                      </span>
                      {exp.is_featured_on_home ? (
                        <span className="text-[9px] uppercase tracking-widest px-2 py-0.5 bg-gold/10 border border-gold/20 text-gold rounded-sm font-sans">
                          Featured
                        </span>
                      ) : null}
                      <span className="text-[9px] text-white/20 font-sans">
                        #{exp.id}
                      </span>
                    </div>
                    <div className="text-sm text-white font-sans font-medium truncate mb-1">{exp.title}</div>
                    <div className="text-[11px] text-white/40 font-sans line-clamp-2 mb-2">{exp.description}</div>
                    <div className="flex items-center gap-4 text-[9px] text-white/20 uppercase tracking-wider font-sans">
                      <span className="flex items-center gap-1"><User size={9} /> {exp.user_name}</span>
                      <span className="flex items-center gap-1">
                        <Clock size={9} />
                        {new Date(exp.created_at).toLocaleDateString('en-AE', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare size={9} />
                        {exp.comments?.length || 0} comments
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {exp.status === 'pending' && (
                      <>
                        <button
                          disabled={acting === exp.id}
                          onClick={() => moderate(exp.id, 'published')}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 border border-green-500/20 text-green-400 text-[9px] uppercase tracking-widest hover:bg-green-500 hover:text-white transition-all disabled:opacity-40"
                        >
                          <CheckCircle2 size={11} /> Approve
                        </button>
                        <button
                          disabled={acting === exp.id}
                          onClick={() => moderate(exp.id, 'rejected')}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 text-[9px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all disabled:opacity-40"
                        >
                          <XCircle size={11} /> Reject
                        </button>
                      </>
                    )}
                    {exp.status === 'published' && (
                      <button
                        disabled={acting === exp.id}
                        onClick={() => moderate(exp.id, 'rejected')}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 text-[9px] uppercase tracking-widest hover:bg-red-500/20 transition-all disabled:opacity-40"
                      >
                        <EyeOff size={11} /> Unpublish
                      </button>
                    )}
                    {exp.status === 'rejected' && (
                      <button
                        disabled={acting === exp.id}
                        onClick={() => moderate(exp.id, 'published')}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 border border-green-500/20 text-green-400 text-[9px] uppercase tracking-widest hover:bg-green-500/20 transition-all disabled:opacity-40"
                      >
                        <Eye size={11} /> Re-publish
                      </button>
                    )}
                    <button
                      disabled={acting === exp.id}
                      onClick={() => toggleFeature(exp)}
                      className={clsx(
                        'flex items-center gap-1.5 px-3 py-1.5 border text-[9px] uppercase tracking-widest transition-all disabled:opacity-40',
                        exp.is_featured_on_home
                          ? 'bg-gold/10 border-gold/30 text-gold hover:bg-gold/20'
                          : 'bg-white/5 border-white/10 text-white/30 hover:text-gold hover:border-gold/20'
                      )}
                    >
                      <Star size={11} />
                    </button>
                    <button
                      disabled={acting === exp.id}
                      onClick={() => setExpanded(expanded === exp.id ? null : exp.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 text-white/30 text-[9px] uppercase tracking-widest hover:text-white transition-all disabled:opacity-40"
                    >
                      <MessageSquare size={11} />
                    </button>
                    <button
                      disabled={acting === exp.id}
                      onClick={() => deleteExp(exp.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-950/30 border border-red-900/20 text-red-500/50 text-[9px] uppercase tracking-widest hover:text-red-400 hover:border-red-500/30 transition-all disabled:opacity-40"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>

                {/* Expanded comments */}
                <AnimatePresence>
                  {expanded === exp.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-white/5 bg-white/2 px-5 py-4"
                    >
                      <p className="text-[9px] uppercase tracking-widest text-white/30 font-sans mb-3">
                        Comments ({exp.comments?.length || 0})
                      </p>
                      {!exp.comments?.length ? (
                        <p className="text-white/20 text-xs font-sans">No comments yet.</p>
                      ) : (
                        <div className="space-y-3">
                          {exp.comments.map(c => (
                            <div key={c.id} className="flex gap-3 items-start">
                              <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[9px] text-white/40 font-sans flex-shrink-0">
                                {c.user_name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="text-[10px] text-white/60 font-sans font-medium">{c.user_name}</div>
                                <div className="text-xs text-white/40 font-sans mt-0.5">{c.comment}</div>
                                <div className="text-[8px] text-white/20 font-sans mt-1 uppercase tracking-wider">
                                  {new Date(c.created_at).toLocaleString('en-AE')}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
