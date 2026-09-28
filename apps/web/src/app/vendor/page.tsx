'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Store, TrendingUp, Shield, Zap, ChevronRight, Star, Package,
  Globe, Award, BarChart2, Users, ArrowRight, CheckCircle
} from 'lucide-react';

const STATS = [
  { label: 'Active Vendors', value: '10,000+', icon: Store },
  { label: 'GMV Processed', value: '$2.4B', icon: TrendingUp },
  { label: 'Countries', value: '78', icon: Globe },
  { label: 'Avg Vendor Rating', value: '4.7★', icon: Star },
];

const FEATURES = [
  { icon: BarChart2, title: 'AI-Powered Analytics', desc: 'Real-time GMV dashboards, cohort analysis, and revenue forecasting powered by our Neural Engine.' },
  { icon: Shield, title: 'Instant KYC Verification', desc: 'GSTIN validation, document AI parsing, and bank-account linkage in under 3 minutes.' },
  { icon: Zap, title: 'Bulk Inventory Import', desc: 'Drop a CSV/Excel of 10,000 SKUs — our pipeline normalises, enriches, and publishes them automatically.' },
  { icon: Globe, title: 'Multi-Currency Payouts', desc: 'Fiat (NEFT/SWIFT) or Crypto (USDC/ETH) payouts on D+1 settlement cycle.' },
  { icon: Package, title: 'Fulfillment Intelligence', desc: 'Auto-assign warehouse, print shipping labels, and trigger dispatch updates from one panel.' },
  { icon: Award, title: 'Commission Tiers', desc: 'Earn back up to 3% commission rebate as you hit GMV milestones each quarter.' },
];

const TESTIMONIALS = [
  { name: 'Arjun Mehta', store: 'NeoTech Gadgets', avatar: 'AM', rating: 5, text: 'Went from zero to ₹40 lakh GMV in 90 days. The AI pricing assistant alone is worth it.' },
  { name: 'Priya Sharma', store: 'AuraWear', avatar: 'PS', rating: 5, text: 'Bulk import saved us 40 hours a month. Payouts hit our account next day, every time.' },
  { name: 'Diego Reyes', store: 'QuantumAudio', avatar: 'DR', rating: 5, text: 'Best vendor portal I\'ve used across 6 platforms. The analytics depth is unreal.' },
];

export default function VendorLandingPage() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'new' | 'existing'>('new');

  useEffect(() => { setMounted(true); }, []);

  return (
    <main className="min-h-screen bg-[#030712] text-white overflow-x-hidden">
      {/* ── Animated background ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-950/20 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-violet-600/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/3 right-0 w-[400px] h-[400px] bg-indigo-600/5 blur-[100px] rounded-full" />
      </div>

      {/* ── Hero ── */}
      <section className="relative z-10 pt-32 pb-20 px-6 text-center">
        <div className={`transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-mono tracking-wider mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            VENDOR PORTAL — UNIFIED COMMERCE
          </span>

          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none mb-6">
            <span className="block text-white">Sell to</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400">
              50 Million Buyers
            </span>
          </h1>

          <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-12 leading-relaxed">
            UnifiedCommerce gives independent vendors a{' '}
            <span className="text-violet-300 font-medium">world-class storefront, AI-driven analytics,</span>{' '}
            and instant payouts — with zero upfront cost.
          </p>

          {/* Role Tabs */}
          <div className="inline-flex rounded-2xl bg-slate-900/60 border border-white/10 p-1 mb-8">
            <button
              onClick={() => setActiveTab('new')}
              className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'new'
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              New Vendor
            </button>
            <button
              onClick={() => setActiveTab('existing')}
              className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'existing'
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Existing Vendor
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {activeTab === 'new' ? (
              <>
                <Link
                  href="/vendor/onboard"
                  className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm transition-all shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 hover:-translate-y-0.5 group"
                >
                  Start Selling Today
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <p className="text-slate-500 text-xs">Free to join · No credit card needed</p>
              </>
            ) : (
              <>
                <Link
                  href="/vendor/dashboard"
                  className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm transition-all shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 hover:-translate-y-0.5 group"
                >
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <p className="text-slate-500 text-xs">Welcome back, Vendor!</p>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="relative z-10 px-6 pb-16">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-2xl bg-slate-900/50 border border-white/5 p-5 text-center hover:border-violet-500/20 transition-all">
              <Icon className="w-5 h-5 text-violet-400 mx-auto mb-2" />
              <p className="text-2xl font-black text-white">{value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="relative z-10 px-6 py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3">
            Everything you need to{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">scale</span>
          </h2>
          <p className="text-slate-400 text-center mb-12 text-sm">Built by vendors, for vendors.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="group rounded-2xl bg-slate-900/40 border border-white/5 p-6 hover:border-violet-500/25 hover:bg-violet-950/20 transition-all cursor-default">
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-4 group-hover:border-violet-500/40 transition-all">
                  <Icon className="w-5 h-5 text-violet-400" />
                </div>
                <h3 className="font-semibold text-white mb-2 text-sm">{title}</h3>
                <p className="text-slate-400 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="relative z-10 px-6 py-16 bg-gradient-to-b from-transparent via-violet-950/10 to-transparent">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">
            Live in{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-400">3 steps</span>
          </h2>
          <div className="relative flex flex-col md:flex-row items-start md:items-center gap-8 md:gap-0">
            {[
              { step: '01', title: 'Apply & KYC', desc: 'Submit business docs. Our AI verifies in minutes.' },
              { step: '02', title: 'List Products', desc: 'Upload via CSV or add manually with AI-assisted descriptions.' },
              { step: '03', title: 'Start Earning', desc: 'Orders flow in. Payouts hit your account D+1.' },
            ].map(({ step, title, desc }, i) => (
              <div key={step} className="flex-1 flex flex-col items-center text-center relative">
                {i < 2 && (
                  <div className="hidden md:block absolute right-0 top-6 w-1/2 h-px bg-gradient-to-r from-violet-500/40 to-transparent z-0" />
                )}
                <div className="w-12 h-12 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-300 font-black text-sm mb-4 relative z-10">
                  {step}
                </div>
                <h3 className="font-semibold text-white mb-1">{title}</h3>
                <p className="text-slate-400 text-xs max-w-[180px]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="relative z-10 px-6 py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Vendors{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">love us</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map(({ name, store, avatar, text }) => (
              <div key={name} className="rounded-2xl bg-slate-900/50 border border-white/5 p-6 hover:border-violet-500/20 transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-xs font-bold">
                    {avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{name}</p>
                    <p className="text-xs text-slate-400">{store}</p>
                  </div>
                  <div className="ml-auto flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">&ldquo;{text}&rdquo;</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative z-10 px-6 py-20 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="rounded-3xl bg-gradient-to-br from-violet-900/40 to-fuchsia-900/30 border border-violet-500/20 p-12">
            <h2 className="text-4xl font-black mb-4">Ready to grow?</h2>
            <p className="text-slate-400 mb-8 text-sm leading-relaxed">
              Join 10,000+ vendors already earning on UnifiedCommerce.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/vendor/onboard"
                className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm transition-all shadow-lg shadow-violet-500/30 hover:-translate-y-0.5 group"
              >
                Apply Now — It&apos;s Free
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/vendor/dashboard"
                className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 hover:border-violet-500/30 text-slate-300 font-medium text-sm transition-all"
              >
                View Demo Dashboard
              </Link>
            </div>
            <div className="mt-8 flex items-center justify-center gap-6 text-xs text-slate-500">
              {['No setup fees', 'Cancel anytime', 'D+1 payouts', 'Dedicated support'].map(f => (
                <span key={f} className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-emerald-500" />
                  {f}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
