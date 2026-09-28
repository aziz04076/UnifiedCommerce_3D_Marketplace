'use client';

import React, { useEffect, useState } from 'react';
import { Clock, ArrowRight } from 'lucide-react';
import { Product } from '@unified-commerce/types';
import { formatPrice } from '@unified-commerce/ui';

interface RecentlyViewedStripProps {
  currentProduct?: Product;
}

export const RecentlyViewedStrip: React.FC<RecentlyViewedStripProps> = ({ currentProduct }) => {
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('unified_recently_viewed');
      let items: Product[] = stored ? JSON.parse(stored) : [];

      if (currentProduct) {
        // Remove duplicate if already exists
        items = items.filter((p) => p.id !== currentProduct.id);
        // Prepend current product
        items.unshift(currentProduct);
        // Keep max 8 items
        items = items.slice(0, 8);
        localStorage.setItem('unified_recently_viewed', JSON.stringify(items));
      }

      // Display items other than current product
      const displayItems = currentProduct
        ? items.filter((p) => p.id !== currentProduct.id)
        : items;

      setRecentProducts(displayItems.slice(0, 6));
    } catch {
      // LocalStorage access fallback
    }
  }, [currentProduct]);

  if (recentProducts.length === 0) return null;

  return (
    <section className="py-14 border-t border-white/10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          <h3 className="text-lg font-bold text-white tracking-tight">Recently Viewed Hardware</h3>
        </div>
        <span className="text-xs font-mono text-slate-400">Stored Locally • Zero Latency</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {recentProducts.map((p) => (
          <a
            key={p.id}
            href={`/products/${p.slug}`}
            className="group rounded-2xl bg-slate-900 border border-white/10 hover:border-cyan-500/40 p-3 flex flex-col justify-between transition-colors shadow-sm"
          >
            <div className="aspect-square rounded-xl bg-slate-950 overflow-hidden mb-2.5 flex items-center justify-center">
              <img
                src={p.images[0]}
                alt={p.name}
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-400 truncate block">{p.vendorName}</span>
              <h4 className="text-xs font-semibold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                {p.name}
              </h4>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-xs font-bold font-mono text-cyan-300">
                  {formatPrice(p.price, p.currency)}
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
};
