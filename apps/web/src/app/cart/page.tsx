'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  Trash2,
  Bookmark,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Tag,
  Check,
  RotateCcw,
  Truck,
  Heart,
  ChevronRight,
  Plus,
  Minus,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { Navbar, Footer, Badge, Button, formatPrice } from '@unified-commerce/ui';
import { getAllCategories } from '@unified-commerce/database';

export default function CartPage() {
  const {
    cartItems,
    savedForLater,
    wishlistIds,
    appliedCoupon,
    membershipTier,
    vipDiscountPercent,
    vipDiscountAmount,
    subtotal,
    discountAmount,
    shippingFee,
    taxAmount,
    total,
    freeShippingThreshold,
    updateQuantity,
    removeFromCart,
    saveForLater,
    moveToCart,
    removeSavedForLater,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const categories = getAllCategories();
  const progressToFreeShipping = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput);
    setCouponFeedback(res);
    if (res.success) {
      setCouponInput('');
    }
  };

  const quickCoupons = ['CYBER2026', 'NEURAL100', 'FREESHIP'];

  return (
    <div className="relative min-h-screen text-slate-100 selection:bg-cyan-500/30 selection:text-white">
      <Navbar
        categories={categories}
        cartCount={cartItems.reduce((acc, i) => acc + i.quantity, 0)}
        wishlistCount={wishlistIds.length}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
        {/* Header */}
        <div className="pb-8 border-b border-white/10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="cyan" size="sm" withDot>LAB ALLOCATION</Badge>
              <span className="text-xs font-mono text-slate-400">
                {cartItems.reduce((acc, i) => acc + i.quantity, 0)} Items in Active Queue
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-2">
              Your Hardware Bag
            </h1>
          </div>

          <a
            href="/products"
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 transition-colors"
          >
            <span>Continue Browsing Catalog</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {cartItems.length === 0 && savedForLater.length === 0 ? (
          /* Empty Bag State */
          <div className="py-24 text-center rounded-3xl bg-slate-950/40 border border-white/10 p-8 space-y-4 my-10 max-w-xl mx-auto">
            <div className="w-20 h-20 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center mx-auto text-slate-500">
              <ShoppingBag className="w-10 h-10 text-cyan-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Your bag is currently empty</h2>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Explore 50+ cutting-edge verified wearable sensors, planar acoustics, and autonomous drones in 3D.
            </p>
            <div className="pt-2">
              <a href="/products">
                <Button variant="primary" size="md">
                  Explore 3D Hardware Catalog
                </Button>
              </a>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start pt-10">
            {/* Left Column: Cart Items & Saved Items (8 cols) */}
            <div className="lg:col-span-8 space-y-8">
              {/* Active Items */}
              {cartItems.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
                    Active Items ({cartItems.length})
                  </h3>

                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        className="p-5 rounded-3xl bg-slate-950/70 border border-white/10 flex flex-col sm:flex-row items-center gap-5 backdrop-blur-xl relative group hover:border-cyan-500/30 transition-all"
                      >
                        {/* Thumbnail */}
                        <a
                          href={`/products/${item.product.slug}`}
                          className="w-full sm:w-28 h-28 rounded-2xl overflow-hidden bg-slate-900 border border-white/10 shrink-0"
                        >
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="w-full h-full object-cover transition-opacity hover:opacity-90"
                          />
                        </a>

                        {/* Details */}
                        <div className="flex-1 min-w-0 space-y-1.5 w-full sm:w-auto">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">
                              {item.product.subcategory}
                            </span>
                            <span className="text-slate-500">•</span>
                            <span className="text-xs text-slate-400">{item.product.vendorName}</span>
                          </div>

                          <a
                            href={`/products/${item.product.slug}`}
                            className="text-base font-bold text-white hover:text-cyan-300 transition-colors block truncate"
                          >
                            {item.product.name}
                          </a>

                          {item.selectedColor && (
                            <div className="text-xs text-slate-400">
                              Finish: <span className="text-slate-200 font-medium">{item.selectedColor}</span>
                            </div>
                          )}

                          {/* Controls Row */}
                          <div className="flex items-center gap-4 pt-2">
                            {/* Quantity */}
                            <div className="flex items-center border border-white/10 rounded-xl bg-slate-900 p-0.5">
                              <button
                                onClick={() => updateQuantity(item.id, -1)}
                                className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-white"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-8 text-center text-xs font-mono font-bold text-white">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, 1)}
                                className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-white"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            {/* Save For Later */}
                            <button
                              onClick={() => saveForLater(item.id)}
                              className="text-xs text-slate-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
                            >
                              <Bookmark className="w-3.5 h-3.5" />
                              <span>Save for Later</span>
                            </button>

                            {/* Remove */}
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-xs text-slate-500 hover:text-rose-400 flex items-center gap-1 transition-colors ml-auto sm:ml-0"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Remove</span>
                            </button>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="text-right shrink-0 w-full sm:w-auto flex sm:flex-col justify-between items-center sm:items-end pt-3 sm:pt-0 border-t sm:border-t-0 border-white/5">
                          <div className="text-lg font-bold text-white font-mono">
                            {formatPrice(item.product.price * item.quantity, item.product.currency)}
                          </div>
                          {item.quantity > 1 && (
                            <div className="text-[11px] text-slate-500 font-mono">
                              {formatPrice(item.product.price)} each
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Saved For Later Section */}
              {savedForLater.length > 0 && (
                <div className="space-y-4 pt-6 border-t border-white/10">
                  <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-purple-400 flex items-center gap-2">
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>Saved for Later ({savedForLater.length})</span>
                  </h3>

                  <div className="space-y-3">
                    {savedForLater.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 rounded-2xl bg-slate-950/40 border border-white/5 flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="w-14 h-14 rounded-xl object-cover border border-white/10"
                          />
                          <div>
                            <h4 className="text-sm font-bold text-white">{item.product.name}</h4>
                            <div className="text-xs text-cyan-400 font-mono">
                              {formatPrice(item.product.price)}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => moveToCart(item.id)}
                            className="px-3 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 text-xs font-semibold hover:bg-cyan-500/30 transition-all"
                          >
                            Move to Bag
                          </button>
                          <button
                            onClick={() => removeSavedForLater(item.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Order Summary & Coupon (4 cols) */}
            <div className="lg:col-span-4 space-y-6 sticky top-28">
              {/* Free Express Shipping Milestone */}
              <div className="p-5 rounded-3xl bg-slate-950/70 border border-white/10 backdrop-blur-xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">
                    {subtotal >= freeShippingThreshold ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" /> Free Global Teleport Shipping Unlocked!
                      </span>
                    ) : (
                      <span>
                        Add <strong className="text-cyan-300">{formatPrice(freeShippingThreshold - subtotal)}</strong> for Free Express
                      </span>
                    )}
                  </span>
                  <span className="font-mono text-slate-500">{Math.round(progressToFreeShipping)}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${progressToFreeShipping}%` }}
                  />
                </div>
              </div>

              {/* Coupon Code Engine */}
              <div className="p-5 rounded-3xl bg-slate-950/70 border border-white/10 backdrop-blur-xl space-y-3">
                <label className="text-xs font-mono uppercase tracking-wider text-slate-400 block">
                  Promotional Protocol
                </label>

                {appliedCoupon ? (
                  <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/40 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold font-mono text-purple-300">{appliedCoupon.code}</span>
                      <p className="text-[11px] text-slate-400">{appliedCoupon.description}</p>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="w-6 h-6 rounded-full bg-purple-900/60 text-purple-300 hover:text-white flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => {
                        setCouponInput(e.target.value);
                        setCouponFeedback(null);
                      }}
                      placeholder="e.g. CYBER2026"
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 text-xs font-mono uppercase focus:outline-none focus:border-cyan-400"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-white border border-white/10 transition-colors"
                    >
                      Apply
                    </button>
                  </form>
                )}

                {couponFeedback && (
                  <div
                    className={`text-xs ${
                      couponFeedback.success ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {couponFeedback.message}
                  </div>
                )}

                {/* Quick Coupon Buttons */}
                {!appliedCoupon && (
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[10px] text-slate-500 font-mono">Try:</span>
                    {quickCoupons.map((c) => (
                      <button
                        key={c}
                        onClick={() => {
                          setCouponInput(c);
                          applyCoupon(c);
                        }}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 hover:text-cyan-300 border border-white/5 hover:border-cyan-500/20 transition-colors"
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Order Summary Receipt */}
              <div className="p-6 rounded-3xl bg-slate-950/80 border border-white/10 backdrop-blur-2xl space-y-4 shadow-2xl">
                <h3 className="text-sm font-bold text-white tracking-tight pb-3 border-b border-white/5">
                  Order Telemetry Summary
                </h3>

                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Subtotal</span>
                    <span className="font-mono text-white">{formatPrice(subtotal)}</span>
                  </div>

                  {vipDiscountAmount > 0 && (
                    <div className="flex items-center justify-between text-amber-400 font-semibold">
                      <span>VIP {membershipTier} ({vipDiscountPercent}%)</span>
                      <span className="font-mono">-{formatPrice(vipDiscountAmount)}</span>
                    </div>
                  )}

                  {discountAmount > 0 && (
                    <div className="flex items-center justify-between text-purple-400 font-semibold">
                      <span>Discount ({appliedCoupon?.code})</span>
                      <span className="font-mono">-{formatPrice(discountAmount)}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-slate-400">
                    <span>Estimated Shipping</span>
                    <span className="font-mono text-emerald-400">
                      {shippingFee === 0 ? 'FREE' : formatPrice(shippingFee)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-400">
                    <span>Estimated Sales Tax (6.5%)</span>
                    <span className="font-mono text-white">{formatPrice(taxAmount)}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-400">
                    <span>Platform Escrow Protection</span>
                    <span className="font-mono text-cyan-400">$0.00 (Sponsored)</span>
                  </div>

                  <div className="flex items-center justify-between text-base font-extrabold text-white pt-3 border-t border-white/10">
                    <span>Total Amount</span>
                    <span className="font-mono text-cyan-300 text-xl">{formatPrice(total)}</span>
                  </div>
                </div>

                <a href="/checkout" className="block pt-2">
                  <button className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-500 to-indigo-600 text-slate-950 font-extrabold text-sm shadow-neon-cyan hover:shadow-cyan-400/50 flex items-center justify-center gap-2 transition-all">
                    <span>Proceed to Animated Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </a>

                <div className="pt-2 text-[11px] text-slate-500 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>256-Bit SSL Smart Contract Escrow Guarantee</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>Direct-from-maker dispatch with live GPS tracking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <RotateCcw className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>30-Day Holographic Return / Replacement Policy</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
