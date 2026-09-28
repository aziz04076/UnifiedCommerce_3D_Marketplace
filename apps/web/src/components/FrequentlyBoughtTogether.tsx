'use client';

import React, { useState, useMemo } from 'react';
import { Product } from '@unified-commerce/types';
import { getAllProducts } from '@unified-commerce/database';
import { useCart } from '../context/CartContext';
import { formatPrice, Badge, Button } from '@unified-commerce/ui';
import { Plus, Check, ShoppingBag, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface FrequentlyBoughtTogetherProps {
  currentProduct: Product;
}

export function FrequentlyBoughtTogether({ currentProduct }: FrequentlyBoughtTogetherProps) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  // Pick 2 complementary products from the same category or related vendor
  const bundleItems = useMemo(() => {
    const all = getAllProducts();
    const candidateSameCategory = all.filter(
      (p) => p.id !== currentProduct.id && p.category === currentProduct.category
    );
    const candidateOther = all.filter(
      (p) => p.id !== currentProduct.id && p.category !== currentProduct.category
    );

    const complementary: Product[] = [];
    if (candidateSameCategory.length > 0) {
      complementary.push(candidateSameCategory[0]);
    }
    if (candidateSameCategory.length > 1) {
      complementary.push(candidateSameCategory[1]);
    } else if (candidateOther.length > 0) {
      complementary.push(candidateOther[0]);
    }

    return complementary.slice(0, 2);
  }, [currentProduct]);

  // Selected state for current product + complementary products
  const [selectedIds, setSelectedIds] = useState<string[]>([
    currentProduct.id,
    ...bundleItems.map((p) => p.id),
  ]);

  if (bundleItems.length === 0) return null;

  const allAvailable = [currentProduct, ...bundleItems];
  const activeProducts = allAvailable.filter((p) => selectedIds.includes(p.id));

  // Bundle calculation: 10% discount if all 3 items selected, 5% if 2 items
  const regularTotal = activeProducts.reduce((sum, p) => sum + p.price, 0);
  const bundleDiscountPercent = activeProducts.length === 3 ? 12 : activeProducts.length === 2 ? 6 : 0;
  const bundleDiscountAmount = Math.round((regularTotal * bundleDiscountPercent) / 100);
  const finalBundlePrice = Math.max(0, regularTotal - bundleDiscountAmount);

  const toggleProduct = (productId: string) => {
    // Current product cannot be deselected if it's the core of the page
    if (productId === currentProduct.id && selectedIds.length > 1) {
      // allow deselect only if others are selected
    }
    setSelectedIds((prev) =>
      prev.includes(productId)
        ? prev.length > 1
          ? prev.filter((id) => id !== productId)
          : prev
        : [...prev, productId]
    );
  };

  const handleAddBundleToCart = () => {
    activeProducts.forEach((p) => {
      addToCart(p, 1);
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 3000);
  };

  return (
    <div className="p-6 md:p-8 rounded-3xl bg-slate-950/70 border border-white/10 backdrop-blur-xl shadow-2xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="cyan" size="sm">BUNDLE & SAVE</Badge>
            {bundleDiscountPercent > 0 && (
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                {bundleDiscountPercent}% Instant Protocol Discount
              </span>
            )}
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">Frequently Bought Together</h3>
          <p className="text-xs text-slate-400">
            Engineered hardware ecosystem calibrated to operate in acoustic and neural synergy.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left: Product Images with Plus Operators */}
        <div className="lg:col-span-8 flex flex-wrap items-center gap-3 sm:gap-4">
          {allAvailable.map((prod, index) => {
            const isSelected = selectedIds.includes(prod.id);
            const isCurrent = prod.id === currentProduct.id;

            return (
              <React.Fragment key={prod.id}>
                {index > 0 && (
                  <div className="w-8 h-8 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center text-slate-400 shrink-0">
                    <Plus className="w-4 h-4" />
                  </div>
                )}

                <div
                  onClick={() => toggleProduct(prod.id)}
                  className={`cursor-pointer group relative p-3 rounded-2xl border transition-colors ${
                    isSelected
                      ? 'border-cyan-500/40 bg-slate-900/60'
                      : 'border-white/5 bg-slate-900/20 opacity-50'
                  }`}
                >
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-black/40 mb-2">
                    <img
                      src={prod.images[0]}
                      alt={prod.name}
                      className="w-full h-full object-cover"
                    />
                    {isCurrent && (
                      <span className="absolute top-1 left-1 bg-cyan-500/90 text-slate-950 font-black text-[9px] px-1.5 py-0.5 rounded uppercase">
                        This Item
                      </span>
                    )}
                    <div
                      className={`absolute bottom-1 right-1 w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'bg-cyan-500 border-cyan-400 text-slate-950'
                          : 'bg-black/60 border-white/20 text-transparent'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  </div>
                  <div className="w-24 sm:w-28">
                    <div className="text-xs font-semibold text-white truncate group-hover:text-cyan-300 transition-colors">
                      {prod.name}
                    </div>
                    <div className="text-xs font-mono font-bold text-cyan-400">
                      {formatPrice(prod.price)}
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>

        {/* Right: Pricing Box & 1-Click Action */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-slate-900/60 border border-white/10 space-y-4">
          <div className="space-y-1">
            <div className="text-xs text-slate-400">Total for {activeProducts.length} items:</div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black font-mono text-cyan-300">
                {formatPrice(finalBundlePrice)}
              </span>
              {bundleDiscountAmount > 0 && (
                <span className="text-sm font-mono line-through text-slate-500">
                  {formatPrice(regularTotal)}
                </span>
              )}
            </div>
            {bundleDiscountAmount > 0 && (
              <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Save {formatPrice(bundleDiscountAmount)} with bundle pricing</span>
              </div>
            )}
          </div>

          <Button
            onClick={handleAddBundleToCart}
            disabled={activeProducts.length === 0}
            variant={added ? 'secondary' : 'primary'}
            size="md"
            className="w-full flex items-center justify-center gap-2"
          >
            {added ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">Added {activeProducts.length} Items to Bag</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                <span>Add Bundle to Bag ({activeProducts.length})</span>
              </>
            )}
          </Button>

          <div className="text-[11px] text-slate-500 flex items-center justify-between pt-2 border-t border-white/5">
            <span>Unified Escrow Protection</span>
            <span className="text-cyan-400">Complimentary</span>
          </div>
        </div>
      </div>
    </div>
  );
}
