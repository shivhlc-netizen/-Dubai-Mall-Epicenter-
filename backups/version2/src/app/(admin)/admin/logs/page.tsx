'use client';
import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Terminal, Search, ChevronLeft, ChevronRight, Monitor, Smartphone, Globe, RefreshCcw, X } from 'lucide-react';
import clsx from 'clsx';

interface LogEntry {
  id: number;
  ip_address: string;
  user_agent: string;
  path: string;
  referrer: string;
  created_at: string;
}

function detectDevice(ua: string): { label: string; color: string } {
  const u = ua.toLowerCase();
  if (u.includes('bot') || u.includes('crawler')) return { label: 'Bot', color: 'text-white/20' };
  if (u.includes('mobile') || u.includes('iphone') || u.includes('android')) return { label: 'Mobile', color: 'text-gold/60' };
  if (u.includes('tablet') || u.includes('ipad')) return { label: 'Tablet', color: 'text-[#7B2FBE]/70' };
  return { label: 'Desktop', color: 'text-[#48CAE4]/70' };
}

function detectBrowser(ua: string): string {
  const u = ua.toLowerCase();
  if (u.includes('edg/')) return 'Edge';
  if (u.includes('opr/') || u.includes('opera')) return 'Opera';
  if (u.includes('chrome')) return 'Chrome';
  if (u.includes('safari')) return 'Safari';
  if (u.includes('firefox')) return 'Firefox';
  return 'Other';
}

export default function LogsAdmin() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [pathFilter, setPathFilter] = useState('');
  const [ipFilter, setIpFilter] = useState('');
  const [expanded, setExpanded] = useState<number | null>(null);

  const fetchLogs = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (pathFilter) params.set('path', pathFilter);
    if (ipFilter) params.set('ip', ipFilter);

    fetch(`/api/admin/logs?${params}`)
      .then(r => r.json())
      .then(d => {
        setLogs(d.logs || []);
        setTotal(d.total || 0);
        setPages(d.pages || 1);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [page, pathFilter, ipFilter]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  function applyFilter() {
    setPage(1);
    fetchLogs();
  }

  function clearFilters() {
    setPathFilter('');
    setIpFilter('');
    setPage(1);
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="font-display text-4xl text-white mb-2">
            System <span className="text-gold-gradient">Logs.</span>
          </h1>
          <p className="text-white/30 text-xs font-sans tracking-[0.2em] uppercase">
            Raw site visit log — {total.toLocaleString()} total entries
          </p>
        </div>
        <button
          onClick={fetchLogs}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-white/40 text-[10px] uppercase tracking-widest hover:text-white hover:border-gold/30 transition-all"
        >
          <RefreshCcw size={12} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="glass-card border border-white/5 p-5">
        <div className="flex gap-4 items-end flex-wrap">
          <div className="flex-1 min-w-[180px]">
            <label className="text-[9px] uppercase tracking-widest text-white/30 font-sans mb-2 block">
              Filter by Path
            </label>
            <input
              value={pathFilter}
              onChange={e => setPathFilter(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && applyFilter()}
              placeholder="/gallery, /admin..."
              className="w-full bg-white/5 border border-white/10 text-white/70 text-xs font-mono px-3 py-2 outline-none focus:border-gold/30 transition-colors placeholder:text-white/20"
            />
          </div>
          <div className="flex-1 min-w-[180px]">
            <label className="text-[9px] uppercase tracking-widest text-white/30 font-sans mb-2 block">
              Filter by IP
            </label>
            <input
              value={ipFilter}
              onChange={e => setIpFilter(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && applyFilter()}
              placeholder="192.168..."
              className="w-full bg-white/5 border border-white/10 text-white/70 text-xs font-mono px-3 py-2 outline-none focus:border-gold/30 transition-colors placeholder:text-white/20"
            />
          </div>
          <button
            onClick={applyFilter}
            className="flex items-center gap-2 px-5 py-2 bg-gold/10 border border-gold/20 text-gold text-[10px] uppercase tracking-widest hover:bg-gold hover:text-black transition-all"
          >
            <Search size={12} /> Search
          </button>
          {(pathFilter || ipFilter) && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-white/30 text-[10px] uppercase tracking-widest hover:text-white transition-all"
            >
              <X size={12} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Log table */}
      <div className="glass-card border border-white/5 overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr] gap-4 px-5 py-3 border-b border-white/5 bg-white/2">
          {['Path', 'IP Address', 'Device', 'Browser', 'Timestamp'].map(h => (
            <div key={h} className="text-[9px] uppercase tracking-widest text-white/20 font-sans">{h}</div>
          ))}
        </div>

        {loading ? (
          <div className="space-y-px">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="h-10 bg-white/2 animate-pulse" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-white/20">
            <Terminal size={28} className="mb-3" />
            <p className="text-xs font-sans uppercase tracking-widest">No log entries found</p>
          </div>
        ) : (
          <div>
            {logs.map((log, i) => {
              const device = detectDevice(log.user_agent);
              const browser = detectBrowser(log.user_agent);
              const isExpanded = expanded === log.id;

              return (
                <div key={log.id}>
                  <div
                    onClick={() => setExpanded(isExpanded ? null : log.id)}
                    className={clsx(
                      'grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr] gap-4 px-5 py-3 border-b border-white/3 cursor-pointer group transition-colors',
                      isExpanded ? 'bg-gold/5 border-b-gold/10' : 'hover:bg-white/2'
                    )}
                  >
                    <div className="font-mono text-[11px] text-white/60 group-hover:text-white/80 truncate transition-colors">
                      {log.path}
                    </div>
                    <div className="font-mono text-[10px] text-white/30">{log.ip_address}</div>
                    <div className={clsx('text-[10px] font-sans uppercase tracking-wider', device.color)}>
                      {device.label}
                    </div>
                    <div className="text-[10px] font-sans text-white/30">{browser}</div>
                    <div className="text-[10px] font-mono text-white/20">
                      {new Date(log.created_at).toLocaleString('en-AE', {
                        month: 'short', day: '2-digit',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </div>
                  </div>

                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-black/60 border-b border-gold/10 px-6 py-4 space-y-2"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[8px] uppercase tracking-widest text-white/20 mb-1 font-sans">User Agent</p>
                          <p className="text-[10px] font-mono text-white/40 break-all leading-relaxed">{log.user_agent}</p>
                        </div>
                        <div>
                          <p className="text-[8px] uppercase tracking-widest text-white/20 mb-1 font-sans">Referrer</p>
                          <p className="text-[10px] font-mono text-white/40 break-all">{log.referrer || '—'}</p>
                          <p className="text-[8px] uppercase tracking-widest text-white/20 mt-3 mb-1 font-sans">Full Timestamp</p>
                          <p className="text-[10px] font-mono text-gold/50">
                            {new Date(log.created_at).toISOString()}
                          </p>
                          <p className="text-[8px] uppercase tracking-widest text-white/20 mt-3 mb-1 font-sans">Log ID</p>
                          <p className="text-[10px] font-mono text-white/30">#{log.id}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-white/40 text-[10px] uppercase tracking-widest hover:text-white disabled:opacity-20 transition-all"
          >
            <ChevronLeft size={12} /> Prev
          </button>
          <div className="text-[10px] font-mono text-white/30 tracking-widest">
            Page {page} of {pages} — {total.toLocaleString()} entries
          </div>
          <button
            onClick={() => setPage(p => Math.min(pages, p + 1))}
            disabled={page === pages}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-white/40 text-[10px] uppercase tracking-widest hover:text-white disabled:opacity-20 transition-all"
          >
            Next <ChevronRight size={12} />
          </button>
        </div>
      )}
    </div>
  );
}
