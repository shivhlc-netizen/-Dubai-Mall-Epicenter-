'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RefreshCcw, Clock, Zap, CheckCircle2, Calendar, CalendarX2,
  Play, Pause, AlertTriangle, Database, Image, Star, ChevronDown
} from 'lucide-react';
import clsx from 'clsx';

interface SyncData {
  schedule: {
    enabled: number;
    run_hour: number;
    run_minute: number;
    postponed_until: string | null;
    last_run: string | null;
    last_run_status: string | null;
    last_run_tokens: number;
    nextRun: string;
    isDue: boolean;
    isPostponed: boolean;
  };
  estimate: {
    pendingImages: number;
    pendingExperiences: number;
    estimatedTokens: number;
    estimatedCostUSD: string;
  };
}

export default function SyncAdmin() {
  const [data, setData] = useState<SyncData | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [acting, setActing] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'ok' | 'error' } | null>(null);
  const [showTimeEditor, setShowTimeEditor] = useState(false);
  const [runHour, setRunHour] = useState(19);
  const [runMinute, setRunMinute] = useState(0);

  const fetchData = () => {
    setLoading(true);
    fetch('/api/admin/scheduled-sync')
      .then(r => r.json())
      .then(d => {
        setData(d);
        if (d.schedule) {
          setRunHour(d.schedule.run_hour);
          setRunMinute(d.schedule.run_minute);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  async function runSync() {
    if (!confirm(`Run sync now? Estimated ${data?.estimate.estimatedTokens.toLocaleString()} tokens will be used.`)) return;
    setSyncing(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/scheduled-sync', { method: 'POST' });
      const d = await res.json();
      setMessage({ text: d.message || d.error, type: res.ok ? 'ok' : 'error' });
      fetchData();
    } catch {
      setMessage({ text: 'Sync failed.', type: 'error' });
    } finally {
      setSyncing(false);
    }
  }

  async function action(actionName: string) {
    setActing(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/scheduled-sync', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: actionName }),
      });
      const d = await res.json();
      setMessage({ text: d.message || d.error, type: res.ok ? 'ok' : 'error' });
      fetchData();
    } catch {
      setMessage({ text: 'Action failed.', type: 'error' });
    } finally {
      setActing(false);
    }
  }

  async function saveSchedule() {
    setActing(true);
    try {
      const res = await fetch('/api/admin/scheduled-sync', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ run_hour: runHour, run_minute: runMinute }),
      });
      const d = await res.json();
      setMessage({ text: d.ok ? 'Schedule saved.' : (d.error || 'Failed'), type: d.ok ? 'ok' : 'error' });
      setShowTimeEditor(false);
      fetchData();
    } finally {
      setActing(false);
    }
  }

  async function toggleEnabled() {
    if (!data) return;
    setActing(true);
    try {
      await fetch('/api/admin/scheduled-sync', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !data.schedule.enabled }),
      });
      fetchData();
    } finally {
      setActing(false);
    }
  }

  const s = data?.schedule;
  const e = data?.estimate;
  const STATUS_COLOR: Record<string, string> = {
    success: 'text-green-400', error: 'text-red-400', partial: 'text-amber-400'
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="font-display text-4xl text-white mb-2">
            Sync <span className="text-gold-gradient">Scheduler.</span>
          </h1>
          <p className="text-white/30 text-xs font-sans tracking-[0.2em] uppercase">
            Daily backend sync — token-aware, admin-controlled
          </p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-white/40 text-[10px] uppercase tracking-widest hover:text-white hover:border-gold/30 transition-all"
        >
          <RefreshCcw size={12} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Action message */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={clsx(
              'flex items-center gap-3 px-5 py-3 border rounded-sm text-xs font-sans',
              message.type === 'ok'
                ? 'bg-green-500/5 border-green-500/20 text-green-400'
                : 'bg-red-500/5 border-red-500/20 text-red-400'
            )}
          >
            {message.type === 'ok' ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="glass-card h-32 animate-pulse rounded-sm" />)}
        </div>
      ) : !data ? (
        <div className="glass-card p-16 text-center text-red-400/60 text-sm">Failed to load sync data.</div>
      ) : (
        <>
          {/* Due alert */}
          {s?.isDue && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-between px-6 py-5 bg-gold/5 border border-gold/30 rounded-sm"
            >
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-gold animate-pulse" />
                <div>
                  <p className="text-gold text-sm font-sans font-medium">Daily Sync Is Due</p>
                  <p className="text-white/40 text-[10px] font-sans mt-0.5 uppercase tracking-wider">
                    Scheduled for {String(s.run_hour).padStart(2, '0')}:{String(s.run_minute).padStart(2, '0')} — {e?.pendingImages} images pending
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => action('postpone_day')}
                  disabled={acting}
                  className="px-4 py-2 bg-white/5 border border-white/10 text-white/40 text-[10px] uppercase tracking-widest hover:text-white transition-all disabled:opacity-40"
                >
                  +1 Day
                </button>
                <button
                  onClick={() => action('postpone_week')}
                  disabled={acting}
                  className="px-4 py-2 bg-white/5 border border-white/10 text-white/40 text-[10px] uppercase tracking-widest hover:text-white transition-all disabled:opacity-40"
                >
                  +1 Week
                </button>
                <button
                  onClick={runSync}
                  disabled={syncing || acting}
                  className="flex items-center gap-2 px-5 py-2 bg-gold text-black text-[10px] uppercase tracking-widest font-bold hover:bg-gold/80 transition-all disabled:opacity-40"
                >
                  <Play size={11} />
                  {syncing ? 'Running...' : 'Run Now'}
                </button>
              </div>
            </motion.div>
          )}

          {/* Postpone state */}
          {s?.isPostponed && (
            <div className="flex items-center justify-between px-6 py-4 bg-amber-500/5 border border-amber-500/20 rounded-sm">
              <div className="flex items-center gap-3">
                <CalendarX2 size={16} className="text-amber-400" />
                <p className="text-amber-400 text-xs font-sans">
                  Sync postponed until {new Date(s.postponed_until!).toLocaleDateString('en-AE', { weekday: 'long', day: '2-digit', month: 'long' })}
                </p>
              </div>
              <button
                onClick={() => action('approve')}
                disabled={acting}
                className="px-4 py-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] uppercase tracking-widest hover:bg-amber-500/20 transition-all"
              >
                Resume
              </button>
            </div>
          )}

          {/* Status grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Status', value: s?.enabled ? 'Active' : 'Paused', icon: s?.enabled ? CheckCircle2 : Pause, color: s?.enabled ? '#2EC4B6' : '#666' },
              { label: 'Next Run', value: `${String(s?.run_hour).padStart(2, '0')}:${String(s?.run_minute).padStart(2, '0')}`, icon: Clock, color: '#C9A052' },
              { label: 'Pending Images', value: String(e?.pendingImages || 0), icon: Image, color: '#48CAE4' },
              { label: 'Est. Tokens', value: (e?.estimatedTokens || 0).toLocaleString(), icon: Zap, color: '#7B2FBE' },
            ].map((c, i) => (
              <div key={i} className="glass-card p-6 border border-white/5">
                <c.icon size={18} className="mb-4" style={{ color: c.color }} />
                <div className="font-display text-2xl text-white mb-1">{c.value}</div>
                <div className="text-[9px] tracking-widest uppercase text-white/30 font-sans">{c.label}</div>
              </div>
            ))}
          </div>

          {/* Token estimate detail */}
          <div className="glass-card border border-white/5 p-8 space-y-6">
            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
              <Zap size={16} className="text-gold" />
              <h2 className="text-xs font-sans uppercase tracking-[0.3em] text-white/60">Token Estimate — Next Sync</h2>
            </div>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <p className="text-[9px] uppercase tracking-widest text-white/20 font-sans mb-2">Images to Describe</p>
                <p className="font-display text-3xl text-white">{e?.pendingImages || 0}</p>
                <p className="text-[10px] text-white/30 font-sans mt-1">~400 tokens each</p>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-widest text-white/20 font-sans mb-2">Total Est. Tokens</p>
                <p className="font-display text-3xl text-gold">{(e?.estimatedTokens || 0).toLocaleString()}</p>
                <p className="text-[10px] text-white/30 font-sans mt-1">Gemini 1.5 Flash</p>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-widest text-white/20 font-sans mb-2">Estimated Cost</p>
                <p className="font-display text-3xl text-[#2EC4B6]">${e?.estimatedCostUSD || '0.0000'}</p>
                <p className="text-[10px] text-white/30 font-sans mt-1">USD (approximate)</p>
              </div>
            </div>
          </div>

          {/* Last run info */}
          {s?.last_run && (
            <div className="glass-card border border-white/5 p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Database size={16} className="text-white/20" />
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-white/20 font-sans">Last Sync</p>
                  <p className="text-sm text-white/60 font-sans mt-0.5">
                    {new Date(s.last_run).toLocaleString('en-AE')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-[9px] uppercase tracking-widest text-white/20 font-sans">Tokens Used</p>
                  <p className="text-sm font-mono text-white/60 mt-0.5">{(s.last_run_tokens || 0).toLocaleString()}</p>
                </div>
                {s.last_run_status && (
                  <div className={clsx('text-[10px] uppercase tracking-widest font-sans font-bold', STATUS_COLOR[s.last_run_status] || 'text-white/40')}>
                    {s.last_run_status}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Schedule controls */}
          <div className="glass-card border border-white/5 p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <Calendar size={16} className="text-gold" />
                <h2 className="text-xs font-sans uppercase tracking-[0.3em] text-white/60">Schedule Configuration</h2>
              </div>
              <button
                onClick={toggleEnabled}
                disabled={acting}
                className={clsx(
                  'flex items-center gap-2 px-4 py-2 border text-[10px] uppercase tracking-widest transition-all disabled:opacity-40',
                  s?.enabled
                    ? 'border-red-500/20 text-red-400 bg-red-500/5 hover:bg-red-500/10'
                    : 'border-green-500/20 text-green-400 bg-green-500/5 hover:bg-green-500/10'
                )}
              >
                {s?.enabled ? <><Pause size={11} /> Pause Schedule</> : <><Play size={11} /> Enable Schedule</>}
              </button>
            </div>

            <div className="flex items-center gap-6">
              <div>
                <p className="text-[9px] uppercase tracking-widest text-white/20 font-sans mb-2">Current Schedule</p>
                <p className="font-display text-2xl text-white">
                  {String(s?.run_hour).padStart(2, '0')}:{String(s?.run_minute).padStart(2, '0')}
                  <span className="text-[12px] text-white/30 ml-2 font-sans">daily</span>
                </p>
              </div>
              <button
                onClick={() => setShowTimeEditor(!showTimeEditor)}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-white/40 text-[10px] uppercase tracking-widest hover:text-white hover:border-gold/20 transition-all"
              >
                Change Time <ChevronDown size={12} className={clsx('transition-transform', showTimeEditor && 'rotate-180')} />
              </button>
            </div>

            <AnimatePresence>
              {showTimeEditor && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="flex items-end gap-4 overflow-hidden"
                >
                  <div>
                    <label className="text-[9px] uppercase tracking-widest text-white/20 font-sans mb-2 block">Hour (0–23)</label>
                    <input
                      type="number" min={0} max={23} value={runHour}
                      onChange={e => setRunHour(parseInt(e.target.value) || 0)}
                      className="w-24 bg-white/5 border border-white/10 text-white font-mono text-center text-lg px-3 py-2 outline-none focus:border-gold/40 transition-colors"
                    />
                  </div>
                  <div className="font-display text-2xl text-white/20 pb-2">:</div>
                  <div>
                    <label className="text-[9px] uppercase tracking-widest text-white/20 font-sans mb-2 block">Minute (0–59)</label>
                    <input
                      type="number" min={0} max={59} value={runMinute}
                      onChange={e => setRunMinute(parseInt(e.target.value) || 0)}
                      className="w-24 bg-white/5 border border-white/10 text-white font-mono text-center text-lg px-3 py-2 outline-none focus:border-gold/40 transition-colors"
                    />
                  </div>
                  <button
                    onClick={saveSchedule}
                    disabled={acting}
                    className="px-5 py-2 bg-gold text-black text-[10px] uppercase tracking-widest font-bold hover:bg-gold/80 transition-all disabled:opacity-40"
                  >
                    Save
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Manual actions */}
          <div className="glass-card border border-white/5 p-8 space-y-5">
            <h2 className="text-[9px] uppercase tracking-[0.3em] text-white/30 font-sans border-b border-white/5 pb-4">Manual Controls</h2>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={runSync}
                disabled={syncing || acting}
                className="flex items-center gap-2 px-6 py-3 bg-gold/10 border border-gold/30 text-gold text-[10px] uppercase tracking-widest hover:bg-gold hover:text-black transition-all disabled:opacity-40"
              >
                <Play size={12} />
                {syncing ? 'Sync Running...' : 'Run Sync Now'}
              </button>
              <button
                onClick={() => action('postpone_day')}
                disabled={acting}
                className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 text-white/40 text-[10px] uppercase tracking-widest hover:text-white transition-all disabled:opacity-40"
              >
                <CalendarX2 size={12} /> Postpone 1 Day
              </button>
              <button
                onClick={() => action('postpone_week')}
                disabled={acting}
                className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 text-white/40 text-[10px] uppercase tracking-widest hover:text-white transition-all disabled:opacity-40"
              >
                <CalendarX2 size={12} /> Postpone 1 Week
              </button>
              {(s?.isPostponed || !s?.isDue) && (
                <button
                  onClick={() => action('approve')}
                  disabled={acting}
                  className="flex items-center gap-2 px-6 py-3 bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] uppercase tracking-widest hover:bg-green-500/20 transition-all disabled:opacity-40"
                >
                  <CheckCircle2 size={12} /> Approve & Resume
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
