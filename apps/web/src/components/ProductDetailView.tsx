'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  ShoppingBag,
  ShieldCheck,
  Sparkles,
  Zap,
  Check,
  Heart,
  Share2,
  Truck,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  Layers,
  ThumbsUp,
  MessageSquare,
  Package,
} from 'lucide-react';
import { Product, ProductCategory, Vendor, CartItem, ProductReview, ProductBundle } from '@unified-commerce/types';
import {
  Button,
  GlassCard,
  Badge,
  ProductCard3D,
  Navbar,
  Footer,
  formatPrice,
} from '@unified-commerce/ui';
import { QuickViewModal } from './QuickViewModal';
import { CartDrawer } from './CartDrawer';
import { SearchModal } from './SearchModal';
import { ReviewSummarizer } from './ReviewSummarizer';
import { VariantSelector, ProductVariant } from './VariantSelector';
import { SizeGuideModal } from './SizeGuideModal';
import { ProductQnA } from './ProductQnA';
import { RecentlyViewedStrip } from './RecentlyViewedStrip';
import { FrequentlyBoughtTogether } from './FrequentlyBoughtTogether';
import { useCart } from '../context/CartContext';

// Dynamically import Product3DStudio with SSR disabled for flawless WebGL initialization
const Product3DStudio = dynamic(
  () => import('./Product3DStudio').then((mod) => mod.Product3DStudio),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[460px] rounded-3xl bg-slate-950/80 border border-white/10 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
          <span className="text-xs font-mono text-cyan-300">Loading 3D Model...</span>
        </div>
      </div>
    ),
  }
);

interface ProductDetailViewProps {
  product: Product;
  vendor: Vendor;
  category?: ProductCategory;
  relatedProducts: Product[];
  reviews: ProductReview[];
  bundle: ProductBundle | null;
  allProducts?: Product[];
  allCategories: ProductCategory[];
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  product,
  vendor,
  category,
  relatedProducts,
  reviews: initialReviews,
  bundle,
  allProducts = [],
  allCategories,
}) => {
  const {
    cartItems,
    wishlistIds,
    toggleWishlist,
    isInWishlist,
    addToCart,
    updateQuantity,
    removeFromCart,
  } = useCart();

  // View mode for media stage: '3d' or 'photos'
  const [mediaMode, setMediaMode] = useState<'3d' | 'photos'>('3d');
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [selectedFinish, setSelectedFinish] = useState('Obsidian Stealth');
  const [quantity, setQuantity] = useState(1);
  const isLiked = isInWishlist(product.id);
  const [reviews, setReviews] = useState<ProductReview[]>(initialReviews);
  const [isWriteReviewOpen, setIsWriteReviewOpen] = useState(false);
  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewTitle, setNewReviewTitle] = useState('');
  const [newReviewComment, setNewReviewComment] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewPhotoUrl, setNewReviewPhotoUrl] = useState('');
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  // Dynamic Product Variants with stock per size
  const productVariants: ProductVariant[] = [
    { id: `${product.id}-s`, size: 'Small (S)', finish: selectedFinish, stock: 14 },
    { id: `${product.id}-m`, size: 'Medium (M)', finish: selectedFinish, stock: Math.max(product.stock, 5) },
    { id: `${product.id}-l`, size: 'Large (L)', finish: selectedFinish, stock: 9 },
    { id: `${product.id}-xl`, size: 'Extra Large (XL)', finish: selectedFinish, stock: 0 },
  ];
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(productVariants[1]);

  const handleHelpfulVote = (reviewId: string) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, helpfulCount: (r.helpfulCount || 0) + 1 } : r))
    );
  };

  // Cart & Modal states
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [activeRole, setActiveRole] = useState('CUSTOMER');

  // Finishes
  const finishOptions = [
    { name: 'Obsidian Stealth', color: '#1E293B', ring: '#00F2FE' },
    { name: 'Cyber Titanium', color: '#64748B', ring: '#7928CA' },
    { name: 'Quantum Cyan', color: '#00F2FE', ring: '#00F2FE' },
  ];

  // Add to cart handler
  const handleAddToCart = (item: Product, qty: number, finish?: string) => {
    addToCart(item, qty, finish || selectedFinish, selectedVariant.size);
    setIsCartOpen(true);
  };

  // Add Bundle to cart handler
  const handleAddBundle = () => {
    if (!bundle) return;
    const itemsToAdd = [bundle.mainProduct, ...bundle.bundledProducts];
    itemsToAdd.forEach((p) => addToCart(p, 1));
    setIsCartOpen(true);
  };

  // Submit Review
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewAuthor.trim() || !newReviewTitle.trim()) return;

    const newRev: ProductReview = {
      id: `rev-${Date.now()}`,
      productId: product.id,
      author: newReviewAuthor,
      rating: newReviewRating,
      date: 'Today',
      title: newReviewTitle,
      comment: newReviewComment,
      verifiedPurchase: true,
      helpfulCount: 0,
      avatarUrl: newReviewPhotoUrl || undefined,
    };

    setReviews([newRev, ...reviews]);
    setIsWriteReviewOpen(false);
    setNewReviewAuthor('');
    setNewReviewTitle('');
    setNewReviewComment('');
    setNewReviewPhotoUrl('');
  };

  return (
    <div className="relative min-h-screen text-slate-100 selection:bg-cyan-500/30 selection:text-white">
      {/* Floating Navbar */}
      <Navbar
        categories={allCategories}
        cartCount={cartItems.reduce((acc, i) => acc + i.quantity, 0)}
        activeRole={activeRole}
        onRoleChange={setActiveRole}
        onSearchClick={() => setIsSearchOpen(true)}
        onCartClick={() => setIsCartOpen(true)}
      />

      {/* Breadcrumb Navigation */}
      <div className="pt-28 pb-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <nav className="flex items-center gap-2 text-xs font-mono text-slate-400 overflow-x-auto whitespace-nowrap">
          <a href="/" className="hover:text-cyan-300 transition-colors">Home</a>
          <ChevronRight className="w-3.5 h-3.5 opacity-50" />
          <a href="/products" className="hover:text-cyan-300 transition-colors">Catalog</a>
          <ChevronRight className="w-3.5 h-3.5 opacity-50" />
          <a href={`/products?category=${product.category}`} className="hover:text-cyan-300 transition-colors">
            {category?.name || product.category}
          </a>
          <ChevronRight className="w-3.5 h-3.5 opacity-50" />
          <span className="text-white truncate max-w-xs">{product.name}</span>
        </nav>
      </div>

      {/* Main Product Showcase Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: 3D Studio & Photo Switcher (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* View Mode Toggle Pill */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-950/80 border border-white/10 backdrop-blur-xl">
                <button
                  onClick={() => setMediaMode('3d')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                    mediaMode === '3d'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-neon-cyan'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>3D Interactive Studio</span>
                </button>
                <button
                  onClick={() => setMediaMode('photos')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                    mediaMode === 'photos'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-neon-cyan'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>Photography Gallery</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all ${
                    isLiked
                      ? 'bg-rose-500/20 border-rose-500/50 text-rose-400'
                      : 'bg-slate-950/70 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500' : ''}`} />
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(window.location.href);
                    alert('Product link copied to clipboard!');
                  }}
                  className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-950/70 border border-white/10 text-slate-400 hover:text-white transition-all"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Media Canvas Stage */}
            <div className="relative">
              {mediaMode === '3d' ? (
                <Product3DStudio product={product} />
              ) : (
                <div className="w-full h-[460px] lg:h-[560px] rounded-3xl bg-slate-950/80 border border-white/10 overflow-hidden flex items-center justify-center relative group">
                  <img
                    src={product.images[selectedPhotoIndex] || product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
                </div>
              )}
            </div>

            {/* Photo Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex items-center gap-3 pt-2 overflow-x-auto pb-1">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedPhotoIndex(idx);
                      setMediaMode('photos');
                    }}
                    className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 ${
                      mediaMode === 'photos' && selectedPhotoIndex === idx
                        ? 'border-cyan-400 shadow-neon-cyan scale-105'
                        : 'border-white/10 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Information, Pricing & Add to Cart (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Category / Subcategory & Badge */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <Badge variant="cyan" size="sm" withDot>
                  {product.subcategory}
                </Badge>
                {product.badge && (
                  <Badge variant="purple" size="sm">
                    {product.badge}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="font-bold text-white">{product.rating}</span>
                <a href="#reviews" className="text-slate-400 underline hover:text-cyan-300 transition-colors">
                  ({product.reviewCount} verified reviews)
                </a>
              </div>
            </div>

            {/* Title & Headline */}
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                {product.name}
              </h1>
              <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                {product.headline}
              </p>
            </div>

            {/* Price Box */}
            <div className="p-5 rounded-2xl bg-slate-950/70 border border-white/10 flex items-center justify-between">
              <div>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-extrabold text-white font-mono">
                    {formatPrice(product.price, product.currency)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm text-slate-500 line-through font-mono">
                      {formatPrice(product.originalPrice, product.currency)}
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Platform escrow protection • Zero hidden fees</span>
                </div>
              </div>

              <div className="text-right">
                <span className="inline-block text-xs font-mono px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  ● In Stock ({product.stock})
                </span>
                <div className="text-[10px] text-slate-500 mt-1">Dispatches in 24h</div>
              </div>
            </div>

            {/* Verified Vendor Trust Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-950/80 to-slate-900/80 border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={vendor.logo}
                  alt={vendor.name}
                  className="w-12 h-12 rounded-xl object-cover border border-cyan-400/30"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold text-white">{vendor.name}</h3>
                    <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="text-xs text-slate-400 font-mono flex items-center gap-2 mt-0.5">
                    <span>{vendor.location}</span>
                    <span>•</span>
                    <span className="text-cyan-400">★ {vendor.rating}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-mono font-bold text-white">{vendor.metrics.completionRate}%</div>
                <div className="text-[10px] text-slate-500">Order Fulfilled</div>
              </div>
            </div>

            {/* Finish Selector */}
            <div className="space-y-2.5">
              <label className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Finish: <strong className="text-white normal-case">{selectedFinish}</strong>
              </label>
              <div className="flex items-center gap-3">
                {finishOptions.map((f) => (
                  <button
                    key={f.name}
                    onClick={() => setSelectedFinish(f.name)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-colors ${
                      selectedFinish === f.name
                        ? 'bg-slate-900 border-cyan-400 text-white'
                        : 'bg-slate-950/60 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-white/20"
                      style={{ backgroundColor: f.color }}
                    />
                    <span>{f.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Size / Fit Variant Selector with Real-time Stock */}
            <VariantSelector
              variants={productVariants}
              selectedVariant={selectedVariant}
              onSelectVariant={setSelectedVariant}
              onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
            />

            {/* Quantity and Add to Cart Buttons */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-white/10 rounded-2xl bg-slate-950/70 p-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    -
                  </button>
                  <span className="w-10 text-center text-sm font-bold text-white font-mono">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => handleAddToCart(product, quantity)}
                  className="flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-500 to-indigo-600 text-slate-950 font-extrabold text-sm shadow-neon-cyan hover:shadow-cyan-400/50 flex items-center justify-center gap-2.5 transition-all"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>
                    Add to Cart • {formatPrice(product.price * quantity, product.currency)}
                  </span>
                </button>
              </div>

              <button
                onClick={() => {
                  handleAddToCart(product, quantity);
                }}
                className="w-full py-3 rounded-2xl bg-slate-900 border border-white/10 hover:border-cyan-400/40 text-slate-200 hover:text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all"
              >
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                <span>Instant 1-Click Buyout with Escrow</span>
              </button>
            </div>

            {/* AI Sentiment Analysis Widget */}
            {product.aiInsights && (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-950/30 via-slate-900/60 to-cyan-950/20 border border-purple-500/25 space-y-2 backdrop-blur-xl">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-purple-300">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span>Neural AI Sentiment Score</span>
                  </div>
                  <div className="flex items-center gap-1 font-mono font-bold text-cyan-300">
                    <span>{product.aiInsights.demandScore}</span>
                    <span className="text-slate-500">/100</span>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {product.aiInsights.sentimentSummary}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Specifications & Engineering Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-white/10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left: Product Description */}
          <div className="lg:col-span-1 space-y-4">
            <Badge variant="purple" size="sm">ENGINEERING MEMO</Badge>
            <h2 className="text-2xl font-bold text-white tracking-tight">Design & Tolerances</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Right: Technical Specifications Grid */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-mono font-semibold uppercase tracking-wider text-slate-400 mb-4">
              Hardware Parameters & Metrics
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(product.specs).map(([specKey, specVal]) => (
                <div
                  key={specKey}
                  className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 flex items-center justify-between"
                >
                  <span className="text-xs text-slate-400">{specKey}</span>
                  <span className="text-xs font-mono font-semibold text-white">{String(specVal)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Bought Together Bundle */}
      {bundle && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/40 border border-white/10 shadow-2xl space-y-6">
            <div className="flex items-center gap-2">
              <Badge variant="rose" size="sm" withDot>BUNDLE & SAVE {bundle.discountPercentage}%</Badge>
              <h2 className="text-xl font-bold text-white">Frequently Bought Together</h2>
            </div>

            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              {/* Product Bundle visual equation */}
              <div className="flex items-center gap-4 flex-wrap">
                {/* Main Product */}
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-900 border border-white/10">
                  <img
                    src={bundle.mainProduct.images[0]}
                    alt={bundle.mainProduct.name}
                    className="w-16 h-16 rounded-xl object-cover border border-white/10"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-white max-w-[150px] truncate">
                      {bundle.mainProduct.name}
                    </h4>
                    <span className="text-xs font-mono text-cyan-400">
                      {formatPrice(bundle.mainProduct.price)}
                    </span>
                  </div>
                </div>

                <span className="text-2xl font-bold text-slate-500">+</span>

                {/* Complementary Products */}
                {bundle.bundledProducts.map((bp) => (
                  <div key={bp.id} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-900 border border-white/10">
                    <img
                      src={bp.images[0]}
                      alt={bp.name}
                      className="w-16 h-16 rounded-xl object-cover border border-white/10"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-white max-w-[150px] truncate">
                        {bp.name}
                      </h4>
                      <span className="text-xs font-mono text-cyan-400">
                        {formatPrice(bp.price)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price & CTA */}
              <div className="flex items-center gap-6 lg:border-l lg:border-white/10 lg:pl-8">
                <div>
                  <div className="text-xs text-slate-400">Bundle Price ({1 + bundle.bundledProducts.length} Items)</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-white font-mono">
                      {formatPrice(bundle.bundlePrice)}
                    </span>
                    <span className="text-xs text-slate-500 line-through font-mono">
                      {formatPrice(bundle.totalOriginalPrice)}
                    </span>
                  </div>
                </div>

                <Button onClick={handleAddBundle} variant="primary" size="md">
                  Add Bundle to Order
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Customer Reviews Section */}
      <section id="reviews" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-white/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-8 gap-4">
          <div>
            <Badge variant="amber" size="sm" withDot>VERIFIED BUYER FEEDBACK</Badge>
            <h2 className="text-2xl font-bold text-white tracking-tight mt-1">
              Customer Telemetry & Reviews
            </h2>
          </div>

          <button
            onClick={() => setIsWriteReviewOpen(true)}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-white/10 hover:border-cyan-400/50 text-xs font-semibold text-white flex items-center gap-2 transition-all"
          >
            <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
            Write a Review
          </button>
        </div>

        {/* AI Consensus & Review Synthesis Component */}
        <div className="mb-10">
          <ReviewSummarizer productId={product.id} />
        </div>

        {/* Rating Meter Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-10 border-b border-white/10">
          <div className="p-6 rounded-2xl bg-slate-950/60 border border-white/5 text-center flex flex-col items-center justify-center">
            <span className="text-5xl font-black text-white font-mono">{product.rating}</span>
            <div className="flex items-center gap-1 text-amber-400 my-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Based on {product.reviewCount} verified transactions
            </span>
          </div>

          <div className="md:col-span-2 space-y-2 justify-center flex flex-col">
            {[
              { stars: 5, pct: 88 },
              { stars: 4, pct: 9 },
              { stars: 3, pct: 2 },
              { stars: 2, pct: 1 },
              { stars: 1, pct: 0 },
            ].map((row) => (
              <div key={row.stars} className="flex items-center gap-3 text-xs">
                <span className="w-12 font-mono text-slate-400">{row.stars} Stars</span>
                <div className="flex-1 h-2 rounded-full bg-slate-900 overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full"
                    style={{ width: `${row.pct}%` }}
                  />
                </div>
                <span className="w-10 text-right font-mono text-slate-500">{row.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-4 pt-8">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-6 rounded-2xl bg-slate-950/60 border border-white/5 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {rev.avatarUrl ? (
                    <img
                      src={rev.avatarUrl}
                      alt={rev.author}
                      className="w-9 h-9 rounded-full object-cover border border-white/10"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-cyan-500/20 text-cyan-300 font-bold flex items-center justify-center text-xs">
                      {rev.author[0]}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{rev.author}</span>
                      {rev.verifiedPurchase && (
                        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded flex items-center gap-1">
                          <Check className="w-2.5 h-2.5" /> Verified
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500">{rev.date}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>

              <h4 className="text-sm font-semibold text-white">{rev.title}</h4>
              <p className="text-xs text-slate-300 leading-relaxed">{rev.comment}</p>

              {rev.avatarUrl && (
                <div className="pt-2">
                  <img
                    src={rev.avatarUrl}
                    alt="Customer attachment"
                    className="w-24 h-24 rounded-xl object-cover border border-white/10"
                  />
                </div>
              )}

              <div className="pt-2 flex items-center gap-4 text-xs text-slate-500">
                <button
                  onClick={() => handleHelpfulVote(rev.id)}
                  className="flex items-center gap-1.5 text-slate-400 hover:text-cyan-300 transition-colors"
                >
                  <ThumbsUp className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Helpful ({rev.helpfulCount})</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Community Product Q&A Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-white/10">
        <ProductQnA productId={product.id} vendorName={vendor.name} />
      </section>

      {/* Frequently Bought Together Bundle Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-t border-white/10">
        <FrequentlyBoughtTogether currentProduct={product} />
      </section>

      {/* Related Products Carousel */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-white/10">
        <div className="space-y-1 mb-8">
          <Badge variant="cyan" size="sm">COMPLEMENTARY HARMONICS</Badge>
          <h2 className="text-2xl font-bold text-white tracking-tight">You May Also Like</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {relatedProducts.map((rp) => (
            <ProductCard3D
              key={rp.id}
              product={rp}
              onAddToCart={(p) => handleAddToCart(p, 1)}
              onQuickView={(p) => setQuickViewProduct(p)}
            />
          ))}
        </div>
      </section>

      {/* Recently Viewed Hardware Strip */}
      <RecentlyViewedStrip currentProduct={product} />

      {/* Footer */}
      <Footer />

      {/* Write a Review Modal */}
      <AnimatePresence>
        {isWriteReviewOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsWriteReviewOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-white/10 p-6 z-10 space-y-4 shadow-2xl"
            >
              <h3 className="text-lg font-bold text-white">Review {product.name}</h3>
              <form onSubmit={handleSubmitReview} className="space-y-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={newReviewAuthor}
                    onChange={(e) => setNewReviewAuthor(e.target.value)}
                    placeholder="e.g. Satoshi K."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((stars) => (
                      <button
                        type="button"
                        key={stars}
                        onClick={() => setNewReviewRating(stars)}
                        className={`p-2 rounded-xl border ${
                          newReviewRating >= stars
                            ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                            : 'border-white/10 text-slate-500'
                        }`}
                      >
                        <Star className="w-4 h-4 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Review Headline</label>
                  <input
                    type="text"
                    required
                    value={newReviewTitle}
                    onChange={(e) => setNewReviewTitle(e.target.value)}
                    placeholder="Briefly state your impressions..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Detailed Feedback</label>
                  <textarea
                    rows={4}
                    required
                    value={newReviewComment}
                    onChange={(e) => setNewReviewComment(e.target.value)}
                    placeholder="Comment on build quality, audio resolution, flight stability, or telemetry..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Attached Photo URL (Optional)</label>
                  <input
                    type="url"
                    value={newReviewPhotoUrl}
                    onChange={(e) => setNewReviewPhotoUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsWriteReviewOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <Button type="submit" variant="primary" size="sm">
                    Publish Review
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Size Guide Modal */}
      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
        category={product.category}
      />

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={(p, qty) => {
          handleAddToCart(p, qty);
          setQuickViewProduct(null);
        }}
      />

      {/* Cart Drawer */}
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

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        products={relatedProducts}
        onSelectProduct={(p) => setQuickViewProduct(p)}
      />
    </div>
  );
};
