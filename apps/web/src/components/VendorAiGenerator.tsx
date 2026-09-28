'use client';

import { useState } from 'react';
import { Sparkles, Wand2, Check, Copy, Tag, DollarSign, FileText, ArrowRight, Loader2, RefreshCw } from 'lucide-react';
import { VendorAiMetadata } from '@unified-commerce/types';

interface VendorAiGeneratorProps {
  initialName?: string;
  initialCategory?: string;
  initialPrice?: number;
  onApply?: (metadata: VendorAiMetadata) => void;
}

export function VendorAiGenerator({
  initialName = '',
  initialCategory = 'cyberpunk-wearables',
  initialPrice = 24999,
  onApply,
}: VendorAiGeneratorProps) {
  const [name, setName] = useState(initialName);
  const [category, setCategory] = useState(initialCategory);
  const [rawPrice, setRawPrice] = useState(initialPrice);
  const [loading, setLoading] = useState(false);
  const [metadata, setMetadata] = useState<VendorAiMetadata | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  async function handleGenerate() {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/ai/vendor-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          category,
          raw_price: rawPrice,
          key_features: ['Aerospace grade titanium chassis', 'Zero-latency neural bridge', 'Sub-millimeter LiDAR precision'],
        }),
      });
      const data = await res.json();
      if (data.metadata) {
        setMetadata(data.metadata);
      }
    } catch (err) {
      console.error('AI generation failed:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleCopy(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  }

  return (
    <div className="rounded-3xl border border-violet-500/20 bg-slate-900/60 p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between pb-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-white shadow-lg shadow-violet-500/25">
            <Wand2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Neural Listing & SEO Generator
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/20">
                1-CLICK AI COPYWRITER
              </span>
            </h3>
            <p className="text-xs text-slate-400">Generate high-converting titles, descriptions, and metadata</p>
          </div>
        </div>
      </div>

      {/* Inputs Form */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-5">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Product Title / Prototype Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Apex Neural Band X2"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/60 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Category</label>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/60 border border-white/10 text-xs text-white focus:outline-none focus:border-violet-500"
          >
            <option value="cyberpunk-wearables">Cyberpunk Wearables & AR</option>
            <option value="spatial-audio">Spatial Audio & Sound</option>
            <option value="autonomous-drones">Autonomous Drones</option>
            <option value="minimalist-living">Minimalist Smart Living</option>
            <option value="biometric-tech">Kinetic & Biometric Tech</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Base Manufacturing Cost / Target (₹)</label>
          <input
            type="number"
            value={rawPrice}
            onChange={e => setRawPrice(Number(e.target.value))}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/60 border border-white/10 text-xs text-white focus:outline-none focus:border-violet-500"
          />
        </div>
      </div>

      {/* Trigger Button */}
      <button
        onClick={handleGenerate}
        disabled={loading || !name.trim()}
        className="w-full py-3 rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-600 hover:opacity-90 disabled:opacity-40 font-semibold text-xs text-white shadow-lg shadow-violet-500/25 flex items-center justify-center gap-2 transition-all"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
        {loading ? 'Synthesizing Technical Specs & Copy...' : 'Generate Listing Copy & SEO Package'}
      </button>

      {/* Generated Output */}
      {metadata && (
        <div className="mt-6 pt-6 border-t border-white/10 space-y-4 animate-fadeIn">
          {/* Headline & SEO Title */}
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-white/5 space-y-3">
            <div className="flex justify-between items-start gap-2">
              <div>
                <span className="text-[10px] font-mono uppercase text-violet-400 font-bold">Generated Commercial Title</span>
                <p className="text-sm font-bold text-white mt-0.5">{metadata.title}</p>
              </div>
              <button
                onClick={() => handleCopy(metadata.title, 'title')}
                className="text-slate-400 hover:text-white p-1"
                title="Copy title"
              >
                {copiedKey === 'title' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase text-violet-400 font-bold">High-Conversion Headline</span>
              <p className="text-xs text-slate-300 italic mt-0.5">&ldquo;{metadata.headline}&rdquo;</p>
            </div>
          </div>

          {/* Description */}
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-white/5">
            <div className="flex justify-between items-start gap-2 mb-2">
              <span className="text-[10px] font-mono uppercase text-violet-400 font-bold">Artisan Hardware Description</span>
              <button
                onClick={() => handleCopy(metadata.description, 'desc')}
                className="text-slate-400 hover:text-white p-1"
              >
                {copiedKey === 'desc' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{metadata.description}</p>

            <ul className="mt-3 space-y-1.5 border-t border-white/5 pt-3">
              {metadata.bulletPoints.map((bp, i) => (
                <li key={i} className="text-[11px] text-slate-400 flex items-start gap-2">
                  <span className="text-violet-400 mt-0.5">•</span>
                  <span>{bp}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* SEO & Pricing Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Keywords */}
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-white/5">
              <span className="text-[10px] font-mono uppercase text-violet-400 font-bold flex items-center gap-1 mb-2">
                <Tag className="w-3 h-3" /> Target SEO Keywords
              </span>
              <div className="flex flex-wrap gap-1.5">
                {metadata.targetKeywords.map((kw, i) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/20">
                    {kw}
                  </span>
                ))}
              </div>
            </div>

            {/* Price corridor */}
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-white/5">
              <span className="text-[10px] font-mono uppercase text-violet-400 font-bold flex items-center gap-1 mb-2">
                <DollarSign className="w-3 h-3" /> Algorithmic Price Range
              </span>
              <div className="flex items-center justify-between text-xs">
                <div>
                  <p className="text-[10px] text-slate-400">Min Floor</p>
                  <p className="font-mono font-bold text-white">₹{metadata.suggestedPriceRange.min.toLocaleString('en-IN')}</p>
                </div>
                <div className="text-center px-2 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-[10px] text-emerald-400 font-bold">Optimal GMV</p>
                  <p className="font-mono font-bold text-emerald-300">₹{metadata.suggestedPriceRange.optimal.toLocaleString('en-IN')}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400">Ceiling</p>
                  <p className="font-mono font-bold text-white">₹{metadata.suggestedPriceRange.max.toLocaleString('en-IN')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Apply Callback */}
          {onApply && (
            <button
              onClick={() => onApply(metadata)}
              className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2"
            >
              <Check className="w-3.5 h-3.5" />
              Apply Metadata to Active Product Listing
            </button>
          )}
        </div>
      )}
    </div>
  );
}
