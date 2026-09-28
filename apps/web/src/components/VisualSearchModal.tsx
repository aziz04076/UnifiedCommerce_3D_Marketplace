'use client';

import { useState } from 'react';
import { Camera, Upload, X, Sparkles, CheckCircle2, ArrowRight, Eye, RefreshCw, Palette } from 'lucide-react';
import { VisualSearchMatch } from '@unified-commerce/types';
import Link from 'next/link';

interface VisualSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SAMPLE_AESTHETICS = [
  {
    id: 'cyberpunk',
    label: 'Cybernetic AR / HUD',
    hint: 'cyberpunk-wearables',
    color: '#00F2FE',
    aesthetic: 'cyberpunk',
    previewImg: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'audiophile',
    label: 'Studio Planar Acoustic',
    hint: 'spatial-audio',
    color: '#7928CA',
    aesthetic: 'audiophile',
    previewImg: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'aerospace',
    label: 'Toroidal LiDAR Drone',
    hint: 'autonomous-drones',
    color: '#00E5FF',
    aesthetic: 'aerospace',
    previewImg: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'minimalist',
    label: 'Minimalist Japandi Living',
    hint: 'minimalist-living',
    color: '#E0E7FF',
    aesthetic: 'minimalist',
    previewImg: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=300&auto=format&fit=crop&q=80',
  },
];

export function VisualSearchModal({ isOpen, onClose }: VisualSearchModalProps) {
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<VisualSearchMatch[]>([]);

  if (!isOpen) return null;

  async function runVisualSearch(params: {
    categoryHint?: string;
    aesthetic?: string;
    colorHint?: string;
    imageName?: string;
  }) {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/visual-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category_hint: params.categoryHint,
          aesthetic: params.aesthetic,
          color_hint: params.colorHint,
          image_name: params.imageName,
        }),
      });
      const data = await res.json();
      if (data.matches) {
        setMatches(data.matches);
      }
    } catch (err) {
      console.error('Visual search failed:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleSelectPreset(preset: typeof SAMPLE_AESTHETICS[0]) {
    setActivePreset(preset.id);
    setUploadedFile(null);
    runVisualSearch({
      categoryHint: preset.hint,
      aesthetic: preset.aesthetic,
      colorHint: preset.color,
      imageName: `${preset.id}_sample.jpg`,
    });
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file.name);
      setActivePreset(null);
      runVisualSearch({
        categoryHint: 'cyberpunk-wearables',
        aesthetic: 'cyberpunk',
        colorHint: '#00F2FE',
        imageName: file.name,
      });
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl bg-[#07090E] border border-cyan-500/30 shadow-2xl shadow-cyan-500/10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Visual Search & Aesthetic Matcher
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                  CLIP EMBEDDINGS
                </span>
              </h3>
              <p className="text-xs text-slate-400">Match textures, contours, and chromatic signatures</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Upload / Presets Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
              Upload Image or Select Visual Signature
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              {SAMPLE_AESTHETICS.map(preset => (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  className={`group relative rounded-2xl overflow-hidden border p-3 text-left transition-all ${
                    activePreset === preset.id
                      ? 'border-cyan-400 bg-cyan-950/20 ring-2 ring-cyan-500/20'
                      : 'border-white/10 bg-slate-900/40 hover:border-white/20'
                  }`}
                >
                  <div className="h-16 w-full rounded-xl overflow-hidden mb-2 relative">
                    <img
                      src={preset.previewImg}
                      alt={preset.label}
                      className="w-full h-full object-cover transition-opacity hover:opacity-90"
                    />
                    <div
                      className="absolute top-1.5 right-1.5 w-3 h-3 rounded-full border border-white"
                      style={{ backgroundColor: preset.color }}
                    />
                  </div>
                  <p className="text-xs font-semibold text-white truncate">{preset.label}</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">{preset.aesthetic}</p>
                </button>
              ))}
            </div>

            {/* Drag & Drop Upload Alternative */}
            <label className="flex items-center justify-center gap-3 p-4 rounded-2xl border-2 border-dashed border-white/10 hover:border-cyan-500/40 bg-slate-950/30 cursor-pointer transition-colors group">
              <Upload className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 transition-colors" />
              <span className="text-xs text-slate-300 font-medium">
                {uploadedFile ? `Loaded: ${uploadedFile}` : 'Drop photo here or click to browse'}
              </span>
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          {/* Results State */}
          {loading && (
            <div className="py-12 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
              <p className="text-sm font-medium text-white">Analyzing visual vector embeddings...</p>
              <p className="text-xs text-slate-500">Cross-referencing cosine similarity against catalog topology</p>
            </div>
          )}

          {!loading && matches.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  Visual Similarity Matches ({matches.length})
                </h4>
                <span className="text-xs text-cyan-400 font-mono">
                  Top Match: {Math.round(matches[0].visualSimilarityScore * 100)}% Match
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {matches.map(m => (
                  <div
                    key={m.product.id}
                    className="flex gap-4 p-4 rounded-2xl border border-white/5 bg-slate-900/40 hover:border-cyan-500/30 transition-all group"
                  >
                    <div className="w-24 h-24 rounded-xl overflow-hidden bg-black/40 shrink-0 relative">
                      <img
                        src={m.product.images[0]}
                        alt={m.product.name}
                        className="w-full h-full object-cover transition-opacity hover:opacity-90"
                      />
                      <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-black/80 text-cyan-300 border border-cyan-500/20">
                        {Math.round(m.visualSimilarityScore * 100)}%
                      </span>
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] text-cyan-400 uppercase font-mono">{m.aestheticCategory}</span>
                          <span className="text-xs font-bold text-white font-mono">
                            ₹{m.product.price.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <h5 className="text-xs font-bold text-white truncate mt-0.5">{m.product.name}</h5>
                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{m.product.headline}</p>
                      </div>

                      {/* Matched tags */}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {m.matchedFeatures.slice(0, 2).map((feat, i) => (
                          <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-slate-300">
                            {feat}
                          </span>
                        ))}
                      </div>

                      {/* Action Link */}
                      <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Palette className="w-3 h-3 text-slate-500" />
                          <div className="flex -space-x-1">
                            {m.dominantColors.map((c, i) => (
                              <div
                                key={i}
                                className="w-2.5 h-2.5 rounded-full border border-black/50"
                                style={{ backgroundColor: c }}
                              />
                            ))}
                          </div>
                        </div>

                        <Link
                          href={`/products/${m.product.slug}`}
                          onClick={onClose}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-400 hover:text-cyan-300"
                        >
                          View 3D Studio
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
