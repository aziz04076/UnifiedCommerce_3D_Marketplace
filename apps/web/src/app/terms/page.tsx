'use client';

import React from 'react';
import { Navbar, Footer, Badge } from '@unified-commerce/ui';
import { getAllCategories } from '@unified-commerce/database';
import { useCart } from '../../context/CartContext';
import { ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function TermsPage() {
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
          <Badge variant="cyan" size="sm">GOVERNANCE & PROTOCOLS</Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Terms of Service & Protocol Agreement
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Effective Date: January 1, 2026 • Version 3.1-Production
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-slate-950/70 border border-white/10 backdrop-blur-xl space-y-6 text-sm text-slate-300 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>1. Multi-Vendor Marketplace Operations</span>
            </h2>
            <p>
              UnifiedCommerce operates as a decentralized, multi-vendor marketplace connecting verified artisanal hardware manufacturers with global operators. By initiating a purchase or listing inventory, you acknowledge that contractual escrow obligations are executed upon payment confirmation and settled via automated smart logistics contracts.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>2. Zero-Trust Payment Processing & Escrow Hold</span>
            </h2>
            <p>
              All payments are processed under strict PCI-DSS SAQ-A compliance using tokenized elements via Stripe or Razorpay. Client prices are never trusted directly; all subtotals, tax obligations, and vendor commissions are independently computed server-side from immutable database registries. Buyer funds are held in secure escrow vaults until delivery telemetry is confirmed by carrier tracking.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>3. Artisan Guarantee & Lifetime Firmware Support</span>
            </h2>
            <p>
              Makers on UnifiedCommerce contractually certify that all hardware units are built with aerospace or medical-grade tolerances and zero planned obsolescence. Telemetry firmware updates, WebXR 3D drivers, and digital DSP sound profiles are provided free of charge for the operational lifetime of the device.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">4. Dispute Arbitration & Escrow Releases</h2>
            <p>
              In the event of physical or acoustic discrepancy, buyers retain full recourse to our 30-day Zero-Friction Return policy and internal Dispute Resolution Center. Escrow funds will remain locked until mutual resolution is achieved or final engineering arbitration is delivered.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
