'use client';
import { useState, useEffect } from 'react';
import { Activity, Zap, AlertCircle, Database, Server, TrendingUp, CheckCircle, RefreshCcw } from 'lucide-react';

interface UsageHourly {
  hour_start: string;
  provider: string;
  calls_success: number;
  calls_failed: number;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
}

interface UsageSummary {
  provider: string;
  total_calls: number;
  calls_success: number;
  calls_failed: number;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
}

interface ByEndpoint {
  endpoint: string;
  provider: string;
  calls: number;
  success_rate: number;
  total_tokens: number;
  avg_tokens: number;
}

interface RecentCall {
  id: number;
  provider: string;
  model: string;
  endpoint: string;
  user_id: number;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  success: number;
  error_type: string;
  created_at: string;
}

interface TodayStat {
  calls: number;
  calls_success: number;
  calls_failed: number;
  input_tokens: number;
  output_tokens: number;
  tokens: number;
}

interface DashboardData {
  hourly: UsageHourly[];
  summaries: UsageSummary[];
  today: Record<string, TodayStat>;
  byEndpoint: ByEndpoint[];
  recentCalls: RecentCall[];
}

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M';
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'k';
  return String(Math.round(n));
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

interface LivePulse {
  calls: number; tokens: number; failed: number;
}
interface LastCall {
  endpoint: string; total_tokens: number; success: number; created_at: string;
}

export default function AiUsageDashboard() {
  const [data, setData]         = useState<DashboardData | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [tab, setTab]           = useState<'overview' | 'endpoints' | 'recent'>('overview');
  const [pulse, setPulse]       = useState<LivePulse>({ calls: 0, tokens: 0, failed: 0 });
  const [lastCall, setLastCall] = useState<LastCall | null>(null);
  const [liveTs, setLiveTs]     = useState(0); // seconds since last call

  const load = () => {
    setLoading(true);
    fetch('/api/admin/ai-usage')
      .then(r => r.json())
      .then(d => { if (d.error) setError(d.error); else setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  };

  // Live pulse — poll every 8s (lightweight, no AI cost)
  useEffect(() => {
    const poll = () => {
      fetch('/api/admin/ai-usage?live=1')
        .then(r => r.json())
        .then(d => {
          if (d.last60) setPulse(d.last60);
          if (d.lastCall) setLastCall(d.lastCall);
        })
        .catch(() => {});
    };
    poll();
    const id = setInterval(poll, 8_000);
    return () => clearInterval(id);
  }, []);

  // Tick seconds-since-last-call
  useEffect(() => {
    if (!lastCall) return;
    const tick = () => {
      const secs = Math.floor((Date.now() - new Date(lastCall.created_at).getTime()) / 1000);
      setLiveTs(secs);
    };
    tick();
    const id = setInterval(tick, 1_000);
    return () => clearInterval(id);
  }, [lastCall]);

  useEffect(() => { load(); }, []);

  if (loading) return (
    <div className="flex items-center gap-3 p-8 text-white/40 font-sans border border-white/5 bg-[#0a0a0a]">
      <Activity className="animate-pulse" size={16}/> Loading telemetry…
    </div>
  );

  if (error) return (
    <div className="p-6 bg-red-950/20 border border-red-900/30 text-red-400 font-sans text-sm flex items-center gap-3">
      <AlertCircle size={16}/> {error}
    </div>
  );

  const gemini  = data?.summaries.find(s => s.provider === 'gemini');
  const todayG  = data?.today?.gemini ?? { calls: 0, calls_success: 0, calls_failed: 0, input_tokens: 0, output_tokens: 0, tokens: 0 };

  // 24h chart data
  const now = new Date(); now.setMinutes(0, 0, 0);
  const timeline = Array.from({ length: 24 }, (_, i) => {
    const d   = new Date(now.getTime() - (23 - i) * 3_600_000);
    const key = d.toISOString().slice(0, 13).replace('T', ' ') + ':00:00';
    const gem = data?.hourly.find(r => r.provider === 'gemini' && r.hour_start.startsWith(key.slice(0, 13)));
    return {
      label:  d.getHours() + ':00',
      total:  gem?.total_tokens  ?? 0,
      input:  gem?.input_tokens  ?? 0,
      output: gem?.output_tokens ?? 0,
      calls:  (gem?.calls_success ?? 0) + (gem?.calls_failed ?? 0),
      failed: gem?.calls_failed  ?? 0,
    };
  });
  const maxTokens   = Math.max(...timeline.map(h => h.total), 1);
  const successRate = gemini && gemini.total_calls > 0
    ? Math.round((gemini.calls_success / gemini.total_calls) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-white/5 pb-4">
        <div>
          <h2 className="text-xl font-display text-white mb-1 flex items-center gap-2">
            <Server size={18} className="text-[#48CAE4]"/> AI Token Usage
          </h2>
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/30 font-sans">
            Gemini 1.5 Flash · Real-time tracking
          </p>
        </div>
        <button onClick={load} className="flex items-center gap-1.5 text-[10px] text-white/30 hover:text-white font-sans uppercase tracking-widest transition-colors border border-white/10 px-3 py-1.5">
          <RefreshCcw size={10}/> Refresh
        </button>
      </div>

      {/* Live Pulse Bar */}
      <div className="flex items-center justify-between p-3 border border-[#48CAE4]/15 bg-[#48CAE4]/5 text-[10px] font-sans">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${pulse.calls > 0 ? 'bg-green-400 animate-pulse' : 'bg-white/20'}`}/>
            <span className="text-white/40 uppercase tracking-widest">Live · Last 60s</span>
          </div>
          <span className="text-[#48CAE4] font-mono font-bold">{pulse.calls} calls</span>
          <span className="text-white/30">·</span>
          <span className="text-emerald-400 font-mono">{fmt(pulse.tokens)} tokens</span>
          {pulse.failed > 0 && (
            <><span className="text-white/30">·</span>
            <span className="text-red-400 font-mono">{pulse.failed} failed</span></>
          )}
        </div>
        {lastCall && (
          <div className="text-white/25 flex items-center gap-2">
            <span>Last:</span>
            <span className="text-[#48CAE4]/70 font-mono">{lastCall.endpoint || '—'}</span>
            <span className="font-mono">{fmt(lastCall.total_tokens)} tok</span>
            <span className="font-mono text-white/20">{liveTs < 60 ? `${liveTs}s ago` : `${Math.floor(liveTs/60)}m ago`}</span>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 border border-white/5 bg-white/[0.02]">
          <div className="text-[9px] uppercase tracking-widest text-white/30 font-sans mb-2 flex items-center gap-1.5">
            <Database size={10}/> Lifetime Tokens
          </div>
          <div className="font-display text-2xl text-white">{fmt(gemini?.total_tokens || 0)}</div>
          <div className="text-[10px] font-sans mt-1 space-x-1">
            <span className="text-blue-400">{fmt(gemini?.input_tokens || 0)} in</span>
            <span className="text-white/20">·</span>
            <span className="text-emerald-400">{fmt(gemini?.output_tokens || 0)} out</span>
          </div>
        </div>

        <div className="p-4 border border-[#48CAE4]/20 bg-[#48CAE4]/5">
          <div className="text-[9px] uppercase tracking-widest text-[#48CAE4]/50 font-sans mb-2 flex items-center gap-1.5">
            <Zap size={10}/> Today
          </div>
          <div className="font-display text-2xl text-white">{fmt(todayG.tokens)}</div>
          <div className="text-[10px] font-sans mt-1 space-x-1">
            <span className="text-white/40">{todayG.calls} calls</span>
            <span className="text-white/20">·</span>
            <span className="text-blue-400">{fmt(todayG.input_tokens)} in</span>
            <span className="text-white/20">·</span>
            <span className="text-emerald-400">{fmt(todayG.output_tokens)} out</span>
          </div>
        </div>

        <div className="p-4 border border-white/5 bg-white/[0.02]">
          <div className="text-[9px] uppercase tracking-widest text-white/30 font-sans mb-2 flex items-center gap-1.5">
            <TrendingUp size={10}/> Total API Calls
          </div>
          <div className="font-display text-2xl text-white">{(gemini?.total_calls || 0).toLocaleString()}</div>
          <div className="text-[10px] font-sans mt-1 space-x-1">
            <span className="text-green-400">{gemini?.calls_success || 0} ok</span>
            <span className="text-white/20">·</span>
            <span className="text-red-400">{gemini?.calls_failed || 0} failed</span>
          </div>
        </div>

        <div className={`p-4 border ${successRate >= 90 ? 'border-green-500/20 bg-green-950/10' : successRate >= 70 ? 'border-amber-500/20 bg-amber-950/10' : 'border-red-500/20 bg-red-950/10'}`}>
          <div className="text-[9px] uppercase tracking-widest text-white/30 font-sans mb-2 flex items-center gap-1.5">
            <CheckCircle size={10}/> Success Rate
          </div>
          <div className={`font-display text-2xl ${successRate >= 90 ? 'text-green-400' : successRate >= 70 ? 'text-amber-400' : 'text-red-400'}`}>
            {successRate}%
          </div>
          <div className="text-[10px] text-white/30 font-sans mt-1">
            avg {fmt(Math.round((gemini?.total_tokens || 0) / Math.max(1, gemini?.total_calls || 1)))} tok/call
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5">
        {(['overview', 'endpoints', 'recent'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2.5 text-[10px] font-sans uppercase tracking-widest border-b-2 transition-all ${
              tab === t ? 'border-[#48CAE4] text-[#48CAE4]' : 'border-transparent text-white/30 hover:text-white/60'
            }`}>
            {t}
          </button>
        ))}
      </div>

      {/* OVERVIEW — 24h stacked bar chart */}
      {tab === 'overview' && (
        <div className="p-5 border border-white/5 bg-white/[0.01]">
          <div className="flex justify-between text-[9px] uppercase tracking-widest text-white/30 font-sans mb-6">
            <span>24-Hour Token Volume</span>
            <span className="text-[#48CAE4]">Peak: {fmt(maxTokens)} tokens</span>
          </div>

          <div className="flex items-end gap-0.5 h-36 w-full">
            {timeline.map((h, i) => (
              <div key={i} className="flex-1 flex flex-col justify-end group relative">
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[#0a0a0a] border border-white/10 p-2.5 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-20 whitespace-nowrap shadow-xl text-[9px] font-mono space-y-0.5">
                  <div className="text-white/40 mb-1 font-sans">{h.label}</div>
                  <div className="text-blue-400">In:    {fmt(h.input)}</div>
                  <div className="text-emerald-400">Out:   {fmt(h.output)}</div>
                  <div className="text-[#48CAE4]">Total: {fmt(h.total)}</div>
                  <div className="text-white/30">{h.calls} call{h.calls !== 1 ? 's' : ''}{h.failed > 0 ? ` · ${h.failed} failed` : ''}</div>
                </div>
                {/* Stacked: output (green) top, input (blue) bottom */}
                {h.output > 0 && (
                  <div className="w-full bg-emerald-500/70 group-hover:bg-emerald-400 transition-colors"
                    style={{ height: `${Math.round((h.output / maxTokens) * 100)}px` }}/>
                )}
                {h.input > 0 && (
                  <div className="w-full bg-[#48CAE4]/60 group-hover:bg-[#48CAE4] transition-colors"
                    style={{ height: `${Math.round((h.input / maxTokens) * 100)}px` }}/>
                )}
                {h.failed > 0 && <div className="w-full h-0.5 bg-red-500 mt-0.5"/>}
              </div>
            ))}
          </div>

          <div className="flex justify-between mt-2 text-[8px] text-white/20 font-mono">
            <span>{timeline[0].label}</span>
            <span>{timeline[6].label}</span>
            <span>{timeline[12].label}</span>
            <span>{timeline[18].label}</span>
            <span>{timeline[23].label} (Now)</span>
          </div>

          <div className="flex gap-5 mt-4 text-[9px] font-sans text-white/30">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-[#48CAE4]/60 inline-block rounded-sm"/> Input tokens</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-emerald-500/70 inline-block rounded-sm"/> Output tokens</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-0.5 bg-red-500 inline-block"/> Failed calls</span>
          </div>
        </div>
      )}

      {/* ENDPOINTS TAB */}
      {tab === 'endpoints' && (
        <div className="border border-white/5 overflow-x-auto">
          <table className="w-full text-xs font-sans min-w-[600px]">
            <thead>
              <tr className="border-b border-white/5 text-[9px] uppercase tracking-widest text-white/30">
                <th className="text-left p-3">Endpoint</th>
                <th className="text-right p-3">Calls</th>
                <th className="text-right p-3">Success</th>
                <th className="text-right p-3">Total Tokens</th>
                <th className="text-right p-3">Avg / Call</th>
              </tr>
            </thead>
            <tbody>
              {(data?.byEndpoint || []).length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center p-8 text-white/20 font-sans text-xs">
                    No endpoint data yet — use AI features to populate
                  </td>
                </tr>
              ) : (data?.byEndpoint || []).map((ep, i) => (
                <tr key={i} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                  <td className="p-3 font-mono text-[#48CAE4] text-[11px]">{ep.endpoint}</td>
                  <td className="p-3 text-right text-white">{ep.calls.toLocaleString()}</td>
                  <td className="p-3 text-right">
                    <span className={ep.success_rate >= 90 ? 'text-green-400' : ep.success_rate >= 70 ? 'text-amber-400' : 'text-red-400'}>
                      {ep.success_rate}%
                    </span>
                  </td>
                  <td className="p-3 text-right text-white/60">{fmt(ep.total_tokens)}</td>
                  <td className="p-3 text-right text-white/40">{fmt(ep.avg_tokens)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* RECENT CALLS TAB */}
      {tab === 'recent' && (
        <div className="border border-white/5 overflow-x-auto">
          <table className="w-full text-xs font-sans min-w-[700px]">
            <thead>
              <tr className="border-b border-white/5 text-[9px] uppercase tracking-widest text-white/30">
                <th className="text-left p-3">#</th>
                <th className="text-left p-3">Endpoint</th>
                <th className="text-left p-3">Model</th>
                <th className="text-right p-3">In</th>
                <th className="text-right p-3">Out</th>
                <th className="text-right p-3">Total</th>
                <th className="text-center p-3">Status</th>
                <th className="text-right p-3">When</th>
              </tr>
            </thead>
            <tbody>
              {(data?.recentCalls || []).length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center p-8 text-white/20 font-sans text-xs">
                    No API calls recorded yet — use Gemini AI features to see data here
                  </td>
                </tr>
              ) : (data?.recentCalls || []).map(c => (
                <tr key={c.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                  <td className="p-3 text-white/20 font-mono">#{c.id}</td>
                  <td className="p-3 font-mono text-[#48CAE4] text-[10px]">{c.endpoint || '—'}</td>
                  <td className="p-3 text-white/40 text-[10px]">{c.model || '—'}</td>
                  <td className="p-3 text-right text-blue-400">{fmt(c.input_tokens)}</td>
                  <td className="p-3 text-right text-emerald-400">{fmt(c.output_tokens)}</td>
                  <td className="p-3 text-right text-white/60">{fmt(c.total_tokens)}</td>
                  <td className="p-3 text-center">
                    {c.success ? (
                      <CheckCircle size={12} className="text-green-400 inline"/>
                    ) : (
                      <span className="text-red-400 text-[9px] font-mono">{c.error_type || 'ERR'}</span>
                    )}
                  </td>
                  <td className="p-3 text-right text-white/30 text-[10px]">{timeAgo(c.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
