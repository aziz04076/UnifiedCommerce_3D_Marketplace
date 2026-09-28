'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Zap, RefreshCw, Loader2, AlertCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface PriceData {
  base_price: number;
  suggested_price: number;
  floor_price: number;
  ceiling_price: number;
  demand_multiplier: number;
  confidence: number;
  reasoning: string[];
  signals: {
    hour_of_day: number;
    day_of_week: string;
    rating: number;
    category: string;
  };
  source: string;
}

interface AIPriceInsightProps {
  productId: string;
  basePrice: number;
  compact?: boolean;
}

export function AIPriceInsight({ productId, basePrice, compact = false }: AIPriceInsightProps) {
  const [data, setData] = useState<PriceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  async function fetchSuggestion() {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch('/api/ai/price-suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, base_price: basePrice }),
      });
      if (!res.ok) throw new Error();
      setData(await res.json());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchSuggestion(); }, [productId, basePrice]);

  if (compact && data) {
    const diff = data.suggested_price - data.base_price;
    const pct = ((diff / data.base_price) * 100).toFixed(1);
    const up = diff >= 0;
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-violet-500/10 border border-violet-500/20">
        <Zap className="w-3.5 h-3.5 text-violet-400 shrink-0" />
        <span className="text-xs text-slate-300">
          AI price: <span className="font-bold text-white">₹{data.suggested_price.toLocaleString('en-IN')}</span>
        </span>
        <span className={`flex items-center gap-0.5 text-[10px] font-medium ${up ? 'text-emerald-400' : 'text-red-400'}`}>
          {up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {up ? '+' : ''}{pct}%
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-slate-900/50 border border-violet-500/20 p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-violet-500/15 border border-violet-500/20 flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-violet-400" />
          </div>
          <div>
            <p className="text-xs font-semibold text-white">AI Price Intelligence</p>
            <p className="text-[10px] text-slate-400">Demand-based dynamic pricing</p>
          </div>
        </div>
        <button
          onClick={fetchSuggestion}
          disabled={loading}
          className="text-slate-500 hover:text-violet-400 transition-colors disabled:opacity-40"
          title="Refresh"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-6 gap-2 text-slate-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-xs">Analysing demand signals...</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-amber-400 py-3 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          Could not fetch pricing data. Check that the AI service is running.
        </div>
      )}

      {data && !loading && (
        <>
          {/* Price comparison */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: 'Current Price', value: data.base_price, color: 'slate' },
              { label: 'AI Suggested', value: data.suggested_price, color: 'violet', highlight: true },
              { label: 'Confidence', value: `${data.confidence}%`, color: 'emerald', isText: true },
            ].map(({ label, value, color, highlight, isText }) => (
              <div
                key={label}
                className={`rounded-xl p-3 text-center ${
                  highlight ? 'bg-violet-500/10 border border-violet-500/30' : 'bg-slate-800/40 border border-white/5'
                }`}
              >
                <p className={`text-sm font-black ${highlight ? 'text-violet-300' : 'text-white'}`}>
                  {isText ? value : `₹${Number(value).toLocaleString('en-IN')}`}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Price range slider visual */}
          <div className="mb-4">
            <div className="flex justify-between text-[10px] text-slate-500 mb-1.5">
              <span>Floor ₹{data.floor_price.toLocaleString('en-IN')}</span>
              <span>Ceiling ₹{data.ceiling_price.toLocaleString('en-IN')}</span>
            </div>
            <div className="relative h-2 rounded-full bg-slate-800">
              {/* Suggested marker */}
              {(() => {
                const range = data.ceiling_price - data.floor_price;
                const pos = ((data.suggested_price - data.floor_price) / range) * 100;
                return (
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-violet-500 border-2 border-white shadow-lg shadow-violet-500/50"
                    style={{ left: `${Math.max(0, Math.min(100, pos))}%`, transform: 'translateX(-50%) translateY(-50%)' }}
                  />
                );
              })()}
              <div className="h-full rounded-full bg-gradient-to-r from-slate-700 via-violet-600 to-slate-700 opacity-30" />
            </div>
          </div>

          {/* Demand signals */}
          <div className="space-y-1.5 mb-4">
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Demand Signals</p>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { label: 'Time', value: `${data.signals.hour_of_day}:00 · ${data.signals.day_of_week}` },
                { label: 'Multiplier', value: `×${data.demand_multiplier}` },
                { label: 'Rating', value: `${data.signals.rating}★` },
                { label: 'Category', value: data.signals.category.replace(/-/g, ' ') },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between px-2.5 py-1.5 rounded-lg bg-slate-800/40 text-[10px]">
                  <span className="text-slate-500">{label}</span>
                  <span className="text-white font-medium capitalize">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Reasoning */}
          {data.reasoning.length > 0 && (
            <div className="space-y-1">
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Reasoning</p>
              {data.reasoning.map((r, i) => (
                <div key={i} className="flex items-start gap-2 text-[11px] text-slate-300">
                  <TrendingUp className="w-3 h-3 text-violet-400 shrink-0 mt-0.5" />
                  {r}
                </div>
              ))}
            </div>
          )}

          <p className="text-[9px] text-slate-600 mt-3 text-right">
            {data.source === 'ai-service' ? '🤖 Powered by Neural Pricing Engine' : '⚡ Local heuristic model'}
          </p>
        </>
      )}
    </div>
  );
}
