'use client';

import React from 'react';
import { Navbar, Footer, Badge, Button } from '@unified-commerce/ui';
import { getAllCategories } from '@unified-commerce/database';
import { useCart } from '../../context/CartContext';
import { RotateCcw, CheckCircle2, ShieldCheck, Truck } from 'lucide-react';
import Link from 'next/link';

export default function ReturnsPage() {
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
          <Badge variant="cyan" size="sm">ZERO-FRICTION GUARANTEE</Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            30-Day Return & Escrow Refund Policy
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Automated prepaid return labels with immediate escrow release upon carrier handoff.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-slate-950/70 border border-white/10 backdrop-blur-xl space-y-6 text-sm text-slate-300 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-cyan-400" />
              <span>1. 30-Day Physical & Telemetry Trial</span>
            </h2>
            <p>
              Every unit purchased through UnifiedCommerce carries a 30-calendar-day evaluation window starting from the verified delivery timestamp recorded by the courier radar system. If a device fails to meet acoustic harmonics, ergonomics, or sensor tolerances, a return may be initiated with zero restocking fees.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Truck className="w-4 h-4 text-cyan-400" />
              <span>2. Prepaid Suborbital & Courier Return Labels</span>
            </h2>
            <p>
              Initiating an RMA through your Orders dashboard automatically issues a prepaid, pre-cleared return manifest. An autonomous courier or local suborbital logistics agent will dispatch for pickup within 24 hours of RMA creation.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>3. Smart Contract Escrow Release</span>
            </h2>
            <p>
              Unlike traditional marketplaces with 14-day refund queues, UnifiedCommerce releases escrow funds to your original payment method (Stripe, UPI, or Web3 wallet) within 60 minutes of the first carrier scan.
            </p>
          </section>

          <div className="pt-4 border-t border-white/10 flex items-center justify-between flex-wrap gap-4">
            <div>
              <h4 className="font-bold text-white">Need to return an existing order?</h4>
              <p className="text-xs text-slate-400">Locate your order number in your dashboard to begin.</p>
            </div>
            <Link
              href="/orders"
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors"
            >
              Go to Order History
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
