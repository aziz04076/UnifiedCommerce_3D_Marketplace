'use client';

import React from 'react';
import { Scale, X, Check, ArrowRight, Trash2, ShoppingBag } from 'lucide-react';
import { Product } from '@unified-commerce/types';
import { Button, formatPrice } from '@unified-commerce/ui';

interface ProductComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onRemoveProduct: (id: string) => void;
  onAddToCart: (p: Product) => void;
  onClearAll: () => void;
}

export const ProductComparisonModal: React.FC<ProductComparisonModalProps> = ({
  isOpen,
  onClose,
  products,
  onRemoveProduct,
  onAddToCart,
  onClearAll,
}) => {
  if (!isOpen || products.length === 0) return null;

  const specRows = [
    { label: 'Category', render: (p: Product) => p.category },
    { label: 'Maker / Lab', render: (p: Product) => p.vendorName },
    { label: 'Price', render: (p: Product) => formatPrice(p.price, p.currency), isHighlight: true },
    {
      label: 'Rating',
      render: (p: Product) => `★ ${p.rating} (${p.reviewCount} verified reviews)`,
    },
    {
      label: 'In Stock',
      render: (p: Product) => (p.stock > 0 ? `${p.stock} units available` : 'Sold Out'),
    },
    {
      label: 'Dispatch SLA',
      render: (p: Product) => `${(p as any).shippingInfo?.estimatedDays || 2} Days (Suborbital Node)`,
    },
    {
      label: 'Key Tech Specs',
      render: (p: Product) =>
        p.specs
          ? Object.entries(p.specs)
              .slice(0, 3)
              .map(([k, v]) => `${k}: ${v}`)
              .join(' • ')
          : p.headline,
    },
    {
      label: 'Sensory / Audio Profile',
      render: (p: Product) => ((p as any).audioSpecs ? `${(p as any).audioSpecs.driverType} (${(p as any).audioSpecs.frequencyResponse})` : 'N/A'),
    },
    {
      label: 'AI Insights Demand',
      render: (p: Product) => `${p.aiInsights?.demandScore || 85}/100 Score`,
    },
  ];

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-md">
      <div className="w-full max-w-6xl max-h-[90vh] rounded-3xl bg-slate-900 border border-white/10 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Side-by-Side Product Comparison</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-cyan-400 text-slate-950 font-bold">
                  {products.length} / 4 Products
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Direct matrix comparison with technical spec differentiation.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClearAll}
              className="text-xs font-mono text-slate-400 hover:text-rose-400 transition-colors"
            >
              Clear Comparison
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="flex-1 overflow-x-auto overflow-y-auto p-4 sm:p-6">
          <table className="w-full border-collapse text-left text-xs font-mono">
            {/* Product Card Row */}
            <thead>
              <tr className="border-b border-white/10">
                <th className="py-4 px-4 w-44 text-slate-400 font-sans font-semibold">Product</th>
                {products.map((product) => (
                  <th key={product.id} className="py-4 px-4 min-w-[200px] w-64 align-top">
                    <div className="space-y-3 relative group">
                      <button
                        onClick={() => onRemoveProduct(product.id)}
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-slate-950 border border-white/10 text-slate-400 hover:text-rose-400 flex items-center justify-center shadow-md transition-colors"
                        title="Remove from comparison"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <div className="aspect-square rounded-2xl bg-slate-950 overflow-hidden border border-white/5 flex items-center justify-center">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-mono truncate block">
                          {product.vendorName}
                        </span>
                        <a
                          href={`/products/${product.slug}`}
                          className="text-sm font-bold text-white hover:text-cyan-300 transition-colors line-clamp-1 block"
                        >
                          {product.name}
                        </a>
                        <div className="text-base font-bold text-cyan-300 mt-1">
                          {formatPrice(product.price, product.currency)}
                        </div>
                      </div>
                      <button
                        onClick={() => onAddToCart(product)}
                        className="w-full py-2 px-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Add to Bag</span>
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Spec Attributes Rows */}
            <tbody className="divide-y divide-white/5">
              {specRows.map((row) => (
                <tr key={row.label} className="hover:bg-white/5 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-300 font-sans">{row.label}</td>
                  {products.map((product) => {
                    const value = row.render(product);
                    return (
                      <td
                        key={product.id}
                        className={`py-3.5 px-4 ${
                          row.isHighlight ? 'text-cyan-300 font-bold text-sm' : 'text-slate-300'
                        }`}
                      >
                        {value}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
