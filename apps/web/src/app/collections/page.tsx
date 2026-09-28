import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { getAllCategories, getAllProducts } from '@unified-commerce/database';
import { Navbar, Footer, Badge } from '@unified-commerce/ui';
import { Sparkles, ArrowRight, Layers } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Curated Collections & Categories — UnifiedCommerce',
  description: 'Explore verified multi-vendor artisanal collections across 35 categories with real-time 3D previews.',
};

export default function CollectionsDirectoryPage() {
  const categories = getAllCategories();
  const products = getAllProducts();

  // Compute product count per category
  const categoryCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of products) {
      counts[p.category] = (counts[p.category] || 0) + 1;
    }
    return counts;
  }, [products]);

  return (
    <div className="relative min-h-screen bg-[#07090e] text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-white">
      <Navbar categories={categories} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 w-full">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <Badge variant="cyan" size="sm" withDot>CURATED CATALOG DIRECTORY</Badge>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            Explore All Collections
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Discover artisanal engineering, cybernetic wearables, and planar audio crafted by verified global makers.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat, idx) => {
            const count = categoryCounts[cat.slug] || 0;
            return (
              <Link
                key={cat.id}
                href={`/collections/${cat.slug}`}
                className="group relative rounded-3xl bg-slate-900/80 border border-white/10 hover:border-cyan-400/50 p-6 flex flex-col justify-between overflow-hidden transition-all duration-200 shadow-lg hover:shadow-cyan-500/10 cursor-pointer"
              >
                {/* Background image preview */}
                <div className="absolute inset-0 z-0">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
                </div>

                <div className="relative z-10 flex items-center justify-between mb-16">
                  <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-slate-950/80 border border-white/10 text-cyan-300">
                    Collection #{idx + 1}
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                    {count} {count === 1 ? 'Product' : 'Products'}
                  </span>
                </div>

                <div className="relative z-10 space-y-2">
                  <h2 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors flex items-center justify-between">
                    <span>{cat.name}</span>
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </h2>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>
                  <div className="flex flex-wrap gap-1 pt-2">
                    {cat.subcategories?.slice(0, 3).map((sub) => (
                      <span
                        key={sub}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-white/5"
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
      </main>

      <Footer />
    </div>
  );
}
