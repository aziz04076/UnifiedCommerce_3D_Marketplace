'use client';

import React from 'react';
import { Navbar, Footer, Badge } from '@unified-commerce/ui';
import { getAllCategories } from '@unified-commerce/database';
import { useCart } from '../../context/CartContext';
import { Truck, Zap, Globe2, Plane, Clock } from 'lucide-react';

export default function ShippingPage() {
  const categories = getAllCategories();
  const { cartItems, wishlistIds } = useCart();

  return (
    <div className="relative min-h-screen text-slate-100 selection:bg-cyan-500/30 selection:text-white">
      <Navbar
        categories={categories}
        cartCount={cartItems.reduce((acc, i) => acc + i.quantity, 0)}
        wishlistCount={wishlistIds.length}
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 space-y-8">
        <div className="space-y-3">
          <Badge variant="cyan" size="sm">LOGISTICS TELEMETRY</Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Shipping & Autonomous Suborbital Logistics
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Radar tracking across 40+ countries with automated customs escrow clearance.
          </p>
        </div>

        {/* Shipping Tiers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-6 rounded-2xl bg-slate-950/70 border border-white/10 space-y-3">
            <div className="flex items-center justify-between text-cyan-400">
              <Truck className="w-5 h-5" />
              <span className="font-mono font-bold text-xs">$25 (Free over $1,000)</span>
            </div>
            <h3 className="font-bold text-white text-base">Standard Quantum Freight</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Consolidated ground & air transport. Deliveries conclude within 2 to 3 business days globally.
            </p>
            <div className="text-[11px] font-mono text-slate-500 pt-2 border-t border-white/5">
              Available worldwide
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-950/70 border border-purple-500/30 space-y-3">
            <div className="flex items-center justify-between text-purple-400">
              <Plane className="w-5 h-5" />
              <span className="font-mono font-bold text-xs">$65 (Free for VIP Gold+)</span>
            </div>
            <h3 className="font-bold text-white text-base">Hyper-Suborbital Express</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Direct point-to-point suborbital flight. Arrives tomorrow by 12:00 PM local time with automated radar pinging.
            </p>
            <div className="text-[11px] font-mono text-purple-300 pt-2 border-t border-white/5">
              Next-day guaranteed
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-950/70 border border-cyan-400/40 space-y-3">
            <div className="flex items-center justify-between text-cyan-300">
              <Zap className="w-5 h-5" />
              <span className="font-mono font-bold text-xs">$120 (Free for VIP Plat)</span>
            </div>
            <h3 className="font-bold text-white text-base">Autonomous Drone Grid</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Dispatched from metropolitan micro-hubs via autonomous quad-rotor grid within 30 minutes. Arrival within 4 hours.
            </p>
            <div className="text-[11px] font-mono text-cyan-400 pt-2 border-t border-white/5">
              Metro sectors only
            </div>
          </div>
        </div>

        {/* Detailed Shipping Info */}
        <div className="p-8 rounded-3xl bg-slate-950/70 border border-white/10 backdrop-blur-xl space-y-6 text-sm text-slate-300 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Globe2 className="w-4 h-4 text-cyan-400" />
              <span>International Delivery & Zero Unexpected Tariffs</span>
            </h2>
            <p>
              UnifiedCommerce calculates and settles all cross-border import duties and value-added taxes (VAT) at the moment of checkout. Your parcel clears customs checkpoints automatically with no supplementary carrier invoices on arrival.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Real-Time Radar Tracking</span>
            </h2>
            <p>
              Once your shipment takes flight, you can monitor exact latitude, longitude, and elevation telemetry in your order dashboard or enter your tracking ID on our live radar page.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
