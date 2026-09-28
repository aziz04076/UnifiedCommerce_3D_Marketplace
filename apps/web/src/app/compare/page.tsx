'use client';

import React, { useState } from 'react';
import { Scale, ArrowRight, ShoppingBag, X, Plus } from 'lucide-react';
import { getAllCategories, getAllProducts } from '@unified-commerce/database';
import { Navbar, Footer, Button, formatPrice, Badge } from '@unified-commerce/ui';
import { useCart } from '../../context/CartContext';
import { Product } from '@unified-commerce/types';

export default function ComparePage() {
  const { cartItems, wishlistIds, addToCart } = useCart();
  const categories = getAllCategories();
  const allProducts = getAllProducts();

  // Selected for comparison (default 3 flagship products)
  const [selectedIds, setSelectedIds] = useState<string[]>([
    allProducts[0]?.id || 'prod-001',
    allProducts[1]?.id || 'prod-002',
    allProducts[2]?.id || 'prod-003',
  ]);

  const comparedProducts = selectedIds
    .map((id) => allProducts.find((p) => p.id === id))
    .filter(Boolean) as Product[];

  const handleRemove = (id: string) => {
    setSelectedIds((prev) => prev.filter((item) => item !== id));
  };

  const handleAddProduct = (id: string) => {
    if (selectedIds.length >= 4) return;
    if (!selectedIds.includes(id)) {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const specRows = [
    { label: 'Category', render: (p: Product) => p.category },
    { label: 'Maker / Lab', render: (p: Product) => p.vendorName },
    { label: 'Price', render: (p: Product) => formatPrice(p.price, p.currency), highlight: true },
    { label: 'Rating', render: (p: Product) => `★ ${p.rating} (${p.reviewCount} reviews)` },
    { label: 'Stock Status', render: (p: Product) => (p.stock > 0 ? `${p.stock} units` : 'Sold out') },
    { label: 'Dispatch SLA', render: (p: Product) => `${(p as any).shippingInfo?.estimatedDays || 2} Days (Direct Lab)` },
    {
      label: 'Specifications',
      render: (p: Product) =>
        p.specs
          ? Object.entries(p.specs)
              .slice(0, 3)
              .map(([k, v]) => `${k}: ${v}`)
              .join(' • ')
          : p.headline,
    },
    {
      label: 'Acoustics / Sensory',
      render: (p: Product) => ((p as any).audioSpecs ? `${(p as any).audioSpecs.driverType}` : 'Integrated Sensory Core'),
    },
    {
      label: 'AI Demand Index',
      render: (p: Product) => `${p.aiInsights?.demandScore || 85}/100`,
    },
  ];

  return (
    <div className="relative min-h-screen text-slate-100 bg-[#07090e]">
      <Navbar
        categories={categories}
        cartCount={cartItems.reduce((acc, i) => acc + i.quantity, 0)}
        wishlistCount={wishlistIds.length}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        <div className="pb-8 border-b border-white/10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="cyan" size="sm" withDot>SPECIFICATION MATRIX</Badge>
              <span className="text-xs font-mono text-slate-400">Up to 4 Hardware Units</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-2 flex items-center gap-3">
              <span>Hardware Comparison Matrix</span>
              <Scale className="w-7 h-7 text-cyan-400" />
            </h1>
          </div>

          {selectedIds.length < 4 && (
            <div className="flex items-center gap-2">
              <label className="text-xs font-mono text-slate-400">Add to Compare:</label>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleAddProduct(e.target.value);
                    e.target.value = '';
                  }
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
              >
                <option value="">Select Hardware Item...</option>
                {allProducts
                  .filter((p) => !selectedIds.includes(p.id))
                  .slice(0, 30)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({formatPrice(p.price, p.currency)})
                    </option>
                  ))}
              </select>
            </div>
          )}
        </div>

        {comparedProducts.length === 0 ? (
          <div className="py-20 text-center rounded-3xl bg-slate-900 border border-white/10 max-w-lg mx-auto my-12 p-8 space-y-4 shadow-xl">
            <Scale className="w-12 h-12 text-slate-500 mx-auto" />
            <h2 className="text-xl font-bold text-white">No products selected for comparison</h2>
            <p className="text-xs text-slate-400">
              Browse the catalog and toggle "Compare" on any item to view a side-by-side spec comparison.
            </p>
            <a href="/products">
              <Button variant="primary" size="md">
                Browse Catalog
              </Button>
            </a>
          </div>
        ) : (
          <div className="mt-8 rounded-3xl bg-slate-900 border border-white/10 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-slate-950/60">
                    <th className="py-4 px-5 w-48 text-slate-400 font-sans font-semibold">Specification</th>
                    {comparedProducts.map((p) => (
                      <th key={p.id} className="py-4 px-5 min-w-[220px] w-72 align-top">
                        <div className="space-y-3 relative">
                          <button
                            onClick={() => handleRemove(p.id)}
                            className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-slate-950 border border-white/10 text-slate-400 hover:text-rose-400 flex items-center justify-center transition-colors"
                            title="Remove"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                          <div className="aspect-square rounded-2xl bg-slate-950 overflow-hidden border border-white/5 flex items-center justify-center">
                            <img
                              src={p.images[0]}
                              alt={p.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 truncate block">{p.vendorName}</span>
                            <a
                              href={`/products/${p.slug}`}
                              className="text-sm font-bold text-white hover:text-cyan-300 transition-colors line-clamp-1 block"
                            >
                              {p.name}
                            </a>
                            <div className="text-base font-bold text-cyan-300 mt-1">
                              {formatPrice(p.price, p.currency)}
                            </div>
                          </div>
                          <button
                            onClick={() => addToCart(p, 1)}
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
                <tbody className="divide-y divide-white/5">
                  {specRows.map((row) => (
                    <tr key={row.label} className="hover:bg-white/5 transition-colors">
                      <td className="py-3.5 px-5 font-bold text-slate-300 font-sans">{row.label}</td>
                      {comparedProducts.map((p) => (
                        <td
                          key={p.id}
                          className={`py-3.5 px-5 ${
                            row.highlight ? 'text-cyan-300 font-bold text-sm' : 'text-slate-300'
                          }`}
                        >
                          {row.render(p)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
