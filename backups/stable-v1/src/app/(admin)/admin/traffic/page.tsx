'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Globe, MousePointer2, Monitor, Smartphone, Tablet, Bot, RefreshCcw, TrendingUp } from 'lucide-react';
import clsx from 'clsx';

interface TrafficData {
  totals: { total: number; today: number; unique_ips: number; this_week: number };
  hourly: { hour: string; count: number }[];
  daily: { date: string; count: number }[];
  topPages30d: { path: string; count: number }[];
  topPages7d: { path: string; count: number }[];
  topReferrers: { referrer: string; count: number }[];
  recentIPs: { ip_address: string; visits: number; last_seen: string }[];
  devices: { device: string; count: number }[];
  browsers: { browser: string; count: number }[];
}

const DEVICE_ICON: Record<string, React.ElementType> = {
  Mobile: Smartphone,
  Desktop: Monitor,
  Tablet: Tablet,
  Bot: Bot,
};

const DEVICE_COLOR: Record<string, string> = {
  Mobile: '#C9A052',
  Desktop: '#48CAE4',
  Tablet: '#7B2FBE',
  Bot: '#666',
};

function MiniBar({ value, max, color = '#C9A052' }: { value: number; max: number; color?: string }) {
  return (
    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${max > 0 ? (value / max) * 100 : 0}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
      />
    </div>
  );
}

function HourlyChart({ data }: { data: { hour: string; count: number }[] }) {
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <div className="flex items-end gap-1 h-24 w-full">
      {data.map((d, i) => {
        const height = Math.max((d.count / max) * 100, 2);
        const label = new Date(d.hour).getHours();
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black border border-gold/20 text-gold text-[8px] font-mono px-1.5 py-0.5 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
              {d.count} visits
            </div>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${height}%` }}
              transition={{ delay: i * 0.02, duration: 0.4 }}
              className="w-full rounded-t-sm bg-gold/30 group-hover:bg-gold transition-colors"
              style={{ minHeight: 2 }}
            />
            {(i === 0 || label % 6 === 0) && (
              <span className="text-[7px] text-white/20 font-mono">{label}h</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function DailyChart({ data }: { data: { date: string; count: number }[] }) {
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <div className="flex items-end gap-0.5 h-20 w-full">
      {data.map((d, i) => {
        const height = Math.max((d.count / max) * 100, 2);
        const day = new Date(d.date).getDate();
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-black border border-gold/20 text-gold text-[8px] font-mono px-1.5 py-0.5 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
              {d.date}: {d.count}
            </div>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${height}%` }}
              transition={{ delay: i * 0.01, duration: 0.4 }}
              className="w-full rounded-t-sm bg-[#48CAE4]/30 group-hover:bg-[#48CAE4]/70 transition-colors"
              style={{ minHeight: 2 }}
            />
            {i % 5 === 0 && (
              <span className="text-[7px] text-white/20 font-mono">{day}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function TrafficAdmin() {
  const [data, setData] = useState<TrafficData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'7d' | '30d'>('7d');

  const fetchData = () => {
    setLoading(true);
    fetch('/api/admin/traffic')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const topPages = tab === '7d' ? data?.topPages7d : data?.topPages30d;
  const maxPageCount = Math.max(...(topPages?.map(p => p.count) || [1]));
  const totalDevices = data?.devices.reduce((s, d) => s + d.count, 0) || 1;

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="font-display text-4xl text-white mb-2">
            Visitor <span className="text-gold-gradient">Analytics.</span>
          </h1>
          <p className="text-white/30 text-xs font-sans tracking-[0.2em] uppercase">
            Real-time traffic intelligence
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

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="glass-card h-24 animate-pulse rounded-sm" />
          ))}
        </div>
      ) : !data ? (
        <div className="glass-card p-16 text-center text-red-400/60 text-sm">Failed to load analytics.</div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Visits', value: data.totals.total?.toLocaleString(), icon: Globe, color: '#C9A052' },
              { label: 'Today', value: data.totals.today?.toLocaleString(), icon: TrendingUp, color: '#48CAE4' },
              { label: 'This Week', value: data.totals.this_week?.toLocaleString(), icon: Activity, color: '#7B2FBE' },
              { label: 'Unique IPs', value: data.totals.unique_ips?.toLocaleString(), icon: MousePointer2, color: '#2EC4B6' },
            ].map((c, i) => (
              <div key={i} className="glass-card p-6 border border-white/5">
                <c.icon size={18} className="mb-4" style={{ color: c.color }} />
                <div className="font-display text-3xl text-white mb-1">{c.value || '0'}</div>
                <div className="text-[9px] tracking-widest uppercase text-white/30 font-sans">{c.label}</div>
              </div>
            ))}
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Hourly chart */}
            <div className="glass-card p-8 border border-white/5 space-y-4">
              <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <Activity size={16} className="text-gold" />
                <h2 className="text-xs font-sans uppercase tracking-[0.3em] text-white/60">Hourly Traffic — Last 24h</h2>
              </div>
              {data.hourly.length === 0 ? (
                <p className="text-white/20 text-xs font-sans text-center py-8">No visit data yet.</p>
              ) : (
                <HourlyChart data={data.hourly} />
              )}
            </div>

            {/* Daily chart */}
            <div className="glass-card p-8 border border-white/5 space-y-4">
              <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <TrendingUp size={16} className="text-[#48CAE4]" />
                <h2 className="text-xs font-sans uppercase tracking-[0.3em] text-white/60">Daily Traffic — Last 30d</h2>
              </div>
              {data.daily.length === 0 ? (
                <p className="text-white/20 text-xs font-sans text-center py-8">No visit data yet.</p>
              ) : (
                <DailyChart data={data.daily} />
              )}
            </div>
          </div>

          {/* Top pages + devices */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top pages */}
            <div className="lg:col-span-2 glass-card p-8 border border-white/5 space-y-5">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                  <MousePointer2 size={16} className="text-gold" />
                  <h2 className="text-xs font-sans uppercase tracking-[0.3em] text-white/60">Top Pages</h2>
                </div>
                <div className="flex gap-2">
                  {(['7d', '30d'] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => setTab(t)}
                      className={clsx(
                        'text-[9px] uppercase tracking-widest px-2 py-1 border transition-all font-sans',
                        tab === t ? 'border-gold/40 text-gold bg-gold/5' : 'border-white/10 text-white/30 hover:text-white'
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              {!topPages?.length ? (
                <p className="text-white/20 text-xs font-sans py-4">No data available.</p>
              ) : (
                <div className="space-y-4">
                  {topPages.map((p, i) => (
                    <div key={i}>
                      <div className="flex justify-between items-center mb-1.5">
                        <div className="flex items-center gap-3">
                          <span className="text-[9px] font-mono text-white/20 w-5">{i + 1}</span>
                          <span className="text-xs font-mono text-white/70 truncate max-w-[280px]">{p.path}</span>
                        </div>
                        <span className="text-xs font-bold text-gold font-mono">{p.count}</span>
                      </div>
                      <MiniBar value={p.count} max={maxPageCount} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Devices + browsers */}
            <div className="space-y-6">
              <div className="glass-card p-6 border border-white/5 space-y-4">
                <h2 className="text-[9px] uppercase tracking-[0.3em] text-white/30 font-sans border-b border-white/5 pb-3">
                  Device Breakdown
                </h2>
                {data.devices.map((d) => {
                  const Icon = DEVICE_ICON[d.device] || Monitor;
                  const pct = Math.round((d.count / totalDevices) * 100);
                  return (
                    <div key={d.device}>
                      <div className="flex justify-between items-center mb-1.5">
                        <div className="flex items-center gap-2">
                          <Icon size={12} style={{ color: DEVICE_COLOR[d.device] || '#fff' }} />
                          <span className="text-xs text-white/50 font-sans">{d.device}</span>
                        </div>
                        <span className="text-[10px] font-mono text-white/40">{pct}%</span>
                      </div>
                      <MiniBar value={d.count} max={totalDevices} color={DEVICE_COLOR[d.device] || '#C9A052'} />
                    </div>
                  );
                })}
              </div>

              <div className="glass-card p-6 border border-white/5 space-y-3">
                <h2 className="text-[9px] uppercase tracking-[0.3em] text-white/30 font-sans border-b border-white/5 pb-3">
                  Browsers
                </h2>
                {data.browsers.map((b) => (
                  <div key={b.browser} className="flex justify-between items-center">
                    <span className="text-xs text-white/50 font-sans">{b.browser}</span>
                    <span className="text-[10px] font-bold text-gold font-mono">{b.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Referrers + IPs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Referrers */}
            <div className="glass-card p-8 border border-white/5 space-y-4">
              <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <Globe size={16} className="text-[#7B2FBE]" />
                <h2 className="text-xs font-sans uppercase tracking-[0.3em] text-white/60">Top Referrers — 30d</h2>
              </div>
              {!data.topReferrers.length ? (
                <p className="text-white/20 text-xs font-sans">No referrer data.</p>
              ) : (
                <div className="space-y-3">
                  {data.topReferrers.map((r, i) => (
                    <div key={i} className="flex justify-between items-center group">
                      <span className="text-[11px] font-mono text-white/40 truncate max-w-[280px] group-hover:text-white/70 transition-colors">
                        {r.referrer}
                      </span>
                      <span className="text-[10px] font-bold text-[#7B2FBE] font-mono ml-4 flex-shrink-0">{r.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent IPs */}
            <div className="glass-card p-8 border border-white/5 space-y-4">
              <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <MousePointer2 size={16} className="text-[#2EC4B6]" />
                <h2 className="text-xs font-sans uppercase tracking-[0.3em] text-white/60">Active Visitors — 7d</h2>
              </div>
              <div className="space-y-2">
                {data.recentIPs.slice(0, 12).map((ip, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <span className="text-[10px] font-mono text-white/40">{ip.ip_address}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-[9px] text-white/20 font-sans">
                        {new Date(ip.last_seen).toLocaleDateString('en-AE', { day: '2-digit', month: 'short' })}
                      </span>
                      <span className="text-[10px] font-bold text-[#2EC4B6] font-mono">{ip.visits}x</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
