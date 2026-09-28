'use client';

import React, { useState } from 'react';
import {
  Heart,
  ShoppingBag,
  Trash2,
  ArrowRight,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Share2,
  BellRing,
  Check,
  X
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { Navbar, Footer, Badge, Button, formatPrice } from '@unified-commerce/ui';
import { getAllCategories, getProductById } from '@unified-commerce/database';

export default function WishlistPage() {
  const { wishlistIds, toggleWishlist, addToCart, cartItems } = useCart();
  const categories = getAllCategories();

  const [copiedShare, setCopiedShare] = useState(false);
  const [alertProduct, setAlertProduct] = useState<any>(null);
  const [alertEmail, setAlertEmail] = useState('alex.vance@unified.io');
  const [alertSuccess, setAlertSuccess] = useState(false);

  // Resolve products from wishlist IDs
  const wishlistProducts = wishlistIds
    .map((id) => getProductById(id))
    .filter(Boolean) as any[];

  const handleShareWishlist = () => {
    if (typeof window !== 'undefined') {
      const shareUrl = `${window.location.origin}/wishlist?items=${wishlistIds.join(',')}`;
      navigator.clipboard.writeText(shareUrl);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  const handleSaveAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertProduct) return;
    const existing = JSON.parse(localStorage.getItem('unified_price_alerts') || '[]');
    existing.push({ productId: alertProduct.id, email: alertEmail, date: new Date().toISOString() });
    localStorage.setItem('unified_price_alerts', JSON.stringify(existing));
    setAlertSuccess(true);
    setTimeout(() => {
      setAlertSuccess(false);
      setAlertProduct(null);
    }, 1500);
  };

  return (
    <div className="relative min-h-screen text-slate-100 selection:bg-cyan-500/30 selection:text-white bg-[#07090e]">
      <Navbar
        categories={categories}
        cartCount={cartItems.reduce((acc, i) => acc + i.quantity, 0)}
        wishlistCount={wishlistIds.length}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24">
        {/* Header */}
        <div className="pb-8 border-b border-white/10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="purple" size="sm" withDot>PERSONAL ARCHIVE</Badge>
              <span className="text-xs font-mono text-slate-400">
                {wishlistProducts.length} Items Saved to Watchlist
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-2 flex items-center gap-3">
              <span>Saved Wishlist</span>
              <Heart className="w-7 h-7 text-purple-400 fill-purple-400/20" />
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {wishlistProducts.length > 0 && (
              <button
                onClick={handleShareWishlist}
                className="px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 hover:border-cyan-400/40 text-xs font-medium text-slate-200 hover:text-white flex items-center gap-1.5 transition-colors"
              >
                {copiedShare ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-cyan-400 font-semibold">Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Share Wishlist Link</span>
                  </>
                )}
              </button>
            )}
            <a
              href="/products"
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 transition-colors"
            >
              <span>Explore 3D Catalog</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Content */}
        {wishlistProducts.length === 0 ? (
          <div className="py-24 text-center rounded-3xl bg-slate-950/80 border border-white/10 p-8 space-y-5 my-12 max-w-lg mx-auto shadow-2xl">
            <div className="w-20 h-20 rounded-full bg-slate-900 border border-purple-500/30 flex items-center justify-center mx-auto text-purple-400">
              <Heart className="w-9 h-9 fill-purple-400/10 stroke-[1.5]" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Your wishlist is currently empty</h2>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                Save next-generation neural interfaces, 3D planar monitors, and biometric telemetry devices to monitor real-time stock alerts and price drops.
              </p>
            </div>
            <div className="pt-2">
              <a href="/products">
                <Button variant="primary" size="md">
                  <span>Explore 3D Hardware Catalog</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </a>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-10">
            {wishlistProducts.map((product) => (
              <div
                key={product.id}
                className="rounded-3xl bg-slate-900/90 border border-white/10 overflow-hidden flex flex-col justify-between group hover:border-purple-500/40 transition-colors shadow-xl"
              >
                <div className="relative aspect-square overflow-hidden bg-slate-950">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-950/80 border border-white/10 text-rose-400 hover:text-white hover:bg-rose-500 flex items-center justify-center transition-colors"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-3 left-3">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-950/90 text-cyan-300 border border-white/10 uppercase">
                      {product.subcategory}
                    </span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="text-[11px] text-slate-400 font-mono mb-1">{product.vendorName}</div>
                    <a
                      href={`/products/${product.slug}`}
                      className="text-sm font-bold text-white hover:text-cyan-300 transition-colors line-clamp-1 block"
                    >
                      {product.name}
                    </a>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-white/5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold font-mono text-cyan-300">
                        {formatPrice(product.price, product.currency)}
                      </span>
                      <button
                        onClick={() => setAlertProduct(product)}
                        className="text-[10px] font-mono text-cyan-400 hover:text-cyan-200 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20 flex items-center gap-1 transition-colors"
                        title="Alert on price drops or restock"
                      >
                        <BellRing className="w-3 h-3" />
                        <span>Alerts</span>
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          addToCart(product, 1);
                          toggleWishlist(product.id);
                        }}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/20 hover:brightness-110 transition-all cursor-pointer"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Move to Bag</span>
                      </button>
                      <a
                        href={`/products/${product.slug}`}
                        className="p-2.5 rounded-xl bg-slate-900 border border-white/10 text-slate-400 hover:text-white transition-colors"
                        title="View 3D Model"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Price Drop & Back-in-Stock Alert Modal */}
      {alertProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-white/10 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <BellRing className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Price-Drop & Restock Alerts</h3>
              </div>
              <button
                onClick={() => setAlertProduct(null)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Receive encrypted notifications when <span className="font-semibold text-white">{alertProduct.name}</span> drops below its current price of <span className="font-mono text-cyan-300">{formatPrice(alertProduct.price, alertProduct.currency)}</span> or when lab batches restock.
            </p>

            <form onSubmit={handleSaveAlert} className="space-y-3">
              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">NOTIFICATION EMAIL</label>
                <input
                  type="email"
                  required
                  value={alertEmail}
                  onChange={(e) => setAlertEmail(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              {alertSuccess ? (
                <div className="py-2.5 px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>Telemetry notification preference saved successfully!</span>
                </div>
              ) : (
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold transition-colors"
                >
                  Activate Alert Notification
                </button>
              )}
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
