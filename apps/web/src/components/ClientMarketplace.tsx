'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Cpu,
  Layers,
  Zap,
  Globe2,
  Box,
  ChevronRight,
  Camera,
} from 'lucide-react';
import { Product, ProductCategory, Vendor } from '@unified-commerce/types';
import {
  Button,
  GlassCard,
  Badge,
  ProductCard3D,
  Navbar,
  Footer,
} from '@unified-commerce/ui';
import { QuickViewModal } from './QuickViewModal';
import { CartDrawer } from './CartDrawer';
import { SearchModal } from './SearchModal';
import { VisualSearchModal } from './VisualSearchModal';
import { NotificationCenter } from './NotificationCenter';
import { useCart } from '../context/CartContext';

// Dynamically import Three.js Hero Canvas with SSR disabled
const Hero3DCanvas = dynamic(
  () => import('@unified-commerce/ui').then((mod) => mod.Hero3DCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-24 h-24 rounded-full border border-cyan-500/20 bg-cyan-500/5 animate-pulse" />
      </div>
    ),
  }
);

interface ClientMarketplaceProps {
  initialProducts: Product[];
  totalCatalogCount?: number;
  categories: ProductCategory[];
  vendors: Vendor[];
}

export const ClientMarketplace: React.FC<ClientMarketplaceProps> = ({
  initialProducts,
  totalCatalogCount = 1024,
  categories,
  vendors,
}) => {
  const {
    cartItems,
    wishlistIds,
    addToCart,
    updateQuantity,
    removeFromCart,
  } = useCart();

  // Navigation & Modal States
  const [activeRole, setActiveRole] = useState('CUSTOMER');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isVisualSearchOpen, setIsVisualSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(3);
  const [currency, setCurrency] = useState('USD');
  const [language, setLanguage] = useState('EN');
  const [activePersona, setActivePersona] = useState<'all' | 'cyberpunk' | 'audiophile' | 'drones' | 'biometric'>('cyberpunk');

  // Cart operations
  const handleAddToCart = (product: Product, quantity = 1) => {
    addToCart(product, quantity);
    setIsCartOpen(true);
  };

  // Filter products by selected category
  const filteredProducts =
    selectedCategory === 'all'
      ? initialProducts
      : initialProducts.filter((p) => p.category === selectedCategory);

  const personaCategoryMap: Record<string, string> = {
    cyberpunk: 'cyberpunk-wearables',
    audiophile: 'spatial-audio',
    drones: 'autonomous-drones',
    biometric: 'biometric-tech',
  };

  const personalizedPicks = React.useMemo(() => {
    const targetCat = personaCategoryMap[activePersona];
    const scored = initialProducts.map((p) => {
      let score = p.rating * 10;
      if (targetCat && p.category === targetCat) score += 50;
      if (p.isTrending) score += 15;
      return { p, score };
    });
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 4).map((s) => s.p);
  }, [activePersona, initialProducts]);

  return (
    <div className="relative min-h-screen text-slate-100 bg-[#07090e]">
      {/* Floating Navbar */}
      <Navbar
        categories={categories}
        cartCount={cartItems.reduce((acc, i) => acc + i.quantity, 0)}
        wishlistCount={wishlistIds.length}
        activeRole={activeRole}
        onRoleChange={setActiveRole}
        onSearchClick={() => setIsSearchOpen(true)}
        onCartClick={() => setIsCartOpen(true)}
        onWishlistClick={() => { window.location.href = '/wishlist'; }}
        onNotificationClick={() => setIsNotificationOpen(true)}
        unreadNotificationsCount={unreadNotifications}
        currency={currency}
        onCurrencyChange={setCurrency}
        language={language}
        onLanguageChange={setLanguage}
      />

      {/* Hero Section */}
      <section className="relative min-h-[85vh] pt-28 pb-16 flex items-center justify-center overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Typography & CTAs */}
            <div className="lg:col-span-7 space-y-6 z-10">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-cyan-500/30 text-cyan-300 text-xs font-mono shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span>UNIFIEDCOMMERCE v2.0 • OPTIMIZED 120FPS ENGINE</span>
                </div>

                <h1 className="text-4xl sm:text-6xl xl:text-7xl font-extrabold tracking-tight text-white leading-[1.08]">
                  The Next Dimension of{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400">
                    Global Commerce
                  </span>
                </h1>

                <p className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed">
                  Step beyond flat catalogs. Explore neural-crafted wearables, planar acoustics, and autonomous drones in real-time 3D space with verified global artisans.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <a href="#featured">
                  <Button variant="primary" size="lg" icon={<Sparkles className="w-4 h-4 text-slate-950" />}>
                    Explore Showcase
                  </Button>
                </a>
                <a href="/products">
                  <Button variant="outline" size="lg" icon={<Box className="w-4 h-4 text-cyan-400" />}>
                    Full Catalog ({totalCatalogCount}+)
                  </Button>
                </a>
                <button
                  onClick={() => setIsVisualSearchOpen(true)}
                  className="px-4 py-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 hover:text-white text-sm font-semibold flex items-center gap-2 transition-colors shadow-sm"
                >
                  <Camera className="w-4 h-4 text-cyan-400" />
                  <span>Visual Search</span>
                </button>
              </div>

              {/* Micro Metrics Badges */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-white/10 max-w-lg">
                <div>
                  <div className="text-2xl font-black text-white font-mono">$4.8M+</div>
                  <div className="text-xs text-slate-400 mt-0.5">Global Volume</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-cyan-400 font-mono">100%</div>
                  <div className="text-xs text-slate-400 mt-0.5">3D Interactive</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-purple-400 font-mono">&lt; 14ms</div>
                  <div className="text-xs text-slate-400 mt-0.5">Vector Search</div>
                </div>
              </div>
            </div>

            {/* Right Column: 3D Canvas Stage */}
            <div className="lg:col-span-5 h-[380px] sm:h-[460px] lg:h-[520px] w-full relative">
              <div className="absolute inset-0 rounded-3xl bg-slate-950/80 border border-white/10 overflow-hidden shadow-2xl">
                {/* 3D Scene */}
                <Hero3DCanvas />

                {/* Floating 3D overlay tag */}
                <div className="absolute top-4 left-4 z-10 bg-slate-900/90 border border-white/10 px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-slate-300 font-mono">WEBGL GPU READY</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Market Telemetry Ticker */}
      <section className="border-y border-white/10 bg-slate-950 py-3 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between text-xs font-mono text-slate-400 overflow-x-auto gap-8 whitespace-nowrap">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>ESCROW LEDGER: <strong className="text-white">SETTLED</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
            <span>AVG VENDOR COMMISSION: <strong className="text-cyan-400">8.0% FLAT</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            <span>KYC VERIFIED MAKERS: <strong className="text-white">10/10 ACTIVE</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Globe2 className="w-3.5 h-3.5 text-pink-400" />
            <span>SUBORBITAL LOGISTICS: <strong className="text-white">TOKYO • ZURICH • SF</strong></span>
          </div>
        </div>
      </section>

      {/* Bento Grid: Featured Collections */}
      <section id="categories" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <Badge variant="cyan" size="sm" withDot>CURATED COLLECTIONS</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-2">
              Engineered for Tomorrow
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-md">
              Five premier categories designed by verified manufacturers across the globe.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono">{totalCatalogCount}+ ASSETS</span>
          </div>
        </div>

        {/* Bento Grid Layout - Zero hover transform/lift */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((cat, idx) => {
            const isLarge = idx === 0 || idx === 2;
            return (
              <Link
                key={cat.id}
                href={`/collections/${cat.slug}`}
                className={`relative rounded-3xl bg-slate-900 border border-white/10 hover:border-cyan-400/50 p-6 flex flex-col justify-between overflow-hidden cursor-pointer group transition-colors duration-150 shadow-md ${
                  isLarge ? 'md:col-span-2' : 'md:col-span-1'
                }`}
              >
                {/* Background image preview with dark gradient */}
                <div className="absolute inset-0 z-0">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover opacity-25"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
                </div>

                <div className="relative z-10 flex items-center justify-between">
                  <span className="text-xs font-mono px-3 py-1 rounded-full bg-slate-950/90 border border-white/10 text-cyan-300">
                    Collection #{idx + 1}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white group-hover:bg-cyan-400 group-hover:text-slate-950 transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>

                <div className="relative z-10 pt-20">
                  <h3 className="text-2xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {cat.subcategories?.slice(0, 3).map((sub) => (
                      <span
                        key={sub}
                        className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-900/90 border border-white/5 text-slate-300"
                      >
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Personalized AI Telemetry Ranking Section */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="cyan" size="sm" withDot>AI TELEMETRY RANKING</Badge>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                DYNAMIC EMBEDDING
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-2">
              Personalized Recommendations for Your Loadout
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Real-time catalog reordering based on your browsing affinity and neural telemetry.
            </p>
          </div>

          {/* Persona Tuning Switches */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {[
              { id: 'cyberpunk', label: '🦾 Cybernetic & AR' },
              { id: 'audiophile', label: '🎧 Audiophile Reference' },
              { id: 'drones', label: '🛸 Autonomous LiDAR' },
              { id: 'biometric', label: '🧬 Biometrics & Sleep' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setActivePersona(p.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-colors whitespace-nowrap ${
                  activePersona === p.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-slate-900 text-slate-400 border border-white/5 hover:border-white/20'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {personalizedPicks.map((product) => (
            <ProductCard3D
              key={product.id}
              product={product}
              onQuickView={setQuickViewProduct}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      </section>

      {/* Main Product Catalog Showcase (Capped to 12 items on homepage) */}
      <section id="featured" className="py-20 bg-slate-950/80 border-t border-white/5 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header & Category Filters */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-8 border-b border-white/10 gap-6">
            <div>
              <Badge variant="purple" size="sm" withDot>CURATED SHOWROOM</Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-2">
                Featured Hardware Showcase
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Displaying 12 featured items. Access all {totalCatalogCount}+ items with full filters in the Catalog Explorer.
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-cyan-400 text-slate-950'
                    : 'bg-slate-900 text-slate-400 border border-white/10 hover:text-white hover:border-white/20'
                }`}
              >
                All Showcase ({filteredProducts.length})
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.slug)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedCategory === c.slug
                      ? 'bg-cyan-400 text-slate-950'
                      : 'bg-slate-900 text-slate-400 border border-white/10 hover:text-white hover:border-white/20'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid (Capped at 12 items) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-10">
            {filteredProducts.slice(0, 12).map((product) => (
              <ProductCard3D
                key={product.id}
                product={product}
                onAddToCart={(p) => handleAddToCart(p, 1)}
                onQuickView={(p) => setQuickViewProduct(p)}
              />
            ))}
          </div>

          {/* Direct CTA to full catalog */}
          <div className="mt-12 text-center p-8 rounded-3xl bg-slate-900 border border-white/10 max-w-2xl mx-auto space-y-3">
            <h3 className="text-xl font-bold text-white">Looking for something specific?</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Explore the full catalog of {totalCatalogCount}+ items with deep filtering by maker, price range, suborbital transit time, and planar acoustics.
            </p>
            <div className="pt-2">
              <a href="/products">
                <Button variant="primary" size="md">
                  <span>Open Full Catalog Explorer</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Verified Global Vendors Section */}
      <section id="vendors" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <Badge variant="emerald" size="sm" withDot>VERIFIED ARTISANAL VENDORS</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Curated Global Makers
          </h2>
          <p className="text-sm text-slate-400">
            Every vendor undergoes cryptographic KYC verification and guarantees direct-from-lab shipping with escrow payment security.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vendors.slice(0, 6).map((vendor) => (
            <GlassCard key={vendor.id} variant="default" interactive className="space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src={vendor.logo}
                  alt={vendor.name}
                  className="w-12 h-12 rounded-2xl object-cover border border-cyan-400/40"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-base font-bold text-white">{vendor.name}</h3>
                    <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  </div>
                  <span className="text-xs text-slate-400 font-mono">{vendor.location}</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                {vendor.description}
              </p>

              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/5 text-center font-mono">
                <div className="bg-slate-950 p-2 rounded-xl border border-white/5">
                  <div className="text-xs font-bold text-white">★ {vendor.rating}</div>
                  <div className="text-[10px] text-slate-500">Rating</div>
                </div>
                <div className="bg-slate-950 p-2 rounded-xl border border-white/5">
                  <div className="text-xs font-bold text-cyan-400">{vendor.metrics.completionRate}%</div>
                  <div className="text-[10px] text-slate-500">Fulfillment</div>
                </div>
                <div className="bg-slate-950 p-2 rounded-xl border border-white/5">
                  <div className="text-xs font-bold text-purple-400">{vendor.metrics.avgDeliveryDays}d</div>
                  <div className="text-[10px] text-slate-500">Avg Transit</div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Modals & Drawers */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={(p, qty) => {
          handleAddToCart(p, qty);
          setQuickViewProduct(null);
        }}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        onCheckout={() => {
          setIsCartOpen(false);
          window.location.href = '/checkout';
        }}
      />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        products={initialProducts}
        onSelectProduct={(p) => setQuickViewProduct(p)}
      />

      <VisualSearchModal
        isOpen={isVisualSearchOpen}
        onClose={() => setIsVisualSearchOpen(false)}
      />

      <NotificationCenter
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        onUnreadCountChange={setUnreadNotifications}
      />
    </div>
  );
};

ClientMarketplace.displayName = 'ClientMarketplace';
