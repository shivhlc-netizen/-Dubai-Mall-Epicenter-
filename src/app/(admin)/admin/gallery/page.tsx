'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import MpcOptimizerModal from '@/components/admin/MpcOptimizerModal';
import {
  Upload, Wand2, Loader2, X, Check, Trash2, Eye, EyeOff, Activity,
  Sparkles, AlertCircle, ChevronDown, ImagePlus, FolderSearch,
  Clock, AlertTriangle, Star, StarOff, CheckSquare, Square,
  BookOpen, Save, ChevronUp,
} from 'lucide-react';

interface Category { id: number; name: string; slug: string; }
interface GalleryImage {
  id: number; filename: string; path: string; title: string;
  description: string; story: string; emotional_hook: string;
  category_id: number; category_name: string; category_slug: string;
  story_id: number | null;
  visual_config: Record<string, any> | null;
  sort_order: number; active: number; featured: number; shift_style: string;
  media_type: 'image' | 'video';
}
interface PendingFile { filename: string; path: string; size: number; }
interface UploadSlot {
  id: string; file: File; previewUrl: string;
  title: string; description: string; story: string;
  emotional_hook: string; category_id: number; shift_style: string;
  aiLoading: boolean; aiError: string; uploading: boolean; done: boolean;
  media_type: 'image' | 'video';
}

const SHIFT_LABELS: Record<string, string> = {
  spotlight: '① Spotlight', story: '② Story', filmstrip: '③ Film Strip',
  mosaic: '④ Mosaic', editorial: '⑤ Editorial',
};

export default function GalleryAdmin() {
  const [images, setImages]         = useState<GalleryImage[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filter, setFilter]         = useState('all');
  const [loading, setLoading]       = useState(true);
  const [editing, setEditing]       = useState<GalleryImage | null>(null);
  const [saving, setSaving]         = useState(false);

  // Upload queue
  const [slots, setSlots]       = useState<UploadSlot[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [rateMsg, setRateMsg]   = useState('');
  const [rateWait, setRateWait] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  // Sync preview modal
  const [syncOpen, setSyncOpen]         = useState(false);
  const [pending, setPending]           = useState<PendingFile[]>([]);
  const [syncLoading, setSyncLoading]   = useState(false);
  const [selected, setSelected]         = useState<Set<string>>(new Set());
  const [syncing, setSyncing]           = useState(false);
  const [syncDone, setSyncDone]         = useState('');

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<GalleryImage | null>(null);
  const [deleting, setDeleting]         = useState(false);

  // Batch select mode
  const [selectMode, setSelectMode]       = useState(false);
  const [reorderMode, setReorderMode]     = useState(false);
  const [selectedIds, setSelectedIds]     = useState<Set<number>>(new Set());
  const [batchAction, setBatchAction]     = useState('');
  const [batchConfirm, setBatchConfirm]   = useState(false);

  // Gallery story panel
  const [storyOpen, setStoryOpen]       = useState(false);
  const [storyTitle, setStoryTitle]     = useState('');
  const [storyText, setStoryText]       = useState('');
  const [storySaving, setStorySaving]   = useState(false);
  const [mpcOpen, setMpcOpen]           = useState(false);

  const catDefault = categories.find(c => c.slug === 'general')?.id ?? 1;

  const fetchImages = useCallback(() => {
    setLoading(true);
    const url = filter === 'all' ? '/api/gallery?limit=1000' : `/api/gallery?category=${filter}&limit=1000`;
    fetch(url)
      .then(r => r.json())
      .then(d => { setImages(d.images || []); setCategories(d.categories || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [filter]);

  useEffect(() => { fetchImages(); }, [fetchImages]);

  // Load gallery story
  useEffect(() => {
    fetch('/api/gallery/story')
      .then(r => r.json())
      .then(d => { setStoryTitle(d.title || ''); setStoryText(d.narrative || ''); })
      .catch(() => {});
  }, []);

  // Rate countdown
  useEffect(() => {
    if (rateWait <= 0) return;
    const t = setInterval(() => setRateWait(w => {
      if (w <= 1) { setRateMsg(''); return 0; }
      return w - 1;
    }), 1000);
    return () => clearInterval(t);
  }, [rateWait]);

  // Reset batch selection when leaving select mode
  useEffect(() => {
    if (!selectMode) { setSelectedIds(new Set()); setBatchConfirm(false); }
  }, [selectMode]);

  // ── Upload ────────────────────────────────────────────────────────────────
  const MAX_UPLOAD = 20;
  const addFiles = (files: FileList | File[]) => {
    setSlots(prev => {
      const pending = prev.filter(s => !s.done).length;
      const canAdd  = Math.max(0, MAX_UPLOAD - pending);
      if (canAdd === 0) {
        alert(`Maximum ${MAX_UPLOAD} images per session. Upload or clear pending items first.`);
        return prev;
      }
      const arr = Array.from(files).filter(f => /image\/|video\//i.test(f.type)).slice(0, canAdd);
      if (Array.from(files).length > canAdd)
        alert(`Only ${canAdd} image(s) added — ${MAX_UPLOAD}-image limit reached.`);
      return [...prev, ...arr.map(file => ({
        id: `${Date.now()}-${Math.random()}`,
        file, previewUrl: URL.createObjectURL(file),
        title: file.name.replace(/[-_.]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).split('.')[0],
        description: '', story: '', emotional_hook: '', shift_style: 'mosaic',
        category_id: catDefault, aiLoading: false, aiError: '', uploading: false, done: false,
        media_type: file.type.startsWith('video/') ? 'video' : 'image' as 'image' | 'video',
      }))];
    });
  };

  const patchSlot = (id: string, patch: Partial<UploadSlot>) =>
    setSlots(s => s.map(sl => sl.id === id ? { ...sl, ...patch } : sl));

  const runAI = async (slot: UploadSlot) => {
    if (rateWait > 0) return;
    patchSlot(slot.id, { aiLoading: true, aiError: '' });
    const reader = new FileReader();
    reader.onload = async () => {
      const b64 = (reader.result as string).split(',')[1];
      const res = await fetch('/api/ai/describe', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: b64, mimeType: slot.file.type }),
      });
      const data = await res.json();
      if (res.status === 429) {
        setRateMsg(data.message || 'Rate limited');
        setRateWait(data.waitSeconds || 60);
        patchSlot(slot.id, { aiLoading: false, aiError: 'Rate limited — see banner.' });
      } else if (!res.ok) {
        patchSlot(slot.id, { aiLoading: false, aiError: data.error || 'AI error' });
      } else {
        const catMatch = categories.find(c => c.slug === data.category || c.name.toLowerCase() === data.category);
        patchSlot(slot.id, {
          aiLoading: false,
          title: data.title || slot.title,
          description: data.description || '',
          story: data.story || '',
          emotional_hook: data.emotional_hook || '',
          shift_style: data.shift_style || 'mosaic',
          category_id: catMatch?.id ?? slot.category_id,
        });
      }
    };
    reader.readAsDataURL(slot.file);
  };

  const uploadSlot = async (slot: UploadSlot) => {
    patchSlot(slot.id, { uploading: true });
    const fd = new FormData();
    fd.append('file', slot.file);
    fd.append('categoryId', String(slot.category_id));
    const upRes = await fetch('/api/gallery/upload', { method: 'POST', body: fd });
    const upData = await upRes.json();
    if (!upRes.ok || !upData.ok) {
      patchSlot(slot.id, { uploading: false, aiError: upData.error || 'Upload failed' });
      return;
    }
    if (upData.id) {
      await fetch(`/api/gallery/${upData.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: slot.title, description: slot.description,
          story: slot.story, emotional_hook: slot.emotional_hook,
          shift_style: slot.shift_style,
        }),
      }).catch(() => null);
    }
    patchSlot(slot.id, { uploading: false, done: true });
    fetchImages();
  };

  const uploadAll = async () => {
    for (const s of slots.filter(s => !s.done && !s.uploading)) await uploadSlot(s);
  };

  // ── Sync Preview ──────────────────────────────────────────────────────────
  const openSync = async () => {
    setSyncOpen(true); setSyncLoading(true); setSyncDone(''); setSelected(new Set());
    const res = await fetch('/api/gallery/sync');
    const data = await res.json();
    setPending(data.pending || []);
    setSyncLoading(false);
  };

  const toggleSelect = (filename: string) =>
    setSelected(s => { const n = new Set(s); n.has(filename) ? n.delete(filename) : n.add(filename); return n; });

  const selectAll  = () => setSelected(new Set(pending.map(p => p.filename)));
  const selectNone = () => setSelected(new Set());

  const doSync = async () => {
    if (selected.size === 0) return;
    setSyncing(true);
    const res = await fetch('/api/gallery/sync', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filenames: [...selected] }),
    });
    const data = await res.json();
    setSyncDone(`✓ ${data.added} image${data.added !== 1 ? 's' : ''} added to gallery.`);
    setSyncing(false);
    setPending(p => p.filter(f => !selected.has(f.filename)));
    setSelected(new Set());
    fetchImages();
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    await fetch(`/api/gallery/${deleteTarget.id}`, { method: 'DELETE' });
    setImages(p => p.filter(i => i.id !== deleteTarget.id));
    setDeleting(false);
    setDeleteTarget(null);
  };

  // ── Toggle visibility ─────────────────────────────────────────────────────
  const toggleActive = async (img: GalleryImage) => {
    const next = img.active !== 1;
    await fetch(`/api/gallery/${img.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: next }),
    });
    setImages(p => p.map(i => i.id === img.id ? { ...i, active: next ? 1 : 0 } : i));
  };

  // ── Toggle featured ───────────────────────────────────────────────────────
  const toggleFeatured = async (img: GalleryImage) => {
    const next = img.featured !== 1;
    await fetch(`/api/gallery/${img.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ featured: next }),
    });
    setImages(p => p.map(i => i.id === img.id ? { ...i, featured: next ? 1 : 0 } : i));
  };

  // ── Batch selection ───────────────────────────────────────────────────────
  const toggleId = (id: number) => {
    setSelectedIds(s => {
      const n = new Set(s);
      if (n.has(id)) { n.delete(id); } else {
        if (n.size >= 20) return s; // hard cap at 20
        n.add(id);
      }
      return n;
    });
  };

  const selectAllVisible = () => {
    const visible = visibleImages().slice(0, 20).map(i => i.id);
    setSelectedIds(new Set(visible));
  };

  const doBatchAction = async (action: string) => {
    if (selectedIds.size === 0) return;
    setBatchAction(action);
    const ids = [...selectedIds];

    if (action === 'delete') {
      setBatchConfirm(true);
      return;
    }

    let patch: Record<string, boolean> = {};
    if (action === 'feature')    patch = { featured: true };
    if (action === 'unfeature')  patch = { featured: false };
    if (action === 'show')       patch = { active: true };
    if (action === 'hide')       patch = { active: false };

    await fetch('/api/gallery/batch', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids, ...patch }),
    });
    setSelectMode(false);
    fetchImages();
  };

  const confirmBatchDelete = async () => {
    const ids = [...selectedIds];
    await fetch('/api/gallery/batch', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    });
    setImages(p => p.filter(i => !selectedIds.has(i.id)));
    setSelectMode(false);
    setBatchConfirm(false);
  };

  async function saveOrder() {
    setSaving(true);
    const payload = images.map((img, i) => ({ id: img.id, sort_order: i }));
    await fetch('/api/gallery', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    setReorderMode(false);
    fetchImages();
  }

  // ── Edit ──────────────────────────────────────────────────────────────────
  const saveEdit = async () => {
    if (!editing) return;
    setSaving(true);
    await fetch(`/api/gallery/${editing.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: editing.title, description: editing.description,
        story: editing.story, emotional_hook: editing.emotional_hook,
        category_id: editing.category_id, sort_order: editing.sort_order,
        shift_style: editing.shift_style,
      }),
    });
    setSaving(false); setEditing(null); fetchImages();
  };

  // ── Gallery Story ─────────────────────────────────────────────────────────
  const saveStory = async () => {
    setStorySaving(true);
    await fetch('/api/gallery/story', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: storyTitle, narrative: storyText }),
    });
    setStorySaving(false);
  };

  const visibleImages = useCallback(() =>
    images.filter(img => filter === 'all' || img.category_slug === filter),
  [images, filter]);

  const featuredCount  = images.filter(i => i.featured).length;
  const pendingCount   = slots.filter(s => !s.done).length;
  const doneCount      = slots.filter(s => s.done).length;
  const vImages        = visibleImages();

  return (
    <div className="space-y-10">

      {/* Header */}
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl text-white mb-1">Gallery Management</h1>
          <p className="text-white/30 text-sm font-sans">
            {images.length} images · {images.filter(i=>i.active).length} visible · {featuredCount} featured in story
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {reorderMode ? (
            <button onClick={saveOrder} disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white text-xs font-bold uppercase tracking-widest hover:bg-green-500 transition-colors disabled:opacity-40 font-sans">
              {saving ? <Loader2 size={13} className="animate-spin"/> : <Save size={13}/>}
              Save New Order
            </button>
          ) : (
            <button
              onClick={() => { setReorderMode(true); setSelectMode(false); }}
              className="flex items-center gap-2 px-4 py-2.5 border border-white/10 text-white/50 hover:text-white hover:border-white/30 text-xs uppercase tracking-widest transition-all font-sans">
              <Activity size={13}/> Reorder Mode
            </button>
          )}
          <button onClick={() => setMpcOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 border border-blue-500/30 text-blue-400 hover:bg-blue-500/10 text-xs uppercase tracking-widest transition-all font-sans">
            <Sparkles size={13}/> MPC Placement
          </button>
          <button onClick={() => setStoryOpen(o => !o)}
            className="flex items-center gap-2 px-4 py-2.5 border border-gold/30 text-gold/70 hover:text-gold hover:border-gold text-xs uppercase tracking-widest transition-all font-sans">
            <BookOpen size={13}/> Gallery Story
          </button>
          <button
            onClick={() => setSelectMode(m => !m)}
            className={`flex items-center gap-2 px-4 py-2.5 border text-xs uppercase tracking-widest transition-all font-sans ${
              selectMode ? 'border-gold bg-gold/15 text-gold' : 'border-white/10 text-white/50 hover:text-white hover:border-white/30'
            }`}>
            <CheckSquare size={13}/> {selectMode ? `Select Mode (${selectedIds.size}/20)` : 'Batch Select'}
          </button>
          <button onClick={openSync}
            className="flex items-center gap-2 px-4 py-2.5 border border-white/10 text-white/50 hover:text-white hover:border-white/30 text-xs uppercase tracking-widest transition-all font-sans">
            <FolderSearch size={13}/> Preview Sync
          </button>
        </div>
      </div>

      {/* Gallery Story Panel */}
      <AnimatePresence>
        {storyOpen && (
          <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}}
            className="border border-gold/20 bg-gold/3 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen size={14} className="text-gold/60"/>
                <h3 className="font-display text-lg text-white">Gallery Story Narrative</h3>
              </div>
              <button onClick={() => setStoryOpen(false)} className="text-white/30 hover:text-white transition-colors">
                <ChevronUp size={16}/>
              </button>
            </div>
            <p className="text-white/30 text-xs font-sans">
              This narrative appears in the Story shift on the main site. Feature individual images below (⭐) to include them in the curated story gallery.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] tracking-widest uppercase text-white/35 font-sans mb-1">Story Title</label>
                <input value={storyTitle} onChange={e => setStoryTitle(e.target.value)}
                  placeholder="The Dubai Mall Story"
                  className="w-full bg-white/5 border border-gold/15 text-white text-sm px-3 py-2 focus:outline-none focus:border-gold/40 font-sans"/>
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] tracking-widest uppercase text-white/35 font-sans mb-1">Narrative ({featuredCount} featured images will be shown)</label>
                <textarea value={storyText} onChange={e => setStoryText(e.target.value)} rows={3}
                  placeholder="A journey through the world's most iconic shopping destination..."
                  className="w-full bg-white/5 border border-gold/15 text-white text-sm px-3 py-2 focus:outline-none focus:border-gold/40 resize-none font-sans"/>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={saveStory} disabled={storySaving}
                className="flex items-center gap-2 px-5 py-2 bg-gold text-black text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-40">
                {storySaving ? <Loader2 size={12} className="animate-spin"/> : <Save size={12}/>}
                Save Story
              </button>
              <p className="text-white/20 text-xs font-sans">⭐ Star images below to include them in the story gallery</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Batch action bar */}
      <AnimatePresence>
        {selectMode && selectedIds.size > 0 && (
          <motion.div initial={{opacity:0,y:-6}} animate={{opacity:1,y:0}} exit={{opacity:0}}
            className="flex items-center gap-3 flex-wrap p-4 bg-[#0A0A0A] border border-gold/15">
            <p className="text-white/50 text-xs font-sans flex-shrink-0">{selectedIds.size} selected</p>
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => doBatchAction('feature')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-950/60 border border-amber-500/30 text-amber-400 text-xs uppercase tracking-wider font-sans hover:bg-amber-900/50 transition-colors">
                <Star size={10}/> Feature in Story
              </button>
              <button onClick={() => doBatchAction('unfeature')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 text-white/40 text-xs uppercase tracking-wider font-sans hover:bg-white/10 transition-colors">
                <StarOff size={10}/> Remove from Story
              </button>
              <button onClick={() => doBatchAction('show')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-950/40 border border-green-700/30 text-green-400 text-xs uppercase tracking-wider font-sans hover:bg-green-900/30 transition-colors">
                <Eye size={10}/> Show on Site
              </button>
              <button onClick={() => doBatchAction('hide')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 text-white/40 text-xs uppercase tracking-wider font-sans hover:bg-white/10 transition-colors">
                <EyeOff size={10}/> Hide from Site
              </button>
              <button onClick={() => doBatchAction('delete')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-950/50 border border-red-800/40 text-red-400 text-xs uppercase tracking-wider font-sans hover:bg-red-900/50 transition-colors">
                <Trash2 size={10}/> Delete {selectedIds.size}
              </button>
            </div>
            <button onClick={() => setSelectMode(false)} className="ml-auto text-white/20 hover:text-white transition-colors">
              <X size={14}/>
            </button>
          </motion.div>
        )}
        {selectMode && selectedIds.size === 0 && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="flex items-center justify-between p-3 bg-[#0A0A0A] border border-white/5">
            <p className="text-white/25 text-xs font-sans">Click images to select (max 20). Then choose a batch action.</p>
            <div className="flex gap-3 items-center">
              <button onClick={selectAllVisible} className="text-gold/50 hover:text-gold text-xs uppercase tracking-wider font-sans transition-colors">
                Select All Visible
              </button>
              <button onClick={() => setSelectMode(false)} className="text-white/20 hover:text-white transition-colors">
                <X size={14}/>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rate limit banner */}
      <AnimatePresence>
        {rateMsg && (
          <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} exit={{opacity:0}}
            className="flex items-start gap-3 p-4 bg-amber-950/40 border border-amber-500/30">
            <Clock size={15} className="text-amber-400 flex-shrink-0 mt-0.5"/>
            <div>
              <p className="text-amber-300 text-sm font-sans">{rateMsg}</p>
              {rateWait > 0 && <p className="text-amber-500/60 text-xs mt-1 font-mono">Recharging in {rateWait}s…</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drop zone */}
      <div
        onDrop={e=>{e.preventDefault();setDragOver(false);addFiles(e.dataTransfer.files);}}
        onDragOver={e=>{e.preventDefault();setDragOver(true);}}
        onDragLeave={()=>setDragOver(false)}
        onClick={()=>fileRef.current?.click()}
        className={`border-2 border-dashed cursor-pointer transition-all duration-300 flex flex-col items-center justify-center py-14 group ${
          dragOver ? 'border-gold bg-gold/5' : 'border-gold/15 hover:border-gold/40'
        }`}
      >
        <input ref={fileRef} type="file" multiple accept="image/*,video/*" className="hidden"
          onChange={e=>e.target.files&&addFiles(e.target.files)}/>
        <ImagePlus size={36} className={`mb-3 transition-colors ${dragOver?'text-gold':'text-white/15 group-hover:text-white/30'}`}/>
        <p className={`text-sm font-sans transition-colors ${dragOver?'text-gold':'text-white/25 group-hover:text-white/45'}`}>
          {dragOver ? 'Drop to add' : 'Drag & drop media or click to browse'}
        </p>
        <p className="text-white/15 text-xs mt-1 font-sans">
          Images &amp; Videos · MP4 MOV JPG PNG ·{' '}
          <span className={slots.filter(s=>!s.done).length >= MAX_UPLOAD ? 'text-red-400/60' : 'text-gold/40'}>
            {slots.filter(s=>!s.done).length}/{MAX_UPLOAD} in queue
          </span>
        </p>
      </div>

      {/* Upload queue */}
      <AnimatePresence>
        {slots.length > 0 && (
          <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-white/40 text-xs uppercase tracking-widest font-sans">
                Queue — {pendingCount} pending · {doneCount} uploaded
              </p>
              <div className="flex gap-3">
                {doneCount > 0 && (
                  <button onClick={()=>setSlots(s=>s.filter(sl=>!sl.done))}
                    className="text-white/20 hover:text-white/50 text-xs font-sans uppercase tracking-wider transition-colors">
                    Clear done
                  </button>
                )}
                {pendingCount > 0 && (
                  <button onClick={uploadAll}
                    className="flex items-center gap-2 px-5 py-2 bg-gold text-black text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors">
                    <Upload size={12}/> Upload All ({pendingCount})
                  </button>
                )}
              </div>
            </div>
            {slots.map(slot => (
              <motion.div key={slot.id} layout initial={{opacity:0,x:-16}} animate={{opacity:1,x:0}} exit={{opacity:0}}
                className={`flex gap-4 p-4 border transition-all ${slot.done?'border-green-900/30 bg-green-950/10':'border-gold/10'}`}>
                <div className="flex-shrink-0 w-20 h-20 overflow-hidden relative bg-black/50">
                  {slot.media_type === 'video' ? (
                    <video src={slot.previewUrl} className="w-full h-full object-cover" />
                  ) : (
                    <img src={slot.previewUrl} alt="" className="w-full h-full object-cover"/>
                  )}
                  {slot.done && <div className="absolute inset-0 bg-green-900/60 flex items-center justify-center"><Check size={18} className="text-green-300"/></div>}
                </div>
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <input value={slot.title} disabled={slot.done} onChange={e=>patchSlot(slot.id,{title:e.target.value})}
                    placeholder="Title"
                    className="bg-white/5 border border-gold/10 text-white text-sm px-3 py-2 focus:outline-none focus:border-gold/30 disabled:opacity-40 font-sans"/>
                  <div className="relative">
                    <select value={slot.category_id} disabled={slot.done} onChange={e=>patchSlot(slot.id,{category_id:parseInt(e.target.value)})}
                      className="w-full appearance-none bg-[#0A0A0A] border border-gold/10 text-white text-sm px-3 py-2 focus:outline-none focus:border-gold/30 disabled:opacity-40 pr-8 font-sans">
                      {categories.filter(c=>c.slug!=='all').map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"/>
                  </div>
                  <input value={slot.description} disabled={slot.done} onChange={e=>patchSlot(slot.id,{description:e.target.value})}
                    placeholder="Description"
                    className="bg-white/5 border border-gold/10 text-white text-sm px-3 py-2 focus:outline-none focus:border-gold/30 disabled:opacity-40 font-sans"/>
                  <div className="relative">
                    <select value={slot.shift_style} disabled={slot.done} onChange={e=>patchSlot(slot.id,{shift_style:e.target.value})}
                      className="w-full appearance-none bg-[#0A0A0A] border border-gold/10 text-white text-sm px-3 py-2 focus:outline-none focus:border-gold/30 disabled:opacity-40 pr-8 font-sans">
                      {Object.entries(SHIFT_LABELS).map(([v,l])=><option key={v} value={v}>{l}</option>)}
                    </select>
                    <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"/>
                  </div>
                  {slot.story && (
                    <div className="col-span-2 text-xs text-white/35 italic border-l-2 border-gold/20 pl-3 font-sans leading-relaxed">
                      {slot.story}
                      {slot.emotional_hook && <span className="ml-2 text-gold/45 not-italic uppercase tracking-widest text-[9px]">· {slot.emotional_hook}</span>}
                    </div>
                  )}
                  {slot.aiError && (
                    <div className="col-span-2 flex items-center gap-1.5 text-red-400 text-xs font-sans">
                      <AlertCircle size={11}/> {slot.aiError}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  {!slot.done && (
                    <>
                      <button onClick={()=>runAI(slot)} disabled={slot.aiLoading||rateWait>0} title="AI Suggest"
                        className="w-9 h-9 flex items-center justify-center border border-purple-500/30 hover:bg-purple-500/10 text-purple-400 transition-colors disabled:opacity-30">
                        {slot.aiLoading?<Loader2 size={13} className="animate-spin"/>:<Wand2 size={13}/>}
                      </button>
                      <button onClick={()=>uploadSlot(slot)} disabled={slot.uploading} title="Upload"
                        className="w-9 h-9 flex items-center justify-center border border-gold/30 hover:bg-gold/10 text-gold transition-colors disabled:opacity-30">
                        {slot.uploading?<Loader2 size={13} className="animate-spin"/>:<Upload size={13}/>}
                      </button>
                    </>
                  )}
                  <button onClick={()=>{URL.revokeObjectURL(slot.previewUrl);setSlots(s=>s.filter(sl=>sl.id!==slot.id));}} title="Remove"
                    className="w-9 h-9 flex items-center justify-center border border-white/5 hover:border-red-500/30 hover:text-red-400 text-white/20 transition-colors">
                    <X size={13}/>
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gallery grid */}
      <div>
        <div className="flex gap-2 flex-wrap mb-5">
          {[{slug:'all',name:'All'},...categories.filter(c=>c.slug!=='all')].map(c=>(
            <button key={c.slug} onClick={()=>setFilter(c.slug)}
              className={`text-[10px] tracking-wider uppercase px-3 py-1.5 border transition-all font-sans ${
                filter===c.slug?'border-gold/50 text-gold bg-gold/10':'border-white/10 text-white/30 hover:border-white/30 hover:text-white/60'
              }`}>{c.name}</button>
          ))}
        </div>
        {loading ? (
          <div className="flex items-center gap-2 text-white/30 py-10 font-sans"><Loader2 size={15} className="animate-spin"/> Loading…</div>
        ) : reorderMode ? (
          <Reorder.Group axis="y" values={images} onReorder={setImages} className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
             {images.map(img => (
               <Reorder.Item key={img.id} value={img} className="relative aspect-square border border-gold/40 cursor-grab active:cursor-grabbing overflow-hidden group">
                  <img src={img.path} alt="" className="w-full h-full object-cover pointer-events-none"/>
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Activity size={20} className="text-white"/>
                  </div>
                  <div className="absolute top-1 left-1 bg-black/80 px-1 text-[8px] text-gold font-mono">
                    #{img.sort_order}
                  </div>
               </Reorder.Item>
             ))}
          </Reorder.Group>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {vImages.map((img,i)=>{
              const isSelected = selectedIds.has(img.id);
              return (
                <motion.div key={img.id} initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} transition={{delay:i*0.02}}
                  className={`relative group overflow-hidden border transition-all cursor-pointer ${
                    selectMode
                      ? isSelected ? 'border-gold ring-1 ring-gold/50' : 'border-white/10 hover:border-white/30'
                      : img.active ? 'border-gold/8 hover:border-gold/30' : 'border-red-900/30 opacity-60'
                  }`}
                  onClick={() => selectMode ? toggleId(img.id) : setEditing({ ...img })}
                >
                  {img.media_type === 'video' ? (
                    <video src={img.path} className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-700" />
                  ) : (
                    <img src={img.path} alt={img.title||img.filename}
                      className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-700"/>
                  )}

                  {/* Select mode overlay */}
                  {selectMode && (
                    <div className={`absolute inset-0 transition-colors ${isSelected ? 'bg-gold/15' : 'bg-black/0'}`}>
                      <div className={`absolute top-2 left-2 w-5 h-5 border-2 flex items-center justify-center transition-all ${
                        isSelected ? 'border-gold bg-gold' : 'border-white/40 bg-black/50'
                      }`}>
                        {isSelected && <Check size={10} className="text-black"/>}
                      </div>
                    </div>
                  )}

                  {/* Featured star badge */}
                  {img.featured === 1 && !selectMode && (
                    <div className="absolute top-2 left-2 w-5 h-5 bg-amber-500/90 flex items-center justify-center">
                      <Star size={9} className="text-black fill-black"/>
                    </div>
                  )}

                  {/* Shift badge */}
                  {!selectMode && (
                    <div className="absolute top-2 right-8 text-[8px] uppercase tracking-wider px-1.5 py-0.5 bg-black/70 text-gold/50 font-sans">
                      {SHIFT_LABELS[img.shift_style]?.replace(/[①②③④⑤]\s/,'') || 'Mosaic'}
                    </div>
                  )}

                  {/* Hover overlay — only in normal mode */}
                  {!selectMode && (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"/>
                      <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <p className="text-white text-xs font-sans font-medium truncate mb-2">{img.title}</p>
                        {img.emotional_hook && <p className="text-gold/50 text-[9px] uppercase tracking-widest font-sans mb-2">{img.emotional_hook}</p>}
                        <div className="flex gap-1.5">
                          {/* Edit */}
                          <button onClick={e=>{e.stopPropagation();setEditing({...img});}}
                            className="flex-1 flex items-center justify-center gap-1 bg-gold/20 hover:bg-gold/40 text-gold text-[9px] py-1.5 transition-colors font-sans">
                            <Sparkles size={9}/> Edit
                          </button>
                          {/* Feature toggle */}
                          <button onClick={e=>{e.stopPropagation();toggleFeatured(img);}} title={img.featured?'Remove from story':'Feature in story'}
                            className={`w-8 flex items-center justify-center py-1.5 transition-colors ${
                              img.featured ? 'bg-amber-900/50 hover:bg-amber-800/60' : 'bg-white/5 hover:bg-white/15'
                            }`}>
                            {img.featured
                              ? <Star size={10} className="text-amber-400 fill-amber-400"/>
                              : <Star size={10} className="text-white/25"/>}
                          </button>
                          {/* Toggle visible */}
                          <button onClick={e=>{e.stopPropagation();toggleActive(img);}} title={img.active?'Hide from site':'Show on site'}
                            className="w-8 flex items-center justify-center bg-white/10 hover:bg-white/20 py-1.5 transition-colors">
                            {img.active
                              ? <Eye size={11} className="text-green-400"/>
                              : <EyeOff size={11} className="text-white/30"/>}
                          </button>
                          {/* Hard delete */}
                          <button onClick={e=>{e.stopPropagation();setDeleteTarget(img);}} title="Delete permanently"
                            className="w-8 flex items-center justify-center bg-red-950/40 hover:bg-red-900/70 text-red-400 py-1.5 transition-colors">
                            <Trash2 size={11}/>
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Status dot */}
                  {!selectMode && (
                    <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${img.active?'bg-green-400':'bg-red-500/50'}`}/>
                  )}
                </motion.div>
              );
            })}
            {vImages.length===0&&!loading&&(
              <div className="col-span-5 py-20 text-center text-white/20 font-sans">No images found.</div>
            )}
          </div>
        )}
      </div>

      {/* ── Sync Preview Modal ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {syncOpen && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={()=>setSyncOpen(false)}>
            <motion.div initial={{scale:0.96,y:16}} animate={{scale:1,y:0}}
              className="bg-[#090909] border border-gold/20 w-full max-w-2xl max-h-[85vh] flex flex-col"
              onClick={e=>e.stopPropagation()}>
              <div className="flex justify-between items-center px-6 py-4 border-b border-gold/10">
                <div>
                  <h3 className="font-display text-lg text-white">Sync Preview</h3>
                  <p className="text-white/30 text-xs font-sans mt-0.5">Files on disk not yet in the gallery database</p>
                </div>
                <button onClick={()=>setSyncOpen(false)} className="text-white/30 hover:text-white transition-colors"><X size={16}/></button>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-4">
                {syncLoading ? (
                  <div className="flex items-center gap-2 py-10 text-white/30 font-sans"><Loader2 size={15} className="animate-spin"/> Scanning disk…</div>
                ) : pending.length === 0 ? (
                  <div className="py-10 text-center text-white/25 font-sans">
                    {syncDone || 'All files are already in the gallery. Nothing to sync.'}
                  </div>
                ) : (
                  <>
                    {syncDone && <p className="text-green-400 text-sm font-sans mb-4">{syncDone}</p>}
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-white/40 text-xs font-sans">{pending.length} unregistered file{pending.length!==1?'s':''} found</p>
                      <div className="flex gap-4 text-xs uppercase tracking-wider font-sans">
                        <button onClick={selectAll} className="text-gold/60 hover:text-gold transition-colors">Select All</button>
                        <button onClick={selectNone} className="text-white/30 hover:text-white/60 transition-colors">None</button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {pending.map(f => (
                        <label key={f.filename}
                          className={`flex items-center gap-3 p-3 border cursor-pointer transition-all ${
                            selected.has(f.filename) ? 'border-gold/40 bg-gold/5' : 'border-white/5 hover:border-white/15'
                          }`}>
                          <input type="checkbox" checked={selected.has(f.filename)} onChange={()=>toggleSelect(f.filename)}
                            className="accent-gold w-4 h-4 flex-shrink-0"/>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={f.path} alt="" className="w-12 h-12 object-cover flex-shrink-0"/>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-sans truncate">{f.filename}</p>
                            <p className="text-white/25 text-xs font-sans">{(f.size/1024).toFixed(0)} KB</p>
                          </div>
                          {selected.has(f.filename) && <Check size={14} className="text-gold flex-shrink-0"/>}
                        </label>
                      ))}
                    </div>
                  </>
                )}
              </div>
              {pending.length > 0 && (
                <div className="px-6 py-4 border-t border-gold/10 flex items-center justify-between gap-3">
                  <p className="text-white/30 text-xs font-sans">{selected.size} selected</p>
                  <div className="flex gap-3">
                    <button onClick={()=>setSyncOpen(false)} className="btn-outline text-xs">Cancel</button>
                    <button onClick={doSync} disabled={selected.size===0||syncing}
                      className="flex items-center gap-2 px-5 py-2 bg-gold text-black text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-40">
                      {syncing?<Loader2 size={12} className="animate-spin"/>:<Check size={12}/>}
                      Add {selected.size > 0 ? `${selected.size} ` : ''}to Gallery
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Batch Delete Confirmation ─────────────────────────────────────── */}
      <AnimatePresence>
        {batchConfirm && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={()=>setBatchConfirm(false)}>
            <motion.div initial={{scale:0.96,y:10}} animate={{scale:1,y:0}}
              className="bg-[#090909] border border-red-900/40 w-full max-w-sm p-6"
              onClick={e=>e.stopPropagation()}>
              <div className="flex items-start gap-3 mb-5">
                <AlertTriangle size={20} className="text-red-400 flex-shrink-0 mt-0.5"/>
                <div>
                  <h3 className="font-display text-lg text-white mb-1">Delete {selectedIds.size} Images</h3>
                  <p className="text-white/40 text-sm font-sans">
                    This will permanently remove <span className="text-red-400 font-bold">{selectedIds.size} images</span> from the database and delete their files from disk. This cannot be undone.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={()=>setBatchConfirm(false)} className="btn-outline flex-1 text-xs">Cancel</button>
                <button onClick={confirmBatchDelete}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-700 hover:bg-red-600 text-white text-xs font-bold uppercase tracking-widest transition-colors">
                  <Trash2 size={12}/> Delete All {selectedIds.size}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Delete Confirmation Modal ─────────────────────────────────────── */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={()=>!deleting&&setDeleteTarget(null)}>
            <motion.div initial={{scale:0.96,y:10}} animate={{scale:1,y:0}}
              className="bg-[#090909] border border-red-900/40 w-full max-w-md p-6"
              onClick={e=>e.stopPropagation()}>
              <div className="flex items-start gap-3 mb-5">
                <AlertTriangle size={20} className="text-red-400 flex-shrink-0 mt-0.5"/>
                <div>
                  <h3 className="font-display text-lg text-white mb-1">Delete Permanently</h3>
                  <p className="text-white/40 text-sm font-sans">
                    This will remove <span className="text-white">"{deleteTarget.title}"</span> from the gallery database <strong className="text-red-400">and delete the file from disk</strong>. This cannot be undone.
                  </p>
                </div>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={deleteTarget.path} alt="" className="w-full h-32 object-cover mb-5 opacity-50"/>
              <div className="flex gap-3">
                <button onClick={()=>setDeleteTarget(null)} disabled={deleting} className="btn-outline flex-1 text-xs">Cancel</button>
                <button onClick={confirmDelete} disabled={deleting}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-700 hover:bg-red-600 text-white text-xs font-bold uppercase tracking-widest transition-colors disabled:opacity-50">
                  {deleting?<Loader2 size={12} className="animate-spin"/>:<Trash2 size={12}/>}
                  Delete Forever
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Edit Modal ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {editing && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={()=>setEditing(null)}>
            <motion.div initial={{scale:0.95,y:16}} animate={{scale:1,y:0}}
              className="bg-[#090909] border border-gold/20 w-full max-w-xl p-6 overflow-y-auto max-h-[90vh]"
              onClick={e=>e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-display text-xl text-white">Edit Image</h3>
                <button onClick={()=>setEditing(null)} className="text-white/30 hover:text-white"><X size={16}/></button>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={editing.path} alt={editing.title} className="w-full h-40 object-cover mb-5"/>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] tracking-widest uppercase text-white/35 font-sans mb-1">Title</label>
                    <input value={editing.title||''} onChange={e=>setEditing({...editing,title:e.target.value})}
                      className="w-full bg-white/5 border border-gold/15 text-white text-sm px-3 py-2 focus:outline-none focus:border-gold/40 font-sans"/>
                  </div>
                  <div>
                    <label className="block text-[10px] tracking-widest uppercase text-white/35 font-sans mb-1">Emotional Hook</label>
                    <input value={editing.emotional_hook||''} onChange={e=>setEditing({...editing,emotional_hook:e.target.value})}
                      placeholder="Awe · Desire · Wonder"
                      className="w-full bg-white/5 border border-gold/15 text-white text-sm px-3 py-2 focus:outline-none focus:border-gold/40 font-sans"/>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] tracking-widest uppercase text-white/35 font-sans mb-1">Description</label>
                  <input value={editing.description||''} onChange={e=>setEditing({...editing,description:e.target.value})}
                    className="w-full bg-white/5 border border-gold/15 text-white text-sm px-3 py-2 focus:outline-none focus:border-gold/40 font-sans"/>
                </div>
                <div>
                  <label className="block text-[10px] tracking-widest uppercase text-white/35 font-sans mb-1">Story Narrative</label>
                  <textarea value={editing.story||''} onChange={e=>setEditing({...editing,story:e.target.value})} rows={3}
                    className="w-full bg-white/5 border border-gold/15 text-white text-sm px-3 py-2 focus:outline-none focus:border-gold/40 resize-none font-sans"/>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] tracking-widest uppercase text-white/35 font-sans mb-1">Category</label>
                    <select value={editing.category_id||''} onChange={e=>setEditing({...editing,category_id:parseInt(e.target.value)})}
                      className="w-full bg-[#0A0A0A] border border-gold/15 text-white text-sm px-3 py-2 focus:outline-none focus:border-gold/40 font-sans">
                      {categories.filter(c=>c.slug!=='all').map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] tracking-widest uppercase text-white/35 font-sans mb-1">Shift Style</label>
                    <select value={editing.shift_style||'mosaic'} onChange={e=>setEditing({...editing,shift_style:e.target.value})}
                      className="w-full bg-[#0A0A0A] border border-gold/15 text-white text-sm px-3 py-2 focus:outline-none focus:border-gold/40 font-sans">
                      {Object.entries(SHIFT_LABELS).map(([v,l])=><option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] tracking-widest uppercase text-white/35 font-sans mb-1">Sort Order</label>
                    <input type="number" value={editing.sort_order||0} onChange={e=>setEditing({...editing,sort_order:parseInt(e.target.value)||0})}
                      className="w-full bg-white/5 border border-gold/15 text-white text-sm px-3 py-2 focus:outline-none focus:border-gold/40 font-sans"/>
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={!!editing.featured} onChange={e=>setEditing({...editing,featured:e.target.checked?1:0})}
                      className="accent-amber-500 w-4 h-4"/>
                    <span className="text-xs text-amber-400/80 font-sans uppercase tracking-wider">⭐ Feature in Story Gallery</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={saveEdit} disabled={saving}
                  className="flex items-center gap-2 px-5 py-2 bg-gold text-black text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-40">
                  {saving?<Loader2 size={12} className="animate-spin"/>:<Check size={12}/>} Save Changes
                </button>
                <button onClick={()=>setEditing(null)} className="btn-outline text-xs">Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MPC Optimizer Modal ────────────────────────────────────────────── */}
      <MpcOptimizerModal 
        open={mpcOpen} 
        onClose={() => setMpcOpen(false)} 
        onOptimized={fetchImages} 
      />

    </div>
  );
}
