'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings2, 
  Eye, 
  Save, 
  RefreshCcw, 
  Layers, 
  Palette, 
  Sun, 
  Contrast, 
  Maximize, 
  Ghost,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import Link from 'next/link';

interface VisualConfig {
  brightness: number;
  contrast: number;
  grayscale: number;
  sepia: number;
  scale: number;
  blur: number;
  hue: number;
}

interface GalleryImage {
  id: number;
  path: string;
  title: string;
  visual_config: VisualConfig | null;
}

const DEFAULT_CONFIG: VisualConfig = {
  brightness: 100,
  contrast: 100,
  grayscale: 0,
  sepia: 0,
  scale: 1,
  blur: 0,
  hue: 0
};

const PRESETS: Record<string, VisualConfig> = {
  'Standard': DEFAULT_CONFIG,
  '7-Star Luxury': { ...DEFAULT_CONFIG, brightness: 105, contrast: 110, sepia: 10, hue: 10 },
  'Cinematic': { ...DEFAULT_CONFIG, contrast: 140, brightness: 90, scale: 1.05 },
  'Noir': { ...DEFAULT_CONFIG, grayscale: 100, contrast: 120 },
  'Vintage': { ...DEFAULT_CONFIG, sepia: 80, contrast: 90, brightness: 95 },
  'Ultra-Vibrant': { ...DEFAULT_CONFIG, contrast: 120, brightness: 110 }
};

export default function GallerySimulator() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaveLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [currentConfig, setCurrentConfig] = useState<VisualConfig>(DEFAULT_CONFIG);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/gallery?limit=100')
      .then(r => r.json())
      .then(d => {
        const processed = (d.images || []).map((img: any) => ({
          ...img,
          visual_config: typeof img.visual_config === 'string' 
            ? JSON.parse(img.visual_config) 
            : (img.visual_config || DEFAULT_CONFIG)
        }));
        setImages(processed);
        if (processed.length > 0) {
          setSelectedId(processed[0].id);
          setCurrentConfig(processed[0].visual_config);
        }
        setLoading(false);
      });
  }, []);

  const handleSelect = (img: GalleryImage) => {
    setSelectedId(img.id);
    setCurrentConfig(img.visual_config || DEFAULT_CONFIG);
  };

  const updateParam = (key: keyof VisualConfig, val: number) => {
    const next = { ...currentConfig, [key]: val };
    setCurrentConfig(next);
    setImages(prev => prev.map(img => img.id === selectedId ? { ...img, visual_config: next } : img));
  };

  const applyPreset = (preset: VisualConfig) => {
    setCurrentConfig(preset);
    setImages(prev => prev.map(img => img.id === selectedId ? { ...img, visual_config: preset } : img));
  };

  const applyToAll = () => {
    setImages(prev => prev.map(img => ({ ...img, visual_config: currentConfig })));
    setMessage('Settings applied to all images in simulation.');
    setTimeout(() => setMessage(''), 3000);
  };

  const pushToWebsite = async () => {
    setSaveLoading(true);
    try {
      const payload = {
        items: images.map(img => ({
          id: img.id,
          visual_config: img.visual_config
        }))
      };
      const res = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setMessage('✓ Successfully pushed to website!');
      } else {
        throw new Error('Failed to push');
      }
    } catch (e) {
      setMessage('✗ Error pushing changes');
    } finally {
      setSaveLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const getFilterStyle = (config: VisualConfig | null) => {
    if (!config) return {};
    return {
      filter: `brightness(${config.brightness}%) contrast(${config.contrast}%) grayscale(${config.grayscale}%) sepia(${config.sepia}%) blur(${config.blur}px) hue-rotate(${config.hue}deg)`,
      transform: `scale(${config.scale})`
    };
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-white/40">
      <Loader2 className="animate-spin mb-4" size={32} />
      <p className="font-sans uppercase tracking-[0.2em] text-[10px]">Initializing Simulator Environment...</p>
    </div>
  );

  const selectedImage = images.find(img => img.id === selectedId);

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-160px)]">
      {/* 1. Simulation Canvas */}
      <div className="flex-1 glass-card rounded-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/2">
          <div className="flex items-center gap-2">
            <Eye size={16} className="text-gold" />
            <h2 className="text-[10px] uppercase tracking-widest text-white/60 font-sans">Live Preview Canvas</h2>
          </div>
          <div className="flex items-center gap-4">
            {message && <span className="text-[10px] text-gold animate-pulse">{message}</span>}
            <button 
              onClick={pushToWebsite}
              disabled={saving}
              className="btn-gold !py-1.5 !px-4 !text-[9px] flex items-center gap-2"
            >
              {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
              Push to Website
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 bg-[#0a0a0a]">
          <div className="columns-2 md:columns-3 gap-4 space-y-4">
            {images.map(img => (
              <motion.div
                key={img.id}
                onClick={() => handleSelect(img)}
                className={`relative cursor-pointer rounded-sm overflow-hidden border-2 transition-all duration-300 ${
                  selectedId === img.id ? 'border-gold shadow-[0_0_15px_rgba(201,160,82,0.3)]' : 'border-transparent opacity-80 hover:opacity-100'
                }`}
              >
                <img 
                  src={img.path} 
                  alt={img.title}
                  className="w-full h-auto transition-all duration-300"
                  style={getFilterStyle(img.visual_config)}
                />
                {selectedId === img.id && (
                  <div className="absolute top-2 right-2 bg-gold text-dark p-1 rounded-full">
                    <CheckCircle2 size={12} />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Control Panel */}
      <div className="w-full lg:w-80 flex flex-col gap-6">
        <div className="glass-card rounded-sm p-6 flex flex-col gap-6">
          <div className="flex items-center gap-2 mb-2">
            <Settings2 size={18} className="text-gold" />
            <h3 className="font-display text-lg text-white">Look & Feel</h3>
          </div>

          {/* Presets */}
          <div>
            <label className="text-[9px] uppercase tracking-widest text-white/30 block mb-4">Master Presets</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(PRESETS).map(name => (
                <button
                  key={name}
                  onClick={() => applyPreset(PRESETS[name])}
                  className="bg-white/5 border border-white/10 hover:border-gold/40 text-[9px] uppercase tracking-tighter py-2 px-1 text-white/60 hover:text-gold transition-all"
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-white/5" />

          {/* Fine Tuning */}
          <div className="space-y-4">
            <label className="text-[9px] uppercase tracking-widest text-white/30 block">Fine Tuning</label>
            
            <ControlSlider 
              icon={<Sun size={12} />} 
              label="Brightness" 
              value={currentConfig.brightness} 
              min={50} max={150} 
              onChange={(v: number) => updateParam('brightness', v)} 
            />
            <ControlSlider 
              icon={<Contrast size={12} />} 
              label="Contrast" 
              value={currentConfig.contrast} 
              min={50} max={200} 
              onChange={(v: number) => updateParam('contrast', v)} 
            />
            <ControlSlider 
              icon={<Palette size={12} />} 
              label="Grayscale" 
              value={currentConfig.grayscale} 
              min={0} max={100} 
              onChange={(v: number) => updateParam('grayscale', v)} 
            />
            <ControlSlider 
              icon={<Layers size={12} />} 
              label="Sepia" 
              value={currentConfig.sepia} 
              min={0} max={100} 
              onChange={(v: number) => updateParam('sepia', v)} 
            />
            <ControlSlider 
              icon={<Maximize size={12} />} 
              label="Zoom" 
              value={currentConfig.scale} 
              min={1} max={1.5} step={0.01}
              onChange={(v: number) => updateParam('scale', v)} 
            />
            <ControlSlider 
              icon={<Ghost size={12} />} 
              label="Blur" 
              value={currentConfig.blur} 
              min={0} max={10} 
              onChange={(v: number) => updateParam('blur', v)} 
            />
          </div>

          <button 
            onClick={applyToAll}
            className="mt-4 flex items-center justify-center gap-2 text-[10px] text-white/40 hover:text-gold transition-colors uppercase tracking-widest"
          >
            <RefreshCcw size={12} />
            Apply Settings to All
          </button>
        </div>

        <div className="glass-card rounded-sm p-4 text-[10px] text-white/20 italic leading-relaxed">
          Design Thinking Tip: High contrast and subtle golden sepia tones reinforce the 7-star luxury aesthetic.
        </div>
      </div>
    </div>
  );
}

function ControlSlider({ icon, label, value, min, max, step = 1, onChange }: any) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-[10px] text-white/40 uppercase tracking-tighter">
        <div className="flex items-center gap-1.5">
          {icon}
          {label}
        </div>
        <span>{value}{step < 1 ? '' : '%'}</span>
      </div>
      <input 
        type="range" 
        min={min} 
        max={max} 
        step={step}
        value={value} 
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full accent-gold h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
      />
    </div>
  );
}
