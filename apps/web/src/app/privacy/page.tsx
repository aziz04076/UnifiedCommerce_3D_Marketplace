'use client';

import React from 'react';
import { Navbar, Footer, Badge } from '@unified-commerce/ui';
import { getAllCategories } from '@unified-commerce/database';
import { useCart } from '../../context/CartContext';
import { Lock, EyeOff, ShieldCheck, Database } from 'lucide-react';

export default function PrivacyPage() {
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
          <Badge variant="cyan" size="sm">DATA INTEGRITY & ENCRYPTION</Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Privacy Policy & Zero-Knowledge Security
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            GDPR & CCPA Compliant • AES-256-GCM PII Encryption Standard
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-slate-950/70 border border-white/10 backdrop-blur-xl space-y-6 text-sm text-slate-300 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <EyeOff className="w-4 h-4 text-cyan-400" />
              <span>1. Zero Raw Cardholder Storage (PCI-DSS SAQ-A)</span>
            </h2>
            <p>
              UnifiedCommerce never captures, logs, or stores raw credit or debit card numbers on any server, database, or application container. Tokenized tokens provided by PCI-DSS compliant providers (Stripe and Razorpay) are utilized exclusively to authorize transactions.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-cyan-400" />
              <span>2. AES-256-GCM PII Vaulting at Rest</span>
            </h2>
            <p>
              All Personally Identifiable Information (PII) including physical shipping coordinates, telephone numbers, and email identities are encrypted at rest utilizing authenticated AES-256-GCM cryptography with per-record salt derivations. Only authorized suborbital couriers receive transient dispatch tokens.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-400" />
              <span>3. Telemetry Logs & Sensor Data Retention</span>
            </h2>
            <p>
              Hardware telemetry and diagnostic logs submitted during support ticketing or WebXR spatial audio calibration are scrubbed of biometric fingerprints. Users maintain full rights under GDPR to inspect, download, or cryptographically purge their complete operational profile at any time.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>4. Cookie Consent & Zero Third-Party Advertising Trackers</span>
            </h2>
            <p>
              We do not sell user data to advertising syndicates. Cookies and local storage keys (`uc_cart`, `uc_wishlist`, `uc_cookie_consent`) are employed solely for state persistence, cart reliability, and low-latency session authorization.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
