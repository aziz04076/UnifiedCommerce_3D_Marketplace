'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, X, ArrowRight, CornerDownLeft, Bot, CheckCircle } from 'lucide-react';
import { Product } from '@unified-commerce/types';
import { formatPrice } from '@unified-commerce/ui';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  products,
  onSelectProduct,
}) => {
  const [query, setQuery] = useState('');
  const [activeMode, setActiveMode] = useState<'search' | 'ai'>('search');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiThinking, setIsAiThinking] = useState(false);

  // Fast client-side vector/keyword simulation
  const results = useMemo(() => {
    if (!query.trim()) return products.slice(0, 6);
    const q = query.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.headline.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)) ||
        p.vendorName.toLowerCase().includes(q)
    );
  }, [query, products]);

  const handleAiAsk = (prompt: string) => {
    setQuery(prompt);
    setActiveMode('ai');
    setIsAiThinking(true);
    setAiResponse(null);

    setTimeout(() => {
      setIsAiThinking(false);
      if (prompt.toLowerCase().includes('audio') || prompt.toLowerCase().includes('headphone')) {
        setAiResponse(
          'I analyzed your audio fidelity preferences. The **SonicForge Elysium Planar Magnetic Headphones** ($1,199) deliver an ultra-wide soundstage from 5Hz to 55kHz with zero harmonic distortion. Pairing it with the **Quantum Solaris Vacuum Tube DAC** will provide authentic analog warmth.'
        );
      } else if (prompt.toLowerCase().includes('drone') || prompt.toLowerCase().includes('lidar')) {
        setAiResponse(
          'For autonomous survey and collision avoidance, the **Vortex Phantom LiDAR Drone X4** ($2,499) features 360° LiDAR point-cloud mapping, 8K ProRes recording, and 52 minutes of sustained flight time in dense environments.'
        );
      } else if (prompt.toLowerCase().includes('ring') || prompt.toLowerCase().includes('sleep')) {
        setAiResponse(
          'The **Chronos Oura-Ring Titan Stealth** ($349) provides clinical-grade HRV, skin temperature, and sleep staging in DLC titanium with 7-day battery life and zero recurring subscription fees.'
        );
      } else {
        setAiResponse(
          `Found ${results.length} multi-vendor products matching "${prompt}". Top recommendation: **${results[0]?.name || 'Neural Wearables'}** by ${results[0]?.vendorName || 'Aether Labs'}.`
        );
      }
    }, 800);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[130] flex items-start justify-center pt-16 sm:pt-24 p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl"
        />

        {/* Modal dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.9)] overflow-hidden z-10"
        >
          {/* Header search bar */}
          <div className="p-4 border-b border-white/10 flex items-center gap-3">
            <Search className="w-5 h-5 text-cyan-400 shrink-0" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setAiResponse(null);
              }}
              placeholder="Search products or ask AI: 'Planar headphones under 1200'..."
              className="w-full bg-transparent text-white placeholder-slate-500 text-sm focus:outline-none"
            />
            {query && (
              <button
                onClick={() => {
                  setQuery('');
                  setAiResponse(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <kbd className="hidden sm:inline text-[11px] font-mono px-2 py-1 rounded bg-slate-800 text-slate-400 border border-slate-700">
              ESC
            </kbd>
          </div>

          {/* Quick AI Prompt Suggestions */}
          <div className="px-4 py-2.5 bg-slate-950/60 border-b border-white/5 flex items-center gap-2 overflow-x-auto text-xs">
            <span className="text-slate-500 text-[11px] font-mono shrink-0">Try AI:</span>
            {[
              'Planar headphones under $1200',
              'LiDAR drone with obstacle avoidance',
              'Titanium smart sleep ring',
              'Circadian sunrise lamp',
            ].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => handleAiAsk(suggestion)}
                className="px-2.5 py-1 rounded-full bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 whitespace-nowrap text-[11px] transition-colors flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-purple-400" />
                {suggestion}
              </button>
            ))}
          </div>

          {/* AI Response Card */}
          {isAiThinking && (
            <div className="p-4 m-4 rounded-xl bg-purple-950/30 border border-purple-500/30 flex items-center gap-3">
              <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-purple-200">
                Vector searching product embeddings & synthesizing neural recommendation...
              </span>
            </div>
          )}

          {aiResponse && !isAiThinking && (
            <div className="p-4 m-4 rounded-xl bg-gradient-to-br from-purple-950/40 to-slate-900 border border-purple-500/30 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
                <Bot className="w-4 h-4 text-cyan-400" />
                <span>Unified AI Assistant</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{aiResponse}</p>
            </div>
          )}

          {/* Results List */}
          <div className="max-h-80 overflow-y-auto p-3 space-y-1">
            <div className="px-3 py-1.5 text-[11px] font-mono text-slate-500 uppercase tracking-wider">
              {query.trim() ? `Search Results (${results.length})` : 'Popular Drops'}
            </div>

            {results.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No matching products found. Try rephrasing with different keywords.
              </div>
            ) : (
              results.map((product) => (
                <button
                  key={product.id}
                  onClick={() => {
                    onSelectProduct(product);
                    onClose();
                  }}
                  className="w-full p-2.5 rounded-xl hover:bg-white/5 flex items-center justify-between text-left transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-10 h-10 rounded-lg object-cover border border-white/10 shrink-0"
                    />
                    <div>
                      <div className="text-xs font-semibold text-white group-hover:text-cyan-300 transition-colors">
                        {product.name}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2">
                        <span>{product.vendorName}</span>
                        <span>•</span>
                        <span className="text-slate-500">{product.subcategory}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-bold font-mono text-white">
                      {formatPrice(product.price, product.currency)}
                    </div>
                    <div className="text-[10px] text-slate-500">★ {product.rating}</div>
                  </div>
                </button>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
