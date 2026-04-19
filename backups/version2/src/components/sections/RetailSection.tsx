'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import AnimatedCounter from '@/components/ui/AnimatedCounter';
import { RETAIL_CATEGORIES } from '@/lib/data';
import {
  TrendingUp, ExternalLink, Lock, Crown, Star,
  ChevronDown, ChevronUp, BarChart2, ShoppingBag, Globe,
} from 'lucide-react';

interface Shop {
  id: number;
  fortune_rank: number;
  name: string;
  category: string;
  category_slug: string;
  description: string;
  website_url: string;
  floor_level: string;
  tier: number;
  is_featured: number;
  offline_rank: number;
  online_rank: number;
  annual_footfall_m: number;
  offline_revenue_m: number;
  online_revenue_m: number;
  yoy_growth: number;
}

interface Meta { role: string; limit: number; tierMax: number; total: number; }

const RETAIL_STATS = [
  { value: 1200, suffix: '+', label: 'Total Stores' },
  { value: 330,  suffix: '+', label: 'Fashion & Luxury Brands' },
  { value: 5.9,  suffix: 'M', label: 'Sq Ft of Retail', decimals: 1 },
  { value: 100,  suffix: 'M+', label: 'Annual Visitors' },
];

// Rank tier: gold=1-10, silver=11-25, bronze=26-50, standard=51+
function rankColor(rank: number) {
  if (rank <= 10)  return { text: 'text-[#FFD700]', border: 'border-[#FFD700]/40', bg: 'bg-[#FFD700]/8',  badge: 'bg-[#FFD700] text-black'  };
  if (rank <= 25)  return { text: 'text-[#C0C0C0]', border: 'border-[#C0C0C0]/30', bg: 'bg-[#C0C0C0]/5',  badge: 'bg-[#C0C0C0] text-black'  };
  if (rank <= 50)  return { text: 'text-[#CD7F32]', border: 'border-[#CD7F32]/30', bg: 'bg-[#CD7F32]/5',  badge: 'bg-[#CD7F32] text-black'  };
  return            { text: 'text-white/50',        border: 'border-white/8',       bg: 'bg-white/[0.02]', badge: 'bg-white/20 text-white/80' };
}

function tierLabel(tier: number, role: string) {
  if (tier === 1) return null;
  if (tier === 2) return { icon: <Star size={9}/>, label: 'Premium', color: 'text-amber-400' };
  return { icon: <Crown size={9}/>, label: 'Admin', color: 'text-[#48CAE4]' };
}

function fmt(n: number, unit = '') {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'B' + unit;
  return n.toFixed(n < 10 ? 1 : 0) + 'M' + unit;
}

export default function RetailSection({ onExploreLeasing }: { onExploreLeasing: () => void }) {
  const { data: session } = useSession();
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.05 });

  const [shops, setShops]         = useState<Shop[]>([]);
  const [meta, setMeta]           = useState<Meta | null>(null);
  const [loading, setLoading]     = useState(true);
  const [expanded, setExpanded]   = useState<number | null>(null);
  const [filterCat, setFilterCat] = useState('all');
  const [viewMode, setViewMode]   = useState<'rank' | 'grid'>('rank');
  const [showAll, setShowAll]     = useState(false);

  const role = (session?.user?.role as string) || 'guest';
  const isPremium = (session?.user as any)?.is_premium;
  const effectiveRole = role === 'admin' || role === 'manager' ? role : isPremium ? 'premium' : role;

  useEffect(() => {
    setLoading(true);
    fetch('/api/retail')
      .then(r => r.json())
      .then(d => { setShops(d.shops || []); setMeta(d.meta || null); setLoading(false); })
      .catch(() => { setShops([]); setMeta(null); setLoading(false); });
  }, []);

  const categories = ['all', ...Array.from(new Set(shops.map(s => s.category_slug).filter(Boolean)))];

  const filtered = shops.filter(s =>
    filterCat === 'all' || s.category_slug === filterCat
  );
  const visible = showAll ? filtered : filtered.slice(0, viewMode === 'rank' ? 20 : 12);

  const tierLimits = { guest: 20, user: 20, premium: 50, admin: 100, manager: 100 };
  const myLimit    = tierLimits[effectiveRole as keyof typeof tierLimits] ?? 20;

  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 32 },
    animate: inView ? { opacity: 1, y: 0 } : {},
    transition: { duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] },
  });

  return (
    <section id="retail" className="relative overflow-hidden">
      {/* BG */}
      <div className="absolute inset-0">
        <Image src="https://images.unsplash.com/photo-1555529902-5261145633bf?w=1920&q=70"
          alt="" fill className="object-cover opacity-8" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-[#050505]/90 to-[#050505]" />
      </div>

      <div ref={ref} className="relative z-10 w-full max-w-[1400px] mx-auto px-6 lg:px-10 py-20 lg:py-32">

        {/* Header */}
        <div className="text-center mb-16">
          <motion.div {...fadeUp(0)} className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px w-8 bg-gold/60" />
            <span className="text-[10px] tracking-[0.5em] uppercase font-sans text-gold">Fortune 100 Retail Index</span>
            <div className="h-px w-8 bg-gold/60" />
          </motion.div>
          <motion.h2 {...fadeUp(0.1)} className="font-display text-[clamp(2.5rem,6vw,5rem)] leading-tight text-white mb-4">
            1,200+ Stores.<br/><span className="text-gold-gradient">One Destination.</span>
          </motion.h2>
          <motion.p {...fadeUp(0.2)} className="text-white/40 text-base max-w-xl mx-auto">
            Ranked by combined online and offline footfall — the world's most valuable retail index under one roof.
          </motion.p>
        </div>

        {/* Stats */}
        <motion.div {...fadeUp(0.3)} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {RETAIL_STATS.map((s, i) => (
            <div key={i} className="glass-card p-6 text-center rounded-sm">
              <div className="font-display text-3xl text-gold-light mb-1">
                <AnimatedCounter value={s.value} suffix={s.suffix} decimals={s.decimals} />
              </div>
              <div className="text-[10px] tracking-widest uppercase text-white/40 font-sans">{s.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Access tier banner */}
        <motion.div {...fadeUp(0.35)} className="mb-8">
          <div className={`flex items-center justify-between p-4 border ${
            effectiveRole === 'admin' || effectiveRole === 'manager'
              ? 'border-[#48CAE4]/30 bg-[#48CAE4]/5'
              : effectiveRole === 'premium'
              ? 'border-amber-500/30 bg-amber-950/10'
              : 'border-white/8 bg-white/[0.02]'
          }`}>
            <div className="flex items-center gap-3">
              {(effectiveRole === 'admin' || effectiveRole === 'manager') && <Crown size={14} className="text-[#48CAE4]"/>}
              {effectiveRole === 'premium' && <Star size={14} className="text-amber-400"/>}
              {(effectiveRole === 'user' || effectiveRole === 'guest') && <ShoppingBag size={14} className="text-white/40"/>}
              <div>
                <span className="text-xs font-sans font-semibold text-white uppercase tracking-wider">
                  {effectiveRole === 'admin' || effectiveRole === 'manager'
                    ? 'Admin Access — Full Fortune 100'
                    : effectiveRole === 'premium'
                    ? 'Premium Access — Fortune 50'
                    : 'Standard Access — Fortune 20'}
                </span>
                <span className="text-white/30 text-[10px] font-sans ml-3">
                  Viewing {meta?.total || 0} of 100 ranked retailers
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* View toggle */}
              <button onClick={() => setViewMode('rank')}
                className={`p-2 border transition-colors text-[10px] ${viewMode==='rank'?'border-gold/40 text-gold':'border-white/10 text-white/30 hover:text-white'}`}>
                <BarChart2 size={12}/>
              </button>
              <button onClick={() => setViewMode('grid')}
                className={`p-2 border transition-colors text-[10px] ${viewMode==='grid'?'border-gold/40 text-gold':'border-white/10 text-white/30 hover:text-white'}`}>
                <ShoppingBag size={12}/>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Category filter pills */}
        <motion.div {...fadeUp(0.38)} className="flex gap-2 flex-wrap mb-8">
          {categories.slice(0, 10).map(cat => (
            <button key={cat} onClick={() => { setFilterCat(cat); setShowAll(false); }}
              className={`px-3 py-1.5 text-[10px] uppercase tracking-widest font-sans border transition-all ${
                filterCat === cat
                  ? 'border-gold/50 text-gold bg-gold/8'
                  : 'border-white/10 text-white/30 hover:text-white/60 hover:border-white/20'
              }`}>
              {cat === 'all' ? 'All' : cat}
            </button>
          ))}
        </motion.div>

        {/* Fortune 100 Ranked List */}
        {loading ? (
          <div className="space-y-2">
            {Array.from({length: 8}).map((_, i) => (
              <div key={i} className="h-16 bg-white/[0.03] border border-white/5 animate-pulse"/>
            ))}
          </div>
        ) : viewMode === 'rank' ? (
          <motion.div {...fadeUp(0.4)} className="space-y-1.5">
            {visible.map((shop, idx) => {
              const rc      = rankColor(shop.fortune_rank);
              const isOpen  = expanded === shop.id;
              const tLabel  = tierLabel(shop.tier, effectiveRole);
              const total   = shop.offline_revenue_m + shop.online_revenue_m;
              const onlinePct = total > 0 ? Math.round((shop.online_revenue_m / total) * 100) : 0;

              return (
                <motion.div key={shop.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.4 + idx * 0.025 }}>

                  {/* Row */}
                  <div
                    className={`border transition-all cursor-pointer ${rc.border} ${isOpen ? rc.bg : 'bg-transparent hover:bg-white/[0.02]'}`}
                    onClick={() => setExpanded(isOpen ? null : shop.id)}>
                    <div className="flex items-center gap-4 px-4 py-3">

                      {/* Rank badge */}
                      <div className={`w-10 h-10 flex items-center justify-center text-xs font-bold font-mono flex-shrink-0 ${rc.badge}`}>
                        {shop.fortune_rank <= 9 ? `0${shop.fortune_rank}` : shop.fortune_rank}
                      </div>

                      {/* Name + category */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`font-sans text-sm font-semibold ${shop.fortune_rank <= 10 ? 'text-white' : 'text-white/80'}`}>
                            {shop.name}
                          </span>
                          {tLabel && (
                            <span className={`flex items-center gap-0.5 text-[9px] uppercase tracking-wider ${tLabel.color}`}>
                              {tLabel.icon} {tLabel.label}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-white/30 font-sans">{shop.category} · {shop.floor_level}</div>
                      </div>

                      {/* Footfall */}
                      <div className="hidden md:block text-right flex-shrink-0 w-28">
                        <div className={`font-display text-sm ${rc.text}`}>{shop.annual_footfall_m.toFixed(1)}M</div>
                        <div className="text-[9px] text-white/25 font-sans">annual visitors</div>
                      </div>

                      {/* Revenue bar */}
                      <div className="hidden lg:block w-32 flex-shrink-0">
                        <div className="flex gap-0.5 h-5 items-end">
                          <div className="bg-[#48CAE4]/60 rounded-sm" title="Online"
                            style={{ width: `${onlinePct}%`, height: `${Math.max(4, onlinePct / 2)}px` }}/>
                          <div className="bg-gold/60 rounded-sm flex-1" title="Offline"
                            style={{ height: `${Math.max(4, (100 - onlinePct) / 2)}px` }}/>
                        </div>
                        <div className="flex justify-between text-[8px] text-white/20 font-mono mt-0.5">
                          <span>{onlinePct}% online</span>
                          <span>{100 - onlinePct}% offline</span>
                        </div>
                      </div>

                      {/* YoY growth */}
                      <div className="hidden md:flex items-center gap-1 flex-shrink-0 w-16">
                        <TrendingUp size={10} className={shop.yoy_growth >= 10 ? 'text-green-400' : 'text-white/30'}/>
                        <span className={`text-xs font-mono ${shop.yoy_growth >= 10 ? 'text-green-400' : 'text-white/40'}`}>
                          +{shop.yoy_growth.toFixed(1)}%
                        </span>
                      </div>

                      {/* Visit link */}
                      {shop.website_url && (
                        <a href={shop.website_url} target="_blank" rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="flex-shrink-0 p-2 border border-white/10 hover:border-gold/40 hover:text-gold text-white/30 transition-colors">
                          <ExternalLink size={12}/>
                        </a>
                      )}

                      <ChevronDown size={12} className={`text-white/20 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}/>
                    </div>
                  </div>

                  {/* Expanded detail */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden">
                        <div className={`px-6 py-5 border-x border-b ${rc.border} bg-[#060608]`}>
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Description */}
                            <div className="lg:col-span-2">
                              <p className="text-white/55 text-sm font-sans leading-relaxed">{shop.description}</p>
                              <div className="flex items-center gap-3 mt-4">
                                <a href={shop.website_url} target="_blank" rel="noopener noreferrer"
                                  className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-sans border border-gold/30 text-gold/70 hover:text-gold hover:border-gold px-3 py-1.5 transition-colors">
                                  <Globe size={10}/> Visit Store
                                </a>
                                <span className="text-[10px] text-white/20 font-sans">{shop.floor_level}</span>
                              </div>
                            </div>

                            {/* Metrics */}
                            <div className="grid grid-cols-2 gap-3 text-center">
                              <div className="p-3 border border-white/5 bg-white/[0.02]">
                                <div className="font-display text-lg text-gold">{shop.fortune_rank}</div>
                                <div className="text-[9px] uppercase tracking-widest text-white/25 font-sans">Fortune Rank</div>
                              </div>
                              <div className="p-3 border border-white/5 bg-white/[0.02]">
                                <div className="font-display text-lg text-[#48CAE4]">#{shop.online_rank}</div>
                                <div className="text-[9px] uppercase tracking-widest text-white/25 font-sans">Online Rank</div>
                              </div>
                              <div className="p-3 border border-white/5 bg-white/[0.02]">
                                <div className="font-display text-lg text-gold">{fmt(shop.offline_revenue_m, '')}</div>
                                <div className="text-[9px] uppercase tracking-widest text-white/25 font-sans">Offline Rev AED</div>
                              </div>
                              <div className="p-3 border border-[#48CAE4]/20 bg-[#48CAE4]/5">
                                <div className="font-display text-lg text-[#48CAE4]">{fmt(shop.online_revenue_m, '')}</div>
                                <div className="text-[9px] uppercase tracking-widest text-white/25 font-sans">Online Rev AED</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}

            {/* Show more / lock */}
            {!showAll && filtered.length > visible.length && (
              <div className="pt-4 text-center">
                <button onClick={() => setShowAll(true)}
                  className="flex items-center gap-2 mx-auto text-xs uppercase tracking-widest font-sans border border-white/10 text-white/40 hover:text-white hover:border-white/30 px-5 py-2.5 transition-colors">
                  <ChevronDown size={12}/> Show all {filtered.length} results
                </button>
              </div>
            )}

            {/* Upgrade prompt for locked tiers */}
            {meta && meta.total < 100 && (
              <div className="mt-4 p-5 border border-white/8 bg-white/[0.02] text-center">
                <Lock size={16} className="text-white/20 mx-auto mb-3"/>
                <p className="text-white/40 text-sm font-sans mb-1">
                  {meta.tierMax === 1
                    ? `Upgrade to Premium to unlock Fortune 21–50 · Admin to see all 100`
                    : `Upgrade to Admin to unlock Fortune 51–100`}
                </p>
                <p className="text-white/20 text-xs font-sans">{100 - meta.total} more retailers await</p>
              </div>
            )}
          </motion.div>

        ) : (
          /* Grid mode */
          <motion.div {...fadeUp(0.4)} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {visible.map((shop, idx) => {
              const rc = rankColor(shop.fortune_rank);
              return (
                <motion.a key={shop.id}
                  href={shop.website_url || '#'}
                  target="_blank" rel="noopener noreferrer"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={inView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.4, delay: idx * 0.03 }}
                  className={`border p-4 group hover:${rc.bg} transition-all ${rc.border} hover:${rc.border}`}>
                  <div className={`text-[9px] font-mono mb-2 ${rc.text}`}>#{shop.fortune_rank}</div>
                  <div className="text-white/80 text-sm font-sans font-semibold mb-1 group-hover:text-white transition-colors">
                    {shop.name}
                  </div>
                  <div className="text-white/25 text-[10px] font-sans">{shop.category}</div>
                  <div className="flex items-center gap-1 mt-3 text-[9px] font-sans text-white/20">
                    <TrendingUp size={8}/>
                    <span>+{shop.yoy_growth.toFixed(1)}% YoY</span>
                    <span className="ml-auto flex items-center gap-0.5">
                      <ExternalLink size={8}/> Visit
                    </span>
                  </div>
                </motion.a>
              );
            })}
          </motion.div>
        )}

        {/* Marquee — all brand names */}
        <motion.div {...fadeUp(0.7)} className="mt-16 mb-12">
          <div className="text-center mb-4">
            <span className="text-[10px] tracking-widest uppercase text-white/20 font-sans">All Fortune 100 Tenants</span>
          </div>
          <div className="marquee-container py-4 border-y border-gold/8">
            <div className="marquee-track">
              {[...shops, ...shops].map((s, i) => (
                <span key={i} className="mx-8 text-[10px] tracking-widest uppercase text-white/25 hover:text-gold transition-colors font-sans cursor-default">
                  {s.name}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div {...fadeUp(0.8)} className="text-center">
          <button onClick={onExploreLeasing} className="btn-outline">
            Explore Leasing Opportunities →
          </button>
        </motion.div>
      </div>
    </section>
  );
}
