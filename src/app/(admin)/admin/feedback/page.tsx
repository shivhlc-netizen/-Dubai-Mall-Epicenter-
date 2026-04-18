'use client';
import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, CheckCircle2, XCircle, Trash2, RefreshCcw, Clock, User, Link2 } from 'lucide-react';
import clsx from 'clsx';

interface Comment {
  id: number;
  experience_id: number;
  experience_title: string;
  user_name: string;
  comment: string;
  status: 'pending' | 'published' | 'rejected';
  created_at: string;
}

const STATUS_COLORS = {
  pending: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  published: 'text-green-400 bg-green-400/10 border-green-400/20',
  rejected: 'text-red-400 bg-red-400/10 border-red-400/20',
};

export default function FeedbackAdmin() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [counts, setCounts] = useState({ pending: 0, published: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'published' | 'rejected'>('pending');
  const [acting, setActing] = useState<number | null>(null);

  const fetchComments = useCallback(() => {
    setLoading(true);
    fetch(`/api/admin/comments?status=${filter}&limit=100`)
      .then(r => r.json())
      .then(d => {
        setComments(d.comments || []);
        setCounts(d.counts || { pending: 0, published: 0, total: 0 });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [filter]);

  useEffect(() => { fetchComments(); }, [fetchComments]);

  async function moderate(id: number, status: string) {
    setActing(id);
    await fetch(`/api/admin/comments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setActing(null);
    fetchComments();
  }

  async function deleteComment(id: number) {
    if (!confirm('Delete this comment permanently?')) return;
    setActing(id);
    await fetch(`/api/admin/comments/${id}`, { method: 'DELETE' });
    setActing(null);
    fetchComments();
  }

  const FILTERS = [
    { key: 'pending', label: 'Pending', count: counts.pending },
    { key: 'published', label: 'Approved', count: counts.published },
    { key: 'all', label: 'All', count: counts.total },
    { key: 'rejected', label: 'Rejected', count: 0 },
  ] as const;

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="font-display text-4xl text-white mb-2">
            Comment <span className="text-gold-gradient">Moderation.</span>
          </h1>
          <p className="text-white/30 text-xs font-sans tracking-[0.2em] uppercase">
            Review user comments across all experiences
          </p>
        </div>
        <button
          onClick={fetchComments}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-white/40 text-[10px] uppercase tracking-widest hover:text-white hover:border-gold/30 transition-all"
        >
          <RefreshCcw size={12} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Pending alert */}
      {counts.pending > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 px-6 py-4 bg-amber-500/5 border border-amber-500/20 rounded-sm"
        >
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <p className="text-amber-400 text-xs font-sans tracking-widest uppercase">
            {counts.pending} comment{counts.pending !== 1 ? 's' : ''} awaiting moderation
          </p>
        </motion.div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2">
        {FILTERS.map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={clsx(
              'flex items-center gap-2 px-4 py-2 border text-[10px] uppercase tracking-widest font-sans transition-all',
              filter === key
                ? 'border-gold/40 text-gold bg-gold/5'
                : 'border-white/10 text-white/30 hover:text-white hover:border-white/20'
            )}
          >
            {label}
            {count > 0 && (
              <span className={clsx(
                'px-1.5 py-0.5 rounded-full text-[8px] font-bold',
                key === 'pending' ? 'bg-amber-400/20 text-amber-400' : 'bg-white/10 text-white/40'
              )}>
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Comment list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass-card h-24 animate-pulse rounded-sm" />
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <MessageSquare size={32} className="text-white/10 mx-auto mb-4" />
          <p className="text-white/20 text-sm font-sans tracking-widest uppercase">No comments to show</p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {comments.map(c => (
              <motion.div
                key={c.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                className="glass-card border border-white/5 rounded-sm p-5"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-sm font-display text-white/50 flex-shrink-0">
                    {c.user_name.charAt(0).toUpperCase()}
                  </div>

                  {/* Body */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                      <span className={clsx(
                        'text-[9px] uppercase tracking-widest px-2 py-0.5 border rounded-sm font-sans font-bold',
                        STATUS_COLORS[c.status]
                      )}>
                        {c.status}
                      </span>
                      <span className="text-[9px] text-white/20 font-sans">#{c.id}</span>
                    </div>

                    <p className="text-sm text-white/80 font-sans mb-2 leading-relaxed">{c.comment}</p>

                    <div className="flex items-center gap-4 text-[9px] text-white/20 uppercase tracking-wider font-sans flex-wrap">
                      <span className="flex items-center gap-1"><User size={9} /> {c.user_name}</span>
                      <span className="flex items-center gap-1">
                        <Clock size={9} />
                        {new Date(c.created_at).toLocaleString('en-AE')}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Link2 size={9} />
                        <span className="text-gold/40 truncate max-w-[200px]">{c.experience_title}</span>
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {c.status !== 'published' && (
                      <button
                        disabled={acting === c.id}
                        onClick={() => moderate(c.id, 'published')}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 border border-green-500/20 text-green-400 text-[9px] uppercase tracking-widest hover:bg-green-500 hover:text-white transition-all disabled:opacity-40"
                      >
                        <CheckCircle2 size={11} /> Approve
                      </button>
                    )}
                    {c.status !== 'rejected' && (
                      <button
                        disabled={acting === c.id}
                        onClick={() => moderate(c.id, 'rejected')}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 text-[9px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all disabled:opacity-40"
                      >
                        <XCircle size={11} /> Reject
                      </button>
                    )}
                    <button
                      disabled={acting === c.id}
                      onClick={() => deleteComment(c.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-950/30 border border-red-900/20 text-red-500/50 text-[9px] uppercase tracking-widest hover:text-red-400 hover:border-red-500/30 transition-all disabled:opacity-40"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
