'use client';

import React, { useState } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Cpu, Globe2, Heart, CheckCircle2 } from 'lucide-react';
import { Button } from './Button';
import { Badge } from './Badge';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 4000);
      setEmail('');
    }
  };

  return (
    <footer className="relative border-t border-white/10 bg-slate-950 pt-20 pb-12 overflow-hidden text-slate-400">
      {/* Aurora glow accent in footer background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-cyan-500/10 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-16 border-b border-white/5">
          {/* Brand Info & Status */}
          <div className="lg:col-span-2 space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-400 via-sky-500 to-indigo-600 p-0.5 shadow-neon-cyan">
                <div className="w-full h-full bg-slate-950 rounded-[7px] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                </div>
              </div>
              <span className="text-lg font-extrabold text-white tracking-tight">
                Unified<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">Commerce</span>
              </span>
            </div>

            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              The next-generation AI-powered 3D multi-vendor e-commerce platform. Real-time vector search, kinetic 3D previews, and verified global craftspeople.
            </p>

            {/* Live Operational Status Indicator */}
            <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-slate-900/90 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10B981] animate-pulse" />
              <span>All 6 AI Microservices Operational</span>
            </div>
          </div>

          {/* Column 1: Marketplace */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-200">
              Marketplace
            </h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/products?category=cyberpunk-wearables" className="hover:text-cyan-300 transition-colors">Neural Wearables</a></li>
              <li><a href="/products?category=spatial-audio" className="hover:text-cyan-300 transition-colors">Spatial Audio</a></li>
              <li><a href="/products?category=autonomous-drones" className="hover:text-cyan-300 transition-colors">Autonomous Robotics</a></li>
              <li><a href="/products?category=kinetic-horology" className="hover:text-cyan-300 transition-colors">Kinetic Horology</a></li>
              <li><a href="/products" className="hover:text-cyan-300 transition-colors">Full Catalog Explorer</a></li>
            </ul>
          </div>

          {/* Column 2: Governance & Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-200">
              Operations & Help
            </h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/vendor" className="hover:text-cyan-300 transition-colors">Vendor Portal</a></li>
              <li><a href="/admin" className="hover:text-cyan-300 transition-colors">Admin Command Center</a></li>
              <li><a href="/faq" className="hover:text-cyan-300 transition-colors">Help Center / FAQ</a></li>
              <li><a href="/support/tickets" className="hover:text-cyan-300 transition-colors">Support Ticketing</a></li>
              <li><a href="/compare" className="hover:text-cyan-300 transition-colors">Product Comparison</a></li>
            </ul>
          </div>

          {/* Column 3: Newsletter & Early Access */}
          <div className="space-y-4">
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-200">
              Neural Dispatch
            </h4>
            <p className="text-xs text-slate-400">
              Curated drops and exclusive firmware releases. Zero spam.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@nexus.io"
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-all"
                />
              </div>
              <Button type="submit" variant="primary" size="sm" className="w-full text-xs">
                {subscribed ? (
                  <span className="flex items-center gap-1.5 text-slate-950 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Subscribed
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-1">
                    Join Network <ArrowRight className="w-3 h-3" />
                  </span>
                )}
              </Button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 UnifiedCommerce Inc. Built with Next.js 14, Three.js & FastAPI.</p>
          <div className="flex items-center gap-6">
            <a href="/privacy" className="hover:text-slate-400 transition-colors">Privacy Policy</a>
            <a href="/terms" className="hover:text-slate-400 transition-colors">Terms of Protocol</a>
            <a href="/returns" className="hover:text-slate-400 transition-colors">30-Day Returns</a>
            <a href="/shipping" className="hover:text-slate-400 transition-colors">Suborbital Shipping</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

Footer.displayName = 'Footer';
