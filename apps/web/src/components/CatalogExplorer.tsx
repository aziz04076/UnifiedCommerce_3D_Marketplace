'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SlidersHorizontal,
  Search,
  X,
  Filter,
  ArrowUpDown,
  Grid,
  List,
  Star,
  ShieldCheck,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  ShoppingBag,
  RotateCcw,
  Flame,
  Clock,
  Tag,
  Zap,
  Scale,
} from 'lucide-react';
import { Product, ProductCategory, Vendor } from '@unified-commerce/types';
import {
  Button,
  Badge,
  ProductCard3D,
  Navbar,
  Footer,
  formatPrice,
} from '@unified-commerce/ui';
import { QuickViewModal } from './QuickViewModal';
import { CartDrawer } from './CartDrawer';
import { SearchModal } from './SearchModal';
import { ProductComparisonModal } from './ProductComparisonModal';
import { useCart } from '../context/CartContext';

interface CatalogExplorerProps {
  initialProducts: Product[];
  categories: ProductCategory[];
  vendors: Vendor[];
  initialCategory?: string;
  initialQuery?: string;
}

export const CatalogExplorer: React.FC<CatalogExplorerProps> = ({
  initialProducts,
  categories,
  vendors,
  initialCategory = 'all',
  initialQuery = '',
}) => {
  const {
    cartItems,
    wishlistIds,
    addToCart,
    updateQuantity,
    removeFromCart,
  } = useCart();

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all');
  const [rawSearchQuery, setRawSearchQuery] = useState<string>(initialQuery);
  const [searchQuery, setSearchQuery] = useState<string>(initialQuery);

  // 300ms Debounce on Search Input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(rawSearchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [rawSearchQuery]);

  // Product Comparison State (up to 4 products)
  const [comparedProducts, setComparedProducts] = useState<Product[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  const handleToggleCompare = (product: Product) => {
    setComparedProducts((prev) => {
      if (prev.some((p) => p.id === product.id)) {
        return prev.filter((p) => p.id !== product.id);
      }
      if (prev.length >= 4) {
        return prev;
      }
      return [...prev, product];
    });
  };

  const [minRating, setMinRating] = useState<number>(0);
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const [vendorSearch, setVendorSearch] = useState<string>('');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<
    'featured' | 'price-asc' | 'price-desc' | 'rating' | 'demand' | 'discount'
  >('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Merchandising Tab Filter
  const [merchandisingTab, setMerchandisingTab] = useState<'ALL' | 'DEALS' | 'TRENDING' | 'NEW_ARRIVALS'>('ALL');

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(24);

  // Price bounds
  const catalogPrices = useMemo(() => initialProducts.map((p) => p.price), [initialProducts]);
  const minPossiblePrice = useMemo(() => Math.min(...catalogPrices), [catalogPrices]);
  const maxPossiblePrice = useMemo(() => Math.max(...catalogPrices), [catalogPrices]);
  const [maxPrice, setMaxPrice] = useState<number>(maxPossiblePrice);

  // Modal & Cart States
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Live countdown timer for Deals of the Day (resets at midnight UTC)
  const [dealCountdown, setDealCountdown] = useState({ hours: 7, minutes: 24, seconds: 18 });
  useEffect(() => {
    const timer = setInterval(() => {
      setDealCountdown((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Extract unique tags
  const allTags = useMemo(() => {
    const set = new Set<string>();
    initialProducts.forEach((p) => p.tags.forEach((t) => set.add(t)));
    return Array.from(set).slice(0, 16);
  }, [initialProducts]);

  // Current subcategories for the selected category
  const activeSubcategories = useMemo(() => {
    if (selectedCategory === 'all') return [];
    const cat = categories.find((c) => c.slug === selectedCategory);
    return cat?.subcategories || [];
  }, [selectedCategory, categories]);

  // Filtered vendors based on search input
  const filteredVendorsList = useMemo(() => {
    if (!vendorSearch.trim()) return vendors;
    const q = vendorSearch.toLowerCase().trim();
    return vendors.filter((v) => v.name.toLowerCase().includes(q) || v.location.toLowerCase().includes(q));
  }, [vendors, vendorSearch]);

  // Reset page to 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    selectedCategory,
    selectedSubcategory,
    searchQuery,
    minRating,
    selectedVendors,
    inStockOnly,
    selectedTags,
    sortBy,
    maxPrice,
    merchandisingTab,
    itemsPerPage,
  ]);

  // Main Filtering Logic
  const filteredProducts = useMemo(() => {
    return initialProducts
      .filter((product) => {
        // Merchandising Tab Quick Filters
        if (merchandisingTab === 'DEALS') {
          if (!product.originalPrice || product.originalPrice <= product.price) return false;
        } else if (merchandisingTab === 'TRENDING') {
          if (!product.isTrending && (product.aiInsights?.demandScore || 0) < 80) return false;
        }

        // Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesQuery =
            product.name.toLowerCase().includes(q) ||
            product.headline.toLowerCase().includes(q) ||
            product.tags.some((t) => t.toLowerCase().includes(q)) ||
            product.vendorName.toLowerCase().includes(q) ||
            product.subcategory.toLowerCase().includes(q);
          if (!matchesQuery) return false;
        }

        // Category
        if (selectedCategory !== 'all' && product.category !== selectedCategory) {
          return false;
        }

        // Subcategory
        if (
          selectedSubcategory !== 'all' &&
          product.subcategory.toLowerCase() !== selectedSubcategory.toLowerCase()
        ) {
          return false;
        }

        // Max Price
        if (product.price > maxPrice) {
          return false;
        }

        // Rating
        if (minRating > 0 && product.rating < minRating) {
          return false;
        }

        // Vendors
        if (selectedVendors.length > 0 && !selectedVendors.includes(product.vendorId)) {
          return false;
        }

        // In stock
        if (inStockOnly && product.stock <= 0) {
          return false;
        }

        // Tags
        if (selectedTags.length > 0 && !selectedTags.some((t) => product.tags.includes(t))) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'price-asc':
            return a.price - b.price;
          case 'price-desc':
            return b.price - a.price;
          case 'rating':
            return b.rating - a.rating;
          case 'demand':
            return (b.aiInsights?.demandScore || 0) - (a.aiInsights?.demandScore || 0);
          case 'discount': {
            const discA = a.originalPrice ? (a.originalPrice - a.price) / a.originalPrice : 0;
            const discB = b.originalPrice ? (b.originalPrice - b.price) / b.originalPrice : 0;
            return discB - discA;
          }
          case 'featured':
          default:
            if (b.isFeatured && !a.isFeatured) return 1;
            if (!b.isFeatured && a.isFeatured) return -1;
            return (b.isTrending ? 1 : 0) - (a.isTrending ? 1 : 0);
        }
      });
  }, [
    initialProducts,
    searchQuery,
    selectedCategory,
    selectedSubcategory,
    maxPrice,
    minRating,
    selectedVendors,
    inStockOnly,
    selectedTags,
    sortBy,
    merchandisingTab,
  ]);

  // Paginated Slicing
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  // Deals of the day sample for showcase
  const topDeals = useMemo(() => {
    return initialProducts
      .filter((p) => p.originalPrice && p.originalPrice > p.price)
      .map((p) => ({
        ...p,
        discountPct: Math.round(((p.originalPrice! - p.price) / p.originalPrice!) * 100),
      }))
      .sort((a, b) => b.discountPct - a.discountPct)
      .slice(0, 4);
  }, [initialProducts]);

  // Cart operations
  const handleAddToCart = (product: Product, quantity = 1) => {
    addToCart(product, quantity);
    setIsCartOpen(true);
  };

  const resetFilters = () => {
    setSelectedCategory('all');
    setSelectedSubcategory('all');
    setRawSearchQuery('');
    setSearchQuery('');
    setMinRating(0);
    setSelectedVendors([]);
    setInStockOnly(false);
    setSelectedTags([]);
    setMaxPrice(maxPossiblePrice);
    setSortBy('featured');
    setMerchandisingTab('ALL');
  };

  const hasActiveFilters =
    selectedCategory !== 'all' ||
    selectedSubcategory !== 'all' ||
    searchQuery !== '' ||
    minRating > 0 ||
    selectedVendors.length > 0 ||
    inStockOnly ||
    selectedTags.length > 0 ||
    maxPrice < maxPossiblePrice ||
    merchandisingTab !== 'ALL';

  return (
    <div className="relative min-h-screen text-slate-100 selection:bg-cyan-500/30 selection:text-white">
      {/* Floating Navbar */}
      <Navbar
        categories={categories}
        cartCount={cartItems.reduce((acc, i) => acc + i.quantity, 0)}
        wishlistCount={wishlistIds.length}
      />

      {/* Hero Header */}
      <div className="pt-28 pb-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-white/10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="cyan" size="sm" withDot>LARGE-SCALE CATALOG</Badge>
              <span className="text-xs font-mono text-slate-400">
                1,024 Verified Hardware Assets Across 35 Global Labs
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-2">
              Hardware & Cybernetic Catalog
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-xl">
              Faceted filtering across 16 categories, engineering tolerances, acoustic planar specs, and real-time inventory.
            </p>
          </div>

          {/* Quick Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={rawSearchQuery}
              onChange={(e) => setRawSearchQuery(e.target.value)}
              placeholder="Search 1,024+ products, tags, models..."
              className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-all"
            />
            {rawSearchQuery && (
              <button
                onClick={() => {
                  setRawSearchQuery('');
                  setSearchQuery('');
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Merchandising Sections Quick Selector Bar */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/5">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
            <button
              onClick={() => setMerchandisingTab('ALL')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                merchandisingTab === 'ALL'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-neon-cyan'
                  : 'bg-slate-900/60 text-slate-400 border border-white/5 hover:text-white'
              }`}
            >
              <span>All Equipment</span>
              <span className="text-[10px] font-mono opacity-80 font-normal">({initialProducts.length})</span>
            </button>

            <button
              onClick={() => {
                setMerchandisingTab('DEALS');
                setSortBy('discount');
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                merchandisingTab === 'DEALS'
                  ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-bold shadow-md shadow-orange-500/20'
                  : 'bg-slate-900/60 text-amber-300 border border-amber-500/20 hover:border-amber-400/40'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>Deals of the Day</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-200">
                UP TO 35% OFF
              </span>
            </button>

            <button
              onClick={() => {
                setMerchandisingTab('TRENDING');
                setSortBy('demand');
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                merchandisingTab === 'TRENDING'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold shadow-neon-purple'
                  : 'bg-slate-900/60 text-purple-300 border border-purple-500/20 hover:border-purple-400/40'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-purple-400" />
              <span>Trending Now</span>
            </button>

            <button
              onClick={() => {
                setMerchandisingTab('NEW_ARRIVALS');
                setSortBy('featured');
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                merchandisingTab === 'NEW_ARRIVALS'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                  : 'bg-slate-900/60 text-emerald-300 border border-emerald-500/20 hover:border-emerald-400/40'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>New Arrivals</span>
            </button>
          </div>

          {/* Deal Countdown Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-amber-500/30 text-amber-300 text-xs font-mono">
            <Clock className="w-3.5 h-3.5 animate-pulse text-amber-400" />
            <span>
              Deals Reset In:{' '}
              <strong className="text-white font-bold">
                {String(dealCountdown.hours).padStart(2, '0')}:
                {String(dealCountdown.minutes).padStart(2, '0')}:
                {String(dealCountdown.seconds).padStart(2, '0')}
              </strong>
            </span>
          </div>
        </div>

        {/* Category Horizontal Quick Switcher (16 Categories) */}
        <div className="flex items-center gap-2 overflow-x-auto pt-4 scrollbar-none">
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSelectedSubcategory('all');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-cyan-400 text-slate-950 font-bold shadow-neon-cyan'
                : 'bg-slate-900/60 text-slate-400 border border-white/5 hover:text-white'
            }`}
          >
            All Categories ({initialProducts.length})
          </button>
          {categories.map((c) => {
            const count = initialProducts.filter((p) => p.category === c.slug).length;
            return (
              <button
                key={c.id}
                onClick={() => {
                  setSelectedCategory(c.slug);
                  setSelectedSubcategory('all');
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === c.slug
                    ? 'bg-cyan-400 text-slate-950 font-bold shadow-neon-cyan'
                    : 'bg-slate-900/60 text-slate-400 border border-white/5 hover:text-white'
                }`}
              >
                {c.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Catalog Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Desktop Left Sidebar: Filters (1 col) */}
          <aside className="hidden lg:block lg:col-span-1 space-y-6 sticky top-28 bg-slate-950/60 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
                <span>Faceted Filters</span>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" /> Reset All
                </button>
              )}
            </div>

            {/* Subcategories (if a category is selected) */}
            {activeSubcategories.length > 0 && (
              <div className="space-y-2.5 pb-5 border-b border-white/5">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
                  Subcategories
                </span>
                <div className="space-y-1">
                  <button
                    onClick={() => setSelectedSubcategory('all')}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      selectedSubcategory === 'all'
                        ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    All Subcategories
                  </button>
                  {activeSubcategories.map((sub) => (
                    <button
                      key={sub}
                      onClick={() => setSelectedSubcategory(sub)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                        selectedSubcategory === sub
                          ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>{sub}</span>
                      <ChevronRight className="w-3 h-3 opacity-60" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Price Filter Slider */}
            <div className="space-y-3 pb-5 border-b border-white/5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-semibold uppercase tracking-wider text-slate-400">
                  Max Price
                </span>
                <span className="font-mono font-bold text-cyan-300">
                  {formatPrice(maxPrice)}
                </span>
              </div>
              <input
                type="range"
                min={minPossiblePrice}
                max={maxPossiblePrice}
                step={25}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-cyan-400 bg-slate-800 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>{formatPrice(minPossiblePrice)}</span>
                <span>{formatPrice(maxPossiblePrice)}</span>
              </div>
            </div>

            {/* Minimum Rating Filter */}
            <div className="space-y-2.5 pb-5 border-b border-white/5">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
                Minimum Rating
              </span>
              <div className="space-y-1">
                {[0, 4.0, 4.5, 4.8, 4.9].map((stars) => (
                  <button
                    key={stars}
                    onClick={() => setMinRating(stars)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                      minRating === stars
                        ? 'bg-amber-500/20 text-amber-300 font-semibold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {stars === 0 ? 'All Ratings' : `${stars}★ & higher`}
                    </span>
                    {minRating === stars && <Check className="w-3.5 h-3.5 text-amber-400" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Verified Vendors (35 Makers) with Search */}
            <div className="space-y-2.5 pb-5 border-b border-white/5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
                  Verified Makers ({vendors.length})
                </span>
                {selectedVendors.length > 0 && (
                  <button
                    onClick={() => setSelectedVendors([])}
                    className="text-[10px] text-cyan-400 hover:underline font-mono"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Vendor Search Input */}
              <input
                type="text"
                value={vendorSearch}
                onChange={(e) => setVendorSearch(e.target.value)}
                placeholder="Filter 35 makers..."
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />

              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {filteredVendorsList.map((vendor) => {
                  const isChecked = selectedVendors.includes(vendor.id);
                  const count = initialProducts.filter((p) => p.vendorId === vendor.id).length;
                  return (
                    <label
                      key={vendor.id}
                      className="flex items-center justify-between text-xs text-slate-300 hover:text-white cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedVendors([...selectedVendors, vendor.id]);
                            } else {
                              setSelectedVendors(selectedVendors.filter((id) => id !== vendor.id));
                            }
                          }}
                          className="rounded border-slate-700 bg-slate-900 text-cyan-400 focus:ring-cyan-400"
                        />
                        <span className="truncate">{vendor.name}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 shrink-0">({count})</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* In-Stock Toggle */}
            <div className="flex items-center justify-between pb-5 border-b border-white/5">
              <span className="text-xs font-mono text-slate-300">In Stock Ready to Dispatch</span>
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-emerald-400 focus:ring-emerald-400"
              />
            </div>

            {/* Popular Tags */}
            <div className="space-y-2.5">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
                Popular Tags
              </span>
              <div className="flex flex-wrap gap-1.5">
                {allTags.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedTags(selectedTags.filter((t) => t !== tag));
                        } else {
                          setSelectedTags([...selectedTags, tag]);
                        }
                      }}
                      className={`text-[10px] font-mono px-2 py-1 rounded-lg border transition-all ${
                        isSelected
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400'
                          : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      #{tag}
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Right Column: Products & Controls (3 cols) */}
          <main className="lg:col-span-3 space-y-6">
            {/* Top Toolbar */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/10 flex flex-wrap items-center justify-between gap-4 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-slate-400">
                  Showing <strong className="text-cyan-300 font-bold">{paginatedProducts.length}</strong> of{' '}
                  <strong className="text-white">{filteredProducts.length}</strong> items
                </span>
                {totalPages > 1 && (
                  <span className="text-xs font-mono text-slate-500">
                    (Page {currentPage} of {totalPages})
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                {/* Items Per Page Selector */}
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                  <span>Show:</span>
                  {[12, 24, 48].map((limit) => (
                    <button
                      key={limit}
                      onClick={() => setItemsPerPage(limit)}
                      className={`px-2 py-0.5 rounded text-xs transition-colors ${
                        itemsPerPage === limit
                          ? 'bg-cyan-500 text-slate-950 font-bold'
                          : 'bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      {limit}
                    </button>
                  ))}
                </div>

                {/* Sort Dropdown */}
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="featured">Featured First</option>
                    <option value="discount">Biggest Discount %</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                    <option value="demand">AI Demand Velocity</option>
                  </select>
                </div>

                {/* Grid / List View Toggle */}
                <div className="flex items-center rounded-xl bg-slate-900 p-0.5 border border-white/10">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-lg transition-colors ${
                      viewMode === 'grid' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Grid className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-lg transition-colors ${
                      viewMode === 'list' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Products List or Grid */}
            {filteredProducts.length === 0 ? (
              <div className="py-24 text-center rounded-3xl bg-slate-950/40 border border-white/10 p-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center mx-auto text-slate-500">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white">No Matching Products Found</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Try widening your price range, clearing tags, or switching categories to browse more equipment.
                </p>
                <Button onClick={resetFilters} variant="primary" size="sm">
                  Reset All Filters
                </Button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {paginatedProducts.map((product) => (
                  <ProductCard3D
                    key={product.id}
                    product={product}
                    onAddToCart={(p) => handleAddToCart(p, 1)}
                    onQuickView={(p) => setQuickViewProduct(p)}
                    onCompareToggle={handleToggleCompare}
                    isCompared={comparedProducts.some((cp) => cp.id === product.id)}
                  />
                ))}
              </div>
            ) : (
              // List View
              <div className="space-y-4">
                {paginatedProducts.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => {
                      window.location.href = `/products/${product.slug}`;
                    }}
                    className="p-4 rounded-2xl bg-slate-950/60 border border-white/10 hover:border-cyan-400/40 hover:shadow-[0_10px_30px_rgba(0,242,254,0.1)] transition-all cursor-pointer flex flex-col sm:flex-row items-center gap-5 group backdrop-blur-xl"
                  >
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full sm:w-36 h-36 rounded-xl object-cover border border-white/10 shrink-0"
                    />
                    <div className="flex-1 space-y-2 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">
                          {product.subcategory}
                        </span>
                        <span className="text-slate-500">•</span>
                        <span className="text-xs text-slate-400">{product.vendorName}</span>
                      </div>
                      <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {product.headline}
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {product.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-white/5 text-slate-400"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="sm:text-right shrink-0 flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-white/5">
                      <div className="text-xl font-bold font-mono text-white">
                        {formatPrice(product.price, product.currency)}
                      </div>
                      {product.originalPrice && (
                        <div className="text-xs font-mono text-slate-500 line-through">
                          {formatPrice(product.originalPrice, product.currency)}
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-xs text-amber-400 font-semibold my-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{product.rating}</span>
                        <span className="text-slate-500 text-[10px]">({product.reviewCount})</span>
                      </div>
                      <div className="flex items-center gap-2 pt-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleCompare(product);
                          }}
                          className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono transition-colors ${
                            comparedProducts.some((cp) => cp.id === product.id)
                              ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                              : 'bg-slate-900 border-white/10 text-slate-400 hover:text-white'
                          }`}
                        >
                          {comparedProducts.some((cp) => cp.id === product.id) ? 'Comparing' : 'Compare'}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setQuickViewProduct(product);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-xs font-medium text-slate-300 hover:text-white"
                        >
                          Quick View
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(product, 1);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-cyan-400 text-slate-950 font-bold text-xs shadow-neon-cyan hover:bg-cyan-300"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/10 flex flex-wrap items-center justify-between gap-4 backdrop-blur-xl">
                <button
                  disabled={currentPage === 1}
                  onClick={() => {
                    setCurrentPage((p) => Math.max(1, p - 1));
                    window.scrollTo({ top: 300, behavior: 'smooth' });
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Previous
                </button>

                {/* Page Number Chips */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum = i + 1;
                    if (totalPages > 5 && currentPage > 3) {
                      pageNum = Math.min(currentPage - 2 + i, totalPages);
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => {
                          setCurrentPage(pageNum);
                          window.scrollTo({ top: 300, behavior: 'smooth' });
                        }}
                        className={`w-8 h-8 rounded-xl text-xs font-mono font-bold transition-all ${
                          currentPage === pageNum
                            ? 'bg-cyan-500 text-slate-950 shadow-neon-cyan'
                            : 'bg-slate-900 text-slate-400 border border-white/5 hover:text-white'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <span className="text-slate-500 px-1 font-mono text-xs">...</span>
                  )}
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <button
                      onClick={() => {
                        setCurrentPage(totalPages);
                        window.scrollTo({ top: 300, behavior: 'smooth' });
                      }}
                      className="w-8 h-8 rounded-xl text-xs font-mono font-bold bg-slate-900 text-slate-400 border border-white/5 hover:text-white"
                    >
                      {totalPages}
                    </button>
                  )}
                </div>

                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => {
                    setCurrentPage((p) => Math.min(totalPages, p + 1));
                    window.scrollTo({ top: 300, behavior: 'smooth' });
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Footer */}
      <Footer />

      {/* Floating Comparison Dock */}
      {comparedProducts.length > 0 && (
        <aside aria-label="Comparison dock" className="fixed bottom-6 inset-x-4 sm:inset-x-auto sm:right-6 z-40 bg-slate-900 border border-cyan-500/40 p-3.5 rounded-2xl shadow-2xl flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-white font-mono">
              {comparedProducts.length}/4 Selected for Comparison
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCompareOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-cyan-400 text-slate-950 font-bold text-xs hover:bg-cyan-300 transition-colors"
            >
              Compare Side-by-Side
            </button>
            <button
              onClick={() => setComparedProducts([])}
              className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors"
              title="Clear all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </aside>
      )}

      {/* Product Comparison Modal */}
      <ProductComparisonModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        products={comparedProducts}
        onRemoveProduct={(id) => setComparedProducts((prev) => prev.filter((p) => p.id !== id))}
        onAddToCart={handleAddToCart}
        onClearAll={() => {
          setComparedProducts([]);
          setIsCompareOpen(false);
        }}
      />

      {/* Modals */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={(p, qty) => {
          handleAddToCart(p, qty);
          setQuickViewProduct(null);
        }}
      />

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

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        products={initialProducts}
        onSelectProduct={(p) => setQuickViewProduct(p)}
      />
    </div>
  );
};
