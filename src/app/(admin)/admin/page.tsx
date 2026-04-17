'use client';

import { useEffect, useState } from 'react';
import { Image, Users, Grid3x3, Activity, Globe, MousePointer2, Clock, RefreshCcw } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import ProjectBoard from '@/components/admin/ProjectBoard';
import FootfallAnalytics from '@/components/admin/FootfallAnalytics';

interface Stats {
  images:       { total: number; active: number; inactive: number };
  users:        { total: number; admins: number; users: number; active_users: number };
  categories:   { total: number };
  recentImages: { id: number; path: string; title: string; category: string }[];
  visits:       number;
  activePages:  { path: string; count: number }[];
  activePages7d: { path: string; count: number }[];
  recentActivity: { path: string; created_at: string; user_agent: string }[];
}

const getStatus = (count: number) => {
  if (count > 50) return { label: 'High', color: 'text-green-400' };
  if (count > 10) return { label: 'Med', color: 'text-gold' };
  return { label: 'Low', color: 'text-white/30' };
};

export default function AdminDashboard() {
  const [stats, setStats]     = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);

  const fetchStats = () => {
    setLoading(true);
    fetch('/api/stats')
      .then(r => r.json())
      .then(data => { setStats(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleReset = async () => {
    if (!confirm('Are you sure you want to MASTER RESET the visit counter? This will wipe all historical traffic data.')) return;
    setResetting(true);
    try {
      const res = await fetch('/api/admin/reset-stats', { method: 'POST' });
      if (res.ok) {
        alert('Epicenter Counter Reset Successful.');
        fetchStats();
      } else {
        const d = await res.json();
        alert('Failed: ' + (d.error || 'Unknown error'));
      }
    } catch (e) {
      alert('Error resetting counter.');
    } finally {
      setResetting(false);
    }
  };

  const CARDS = stats ? [
    { icon: Image,    label: 'Gallery Assets',  value: stats.images?.total || 0,     sub: `${stats.images?.active || 0} live`,   color: '#C9A052', href: '/admin/gallery' },
    { icon: Globe,    label: 'Total Visits',    value: stats.visits || 0,           sub: 'Across all entry points',      color: '#48CAE4', href: '#' },
    { icon: Grid3x3,  label: 'Categories',      value: stats.categories?.total || 0, sub: 'Interactive segments',         color: '#7B2FBE', href: '/admin/gallery' },
    { icon: Users,    label: 'Verified Users',  value: stats.users?.total || 0,      sub: `${stats.users?.admins || 0} admin(s)`, color: '#2EC4B6', href: '/admin/users' },
  ] : [];

  return (
    <div className="space-y-10 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="font-display text-4xl text-white mb-2">Epicenter <span className="text-gold-gradient">Command.</span></h1>
          <p className="text-white/30 text-xs font-sans tracking-[0.2em] uppercase">The Dubai Mall — Epicenter Intelligence</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleReset}
            disabled={resetting}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] uppercase tracking-widest font-bold hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
          >
            <RefreshCcw size={14} className={resetting ? 'animate-spin' : ''} />
            Master Reset
          </button>
          <div className="flex items-center gap-3 px-4 py-2 bg-green-500/5 border border-green-500/20 rounded-full">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] text-green-500 font-mono tracking-widest uppercase">System_Active</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-card rounded-sm p-6 animate-pulse h-28" />
          ))}
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {CARDS.map((c, i) => (
              <Link key={i} href={c.href}
                className="glass-card rounded-sm p-6 gold-hover block border-gold/10"
              >
                <c.icon size={18} className="mb-4" style={{ color: c.color }} />
                <div className="font-display text-3xl text-white mb-1">{c.value.toLocaleString()}</div>
                <div className="text-[10px] tracking-widest uppercase text-white/40 font-sans mb-1">{c.label}</div>
                <div className="text-[10px] text-white/20 font-sans italic">{c.sub}</div>
              </Link>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Live Traffic */}
            <div className="lg:col-span-2 glass-card p-8 border-white/5 space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                  <Activity size={18} className="text-gold" />
                  <h2 className="text-sm font-sans uppercase tracking-[0.3em] text-white/60">Traffic Epicenter</h2>
                </div>
                <div className="text-[9px] tracking-widest uppercase text-white/20 font-sans">
                  Live Analytics (24h / 7d)
                </div>
              </div>
              <div className="space-y-4">
                {stats?.activePages.map((page, i) => {
                  const p7d = stats.activePages7d.find(p => p.path === page.path)?.count || page.count;
                  const status = getStatus(page.count);
                  return (
                    <div key={i} className="flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-mono text-white/40 group-hover:text-gold transition-colors">
                          {i + 1}
                        </div>
                        <div>
                          <div className="text-sm font-mono text-white/50 group-hover:text-white transition-colors">{page.path}</div>
                          <div className={`text-[8px] uppercase tracking-widest font-bold ${status.color}`}>Status: {status.label}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="text-xs font-bold text-gold">{page.count} <span className="text-[9px] font-normal text-white/20 uppercase ml-0.5">24h</span></div>
                          <div className="text-[10px] text-white/30">{p7d} <span className="text-[8px] uppercase ml-0.5">7d</span></div>
                        </div>
                        <div className="h-1 w-16 bg-white/5 rounded-full overflow-hidden hidden sm:block">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(page.count / (stats.activePages[0]?.count || 1)) * 100}%` }}
                            className="h-full bg-gold/40"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Activity Stream */}
            <div className="glass-card p-8 border-white/5 space-y-6">
              <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <MousePointer2 size={18} className="text-[#48CAE4]" />
                <h2 className="text-sm font-sans uppercase tracking-[0.3em] text-white/60">Activity Stream</h2>
              </div>
              <div className="space-y-6">
                {stats?.recentActivity.map((act, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                       <div className="w-1.5 h-1.5 rounded-full bg-gold/40" />
                       <div className="flex-1 w-px bg-white/5 my-1" />
                    </div>
                    <div>
                      <div className="text-xs text-white/80 font-sans">{act.path}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock size={10} className="text-white/20" />
                        <span className="text-[9px] text-white/20 uppercase tracking-tighter">
                          {new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Epicenter Intelligence: Footfall & Projects */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="glass-card p-8 border-gold/10">
               <FootfallAnalytics />
            </div>
            <div className="glass-card p-8 border-gold/10">
               <ProjectBoard />
            </div>
          </div>

          {/* Recent Images (Gallery View) */}
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
               <div className="flex items-center gap-3">
                 <Image size={18} className="text-gold" />
                 <h2 className="text-sm font-sans uppercase tracking-[0.3em] text-white/60">Recent Narratives</h2>
               </div>
               <Link href="/admin/gallery" className="text-[9px] tracking-[0.3em] uppercase text-gold hover:text-white transition-colors">
                 Manage Epicenter →
               </Link>
            </div>
            <div className="grid grid-cols-3 lg:grid-cols-6 gap-4">
              {stats?.recentImages.map(img => (
                <div key={img.id} className="aspect-[4/5] rounded-sm overflow-hidden border border-white/5 relative group cursor-pointer">
                  <img
                    src={img.path}
                    alt={img.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                    <p className="text-[10px] text-gold font-display truncate mb-1">{img.title}</p>
                    <p className="text-[8px] text-white/40 uppercase tracking-widest">{img.category}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
