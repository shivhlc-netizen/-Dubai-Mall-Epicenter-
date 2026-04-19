'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, Calendar, Plus, Play, Shield, AlertTriangle,
  TrendingDown, Ban, RefreshCcw, ChevronDown, ChevronUp,
  Star, Users, X, Check, ToggleLeft, ToggleRight
} from 'lucide-react';
import clsx from 'clsx';

interface ApiEvent {
  id: number;
  name: string;
  description: string;
  event_type: string;
  budget_multiplier: number;
  extra_tokens: number;
  start_date: string;
  end_date: string;
  active: number;
  applies_to: string;
  selected_users: number;
  isLive: boolean;
}

interface AbuseRule {
  id: number;
  rule_name: string;
  threshold_tokens: number;
  window_hours: number;
  action: string;
  active: number;
}

interface UserRow {
  id: number;
  name: string;
  email: string;
  api_budget: number;
  api_used: number;
  usage_pct: number;
  role: string;
  active: number;
}

const EVENT_TYPE_COLORS: Record<string, string> = {
  festival: 'text-amber-400 border-amber-400/20 bg-amber-400/10',
  concert: 'text-purple-400 border-purple-400/20 bg-purple-400/10',
  sale: 'text-green-400 border-green-400/20 bg-green-400/10',
  vip: 'text-gold border-gold/20 bg-gold/10',
  premium: 'text-[#48CAE4] border-[#48CAE4]/20 bg-[#48CAE4]/10',
  custom: 'text-white/50 border-white/10 bg-white/5',
};

const ABUSE_ACTION_LABELS: Record<string, { label: string; color: string }> = {
  warn: { label: 'Warn', color: 'text-amber-400' },
  reduce_50: { label: 'Halve Budget', color: 'text-orange-400' },
  block: { label: 'Block', color: 'text-red-400' },
  notify: { label: 'Notify Admin', color: 'text-[#48CAE4]' },
};

export default function ApiManagerAdmin() {
  const [data, setData] = useState<{ events: ApiEvent[]; abuseRules: AbuseRule[]; abusers: UserRow[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'events' | 'abuse' | 'usage'>('events');
  const [showNewEvent, setShowNewEvent] = useState(false);
  const [showNewRule, setShowNewRule] = useState(false);
  const [acting, setActing] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const [eventForm, setEventForm] = useState({
    name: '', description: '', event_type: 'festival',
    budget_multiplier: 2, extra_tokens: 5000,
    start_date: '', end_date: '', applies_to: 'premium'
  });

  const [ruleForm, setRuleForm] = useState({
    rule_name: '', threshold_tokens: 5000, window_hours: 24, action: 'reduce_50'
  });

  const fetchData = () => {
    setLoading(true);
    fetch('/api/admin/api-events')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  async function createEvent() {
    setActing('create_event');
    const res = await fetch('/api/admin/api-events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'event', ...eventForm }),
    });
    const d = await res.json();
    setMsg({ text: d.message || d.error, ok: res.ok });
    setActing(null);
    if (res.ok) { setShowNewEvent(false); fetchData(); }
  }

  async function createRule() {
    setActing('create_rule');
    const res = await fetch('/api/admin/api-events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'abuse_rule', ...ruleForm }),
    });
    const d = await res.json();
    setMsg({ text: d.message || d.error, ok: res.ok });
    setActing(null);
    if (res.ok) { setShowNewRule(false); fetchData(); }
  }

  async function applyEvent(event_id: number) {
    if (!confirm('Apply this event budget boost to enrolled users now?')) return;
    setActing('apply_' + event_id);
    const res = await fetch('/api/admin/api-events', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'apply_event', event_id }),
    });
    const d = await res.json();
    setMsg({ text: d.message || d.error, ok: res.ok });
    setActing(null);
    fetchData();
  }

  async function abuseAction(target_user_id: number, abuse_action: string) {
    const labels: Record<string, string> = {
      block: 'BLOCK this user\'s API?', reduce_50: 'Halve this user\'s API budget?', reset: 'Reset this user\'s API budget?'
    };
    if (!confirm(labels[abuse_action] || 'Proceed?')) return;
    setActing('abuse_' + target_user_id);
    const res = await fetch('/api/admin/api-events', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'abuse_user', target_user_id, abuse_action }),
    });
    const d = await res.json();
    setMsg({ text: d.message || d.error, ok: res.ok });
    setActing(null);
    fetchData();
  }

  async function toggleEvent(event_id: number) {
    setActing('toggle_' + event_id);
    await fetch('/api/admin/api-events', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'toggle_event', event_id }),
    });
    setActing(null);
    fetchData();
  }

  async function toggleRule(rule_id: number) {
    setActing('toggle_rule_' + rule_id);
    await fetch('/api/admin/api-events', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'toggle_rule', rule_id }),
    });
    setActing(null);
    fetchData();
  }

  async function deleteEvent(event_id: number) {
    if (!confirm('Delete this event?')) return;
    await fetch(`/api/admin/api-events?event_id=${event_id}`, { method: 'DELETE' });
    fetchData();
  }

  async function deleteRule(rule_id: number) {
    if (!confirm('Delete this rule?')) return;
    await fetch(`/api/admin/api-events?rule_id=${rule_id}`, { method: 'DELETE' });
    fetchData();
  }

  const liveCount = data?.events.filter(e => e.isLive).length || 0;

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="font-display text-4xl text-white mb-2">
            API <span className="text-gold-gradient">Intelligence.</span>
          </h1>
          <p className="text-white/30 text-xs font-sans tracking-[0.2em] uppercase">
            Event-based API distribution · Abuse prevention · Usage governance
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

      {/* Message */}
      <AnimatePresence>
        {msg && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={clsx(
              'flex items-center gap-3 px-5 py-3 border rounded-sm text-xs font-sans',
              msg.ok ? 'bg-green-500/5 border-green-500/20 text-green-400' : 'bg-red-500/5 border-red-500/20 text-red-400'
            )}
          >
            {msg.ok ? <Check size={14} /> : <AlertTriangle size={14} />}
            {msg.text}
            <button onClick={() => setMsg(null)} className="ml-auto"><X size={12} /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card p-6 border border-white/5">
          <Calendar size={18} className="text-gold mb-4" />
          <div className="font-display text-3xl text-white mb-1">{data?.events.length || 0}</div>
          <div className="text-[9px] uppercase tracking-widest text-white/30 font-sans">Total Events</div>
        </div>
        <div className="glass-card p-6 border border-white/5">
          <Zap size={18} className="text-green-400 mb-4" />
          <div className="font-display text-3xl text-white mb-1">{liveCount}</div>
          <div className="text-[9px] uppercase tracking-widest text-white/30 font-sans">Live Right Now</div>
        </div>
        <div className="glass-card p-6 border border-white/5">
          <Shield size={18} className="text-red-400 mb-4" />
          <div className="font-display text-3xl text-white mb-1">{data?.abuseRules.filter(r => r.active).length || 0}</div>
          <div className="text-[9px] uppercase tracking-widest text-white/30 font-sans">Active Abuse Rules</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/5 pb-0">
        {[
          { key: 'events', label: 'API Events', icon: Calendar },
          { key: 'abuse', label: 'Abuse Rules', icon: Shield },
          { key: 'usage', label: 'User Usage', icon: Users },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key as any)}
            className={clsx(
              'flex items-center gap-2 px-5 py-3 border-b-2 text-[11px] uppercase tracking-widest font-sans transition-all',
              tab === key
                ? 'border-gold text-gold'
                : 'border-transparent text-white/30 hover:text-white'
            )}
          >
            <Icon size={12} /> {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="glass-card h-20 animate-pulse rounded-sm" />)}
        </div>
      ) : (
        <>
          {/* EVENTS TAB */}
          {tab === 'events' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  onClick={() => setShowNewEvent(!showNewEvent)}
                  className="flex items-center gap-2 px-5 py-2 bg-gold/10 border border-gold/30 text-gold text-[10px] uppercase tracking-widest hover:bg-gold hover:text-black transition-all"
                >
                  <Plus size={12} /> New Event
                </button>
              </div>

              {/* New Event Form */}
              <AnimatePresence>
                {showNewEvent && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="glass-card border border-gold/20 p-6 space-y-4 overflow-hidden"
                  >
                    <p className="text-[9px] uppercase tracking-widest text-gold/60 font-sans">Create New API Event</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[8px] uppercase tracking-widest text-white/20 font-sans mb-1 block">Event Name *</label>
                        <input value={eventForm.name} onChange={e => setEventForm(f => ({ ...f, name: e.target.value }))}
                          placeholder="Dubai Shopping Festival 2026"
                          className="w-full bg-white/5 border border-white/10 text-white text-xs font-sans px-3 py-2 outline-none focus:border-gold/40 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-[8px] uppercase tracking-widest text-white/20 font-sans mb-1 block">Type</label>
                        <select value={eventForm.event_type} onChange={e => setEventForm(f => ({ ...f, event_type: e.target.value }))}
                          className="w-full bg-[#111] border border-white/10 text-white text-xs font-sans px-3 py-2 outline-none focus:border-gold/40"
                        >
                          {['festival', 'concert', 'sale', 'vip', 'premium', 'custom'].map(t => (
                            <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[8px] uppercase tracking-widest text-white/20 font-sans mb-1 block">Budget Multiplier (×)</label>
                        <input type="number" step="0.5" min="1" max="10"
                          value={eventForm.budget_multiplier}
                          onChange={e => setEventForm(f => ({ ...f, budget_multiplier: parseFloat(e.target.value) }))}
                          className="w-full bg-white/5 border border-white/10 text-white text-xs font-mono px-3 py-2 outline-none focus:border-gold/40"
                        />
                      </div>
                      <div>
                        <label className="text-[8px] uppercase tracking-widest text-white/20 font-sans mb-1 block">Extra Tokens (bonus)</label>
                        <input type="number" min="0"
                          value={eventForm.extra_tokens}
                          onChange={e => setEventForm(f => ({ ...f, extra_tokens: parseInt(e.target.value) }))}
                          className="w-full bg-white/5 border border-white/10 text-white text-xs font-mono px-3 py-2 outline-none focus:border-gold/40"
                        />
                      </div>
                      <div>
                        <label className="text-[8px] uppercase tracking-widest text-white/20 font-sans mb-1 block">Start Date & Time *</label>
                        <input type="datetime-local"
                          value={eventForm.start_date}
                          onChange={e => setEventForm(f => ({ ...f, start_date: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 text-white text-xs font-mono px-3 py-2 outline-none focus:border-gold/40"
                        />
                      </div>
                      <div>
                        <label className="text-[8px] uppercase tracking-widest text-white/20 font-sans mb-1 block">End Date & Time *</label>
                        <input type="datetime-local"
                          value={eventForm.end_date}
                          onChange={e => setEventForm(f => ({ ...f, end_date: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 text-white text-xs font-mono px-3 py-2 outline-none focus:border-gold/40"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-[8px] uppercase tracking-widest text-white/20 font-sans mb-1 block">Applies To</label>
                        <div className="flex gap-3">
                          {[
                            { v: 'premium', label: 'Premium Members Only' },
                            { v: 'all', label: 'All Active Users' },
                            { v: 'selected', label: 'Selected Users' },
                          ].map(({ v, label }) => (
                            <button
                              key={v}
                              onClick={() => setEventForm(f => ({ ...f, applies_to: v }))}
                              className={clsx(
                                'flex-1 py-2 border text-[9px] uppercase tracking-widest transition-all',
                                eventForm.applies_to === v ? 'border-gold/40 text-gold bg-gold/5' : 'border-white/10 text-white/30 hover:text-white'
                              )}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="col-span-2">
                        <label className="text-[8px] uppercase tracking-widest text-white/20 font-sans mb-1 block">Description</label>
                        <textarea value={eventForm.description}
                          onChange={e => setEventForm(f => ({ ...f, description: e.target.value }))}
                          rows={2}
                          placeholder="Optional description..."
                          className="w-full bg-white/5 border border-white/10 text-white text-xs font-sans px-3 py-2 outline-none focus:border-gold/40 resize-none"
                        />
                      </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={createEvent}
                        disabled={acting === 'create_event' || !eventForm.name || !eventForm.start_date}
                        className="flex items-center gap-2 px-6 py-2 bg-gold text-black text-[10px] uppercase tracking-widest font-bold hover:bg-gold/80 transition-all disabled:opacity-40"
                      >
                        <Plus size={12} /> Create Event
                      </button>
                      <button onClick={() => setShowNewEvent(false)} className="px-4 py-2 bg-white/5 border border-white/10 text-white/30 text-[10px] uppercase tracking-widest hover:text-white transition-all">
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Event list */}
              {!data?.events.length ? (
                <div className="glass-card p-12 text-center text-white/20 text-xs font-sans uppercase tracking-widest">
                  No events created yet
                </div>
              ) : (
                <div className="space-y-3">
                  {data.events.map(ev => (
                    <div key={ev.id} className={clsx(
                      'glass-card border rounded-sm p-5',
                      ev.isLive ? 'border-gold/30 bg-gold/3' : 'border-white/5'
                    )}>
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            {ev.isLive && (
                              <span className="flex items-center gap-1.5 text-[8px] uppercase tracking-widest text-green-400 font-bold">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> LIVE
                              </span>
                            )}
                            <span className={clsx('text-[9px] uppercase tracking-widest px-2 py-0.5 border rounded-sm font-sans', EVENT_TYPE_COLORS[ev.event_type])}>
                              {ev.event_type}
                            </span>
                            <span className={clsx('text-[9px] px-2 py-0.5 border rounded-sm font-sans', ev.active ? 'text-green-400 border-green-400/20 bg-green-400/5' : 'text-white/20 border-white/10')}>
                              {ev.active ? 'Enabled' : 'Disabled'}
                            </span>
                          </div>
                          <p className="text-sm text-white font-sans font-medium mb-1">{ev.name}</p>
                          {ev.description && <p className="text-[11px] text-white/30 font-sans mb-2">{ev.description}</p>}
                          <div className="flex items-center gap-5 text-[9px] text-white/20 uppercase tracking-wider font-sans">
                            <span>×{ev.budget_multiplier} budget</span>
                            <span>+{ev.extra_tokens.toLocaleString()} tokens</span>
                            <span><Users size={8} className="inline mr-1" />{ev.selected_users} enrolled</span>
                            <span>→ {ev.applies_to}</span>
                            <span>{new Date(ev.start_date).toLocaleDateString('en-AE')} – {new Date(ev.end_date).toLocaleDateString('en-AE')}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => applyEvent(ev.id)}
                            disabled={acting === 'apply_' + ev.id}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-gold/10 border border-gold/30 text-gold text-[9px] uppercase tracking-widest hover:bg-gold hover:text-black transition-all disabled:opacity-40"
                          >
                            <Play size={10} /> Apply
                          </button>
                          <button
                            onClick={() => toggleEvent(ev.id)}
                            disabled={!!acting}
                            className="p-2 text-white/30 hover:text-white transition-colors"
                          >
                            {ev.active ? <ToggleRight size={18} className="text-green-400" /> : <ToggleLeft size={18} />}
                          </button>
                          <button onClick={() => deleteEvent(ev.id)} className="p-2 text-red-500/30 hover:text-red-400 transition-colors">
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ABUSE RULES TAB */}
          {tab === 'abuse' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  onClick={() => setShowNewRule(!showNewRule)}
                  className="flex items-center gap-2 px-5 py-2 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                >
                  <Plus size={12} /> New Rule
                </button>
              </div>

              <AnimatePresence>
                {showNewRule && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="glass-card border border-red-500/20 p-6 space-y-4 overflow-hidden"
                  >
                    <p className="text-[9px] uppercase tracking-widest text-red-400/60 font-sans">Create Abuse Detection Rule</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="text-[8px] uppercase tracking-widest text-white/20 font-sans mb-1 block">Rule Name</label>
                        <input value={ruleForm.rule_name} onChange={e => setRuleForm(f => ({ ...f, rule_name: e.target.value }))}
                          placeholder="High Volume Abuse"
                          className="w-full bg-white/5 border border-white/10 text-white text-xs px-3 py-2 outline-none focus:border-red-500/40"
                        />
                      </div>
                      <div>
                        <label className="text-[8px] uppercase tracking-widest text-white/20 font-sans mb-1 block">Token Threshold</label>
                        <input type="number" value={ruleForm.threshold_tokens}
                          onChange={e => setRuleForm(f => ({ ...f, threshold_tokens: parseInt(e.target.value) }))}
                          className="w-full bg-white/5 border border-white/10 text-white text-xs font-mono px-3 py-2 outline-none focus:border-red-500/40"
                        />
                      </div>
                      <div>
                        <label className="text-[8px] uppercase tracking-widest text-white/20 font-sans mb-1 block">Window (hours)</label>
                        <input type="number" value={ruleForm.window_hours}
                          onChange={e => setRuleForm(f => ({ ...f, window_hours: parseInt(e.target.value) }))}
                          className="w-full bg-white/5 border border-white/10 text-white text-xs font-mono px-3 py-2 outline-none focus:border-red-500/40"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-[8px] uppercase tracking-widest text-white/20 font-sans mb-1 block">Action</label>
                        <div className="flex gap-2">
                          {Object.entries(ABUSE_ACTION_LABELS).map(([v, { label, color }]) => (
                            <button key={v} onClick={() => setRuleForm(f => ({ ...f, action: v }))}
                              className={clsx('flex-1 py-2 border text-[9px] uppercase tracking-widest transition-all',
                                ruleForm.action === v ? 'border-red-500/40 bg-red-500/10 text-red-400' : 'border-white/10 text-white/30 hover:text-white'
                              )}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={createRule} disabled={acting === 'create_rule' || !ruleForm.rule_name}
                        className="flex items-center gap-2 px-6 py-2 bg-red-500/20 border border-red-500/30 text-red-400 text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all disabled:opacity-40"
                      >
                        <Shield size={12} /> Create Rule
                      </button>
                      <button onClick={() => setShowNewRule(false)} className="px-4 py-2 bg-white/5 border border-white/10 text-white/30 text-[10px] uppercase tracking-widest hover:text-white transition-all">
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-3">
                {!data?.abuseRules.length ? (
                  <div className="glass-card p-12 text-center text-white/20 text-xs font-sans uppercase tracking-widest">
                    No abuse rules defined
                  </div>
                ) : data.abuseRules.map(rule => (
                  <div key={rule.id} className="glass-card border border-white/5 p-5 flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1.5">
                        <span className={clsx('text-[9px] uppercase tracking-widest font-bold', ABUSE_ACTION_LABELS[rule.action]?.color)}>
                          {ABUSE_ACTION_LABELS[rule.action]?.label}
                        </span>
                        <span className={clsx('text-[8px] px-2 py-0.5 border rounded-sm font-sans', rule.active ? 'text-green-400 border-green-400/20' : 'text-white/20 border-white/10')}>
                          {rule.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-sm text-white font-sans">{rule.rule_name}</p>
                      <p className="text-[10px] text-white/30 font-sans mt-1">
                        Trigger: &gt;{rule.threshold_tokens.toLocaleString()} tokens in {rule.window_hours}h window
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleRule(rule.id)} className="p-2 text-white/30 hover:text-white transition-colors">
                        {rule.active ? <ToggleRight size={18} className="text-green-400" /> : <ToggleLeft size={18} />}
                      </button>
                      <button onClick={() => deleteRule(rule.id)} className="p-2 text-red-500/30 hover:text-red-400 transition-colors">
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* USER USAGE TAB */}
          {tab === 'usage' && (
            <div className="space-y-4">
              <p className="text-[9px] uppercase tracking-widest text-white/20 font-sans">
                Top users by API consumption — click actions to manage limits
              </p>
              <div className="glass-card border border-white/5 overflow-hidden">
                <div className="grid grid-cols-[2fr_1fr_2fr_auto] gap-4 px-5 py-3 border-b border-white/5 bg-white/2">
                  {['User', 'Usage', 'Budget Bar', 'Controls'].map(h => (
                    <div key={h} className="text-[9px] uppercase tracking-widest text-white/20 font-sans">{h}</div>
                  ))}
                </div>
                {data?.abusers.map((u, i) => {
                  const pct = Math.min(u.usage_pct, 100);
                  const isHigh = pct >= 80;
                  const isMedium = pct >= 50 && pct < 80;
                  return (
                    <div key={u.id} className={clsx(
                      'grid grid-cols-[2fr_1fr_2fr_auto] gap-4 px-5 py-4 border-b border-white/3 items-center',
                      isHigh && 'bg-red-500/3'
                    )}>
                      <div>
                        <p className="text-xs text-white/70 font-sans truncate">{u.name}</p>
                        <p className="text-[9px] text-white/30 font-mono truncate">{u.email}</p>
                      </div>
                      <div>
                        <p className={clsx('text-sm font-bold font-mono', isHigh ? 'text-red-400' : isMedium ? 'text-amber-400' : 'text-white/50')}>
                          {pct}%
                        </p>
                        <p className="text-[8px] text-white/20 font-mono">{u.api_used}/{u.api_budget}</p>
                      </div>
                      <div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            className={clsx('h-full rounded-full', isHigh ? 'bg-red-500' : isMedium ? 'bg-amber-400' : 'bg-gold/40')}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => abuseAction(u.id, 'reduce_50')}
                          disabled={!!acting}
                          title="Halve budget"
                          className="p-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 transition-all disabled:opacity-40 rounded-sm"
                        >
                          <TrendingDown size={11} />
                        </button>
                        <button
                          onClick={() => abuseAction(u.id, 'block')}
                          disabled={!!acting}
                          title="Block API"
                          className="p-1.5 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-40 rounded-sm"
                        >
                          <Ban size={11} />
                        </button>
                        <button
                          onClick={() => abuseAction(u.id, 'reset')}
                          disabled={!!acting}
                          title="Reset to 1000"
                          className="p-1.5 bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 transition-all disabled:opacity-40 rounded-sm"
                        >
                          <RefreshCcw size={11} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
