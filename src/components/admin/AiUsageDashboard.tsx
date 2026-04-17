'use client';
import { useState, useEffect } from 'react';
import { Activity, Zap, AlertCircle, Database, Server } from 'lucide-react';
import { motion } from 'framer-motion';

interface UsageHourly {
  hour_start: string;
  provider: 'gemini';
  calls_success: number;
  calls_failed: number;
  total_tokens: number;
}

interface UsageSummary {
  provider: 'gemini';
  total_calls: number;
  total_tokens: number;
}

interface DashboardData {
  hourly: UsageHourly[];
  summaries: UsageSummary[];
  today: {
    gemini: { calls: number; tokens: number };
  };
}

const UI = {
  gemini: { bg: 'bg-[#48CAE4]/10', border: 'border-[#48CAE4]/30', text: 'text-[#48CAE4]', bar: 'bg-[#48CAE4]' },
};

export default function AiUsageDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/ai-usage')
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(d.error);
        else setData(d);
        setLoading(false);
      })
      .catch(e => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="flex items-center gap-3 p-6 text-white/50 font-sans border border-white/5 bg-[#0a0a0a]">
      <Activity className="animate-pulse" size={16}/> <span>Syncing neural telemetry...</span>
    </div>
  );

  if (error) return (
    <div className="p-6 bg-red-950/20 border border-red-900/30 text-red-400 font-sans text-sm flex items-center gap-3">
      <AlertCircle size={16}/> {error}
    </div>
  );

  // Generate 24h timeline
  const now = new Date();
  now.setMinutes(0, 0, 0);
  const timeline = Array.from({ length: 24 }, (_, i) => {
    const d = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000);
    const h = d.toISOString().slice(0, 13).replace('T', ' ') + ':00:00';
    return h;
  });

  const last24h = timeline.map(h => {
    if (!data) return { hour: h, geminiTokens: 0, geminiCalls: 0 };
    const gem = data.hourly.find(r => r.provider === 'gemini' && r.hour_start.startsWith(h.slice(0, 13)));
    return {
      hour: new Date(h).getHours() + ':00',
      geminiTokens: gem?.total_tokens ?? 0,
      geminiCalls:  (gem?.calls_success ?? 0) + (gem?.calls_failed ?? 0),
    };
  });

  const maxTokens = Math.max(...last24h.map(h => h.geminiTokens), 1);

  const totalGeminiTokens = data?.summaries.find(s => s.provider === 'gemini')?.total_tokens || 0;
  const totalGeminiCalls  = data?.summaries.find(s => s.provider === 'gemini')?.total_calls || 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end border-b border-white/5 pb-4">
        <div>
          <h2 className="text-xl font-display text-white mb-1 flex items-center gap-2">
            <Server size={18} className="text-[#48CAE4]"/> Neural Core Telemetry
          </h2>
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/30 font-sans">
            Gemini (primary)
          </p>
        </div>
        <div className="flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-[#48CAE4] animate-pulse"/>
           <span className="text-[9px] uppercase tracking-widest text-[#48CAE4]/80 font-mono">Systems Nominal</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Total Lifetime */}
        <div className="p-5 border border-white/5 bg-white/[0.02] relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Database size={40}/></div>
          <div className="text-[9px] uppercase tracking-widest text-white/30 font-sans mb-4">Lifetime Processing</div>
          <div className="flex items-end gap-3 mb-1">
             <span className="font-display text-3xl text-white">{(totalGeminiTokens / 1000).toFixed(1)}k</span>
             <span className="text-[10px] tracking-widest text-[#48CAE4] font-mono mb-1.5 uppercase">Tokens</span>
          </div>
          <div className="text-xs text-white/40 font-sans">{totalGeminiCalls.toLocaleString()} API Transactions</div>
        </div>

        {/* Today */}
        <div className="p-5 border border-[#48CAE4]/20 bg-[#48CAE4]/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Zap size={40}/></div>
          <div className="text-[9px] uppercase tracking-widest text-[#48CAE4]/50 font-sans mb-4">Today's Load</div>
          <div className="flex items-end gap-3 mb-1">
             <span className="font-display text-3xl text-white">{(data?.today.gemini.tokens || 0).toLocaleString()}</span>
             <span className="text-[10px] tracking-widest text-[#48CAE4] font-mono mb-1.5 uppercase">Tokens</span>
          </div>
          <div className="text-xs text-[#48CAE4]/60 font-sans">{(data?.today.gemini.calls || 0).toLocaleString()} API Transactions</div>
        </div>
      </div>

      {/* 24h Timeline Chart */}
      <div className="p-5 border border-white/5 bg-white/[0.01]">
        <div className="text-[9px] uppercase tracking-widest text-white/30 font-sans mb-8 flex justify-between">
          <span>24-Hour Token Volume (Primary Node)</span>
          <span className="text-[#48CAE4]">Max: {maxTokens.toLocaleString()}</span>
        </div>
        
        <div className="flex items-end gap-1 h-32 w-full pt-4">
          {last24h.map((h, i) => (
            <div key={i} className="flex-1 flex flex-col justify-end gap-0.5 group relative">
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[#0a0a0a] border border-white/10 p-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 whitespace-nowrap shadow-xl">
                 <div className="text-[9px] text-white/40 mb-1">{h.hour}</div>
                 <div className="text-[10px] font-mono">
                   <div className="text-[#48CAE4]">G: {h.geminiTokens}t/{h.geminiCalls}c</div>
                 </div>
              </div>
              
              {/* Gemini bar */}
              <div 
                className="w-full bg-[#48CAE4]/60 group-hover:bg-[#48CAE4] transition-colors rounded-sm"
                style={{ height: `${Math.round((h.geminiTokens / maxTokens) * 80)}px` }}
              />
            </div>
          ))}
        </div>
        
        {/* X-Axis labels */}
        <div className="flex justify-between mt-3 text-[8px] text-white/20 font-mono">
          <span>{last24h[0].hour}</span>
          <span>{last24h[12].hour}</span>
          <span>{last24h[23].hour} (Now)</span>
        </div>
      </div>
    </div>
  );
}
