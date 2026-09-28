'use client';

import React, { useState, useMemo } from 'react';
import {
  HelpCircle,
  Search,
  ChevronDown,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  Cpu,
  MessageSquare,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { Navbar, Footer, Badge, Button } from '@unified-commerce/ui';
import { getAllCategories } from '@unified-commerce/database';
import { useCart } from '../../context/CartContext';
import Link from 'next/link';

interface FAQItem {
  id: string;
  category: 'orders' | 'security' | 'returns' | 'vip' | 'hardware';
  question: string;
  answer: string;
  badge?: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'orders',
    question: 'How fast is Quantum Suborbital Air Express & Autonomous Drone delivery?',
    answer:
      'Autonomous Drone Grid delivery dispatches within 30 minutes of escrow confirmation and arrives within 4 hours in metropolitan airspace sectors. Quantum Suborbital Transit delivers worldwide next-business-day by 12:00 PM local time. Standard ground quantum freight takes 2-3 business days.',
    badge: 'Logistics',
  },
  {
    id: 'faq-2',
    category: 'orders',
    question: 'How do I track my order telemetry in real-time?',
    answer:
      'Every order includes live GPS coordinates, altitude readings, and estimated time of arrival. Visit your Orders dashboard or enter your tracking code (e.g. QSA-9941-TK) into the live radar tracker for sub-second updates.',
  },
  {
    id: 'faq-3',
    category: 'security',
    question: 'How does UnifiedCommerce guarantee payment security (PCI-DSS SAQ-A)?',
    answer:
      'We operate under zero-trust payment architecture. Cardholder data is tokenized directly via Stripe or Razorpay SDKs and never touches or resides on our web servers. Every transaction enforces 3D Secure 2.0 / Strong Customer Authentication (SCA) with dynamic fraud velocity screening and AES-256-GCM encrypted escrow vaulting.',
    badge: 'Bank-Grade',
  },
  {
    id: 'faq-4',
    category: 'security',
    question: 'Are prices verified server-side before confirmation?',
    answer:
      'Yes. Our backend checkout pipeline independently recalculates subtotals, vendor commissions, taxes, and promotional discounts directly from database records. Any price discrepancy between client and server immediately aborts the transaction with an alert.',
  },
  {
    id: 'faq-5',
    category: 'returns',
    question: 'What is the 30-Day Zero-Friction Return Policy?',
    answer:
      'All verified artisan hardware units carry a 30-day trial period. If you are not satisfied with acoustic, telemetry, or ergonomic performance, initiate a return from your Orders dashboard to receive an instant prepaid suborbital shipping label. Funds held in smart contract escrow are refunded immediately upon carrier scan.',
    badge: '30-Day RMA',
  },
  {
    id: 'faq-6',
    category: 'returns',
    question: 'How are vendor dispute resolutions handled?',
    answer:
      'In the rare event of damaged goods or discrepancy, our Admin Dispute Resolution Center steps in with photographic telemetry review. Escrow funds remain frozen until both buyer and vendor agree, or until engineering arbitration rules.',
  },
  {
    id: 'faq-7',
    category: 'vip',
    question: 'What are the VIP Membership Tiers and Perks?',
    answer:
      'UnifiedCommerce offers four membership tiers: Bronze (Base), Silver (2% instant rebate on all items), Gold (5% instant rebate + free express delivery), and Platinum (10% rebate + free autonomous drone delivery + 24/7 dedicated human engineer concierge). Tiers upgrade automatically based on lifetime order volume.',
    badge: 'VIP Protocol',
  },
  {
    id: 'faq-8',
    category: 'vip',
    question: 'How do Store Credits and Gift Cards work together?',
    answer:
      'You can combine promotional coupons, store credit balances, and gift cards on a single checkout transaction. Gift cards deduct from your post-discount total, and remaining balances can be covered by store credit or card/UPI.',
  },
  {
    id: 'faq-9',
    category: 'hardware',
    question: 'Do hardware units require recurring software or firmware subscriptions?',
    answer:
      'Never. UnifiedCommerce strictly forbids planned obsolescence and recurring software paywalls. All onboard neural firmware upgrades, spatial audio DSP filters, and telemetry drivers are free for the lifetime of the hardware unit.',
    badge: 'Artisan Guarantee',
  },
  {
    id: 'faq-10',
    category: 'hardware',
    question: 'How does the interactive 3D WebXR studio work?',
    answer:
      'Our 3D studio is built on React Three Fiber and WebGL with demand-based rendering. You can orbit 360°, inspect holographic wireframes, customize emissive neon accent glow colors, and examine physical aerospace tolerances directly in your browser without extra plugins.',
  },
];

const CATEGORIES = [
  { id: 'all', label: 'All Protocols', icon: HelpCircle },
  { id: 'orders', label: 'Orders & Delivery', icon: Truck },
  { id: 'security', label: 'Security & Escrow', icon: ShieldCheck },
  { id: 'returns', label: 'Returns & Warranty', icon: RotateCcw },
  { id: 'vip', label: 'VIP & Membership', icon: Sparkles },
  { id: 'hardware', label: 'Hardware & 3D', icon: Cpu },
];

export default function FAQPage() {
  const categories = getAllCategories();
  const { cartItems, wishlistIds } = useCart();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({
    'faq-1': true,
    'faq-3': true,
  });

  const toggleAccordion = (id: string) => {
    setExpandedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredFaqs = useMemo(() => {
    return FAQ_DATA.filter((item) => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q) ||
        (item.badge && item.badge.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="relative min-h-screen text-slate-100 selection:bg-cyan-500/30 selection:text-white">
      <Navbar
        categories={categories}
        cartCount={cartItems.reduce((acc, i) => acc + i.quantity, 0)}
        wishlistCount={wishlistIds.length}
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
        {/* Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto mb-12">
          <Badge variant="cyan" size="sm">TELEMETRY & SUPPORT NEXUS</Badge>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-sm sm:text-base text-slate-400">
            Transparent protocols, bank-grade payment standards, autonomous drone logistics, and warranty documentation.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-xl mx-auto mt-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
            <input
              type="text"
              placeholder="Search across questions, RMA terms, or encryption protocols..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-900/80 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center justify-center gap-2 flex-wrap mb-10">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors ${
                  isSelected
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50'
                    : 'bg-slate-900/60 text-slate-400 border border-white/5 hover:text-white hover:border-white/20'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-4 max-w-4xl mx-auto">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-16 p-8 rounded-3xl bg-slate-900/40 border border-white/10 space-y-3">
              <HelpCircle className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-sm text-slate-400">No matching protocols found for your query.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="text-xs text-cyan-400 hover:underline"
              >
                Reset all filters
              </button>
            </div>
          ) : (
            filteredFaqs.map((faq) => {
              const isExpanded = !!expandedIds[faq.id];
              return (
                <div
                  key={faq.id}
                  className="rounded-2xl border border-white/10 bg-slate-950/70 overflow-hidden transition-colors hover:border-cyan-500/30"
                >
                  <button
                    type="button"
                    onClick={() => toggleAccordion(faq.id)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 select-none"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-semibold text-sm sm:text-base text-white">
                        {faq.question}
                      </span>
                      {faq.badge && (
                        <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 shrink-0">
                          {faq.badge}
                        </span>
                      )}
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-cyan-400 shrink-0 transition-transform duration-200 ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {isExpanded && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-400 border-t border-white/5 leading-relaxed">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Escalation CTA */}
        <div className="mt-16 p-8 rounded-3xl bg-gradient-to-r from-cyan-950/40 via-slate-900/60 to-purple-950/40 border border-white/10 max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-lg font-bold text-white">Have a unique hardware calibration inquiry?</h3>
            <p className="text-xs text-slate-400">
              Our Tier-3 hardware engineering team is available 24/7 for live diagnostic escalation.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/support/tickets"
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Submit Ticket</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
