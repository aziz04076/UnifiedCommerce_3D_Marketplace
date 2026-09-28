'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, ArrowRight, ShoppingBag, ShieldCheck, Sparkles } from 'lucide-react';
import { CartItem } from '@unified-commerce/types';
import { formatPrice } from '@unified-commerce/ui';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}) => {
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const freeShippingThreshold = 1000;
  const progressToFreeShipping = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/75 backdrop-blur-md"
          />

          {/* Drawer Slide-Over */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="w-screen max-w-md bg-slate-950/95 border-l border-white/10 shadow-2xl p-6 flex flex-col justify-between backdrop-blur-2xl"
            >
              {/* Header */}
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-cyan-400" />
                    <h2 className="text-lg font-bold text-white tracking-tight">Your Cart</h2>
                    <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      {items.reduce((acc, i) => acc + i.quantity, 0)} items
                    </span>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Free Shipping Progress Indicator */}
                <div className="mt-4 p-3 rounded-xl bg-slate-900/80 border border-white/5 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">
                      {subtotal >= freeShippingThreshold ? (
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" /> Free Express Shipping Unlocked!
                        </span>
                      ) : (
                        <span>
                          Add <strong className="text-cyan-300">{formatPrice(freeShippingThreshold - subtotal)}</strong> for Free Express Teleport
                        </span>
                      )}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      {Math.round(progressToFreeShipping)}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 transition-all duration-500 rounded-full"
                      style={{ width: `${progressToFreeShipping}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto my-6 space-y-4 pr-1">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
                    <div className="w-16 h-16 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center text-slate-500">
                      <ShoppingBag className="w-7 h-7" />
                    </div>
                    <p className="text-sm text-slate-300 font-medium">Your cart is empty</p>
                    <p className="text-xs text-slate-500 max-w-xs">
                      Discover next-generation cybernetic gear, 3D audio, and autonomous robotics in the catalog.
                    </p>
                    <button
                      onClick={onClose}
                      className="mt-2 px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30 transition-all"
                    >
                      Explore 3D Catalog
                    </button>
                  </div>
                ) : (
                  items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 rounded-2xl bg-slate-900/60 border border-white/5 hover:border-white/10 transition-colors"
                    >
                      {/* Thumbnail */}
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-16 h-16 rounded-xl object-cover border border-white/10 shrink-0"
                      />

                      {/* Info */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <h4 className="text-xs font-semibold text-white truncate">
                          {item.product.name}
                        </h4>
                        <div className="text-[11px] text-cyan-400 font-mono">
                          {formatPrice(item.product.price, item.product.currency)}
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 pt-1">
                          <div className="flex items-center border border-white/10 rounded-lg bg-slate-950 p-0.5 text-xs">
                            <button
                              onClick={() => onUpdateQuantity(item.id, -1)}
                              className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-white"
                            >
                              -
                            </button>
                            <span className="w-6 text-center text-xs font-medium text-white">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => onUpdateQuantity(item.id, 1)}
                              className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-white"
                            >
                              +
                            </button>
                          </div>

                          <button
                            onClick={() => onRemoveItem(item.id)}
                            className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer Summary & Checkout */}
              {items.length > 0 && (
                <div className="border-t border-white/10 pt-4 space-y-3">
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Subtotal</span>
                      <span className="font-mono text-white">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Estimated Shipping</span>
                      <span className="font-mono text-emerald-400">
                        {subtotal >= freeShippingThreshold ? 'FREE' : formatPrice(25)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm font-bold text-white pt-2 border-t border-white/5">
                      <span>Total Amount</span>
                      <span className="font-mono text-cyan-300">
                        {formatPrice(subtotal + (subtotal >= freeShippingThreshold ? 0 : 25))}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (onCheckout) onCheckout();
                      else window.location.href = '/checkout';
                    }}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-500 to-indigo-600 text-slate-950 font-bold text-sm shadow-neon-cyan hover:shadow-cyan-400/50 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <span>Proceed to Multi-Step Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <a
                    href="/cart"
                    onClick={onClose}
                    className="block text-center text-xs text-slate-400 hover:text-cyan-300 transition-colors py-1 underline"
                  >
                    View & Edit Full Cart with Coupons
                  </a>

                  <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>256-bit SSL encrypted • Instant multi-vendor dispatch</span>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
