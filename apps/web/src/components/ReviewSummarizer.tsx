'use client';

import { useState, useEffect } from 'react';
import { Sparkles, ThumbsUp, ThumbsDown, ShieldCheck, CheckCircle2, AlertTriangle, RefreshCw, BarChart3 } from 'lucide-react';
import { ReviewSummary } from '@unified-commerce/types';

interface ReviewSummarizerProps {
  productId: string;
}

export function ReviewSummarizer({ productId }: ReviewSummarizerProps) {
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchSummary() {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/review-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId }),
      });
      const data = await res.json();
      if (data.summary) {
        setSummary(data.summary);
      }
    } catch (err) {
      console.error('Failed to load review summary:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSummary();
  }, [productId]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-6 backdrop-blur-xl animate-pulse">
        <div className="h-5 w-48 bg-white/10 rounded mb-4" />
        <div className="h-4 w-full bg-white/5 rounded mb-2" />
        <div className="h-4 w-3/4 bg-white/5 rounded" />
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="rounded-2xl border border-cyan-500/20 bg-slate-950/60 p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden">
      {/* Ambient gradient glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-wide">AI Consensus & Review Synthesis</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                {summary.totalReviewsAnalyzed} VERIFIED REVIEWS
              </span>
            </div>
            <p className="text-xs text-slate-400">Aggregated sentiment, pros/cons, and aspect telemetry</p>
          </div>
        </div>
        <button
          onClick={fetchSummary}
          className="text-slate-500 hover:text-cyan-400 transition-colors p-1"
          title="Refresh summary"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* AI Verdict */}
      <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-cyan-950/20 to-violet-950/20 border border-cyan-500/15">
        <div className="flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-200 leading-relaxed font-sans">
            <span className="font-semibold text-cyan-300">Executive Verdict: </span>
            {summary.verdict}
          </p>
        </div>
      </div>

      {/* Pros & Cons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
        {/* Pros */}
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/10 p-4">
          <div className="flex items-center gap-2 mb-3">
            <ThumbsUp className="w-3.5 h-3.5 text-emerald-400" />
            <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Primary Strengths</h4>
          </div>
          <ul className="space-y-2">
            {summary.pros.map((pro, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-300 leading-relaxed">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>{pro}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Cons */}
        <div className="rounded-xl border border-amber-500/20 bg-amber-950/10 p-4">
          <div className="flex items-center gap-2 mb-3">
            <ThumbsDown className="w-3.5 h-3.5 text-amber-400" />
            <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">Considerations & Nuances</h4>
          </div>
          <ul className="space-y-2">
            {summary.cons.map((con, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-300 leading-relaxed">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>{con}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Aspect-Based Ratings */}
      <div className="mt-5 pt-4 border-t border-white/5">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
          <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
          Aspect-Based Performance Index
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {summary.aspects.map(aspect => (
            <div key={aspect.aspect} className="rounded-xl bg-slate-900/40 border border-white/5 p-3">
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-medium text-white">{aspect.aspect}</span>
                <span className="font-mono text-cyan-300 font-bold">{Math.round(aspect.score * 100)}%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-1.5">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-full"
                  style={{ width: `${Math.round(aspect.score * 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">{aspect.summary}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
