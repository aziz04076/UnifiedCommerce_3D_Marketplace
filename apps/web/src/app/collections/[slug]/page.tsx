import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllCategories, getAllProducts, getAllVendors } from '@unified-commerce/database';
import { CatalogExplorer } from '../../../components/CatalogExplorer';
import { Navbar, Footer, Badge } from '@unified-commerce/ui';
import { ArrowLeft, Sparkles, FolderX } from 'lucide-react';

interface Props {
  params: { slug: string };
  searchParams?: { q?: string; sort?: string };
}

export function generateStaticParams() {
  const categories = getAllCategories();
  return categories.map((cat) => ({ slug: cat.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const categories = getAllCategories();
  const cat = categories.find((c) => c.slug === params.slug);
  if (!cat) return { title: 'Collection Not Found — UnifiedCommerce' };

  return {
    title: `${cat.name} — Curated Collection | UnifiedCommerce`,
    description: cat.description,
  };
}

export default function CollectionDetailPage({ params, searchParams }: Props) {
  const categories = getAllCategories();
  const allProducts = getAllProducts();
  const vendors = getAllVendors();

  const currentCategory = categories.find((c) => c.slug === params.slug) || {
    id: params.slug,
    name: params.slug.split('-').map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(' '),
    slug: params.slug,
    description: 'Explore curated products and vendor listings in this collection.',
    productCount: 0,
    bannerUrl: '/banner-default.jpg',
  };

  // Filter products for this collection
  const categoryProducts = allProducts.filter((p) => p.category === params.slug);

  return (
    <div className="relative min-h-screen bg-[#07090e] text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-white">
      {/* Category Hero Banner */}
      <div className="relative pt-28 pb-12 bg-gradient-to-b from-slate-900 to-[#07090e] border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-4 font-mono">
            <Link href="/" className="hover:text-white">Home</Link>
            <span>/</span>
            <Link href="/collections" className="hover:text-white">Collections</Link>
            <span>/</span>
            <span className="text-cyan-400">{currentCategory?.name || params.slug}</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-2xl space-y-2">
              <Badge variant="cyan" size="sm" withDot>COLLECTION SHOWROOM</Badge>
              <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
                {currentCategory?.name || params.slug}
              </h1>
              <p className="text-slate-400 text-sm leading-relaxed">
                {currentCategory?.description || `Explore verified artisanal products in ${params.slug}.`}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-slate-800 border border-white/10 text-cyan-300">
                {categoryProducts.length} {categoryProducts.length === 1 ? 'Product' : 'Products'} Available
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Catalog View or Friendly Empty State */}
      <main className="flex-1 w-full">
        {categoryProducts.length > 0 ? (
          <CatalogExplorer
            initialProducts={categoryProducts}
            categories={categories}
            vendors={vendors}
            initialCategory={params.slug}
            initialQuery={searchParams?.q || ''}
          />
        ) : (
          <div className="max-w-lg mx-auto py-24 px-4 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
              <FolderX className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-white">No Products In This Collection Yet</h2>
            <p className="text-xs text-slate-400">
              Our artisanal makers are actively preparing new listings for this category. Check back shortly or browse other collections.
            </p>
            <div className="pt-2">
              <Link
                href="/collections"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Browse All Collections</span>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
