'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye, EyeOff, Star, StarOff, Trash2, RefreshCcw,
  Check, AlertTriangle, UploadCloud, X, ChevronDown,
  Copy, Layers, ShieldCheck, LayoutGrid, List,
  ArrowRight, ArrowLeft, Loader2, Search,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
interface Img {
  id: number; path: string; title: string; filename?: string;
  emotional_hook: string; shift_style: string;
  active: number; featured: number; sort_order?: number;
  media_type: 'image' | 'video'; category_name: string;
}
interface DupGroup { hash: string; count: number; images: Img[]; }
interface DedupSummary {
  total: number; onDisk: number; orphaned: number; ignored: number;
  uniqueFiles: number; duplicateFiles: number; extraCopies: number;
}

const SITE_MIN = 10;
const SITE_MAX = 50;

// ─────────────────────────────────────────────────────────────
export default function GalleryToolsPage() {
  const [tab, setTab] = useState<'curate' | 'dedup' | 'tools'>('curate');

  return (
    <div className="min-h-screen p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl text-white">Gallery Tool Kit</h1>
        <p className="text-white/30 text-sm font-sans mt-1">Curate · Deduplicate · Manage</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/5">
        {([
          { key: 'curate', label: 'Site Curation', desc: '10–50 image limit' },
          { key: 'dedup',  label: 'Dedup Scanner',  desc: 'Remove duplicates' },
          { key: 'tools',  label: 'Quick Tools',    desc: 'Bulk actions'      },
        ] as const).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-5 py-3 text-xs font-sans uppercase tracking-widest border-b-2 transition-all ${
              tab === t.key
                ? 'border-gold text-gold'
                : 'border-transparent text-white/30 hover:text-white/60'
            }`}>
            {t.label}
            <span className="ml-2 text-[9px] text-white/20 normal-case tracking-normal">{t.desc}</span>
          </button>
        ))}
      </div>

      {tab === 'curate' && <CurateTab />}
      {tab === 'dedup'  && <DedupTab />}
      {tab === 'tools'  && <QuickToolsTab />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TAB 1: Site Curation (10-50 limit)
// ─────────────────────────────────────────────────────────────
function CurateTab() {
  const [published, setPublished] = useState<Img[]>([]);
  const [library, setLibrary]     = useState<Img[]>([]);
  const [loading, setLoading]     = useState(true);
  const [selPub, setSelPub]       = useState<Set<number>>(new Set());
  const [selLib, setSelLib]       = useState<Set<number>>(new Set());
  const [busy, setBusy]           = useState(false);
  const [toast, setToast]         = useState('');
  const [search, setSearch]       = useState('');

  const showToast = (msg: string, err = false) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const fetchData = useCallback(() => {
    setLoading(true);
    fetch('/api/admin/gallery-tools/curate')
      .then(r => r.json())
      .then(d => { setPublished(d.published || []); setLibrary(d.library || []); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const togglePub = (id: number) => setSelPub(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleLib = (id: number) => setSelLib(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const doPublish = async () => {
    if (!selLib.size) return;
    setBusy(true);
    const res = await fetch('/api/admin/gallery-tools/curate', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publish: [...selLib] }),
    });
    const d = await res.json();
    if (!res.ok) { showToast(d.error, true); setBusy(false); return; }
    setSelLib(new Set());
    showToast(`✓ ${selLib.size} image(s) published to site`);
    fetchData(); setBusy(false);
  };

  const doUnpublish = async () => {
    if (!selPub.size) return;
    setBusy(true);
    const res = await fetch('/api/admin/gallery-tools/curate', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ unpublish: [...selPub] }),
    });
    const d = await res.json();
    if (!res.ok) { showToast(d.error, true); setBusy(false); return; }
    setSelPub(new Set());
    showToast(`✓ ${selPub.size} image(s) moved to library`);
    fetchData(); setBusy(false);
  };

  const count     = published.length;
  const pct       = Math.round((count / SITE_MAX) * 100);
  const isOk      = count >= SITE_MIN && count <= SITE_MAX;
  const isTooMany = count > SITE_MAX;
  const isTooFew  = count < SITE_MIN;

  const filteredLib = library.filter(i =>
    !search || i.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`fixed top-5 right-5 z-50 border px-4 py-3 text-xs font-sans flex items-center gap-2 ${
              toast.startsWith('✓') ? 'bg-black border-green-500/30 text-green-400' : 'bg-black border-red-500/30 text-red-400'
            }`}>
            {toast.startsWith('✓') ? <Check size={12}/> : <AlertTriangle size={12}/>} {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Limit meter */}
      <div className={`p-4 border rounded-sm ${isTooMany ? 'border-red-500/40 bg-red-950/10' : isTooFew ? 'border-amber-500/30 bg-amber-950/10' : 'border-green-500/20 bg-green-950/10'}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className={isOk ? 'text-green-400' : 'text-amber-400'}/>
            <span className="text-xs font-sans text-white/60">Site Gallery Limit</span>
          </div>
          <span className={`text-sm font-bold font-display ${isTooMany ? 'text-red-400' : isTooFew ? 'text-amber-400' : 'text-green-400'}`}>
            {count} / {SITE_MAX}
          </span>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-2">
          <div className={`h-full rounded-full transition-all duration-500 ${isTooMany ? 'bg-red-500' : isTooFew ? 'bg-amber-500' : 'bg-green-500'}`}
            style={{ width: `${Math.min(100, pct)}%` }}/>
        </div>
        <p className="text-[10px] font-sans text-white/25">
          {isTooMany && `⚠ Over limit by ${count - SITE_MAX} — unpublish some images`}
          {isTooFew  && `⚠ Below minimum ${SITE_MIN} — publish at least ${SITE_MIN - count} more`}
          {isOk      && `✓ Gallery is healthy — ${SITE_MIN} min · ${SITE_MAX} max`}
        </p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-16 justify-center text-white/20 font-sans text-sm">
          <Loader2 size={14} className="animate-spin"/> Loading gallery…
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Published column */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-sans uppercase tracking-widest text-green-400 flex items-center gap-2">
                <Eye size={12}/> Live on Site ({count})
              </h3>
              {selPub.size > 0 && (
                <button onClick={doUnpublish} disabled={busy}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-white/20 text-white/50 hover:text-white text-[10px] uppercase tracking-wider font-sans transition-colors disabled:opacity-40">
                  <ArrowRight size={10}/> Move {selPub.size} to Library
                </button>
              )}
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 max-h-[60vh] overflow-y-auto pr-1">
              {published.map(img => {
                const sel = selPub.has(img.id);
                return (
                  <div key={img.id} onClick={() => togglePub(img.id)}
                    className={`relative cursor-pointer border transition-all ${sel ? 'border-gold ring-1 ring-gold/40' : 'border-white/10 hover:border-white/30'}`}>
                    <img src={img.path} alt={img.title} className="w-full aspect-square object-cover"/>
                    {sel && (
                      <div className="absolute inset-0 bg-gold/20 flex items-center justify-center">
                        <div className="w-5 h-5 bg-gold flex items-center justify-center">
                          <Check size={10} className="text-black"/>
                        </div>
                      </div>
                    )}
                    {img.featured === 1 && !sel && (
                      <div className="absolute top-1 left-1 w-3 h-3 bg-amber-500 flex items-center justify-center">
                        <Star size={6} className="fill-black text-black"/>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/80 px-1.5 py-1 opacity-0 hover:opacity-100 transition-opacity">
                      <p className="text-[8px] text-white/60 font-sans truncate">{img.title}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Library column */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-sans uppercase tracking-widest text-white/40 flex items-center gap-2">
                <EyeOff size={12}/> Library ({library.length})
              </h3>
              {selLib.size > 0 && (
                <button onClick={doPublish} disabled={busy || (count + selLib.size) > SITE_MAX}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-green-700/40 text-green-400 hover:bg-green-950/40 text-[10px] uppercase tracking-wider font-sans transition-colors disabled:opacity-40">
                  <ArrowLeft size={10}/> Publish {selLib.size} to Site
                </button>
              )}
            </div>

            <div className="relative">
              <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/20"/>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search library…"
                className="w-full bg-white/3 border border-white/8 text-white/60 text-xs pl-7 pr-3 py-1.5 focus:outline-none focus:border-white/20 font-sans"/>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 max-h-[55vh] overflow-y-auto pr-1">
              {filteredLib.map(img => {
                const sel = selLib.has(img.id);
                const wouldExceed = !sel && (count + selLib.size + 1) > SITE_MAX;
                return (
                  <div key={img.id} onClick={() => !wouldExceed && toggleLib(img.id)}
                    className={`relative border transition-all ${
                      wouldExceed ? 'opacity-30 cursor-not-allowed border-white/5'
                      : sel ? 'border-green-500 ring-1 ring-green-500/40 cursor-pointer'
                      : 'border-white/10 hover:border-white/30 cursor-pointer'
                    }`}>
                    <img src={img.path} alt={img.title} className="w-full aspect-square object-cover"/>
                    {sel && (
                      <div className="absolute inset-0 bg-green-900/30 flex items-center justify-center">
                        <div className="w-5 h-5 bg-green-500 flex items-center justify-center">
                          <Check size={10} className="text-black"/>
                        </div>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/80 px-1.5 py-1 opacity-0 hover:opacity-100 transition-opacity">
                      <p className="text-[8px] text-white/60 font-sans truncate">{img.title}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TAB 2: Dedup Scanner
// ─────────────────────────────────────────────────────────────
function DedupTab() {
  const [scanning, setScanning]   = useState(false);
  const [summary, setSummary]     = useState<DedupSummary | null>(null);
  const [groups, setGroups]       = useState<DupGroup[]>([]);
  const [orphans, setOrphans]     = useState<Img[]>([]);
  const [keepMap, setKeepMap]     = useState<Record<string, number>>({}); // hash→keepId
  const [ignore, setIgnore]       = useState(''); // folder1, folder2
  const [removing, setRemoving]   = useState(false);
  const [cleaningOrphans, setCleaningOrphans] = useState(false);
  const [toast, setToast]         = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  const scan = async () => {
    setScanning(true);
    setSummary(null); setGroups([]); setOrphans([]); setKeepMap({});
    const r = await fetch(`/api/admin/gallery-tools/dedup?ignore=${encodeURIComponent(ignore)}`);
    const d = await r.json();
    setSummary(d.summary);
    setGroups(d.duplicateGroups || []);
    setOrphans(d.orphans || []);
    // Default keep = first image per group
    const km: Record<string, number> = {};
    (d.duplicateGroups || []).forEach((g: DupGroup) => { km[g.hash] = g.images[0].id; });
    setKeepMap(km);
    setScanning(false);
  };

  const removeAllDups = async () => {
    if (!groups.length) return;
    if (!confirm(`Remove ${summary?.extraCopies} duplicate copies? The selected "keep" image in each group will be preserved.`)) return;
    setRemoving(true);

    const allDeleteIds: number[] = [];
    for (const g of groups) {
      const keepId = keepMap[g.hash] ?? g.images[0].id;
      g.images.forEach(img => { if (img.id !== keepId) allDeleteIds.push(img.id); });
    }

    const r = await fetch('/api/admin/gallery-tools/dedup', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keepIds: Object.values(keepMap), deleteIds: allDeleteIds }),
    });
    const d = await r.json();
    showToast(`✓ Removed ${d.dbRemoved} duplicate records, ${d.filesDeleted} files deleted`);
    setGroups([]); setSummary(s => s ? { ...s, extraCopies: 0, duplicateFiles: 0 } : s);
    setRemoving(false);
  };

  const cleanOrphans = async () => {
    if (!orphans.length) return;
    setCleaningOrphans(true);
    const r = await fetch('/api/admin/gallery-tools/dedup', { method: 'DELETE' });
    const d = await r.json();
    showToast(`✓ Removed ${d.removed} orphaned DB records`);
    setOrphans([]);
    setCleaningOrphans(false);
  };

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="fixed top-5 right-5 z-50 bg-black border border-green-500/30 text-green-400 text-xs font-sans px-4 py-3 flex items-center gap-2">
            <Check size={12}/> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scan button */}
      <div className="flex flex-col gap-4 p-5 border border-white/5 bg-white/2">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <p className="text-white text-sm font-sans font-medium">Scan for Duplicate Images</p>
            <p className="text-white/30 text-xs font-sans mt-0.5">Computes SHA-256 hash of each file on disk to find exact duplicates.</p>
          </div>
          <button onClick={scan} disabled={scanning}
            className="flex items-center gap-2 px-5 py-2.5 bg-gold text-black text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-50">
            {scanning ? <><Loader2 size={12} className="animate-spin"/> Scanning…</> : <><Layers size={12}/> Scan Now</>}
          </button>
        </div>

        {/* Ignore folders input */}
        <div className="flex items-center gap-3 border-t border-white/5 pt-4">
          <label className="text-[10px] text-white/40 uppercase tracking-wider font-sans">Ignore Folders:</label>
          <input 
            type="text" 
            value={ignore} 
            onChange={e => setIgnore(e.target.value)}
            placeholder="e.g. thumbnails, temp, avatars"
            className="bg-white/5 border border-white/10 text-white/70 text-xs px-3 py-2 flex-1 focus:outline-none focus:border-gold/30 font-sans"
          />
        </div>
      </div>

      {summary && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { label: 'Files on Disk', val: summary.onDisk,        col: 'text-white/60' },
              { label: 'Ignored',       val: summary.ignored,       col: 'text-white/30' },
              { label: 'Unique Files',  val: summary.uniqueFiles,   col: 'text-green-400' },
              { label: 'Dup Groups',    val: summary.duplicateFiles, col: 'text-amber-400' },
              { label: 'Extra Copies',  val: summary.extraCopies,   col: 'text-red-400' },
            ].map(s => (
              <div key={s.label} className="border border-white/5 p-4 text-center">
                <div className={`text-3xl font-display ${s.col}`}>{s.val}</div>
                <div className="text-[10px] text-white/25 font-sans uppercase tracking-widest mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Orphan cleaner */}
          {orphans.length > 0 && (
            <div className="flex items-center justify-between p-4 border border-amber-500/20 bg-amber-950/10">
              <div>
                <p className="text-amber-400 text-sm font-sans font-medium flex items-center gap-2">
                  <AlertTriangle size={14}/> {orphans.length} Orphaned DB Records
                </p>
                <p className="text-white/30 text-xs font-sans mt-0.5">These images exist in the database but files are missing from disk.</p>
              </div>
              <button onClick={cleanOrphans} disabled={cleaningOrphans}
                className="flex items-center gap-2 px-4 py-2 border border-amber-500/30 text-amber-400 hover:bg-amber-950/40 text-xs font-sans uppercase tracking-widest transition-colors disabled:opacity-40">
                {cleaningOrphans ? <Loader2 size={11} className="animate-spin"/> : <Trash2 size={11}/>}
                Clean {orphans.length} Orphans
              </button>
            </div>
          )}

          {/* Duplicate groups */}
          {groups.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-sans uppercase tracking-widest text-white/50">
                  Duplicate Groups — {groups.length} groups, {summary.extraCopies} extra copies
                </h3>
                <button onClick={removeAllDups} disabled={removing}
                  className="flex items-center gap-2 px-5 py-2 bg-red-900/40 border border-red-700/40 text-red-400 hover:bg-red-900/60 text-xs font-sans uppercase tracking-widest transition-colors disabled:opacity-40">
                  {removing ? <Loader2 size={11} className="animate-spin"/> : <Trash2 size={11}/>}
                  Remove All Duplicates ({summary.extraCopies})
                </button>
              </div>

              <p className="text-[10px] text-white/25 font-sans">Click an image in each group to mark it as the one to <span className="text-green-400">keep</span>. All others will be deleted.</p>

              <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-1">
                {groups.map(g => {
                  const keepId = keepMap[g.hash] ?? g.images[0].id;
                  return (
                    <div key={g.hash} className="border border-white/5 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Copy size={12} className="text-amber-400"/>
                        <span className="text-[10px] text-white/40 font-sans">{g.count} identical copies</span>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {g.images.map(img => {
                          const isKeep = img.id === keepId;
                          return (
                            <div key={img.id} onClick={() => setKeepMap(m => ({ ...m, [g.hash]: img.id }))}
                              className={`relative w-20 h-20 cursor-pointer border-2 transition-all ${
                                isKeep ? 'border-green-400' : 'border-red-500/40 opacity-60 hover:opacity-90'
                              }`}>
                              <img src={img.path} alt="" className="w-full h-full object-cover"/>
                              <div className={`absolute inset-0 flex items-center justify-center text-[9px] font-bold font-sans ${
                                isKeep ? 'bg-green-900/60 text-green-300' : 'bg-red-900/50 text-red-300'
                              }`}>
                                {isKeep ? 'KEEP' : 'DEL'}
                              </div>
                              {img.active === 1 && (
                                <div className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-green-400"/>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center border border-green-500/10 bg-green-950/5">
              <Check size={24} className="text-green-400 mx-auto mb-2"/>
              <p className="text-green-400 text-sm font-sans">No duplicate images found</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TAB 3: Quick Tools (Bulk show/hide/feature)
// ─────────────────────────────────────────────────────────────
function QuickToolsTab() {
  const [items, setItems]     = useState<Img[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView]       = useState('all');
  const [category, setCategory] = useState('all');
  const [categories, setCategories] = useState<{ id: number; name: string; slug: string; count: number }[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [busy, setBusy]       = useState(false);
  const [toast, setToast]     = useState('');
  const [search, setSearch]   = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadCat, setUploadCat] = useState(9);
  const [uploading, setUploading] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadProg, setUploadProg] = useState<Record<string, 'pending'|'done'|'error'|'dup'|'checking'>>({});
  const [dupResults, setDupResults] = useState<Record<string, { isDuplicate: boolean; method: string; matchTitle?: string; tokensUsed: number }>>({});
  const [checking, setChecking] = useState(false);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const fetchData = useCallback(() => {
    setLoading(true);
    fetch(`/api/admin/gallery-tools?view=${view}&category=${category}`)
      .then(r => r.json())
      .then(d => { setItems(d.images || []); setCategories(d.categories || []); })
      .finally(() => setLoading(false));
  }, [view, category]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = items.filter(i =>
    !search || i.title?.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSel = (id: number) => setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const selectAll = () => setSelected(new Set(filtered.map(i => i.id)));
  const clearSel  = () => setSelected(new Set());

  const bulkAction = async (action: string) => {
    if (!selected.size) return;
    if (action === 'delete' && !confirm(`Delete ${selected.size} image(s)?`)) return;
    setBusy(true);
    await fetch('/api/admin/gallery-tools/bulk', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: [...selected], action }),
    });
    clearSel(); showToast(`✓ ${action} → ${selected.size} images`); fetchData(); setBusy(false);
  };

  const quickToggle = async (item: Img, field: 'active' | 'featured') => {
    await fetch('/api/admin/gallery-tools', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: item.id, [field]: item[field] === 1 ? 0 : 1 }),
    });
    setItems(p => p.map(i => i.id === item.id ? { ...i, [field]: item[field] === 1 ? 0 : 1 } : i));
  };

  const addUploadFiles = (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files).filter(f => /image\/|video\//i.test(f.type)).slice(0, 20);
    setUploadFiles(arr);
    const prog: Record<string, 'pending'|'done'|'error'|'dup'|'checking'> = {};
    arr.forEach(f => { prog[f.name] = 'pending'; });
    setUploadProg(prog);
    setDupResults({});
  };

  // Check all pending files for duplicates (SHA-256 + Claude 2-token visual check)
  const checkDuplicates = async () => {
    if (!uploadFiles.length) return;
    setChecking(true);
    for (const file of uploadFiles) {
      if (!file.type.startsWith('image/')) continue;
      setUploadProg(p => ({ ...p, [file.name]: 'checking' }));
      const b64 = await new Promise<string>(res => {
        const r = new FileReader();
        r.onload = () => res((r.result as string).split(',')[1]);
        r.readAsDataURL(file);
      });
      try {
        const resp = await fetch('/api/admin/gallery-tools/check-duplicate', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: b64, mimeType: file.type }),
        });
        const d = await resp.json();
        setDupResults(p => ({ ...p, [file.name]: d }));
        setUploadProg(p => ({ ...p, [file.name]: d.isDuplicate ? 'dup' : 'pending' }));
      } catch {
        setUploadProg(p => ({ ...p, [file.name]: 'pending' }));
      }
    }
    setChecking(false);
  };

  const runUpload = async () => {
    if (!uploadFiles.length) return;
    setUploading(true);
    let uploaded = 0;
    for (const file of uploadFiles) {
      // Skip confirmed duplicates
      if (uploadProg[file.name] === 'dup') continue;
      const fd = new FormData();
      fd.append('file', file); fd.append('categoryId', String(uploadCat));
      try {
        const r = await fetch('/api/gallery/upload', { method: 'POST', body: fd });
        const d = await r.json();
        setUploadProg(p => ({ ...p, [file.name]: d.ok ? 'done' : 'error' }));
        if (d.ok) uploaded++;
      } catch { setUploadProg(p => ({ ...p, [file.name]: 'error' })); }
    }
    setUploading(false);
    showToast(`✓ ${uploaded} image(s) uploaded to library`);
    setTimeout(() => { setUploadOpen(false); setUploadFiles([]); fetchData(); }, 1000);
  };

  const VIEWS = ['all','active','hidden','featured'];

  return (
    <div className="space-y-5">
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="fixed top-5 right-5 z-50 bg-black border border-green-500/30 text-green-400 text-xs font-sans px-4 py-3 flex items-center gap-2">
            <Check size={12}/> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <div className="flex gap-2 flex-wrap items-center">
        {VIEWS.map(v => (
          <button key={v} onClick={() => setView(v)}
            className={`px-3 py-1.5 text-[10px] uppercase tracking-widest border font-sans transition-all ${
              view === v ? 'border-gold text-gold bg-gold/5' : 'border-white/5 text-white/25 hover:border-white/20'
            }`}>{v}</button>
        ))}
        <div className="relative">
          <select value={category} onChange={e => setCategory(e.target.value)}
            className="appearance-none bg-[#0A0A0A] border border-white/10 text-white/50 text-xs px-3 py-1.5 pr-7 font-sans focus:outline-none">
            <option value="all">All Categories</option>
            {categories.filter(c => c.slug !== 'all').map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </select>
          <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"/>
        </div>
        <div className="relative flex-1 min-w-[180px]">
          <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/20"/>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"
            className="w-full bg-white/3 border border-white/8 text-white/60 text-xs pl-7 pr-3 py-1.5 focus:outline-none focus:border-white/20 font-sans"/>
        </div>
        <span className="text-white/20 text-xs font-sans">{filtered.length}</span>
        <button onClick={() => setUploadOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gold text-black text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors ml-auto">
          <UploadCloud size={12}/> Upload
        </button>
      </div>

      {/* Bulk bar */}
      <AnimatePresence>
        {selected.size > 0 && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-2 flex-wrap p-3 bg-[#0A0A0A] border border-gold/20">
            <span className="text-gold text-xs font-bold font-sans">{selected.size} selected</span>
            {[
              { a: 'show',       l: 'Show',      c: 'text-green-400 border-green-700/30 hover:bg-green-950/40' },
              { a: 'hide',       l: 'Hide',       c: 'text-white/40 border-white/10 hover:bg-white/5' },
              { a: 'feature',    l: 'Feature',    c: 'text-amber-400 border-amber-500/30 hover:bg-amber-950/40' },
              { a: 'unfeature',  l: 'Unfeature',  c: 'text-white/30 border-white/10 hover:bg-white/5' },
              { a: 'set_event',  l: '★ Event',    c: 'text-purple-400 border-purple-500/30 hover:bg-purple-950/40' },
              { a: 'delete',     l: 'Delete',     c: 'text-red-400 border-red-800/40 hover:bg-red-950/40' },
            ].map(({ a, l, c }) => (
              <button key={a} onClick={() => bulkAction(a)} disabled={busy}
                className={`px-3 py-1.5 border text-[10px] uppercase tracking-wider font-sans transition-colors disabled:opacity-40 ${c}`}>
                {l}
              </button>
            ))}
            <button onClick={selectAll} className="text-[10px] text-white/30 hover:text-white font-sans uppercase tracking-wider ml-auto">All</button>
            <button onClick={clearSel}><X size={14} className="text-white/20 hover:text-white"/></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center gap-2 py-16 justify-center text-white/20 font-sans text-sm">
          <Loader2 size={14} className="animate-spin"/> Loading…
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2">
          {filtered.map(item => {
            const sel = selected.has(item.id);
            return (
              <div key={item.id} onClick={() => toggleSel(item.id)}
                className={`relative group cursor-pointer border transition-all ${
                  sel ? 'border-gold ring-1 ring-gold/40' : item.active ? 'border-white/8 hover:border-gold/30' : 'border-red-900/20 opacity-50'
                }`}>
                <img src={item.path} alt={item.title} className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-500"/>
                {sel && <div className="absolute inset-0 bg-gold/20 flex items-center justify-center"><div className="w-5 h-5 bg-gold flex items-center justify-center"><Check size={9} className="text-black"/></div></div>}
                <div className="absolute top-1 right-1 flex flex-col gap-0.5 items-end">
                  {item.featured === 1 && <div className="w-3 h-3 bg-amber-500 flex items-center justify-center"><Star size={6} className="fill-black text-black"/></div>}
                  <div className={`w-2 h-2 rounded-full ${item.active ? 'bg-green-400' : 'bg-red-500/50'}`}/>
                </div>
                <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform bg-black/90 flex gap-0.5 p-1">
                  <button onClick={e => { e.stopPropagation(); quickToggle(item, 'active'); }}
                    className={`flex-1 py-1 flex items-center justify-center border text-[8px] ${item.active ? 'border-green-700/30 text-green-400' : 'border-white/10 text-white/30'}`}>
                    {item.active ? <Eye size={8}/> : <EyeOff size={8}/>}
                  </button>
                  <button onClick={e => { e.stopPropagation(); quickToggle(item, 'featured'); }}
                    className={`flex-1 py-1 flex items-center justify-center border text-[8px] ${item.featured ? 'border-amber-500/30 text-amber-400' : 'border-white/10 text-white/30'}`}>
                    <Star size={8} className={item.featured ? 'fill-current' : ''}/>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload modal */}
      <AnimatePresence>
        {uploadOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur flex items-center justify-center p-6"
            onClick={() => !uploading && setUploadOpen(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }}
              className="bg-[#0A0A0A] border border-gold/20 w-full max-w-md p-6 space-y-4"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg text-white">Upload Images</h3>
                <button onClick={() => !uploading && setUploadOpen(false)}><X size={16} className="text-white/30 hover:text-white"/></button>
              </div>
              <div className="relative">
                <select value={uploadCat} onChange={e => setUploadCat(Number(e.target.value))}
                  className="w-full appearance-none bg-black border border-white/10 text-white text-sm px-3 py-2 pr-8 font-sans focus:outline-none">
                  {categories.filter(c => c.slug !== 'all').map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"/>
              </div>
              <div className="border-2 border-dashed border-gold/20 hover:border-gold/40 cursor-pointer py-8 flex flex-col items-center gap-2 transition-colors"
                onClick={() => fileRef.current?.click()}
                onDrop={e => { e.preventDefault(); addUploadFiles(e.dataTransfer.files); }}
                onDragOver={e => e.preventDefault()}>
                <input ref={fileRef} type="file" multiple accept="image/*,video/*" className="hidden" onChange={e => addUploadFiles(e.target.files)}/>
                <UploadCloud size={24} className="text-gold/30"/>
                <p className="text-white/30 text-sm font-sans">Click or drag — max 20</p>
              </div>
              {uploadFiles.length > 0 && (
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {uploadFiles.map(f => {
                    const prog = uploadProg[f.name];
                    const dup  = dupResults[f.name];
                    return (
                      <div key={f.name} className={`flex items-center gap-2 text-xs font-sans p-1.5 border ${prog==='dup'?'border-red-500/20 bg-red-950/10':prog==='done'?'border-green-500/10 bg-green-950/10':'border-white/5'}`}>
                        {/* Status dot */}
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          prog==='done'     ? 'bg-green-400'
                          : prog==='error'  ? 'bg-red-400'
                          : prog==='dup'    ? 'bg-orange-400'
                          : prog==='checking'?'bg-blue-400 animate-pulse'
                          : 'bg-white/20'
                        }`}/>
                        <span className={`truncate flex-1 ${prog==='dup'?'text-orange-300/60 line-through':'text-white/40'}`}>{f.name}</span>
                        {/* Check result badge */}
                        {dup && (
                          <span className={`text-[8px] px-1.5 py-0.5 uppercase tracking-wider font-sans flex-shrink-0 ${
                            dup.isDuplicate ? 'bg-orange-950/50 text-orange-400 border border-orange-500/20'
                            : 'bg-green-950/40 text-green-400 border border-green-500/20'
                          }`}>
                            {dup.isDuplicate ? `DUP · ${dup.method}` : `OK · ${dup.method}`}
                            {dup.tokensUsed > 0 && ` · ${dup.tokensUsed}tok`}
                          </span>
                        )}
                        {dup?.isDuplicate && dup.matchTitle && (
                          <span className="text-[8px] text-orange-400/60 font-sans truncate max-w-[80px]" title={dup.matchTitle}>≈ {dup.matchTitle}</span>
                        )}
                        {prog==='done'    && <Check size={10} className="text-green-400 flex-shrink-0"/>}
                        {prog==='error'   && <AlertTriangle size={10} className="text-red-400 flex-shrink-0"/>}
                        {prog==='checking'&& <Loader2 size={10} className="text-blue-400 animate-spin flex-shrink-0"/>}
                      </div>
                    );
                  })}
                </div>
              )}
              {/* Duplicate summary */}
              {Object.values(dupResults).some(d => d.isDuplicate) && (
                <div className="text-[10px] text-orange-400/80 font-sans bg-orange-950/10 border border-orange-500/20 px-3 py-2">
                  ⚠ {Object.values(dupResults).filter(d => d.isDuplicate).length} duplicate(s) detected — they will be skipped on upload.
                  <span className="text-white/20 ml-2">
                    Claude tokens used: {Object.values(dupResults).reduce((s, d) => s + (d.tokensUsed || 0), 0)}
                  </span>
                </div>
              )}
              <div className="flex gap-2">
                <button onClick={checkDuplicates} disabled={!uploadFiles.length || checking || uploading}
                  className="flex-1 py-2.5 border border-blue-500/30 text-blue-400 hover:bg-blue-950/30 text-xs font-sans uppercase tracking-widest transition-colors disabled:opacity-40 flex items-center justify-center gap-2">
                  {checking ? <><Loader2 size={11} className="animate-spin"/> Checking…</> : <><Copy size={11}/> Check Duplicates</>}
                </button>
                <button onClick={runUpload} disabled={!uploadFiles.length || uploading}
                  className="flex-1 py-2.5 bg-gold text-black text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-40 flex items-center justify-center gap-2">
                  {uploading ? <><Loader2 size={11} className="animate-spin"/> Uploading…</> : <><UploadCloud size={11}/> Upload</>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
