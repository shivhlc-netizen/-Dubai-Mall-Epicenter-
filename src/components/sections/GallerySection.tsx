'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Layers, Maximize2, Trash2, Star, GitMerge, CheckCircle, RefreshCcw } from 'lucide-react';

interface GalleryImage {
  id: number; path: string; title: string; description: string;
  story: string; emotional_hook: string; shift_style: string;
  category_name: string; category_slug: string; featured: number;
  media_type: 'image' | 'video';
}

interface GalleryStory { title: string; narrative: string; }

type Shift = 'spotlight' | 'story' | 'filmstrip' | 'mosaic' | 'editorial';

const SHIFTS: { id: Shift; label: string; sub: string }[] = [
  { id: 'spotlight', label: '① Spotlight',  sub: 'One image. All attention.' },
  { id: 'story',     label: '② Story',      sub: 'Narrative unfolds.' },
  { id: 'filmstrip', label: '③ Film Strip', sub: 'Drag to explore.' },
  { id: 'mosaic',    label: '④ Mosaic',     sub: 'The full picture.' },
  { id: 'editorial', label: '⑤ Editorial',  sub: 'Magazine spread.' },
];

export default function GallerySection({ isManaging }: { isManaging?: boolean }) {
  const [allImages, setAllImages]         = useState<GalleryImage[]>([]);
  const [featuredImages, setFeaturedImages] = useState<GalleryImage[]>([]);
  const [storyMeta, setStoryMeta]         = useState<GalleryStory>({ title: '', narrative: '' });
  const [shift, setShift]                 = useState<Shift>('mosaic');
  const [lightboxImages, setLightboxImages] = useState<GalleryImage[]>([]);
  const [lightbox, setLightbox]           = useState<number | null>(null);
  const [loading, setLoading]             = useState(true);
  const [totalCount, setTotalCount]       = useState(0);
  const [spotIdx, setSpotIdx]             = useState(0);
  const filmRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/gallery?limit=1000').then(r => r.json()),
      fetch('/api/gallery?featured=1&limit=100').then(r => r.json()),
      fetch('/api/gallery/story').then(r => r.json()),
    ]).then(([all, featured, story]) => {
      setAllImages(all.images || []);
      setFeaturedImages(featured.images || []);
      setTotalCount(all.total || 0);
      setStoryMeta({ title: story.title || '', narrative: story.narrative || '' });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // Update lightbox image set when shift changes
  useEffect(() => {
    const imgs = (shift === 'spotlight' || shift === 'story')
      ? (featuredImages.length > 0 ? featuredImages : allImages)
      : allImages;
    setLightboxImages(imgs);
    setLightbox(null);
    setSpotIdx(0);
  }, [shift, allImages, featuredImages]);

  // Spotlight auto-advance
  useEffect(() => {
    if (shift !== 'spotlight' || lightboxImages.length === 0) return;
    const t = setInterval(() => setSpotIdx(i => (i + 1) % lightboxImages.length), 5000);
    return () => clearInterval(t);
  }, [shift, lightboxImages.length]);

  const lightboxImg = lightbox !== null ? lightboxImages[lightbox] : null;

  const nav = useCallback((dir: 1 | -1) => {
    setLightbox(p => p === null ? null : (p + dir + lightboxImages.length) % lightboxImages.length);
  }, [lightboxImages.length]);

  useEffect(() => {
    if (lightbox === null) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(null);
      if (e.key === 'ArrowRight') nav(1);
      if (e.key === 'ArrowLeft')  nav(-1);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [lightbox, nav]);

  // Story shift: featured images if available, else first 20 images
  const storyImages  = featuredImages.length > 0 ? featuredImages : allImages.slice(0, 20);
  // Spotlight uses featured or falls back to all
  const spotImages   = featuredImages.length > 0 ? featuredImages : allImages;

  const handleToggleFeature = async (img: GalleryImage) => {
    const newFeatured = img.featured ? 0 : 1;
    try {
      const res = await fetch(`/api/gallery/${img.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: newFeatured }),
      });
      if (res.ok) {
        setAllImages(prev => prev.map(i => i.id === img.id ? { ...i, featured: newFeatured } : i));
        const updatedImg = { ...img, featured: newFeatured };
        if (newFeatured) {
          setFeaturedImages(prev => [...prev, updatedImg]);
        } else {
          setFeaturedImages(prev => prev.filter(i => i.id !== img.id));
        }
      } else {
        alert('Failed to update feature status');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating status');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Permanently remove this asset from the gallery?')) return;
    
    try {
      const res = await fetch(`/api/gallery/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setAllImages(prev => prev.filter(img => img.id !== id));
        setFeaturedImages(prev => prev.filter(img => img.id !== id));
        setLightbox(null);
      } else {
        alert('Failed to remove asset');
      }
    } catch (err) {
      console.error(err);
      alert('Error removing asset');
    }
  };

  if (loading) return (
    <section id="gallery" className="h-screen bg-[#050505] flex items-center justify-center scroll-mt-20">
      <div className="w-10 h-10 border-2 border-gold/20 border-t-gold rounded-full animate-spin" />
    </section>
  );

  if (allImages.length === 0) return (
    <section id="gallery" className="h-0 opacity-0 pointer-events-none scroll-mt-20" />
  );

  return (
    <section id="gallery" className="snap-section relative bg-[#050505] overflow-hidden scroll-mt-20">

      {/* Shift selector */}
      <div className="sticky top-0 z-40 bg-[#050505]/95 backdrop-blur-xl border-b border-gold/8 px-6 lg:px-10">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between py-3">
          <div className="flex items-center gap-2 text-white/20">
            <Layers size={12} /><span className="text-[9px] tracking-[0.5em] uppercase font-sans ml-1">Shift</span>
          </div>
          <div className="flex overflow-x-auto scrollbar-hide">
            {SHIFTS.map(s => (
              <button key={s.id} onClick={() => setShift(s.id)}
                className={`flex-shrink-0 px-5 py-3 text-[9px] uppercase tracking-widest font-sans transition-all border-b-2 ${
                  shift === s.id ? 'text-gold border-gold' : 'text-white/25 border-transparent hover:text-white/50'
                }`}>{s.label}</button>
            ))}
          </div>
          <p className="text-[9px] text-white/15 font-sans hidden lg:block italic">
            {SHIFTS.find(s => s.id === shift)?.sub}
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait">

        {/* ── SHIFT 1: SPOTLIGHT — featured images only ── */}
        {shift === 'spotlight' && (
          <motion.div key="spotlight" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="relative" style={{height:'90vh'}}>
            <AnimatePresence mode="wait">
              <motion.div key={spotIdx} initial={{opacity:0,scale:1.04}} animate={{opacity:1,scale:1}}
                exit={{opacity:0}} transition={{duration:1.2}} className="absolute inset-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={spotImages[spotIdx]?.path} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
              </motion.div>
            </AnimatePresence>
            <div className="absolute bottom-0 left-0 p-10 lg:p-20 max-w-3xl z-10">
              <motion.div key={`t-${spotIdx}`} initial={{opacity:0,y:30}} animate={{opacity:1,y:0}}
                transition={{delay:0.5,duration:0.8}}>
                {spotImages[spotIdx]?.emotional_hook && (
                  <p className="text-gold/60 text-[10px] uppercase tracking-[0.6em] font-sans mb-4">{spotImages[spotIdx].emotional_hook}</p>
                )}
                <h2 className="font-display text-4xl md:text-6xl text-white mb-5 leading-tight">{spotImages[spotIdx]?.title}</h2>
                {(spotImages[spotIdx]?.story || spotImages[spotIdx]?.description) && (
                  <p className="text-white/45 text-sm font-sans leading-relaxed max-w-xl">
                    {spotImages[spotIdx].story || spotImages[spotIdx].description}
                  </p>
                )}
              </motion.div>
            </div>
            <button onClick={() => setSpotIdx(i=>(i-1+spotImages.length)%spotImages.length)}
              className="absolute left-6 top-1/2 -translate-y-1/2 z-10 w-12 h-12 border border-white/10 hover:border-gold/50 flex items-center justify-center text-white/40 hover:text-gold transition-all">
              <ChevronLeft size={20}/>
            </button>
            <button onClick={() => setSpotIdx(i=>(i+1)%spotImages.length)}
              className="absolute right-6 top-1/2 -translate-y-1/2 z-10 w-12 h-12 border border-white/10 hover:border-gold/50 flex items-center justify-center text-white/40 hover:text-gold transition-all">
              <ChevronRight size={20}/>
            </button>
            <div className="absolute bottom-8 right-10 z-10 flex gap-1.5">
              {spotImages.slice(0,10).map((_,i)=>(
                <button key={i} onClick={()=>setSpotIdx(i)}
                  className={`h-1 rounded-full transition-all duration-300 ${i===spotIdx?'bg-gold w-8':'bg-white/20 w-1.5 hover:bg-white/40'}`}/>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── SHIFT 2: STORY — curated narrative with gallery story text ── */}
        {shift === 'story' && (
          <motion.div key="story" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="max-w-[860px] mx-auto px-6 py-20">
            {/* Gallery story header */}
            {(storyMeta.title || storyMeta.narrative) && (
              <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="mb-20 text-center">
                <p className="text-[9px] text-gold/40 uppercase tracking-[0.7em] font-sans mb-4">Gallery Story</p>
                <h2 className="font-display text-4xl md:text-5xl text-white mb-6">{storyMeta.title}</h2>
                {storyMeta.narrative && (
                  <p className="text-white/35 font-sans leading-relaxed text-sm max-w-xl mx-auto">{storyMeta.narrative}</p>
                )}
                <div className="h-px w-20 bg-gold/20 mx-auto mt-8"/>
              </motion.div>
            )}
            <div className="space-y-28">
              {storyImages.map((img,i)=>(
                <motion.div key={img.id} initial={{opacity:0,y:60}} whileInView={{opacity:1,y:0}}
                  viewport={{once:true,margin:'-80px'}} transition={{duration:0.9,ease:[0.22,1,0.36,1]}}
                  className={`flex flex-col gap-8 items-center ${i%2===0?'md:flex-row':'md:flex-row-reverse'}`}>
                  <div className="flex-shrink-0 w-full md:w-[56%] cursor-pointer group relative overflow-hidden border border-gold/8"
                    onClick={()=>setLightbox(i)}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.path} alt={img.title}
                      className="w-full aspect-[4/3] object-cover group-hover:scale-[1.03] transition-transform duration-700"/>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors flex items-center justify-center">
                      <Maximize2 size={18} className="text-white opacity-0 group-hover:opacity-70 transition-opacity"/>
                    </div>
                  </div>
                  <div className="flex-1 py-4">
                    <p className="text-[9px] text-gold/40 uppercase tracking-[0.6em] font-sans mb-4">
                      {String(i+1).padStart(2,'0')}{img.emotional_hook?` · ${img.emotional_hook}`:''}
                    </p>
                    <h3 className="font-display text-2xl md:text-3xl text-white mb-5 leading-snug">{img.title}</h3>
                    <div className="h-px w-10 bg-gold/25 mb-5"/>
                    <p className="text-white/35 font-sans leading-relaxed text-sm">{img.story||img.description||''}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── SHIFT 3: FILM STRIP — all images ── */}
        {shift === 'filmstrip' && (
          <motion.div key="filmstrip" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="py-16">
            <div className="mb-8 px-6 lg:px-10">
              <h2 className="font-display text-4xl text-white mb-1">The Collection</h2>
              <p className="text-white/25 text-sm font-sans">{allImages.length} frames · drag to explore</p>
            </div>
            <div ref={filmRef} className="overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing select-none"
              onMouseDown={e=>{
                const el=filmRef.current;if(!el)return;
                const sx=e.pageX-el.offsetLeft,sl=el.scrollLeft;
                const mv=(ev:MouseEvent)=>{el.scrollLeft=sl-(ev.pageX-el.offsetLeft-sx);};
                const up=()=>{document.removeEventListener('mousemove',mv);document.removeEventListener('mouseup',up);};
                document.addEventListener('mousemove',mv);document.addEventListener('mouseup',up);
              }}>
              <div className="flex items-end gap-3 px-6 lg:px-10 pb-6" style={{width:'max-content'}}>
                {allImages.map((img,i)=>{
                  const hs=['h-80','h-96','h-72','h-80','h-88'];
                  const ws=['w-64','w-80','w-56','w-72','w-64'];
                  return(
                    <motion.div key={img.id} initial={{opacity:0}} whileInView={{opacity:1}} viewport={{once:true}}
                      transition={{delay:(i%10)*0.03}} onClick={()=>setLightbox(i)}
                      className={`flex-shrink-0 ${ws[i%5]} ${hs[i%5]} relative group cursor-pointer overflow-hidden border border-gold/8 hover:border-gold/40 transition-all`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.path} alt={img.title} className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-700"/>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"/>
                      <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <p className="text-white text-xs font-sans truncate font-medium">{img.title}</p>
                        {img.emotional_hook&&<p className="text-gold/50 text-[9px] uppercase tracking-widest font-sans mt-1">{img.emotional_hook}</p>}
                      </div>
                      <div className="absolute top-3 left-3 text-[8px] text-white/25 font-sans">{String(i+1).padStart(3,'0')}</div>
                      {isManaging && (
                        <div className="absolute top-3 right-3 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleToggleFeature(img); }}
                            className={`w-7 h-7 flex items-center justify-center transition-colors shadow-lg ${img.featured ? 'bg-gold text-black' : 'bg-black/70 text-gold hover:bg-gold hover:text-black'}`}
                            title={img.featured ? "Remove from History" : "Add to History"}
                          >
                            <Star size={11} fill={img.featured ? "currentColor" : "none"} />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDelete(img.id); }}
                            className="w-7 h-7 bg-red-600 flex items-center justify-center text-white hover:bg-red-500 transition-colors shadow-lg"
                            title="Delete Image"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── SHIFT 4: MOSAIC — all images ── */}
        {shift === 'mosaic' && (
          <motion.div key="mosaic" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="max-w-[1400px] mx-auto px-6 lg:px-10 py-16">
            <div className="mb-10">
              <h2 className="font-display text-5xl md:text-6xl text-white mb-2">Gallery</h2>
              <p className="text-white/25 text-sm font-sans">
                {allImages.length < totalCount ? `Showing ${allImages.length} of ${totalCount}` : `${allImages.length} images`} · The Dubai Mall
              </p>
            </div>
            <div className="columns-2 md:columns-3 lg:columns-4 gap-3">
              {allImages.map((img,i)=>(
                <motion.div key={img.id} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}}
                  viewport={{once:true,margin:'-30px'}} transition={{delay:(i%8)*0.05}}
                  className="break-inside-avoid mb-3 cursor-pointer group relative overflow-hidden border border-gold/5 hover:border-gold/25 transition-colors duration-500"
                  onClick={()=>setLightbox(i)}>
                  {img.media_type === 'video' ? (
                    <video src={img.path} className="w-full object-cover group-hover:scale-[1.04] transition-transform duration-700 block" autoPlay muted loop playsInline />
                  ) : (
                    <img src={img.path} alt={img.title} className="w-full object-cover group-hover:scale-[1.04] transition-transform duration-700 block"/>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400"/>
                  <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    {/* Titles hidden for luxury focus */}
                  </div>
                  <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                    <div className="w-7 h-7 bg-black/70 backdrop-blur-sm flex items-center justify-center border border-white/10">
                      <Maximize2 size={11} className="text-white/70"/>
                    </div>
                    {isManaging && (
                      <>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleToggleFeature(img); }}
                          className={`w-7 h-7 flex items-center justify-center transition-colors shadow-lg border border-white/10 ${img.featured ? 'bg-gold text-black border-gold' : 'bg-black/70 text-gold hover:bg-gold hover:text-black'}`}
                          title={img.featured ? "Remove from History" : "Add to History"}
                        >
                          <Star size={11} fill={img.featured ? "currentColor" : "none"} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); alert('Merge logic initialized for frame ' + img.id); }}
                          className="w-7 h-7 bg-black/70 border border-white/10 text-blue-400 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-colors shadow-lg"
                          title="Merge Narrative"
                        >
                          <GitMerge size={11} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); alert('Replace asset flow started.'); }}
                          className="w-7 h-7 bg-black/70 border border-white/10 text-purple-400 flex items-center justify-center hover:bg-purple-500 hover:text-white transition-colors shadow-lg"
                          title="Replace Asset"
                        >
                          <RefreshCcw size={11} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDelete(img.id); }}
                          className="w-7 h-7 bg-black/70 border border-white/10 text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors shadow-lg"
                          title="Delete Frame"
                        >
                          <Trash2 size={11} />
                        </button>
                      </>
                    )}
                  </div>

                  {isManaging && (
                    <div className="absolute inset-x-0 top-0 p-3 bg-black/60 backdrop-blur-md border-b border-gold/20 -translate-y-full group-hover:translate-y-0 transition-transform duration-500 z-10">
                       <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2">
                           <CheckCircle size={10} className="text-green-500" />
                           <span className="text-[8px] uppercase tracking-widest text-white/80 font-bold">Added to Website</span>
                         </div>
                         <span className="text-[8px] text-gold/60 font-mono">ID: {img.id}</span>
                       </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── SHIFT 5: EDITORIAL — all images ── */}
        {shift === 'editorial' && (
          <motion.div key="editorial" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="max-w-[1400px] mx-auto px-6 lg:px-10 py-20 space-y-20">
            {allImages[0]&&(
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 border border-gold/10 cursor-pointer group"
                onClick={()=>setLightbox(0)}>
                <div className="relative overflow-hidden" style={{height:'60vh'}}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={allImages[0].path} alt={allImages[0].title}
                    className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-1000"/>
                </div>
                <div className="p-10 lg:p-16 flex flex-col justify-center bg-[#070707] border-l border-gold/8">
                  <p className="text-gold/40 text-[10px] uppercase tracking-[0.7em] font-sans mb-6">Cover Story</p>
                  <h2 className="font-display text-4xl lg:text-5xl text-white mb-6 leading-tight">{allImages[0].title}</h2>
                  <div className="h-px w-10 bg-gold/25 mb-6"/>
                  <p className="text-white/35 font-sans leading-relaxed text-sm">{allImages[0].story||allImages[0].description}</p>
                  {allImages[0].emotional_hook&&<p className="mt-8 text-[9px] uppercase tracking-[0.5em] text-gold/35 font-sans">{allImages[0].emotional_hook}</p>}
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {allImages.slice(1, 13).map((img,i)=>(
                <motion.div key={img.id} initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}}
                  viewport={{once:true}} transition={{delay:i*0.08}}
                  className="cursor-pointer group" onClick={()=>setLightbox(i+1)}>
                  <div className="relative overflow-hidden mb-4 border border-gold/5 group-hover:border-gold/30 transition-colors">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.path} alt={img.title}
                      className="w-full aspect-[3/4] object-cover group-hover:scale-[1.05] transition-transform duration-700"/>
                    {img.emotional_hook&&(
                      <div className="absolute top-3 right-3 text-[8px] uppercase tracking-widest bg-black/70 text-gold/55 px-2 py-1 font-sans">{img.emotional_hook}</div>
                    )}
                  </div>
                  <p className="text-[9px] text-white/25 uppercase tracking-widest font-sans mb-1">{img.category_name}</p>
                  <h4 className="font-display text-lg text-white group-hover:text-gold transition-colors leading-snug">{img.title}</h4>
                  {img.description&&<p className="text-white/25 text-xs font-sans mt-2 line-clamp-2">{img.description}</p>}
                </motion.div>
              ))}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {allImages.slice(13, 31).map((img,i)=>(
                <div key={img.id} className="cursor-pointer group relative overflow-hidden border border-gold/5 hover:border-gold/25 transition-colors"
                  onClick={()=>setLightbox(i+13)}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.path} alt={img.title}
                    className="w-full aspect-square object-cover group-hover:scale-[1.05] transition-transform duration-500"/>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-end p-3">
                    <p className="text-white text-xs font-sans opacity-0 group-hover:opacity-100 transition-opacity font-medium">{img.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox!==null&&lightboxImg&&(
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="fixed inset-0 z-[200] bg-black/97 backdrop-blur-xl flex items-center justify-center"
            onClick={()=>setLightbox(null)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={lightboxImg.path} alt="" className="absolute inset-0 w-full h-full object-cover opacity-5 blur-3xl scale-110 pointer-events-none"/>
            <motion.div key={lightbox} initial={{opacity:0,scale:0.94}} animate={{opacity:1,scale:1}} transition={{duration:0.3}}
              className="relative z-10 flex flex-col items-center max-w-5xl w-full px-16 max-h-[90vh]"
              onClick={e=>e.stopPropagation()}>
              {lightboxImg.media_type === 'video' ? (
                <video src={lightboxImg.path} className="max-h-[70vh] max-w-full object-contain" controls autoPlay />
              ) : (
                <img src={lightboxImg.path} alt={lightboxImg.title} className="max-h-[70vh] max-w-full object-contain"/>
              )}              <div className="mt-5 text-center max-w-xl">
                {lightboxImg.emotional_hook&&<p className="text-gold/45 text-[9px] uppercase tracking-[0.6em] font-sans mb-2">{lightboxImg.emotional_hook}</p>}
                <h3 className="font-display text-xl text-white mb-2">{lightboxImg.title}</h3>
                <p className="text-white/30 text-sm font-sans leading-relaxed">{lightboxImg.story||lightboxImg.description}</p>
                <p className="text-white/15 text-[9px] uppercase tracking-widest font-sans mt-4">{lightbox+1} / {lightboxImages.length} · {lightboxImg.category_name}</p>
              </div>
            </motion.div>
            <button onClick={e=>{e.stopPropagation();nav(-1);}}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 border border-white/8 hover:border-gold/40 flex items-center justify-center text-white/30 hover:text-gold transition-all">
              <ChevronLeft size={20}/>
            </button>
            <button onClick={e=>{e.stopPropagation();nav(1);}}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 border border-white/8 hover:border-gold/40 flex items-center justify-center text-white/30 hover:text-gold transition-all">
              <ChevronRight size={20}/>
            </button>
            <button onClick={()=>setLightbox(null)}
              className="absolute top-5 right-5 w-9 h-9 border border-white/8 hover:border-red-500/40 flex items-center justify-center text-white/25 hover:text-red-400 transition-all">
              <X size={14}/>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
