import {
  Product,
  Vendor,
  ProductCategory,
  ReviewSummary,
  VisualSearchMatch,
  VendorAiMetadata,
  UserInterestProfile,
} from '@unified-commerce/types';
import { MOCK_PRODUCTS as INITIAL_FLAGSHIP_PRODUCTS } from './mock-data';
import {
  EXPANDED_CATEGORIES,
  EXPANDED_VENDORS,
  generateLargeScaleCatalog,
} from './catalog-generator';

export * from './mock-data';
export * from './catalog-generator';
export * from './cache';

// Expanded 1,024+ product marketplace catalog
export const MOCK_CATEGORIES: ProductCategory[] = EXPANDED_CATEGORIES;
export const MOCK_VENDORS: Vendor[] = EXPANDED_VENDORS;
export const MOCK_PRODUCTS: Product[] = generateLargeScaleCatalog(INITIAL_FLAGSHIP_PRODUCTS);

export function getAllProducts(): Product[] {
  return MOCK_PRODUCTS;
}

export function getFeaturedProducts(): Product[] {
  return MOCK_PRODUCTS.filter(p => p.isFeatured);
}

export function getTrendingProducts(): Product[] {
  return MOCK_PRODUCTS.filter(p => p.isTrending);
}

export function getProductsByCategory(categorySlug: string): Product[] {
  return MOCK_PRODUCTS.filter(p => p.category === categorySlug);
}

export function getProductBySlug(slug: string): Product | undefined {
  return MOCK_PRODUCTS.find(p => p.slug === slug);
}

export function getProductById(id: string): Product | undefined {
  return MOCK_PRODUCTS.find(p => p.id === id);
}

export function getAllVendors(): Vendor[] {
  return MOCK_VENDORS;
}

export function getVendorBySlug(slug: string): Vendor | undefined {
  return MOCK_VENDORS.find(v => v.slug === slug);
}

export function getVendorById(id: string): Vendor | undefined {
  return MOCK_VENDORS.find(v => v.id === id);
}

export function getAllCategories(): ProductCategory[] {
  return MOCK_CATEGORIES;
}

export function getCategoryBySlug(slug: string): ProductCategory | undefined {
  return MOCK_CATEGORIES.find(c => c.slug === slug);
}

export interface FilterProductsOptions {
  query?: string;
  category?: string;
  subcategory?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  vendors?: string[];
  inStockOnly?: boolean;
  tags?: string[];
  sortBy?: 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'demand';
  page?: number;
  limit?: number;
}

export function getFilteredProducts(options: FilterProductsOptions = {}): {
  products: Product[];
  totalCount: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
  availableVendors: { id: string; name: string; count: number }[];
  priceRange: { min: number; max: number };
} {
  let filtered = [...MOCK_PRODUCTS];

  // Price bounds across entire catalog
  const prices = MOCK_PRODUCTS.map(p => p.price);
  const priceRange = {
    min: Math.min(...prices),
    max: Math.max(...prices),
  };

  // Keyword query
  if (options.query && options.query.trim()) {
    const q = options.query.toLowerCase().trim();
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.headline.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q)) ||
      p.vendorName.toLowerCase().includes(q) ||
      p.subcategory.toLowerCase().includes(q)
    );
  }

  // Category
  if (options.category && options.category !== 'all') {
    filtered = filtered.filter(p => p.category === options.category);
  }

  // Subcategory
  if (options.subcategory && options.subcategory !== 'all') {
    filtered = filtered.filter(p => p.subcategory.toLowerCase() === options.subcategory?.toLowerCase());
  }

  // Price range
  if (options.minPrice !== undefined) {
    filtered = filtered.filter(p => p.price >= options.minPrice!);
  }
  if (options.maxPrice !== undefined) {
    filtered = filtered.filter(p => p.price <= options.maxPrice!);
  }

  // Rating
  if (options.minRating !== undefined && options.minRating > 0) {
    filtered = filtered.filter(p => p.rating >= options.minRating!);
  }

  // Vendors
  if (options.vendors && options.vendors.length > 0) {
    filtered = filtered.filter(p => options.vendors!.includes(p.vendorId));
  }

  // In-stock
  if (options.inStockOnly) {
    filtered = filtered.filter(p => p.stock > 0);
  }

  // Tags
  if (options.tags && options.tags.length > 0) {
    filtered = filtered.filter(p => options.tags!.some(tag => p.tags.includes(tag)));
  }

  // Sorting
  switch (options.sortBy) {
    case 'price-asc':
      filtered.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      filtered.sort((a, b) => b.price - a.price);
      break;
    case 'rating':
      filtered.sort((a, b) => b.rating - a.rating);
      break;
    case 'demand':
      filtered.sort((a, b) => (b.aiInsights?.demandScore ?? 0) - (a.aiInsights?.demandScore ?? 0));
      break;
    case 'featured':
    default:
      filtered.sort((a, b) => {
        if (b.isFeatured && !a.isFeatured) return 1;
        if (!b.isFeatured && a.isFeatured) return -1;
        return (b.isTrending ? 1 : 0) - (a.isTrending ? 1 : 0);
      });
      break;
  }

  // Vendor counts for faceting
  const vendorCounts = MOCK_VENDORS.map(v => ({
    id: v.id,
    name: v.name,
    count: MOCK_PRODUCTS.filter(p => p.vendorId === v.id).length,
  }));

  const totalCount = filtered.length;
  let page = options.page || 1;
  let limit = options.limit || totalCount;
  let totalPages = Math.ceil(totalCount / limit) || 1;
  let paginatedProducts = filtered;

  if (options.page && options.limit) {
    const startIndex = (page - 1) * limit;
    paginatedProducts = filtered.slice(startIndex, startIndex + limit);
  }

  return {
    products: paginatedProducts,
    totalCount,
    page,
    totalPages,
    hasMore: page < totalPages,
    availableVendors: vendorCounts,
    priceRange,
  };
}

export function getRelatedProducts(productId: string, limit: number = 4): Product[] {
  const current = getProductById(productId);
  if (!current) return MOCK_PRODUCTS.slice(0, limit);

  // Match same category first, then matching tags, exclude self
  const candidates = MOCK_PRODUCTS.filter(p => p.id !== productId);
  candidates.sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;
    if (a.category === current.category) scoreA += 5;
    if (b.category === current.category) scoreB += 5;
    if (a.vendorId === current.vendorId) scoreA += 2;
    if (b.vendorId === current.vendorId) scoreB += 2;
    const commonTagsA = a.tags.filter(t => current.tags.includes(t)).length;
    const commonTagsB = b.tags.filter(t => current.tags.includes(t)).length;
    scoreA += commonTagsA;
    scoreB += commonTagsB;
    return scoreB - scoreA;
  });

  return candidates.slice(0, limit);
}

export function getProductReviews(productId: string) {
  const product = getProductById(productId);
  if (!product) return [];

  // Generate realistic reviews tailored to product category
  return [
    {
      id: `rev-${productId}-1`,
      productId,
      author: 'Marcus Vance',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      rating: 5,
      date: 'September 18, 2026',
      title: 'Exceeded all expectations — engineering at its absolute finest',
      comment: `The build quality on the ${product.name} is unmatched. The materials feel premium and the finish is flawless. Integration was seamless and the performance metrics match the vendor claims precisely.`,
      verifiedPurchase: true,
      helpfulCount: 42,
    },
    {
      id: `rev-${productId}-2`,
      productId,
      author: 'Elena Rostova',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
      rating: 5,
      date: 'September 12, 2026',
      title: 'Seamless dispatch and astounding precision',
      comment: `Arrived from ${product.vendorName} in 2 days. The 3D preview on UnifiedCommerce was 1:1 identical to unboxing the real item. Absolutely loving the tactile feel.`,
      verifiedPurchase: true,
      helpfulCount: 29,
    },
    {
      id: `rev-${productId}-3`,
      productId,
      author: 'Kaelen Thorne',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      rating: 4,
      date: 'August 29, 2026',
      title: 'Phenomenal device, slight learning curve for calibration',
      comment: `High-tech piece of equipment. It took me about 15 minutes to run through the initial setup, but once configured, the feedback loops and responsiveness are revolutionary.`,
      verifiedPurchase: true,
      helpfulCount: 17,
    },
  ];
}

export function getProductBundle(productId: string) {
  const main = getProductById(productId);
  if (!main) return null;

  const bundleIds = main.aiInsights?.frequentlyBoughtWith || [];
  const bundledProducts: Product[] = [];

  for (const bId of bundleIds) {
    const p = getProductById(bId);
    if (p) bundledProducts.push(p);
  }

  // If no predefined bundle, pick 1 complementary product from same or related category
  if (bundledProducts.length === 0) {
    const fallback = MOCK_PRODUCTS.find(p => p.id !== main.id && (p.category === main.category || p.vendorId === main.vendorId));
    if (fallback) bundledProducts.push(fallback);
  }

  const allItems = [main, ...bundledProducts];
  const totalOriginalPrice = allItems.reduce((acc, p) => acc + (p.originalPrice || p.price), 0);
  const standardPrice = allItems.reduce((acc, p) => acc + p.price, 0);
  // Give 12% bundle discount
  const bundlePrice = Math.round(standardPrice * 0.88);
  const discountPercentage = Math.round(((totalOriginalPrice - bundlePrice) / totalOriginalPrice) * 100);

  return {
    mainProduct: main,
    bundledProducts,
    totalOriginalPrice,
    bundlePrice,
    discountPercentage,
  };
}

/* ─────────────────────────────────────────────────────────────
   Category A: AI Depth Data Engine Helpers
───────────────────────────────────────────────────────────── */

export function getProductReviewSummary(productId: string): ReviewSummary {
  const product = getProductById(productId);
  const reviews = getProductReviews(productId);
  const rating = product?.rating ?? 4.8;

  const prosMap: Record<string, string[]> = {
    'cyberpunk-wearables': [
      'Zero-latency tactile and neural response',
      'Ultralight aerospace titanium alloy chassis',
      'Instant AR synchronization across Apple Vision and Quest ecosystems',
      'Sublime battery life (48+ hours of intensive haptic load)',
    ],
    'spatial-audio': [
      'Unsurpassed harmonic separation across 5Hz–55kHz spectrum',
      'Class-A tube stage warmth with studio reference clarity',
      'Bespoke lambskin memory ear cushions with zero clamping fatigue',
      'Lossless low-jitter wireless transmitter included',
    ],
    'autonomous-drones': [
      'Sub-millimeter LiDAR precision in dense architectural foliage',
      'Active collision mitigation at 60 km/h flight velocities',
      'Whisper-quiet carbon fiber toroidal propulsion geometry',
      'Automated RTK return-to-base and inductive landing mat compatibility',
    ],
    'minimalist-living': [
      'Flawless Scandinavian and Japanese brutalist aesthetic',
      'Precision-machined unibody finishes that resist all fingerprints',
      'Silent ultrasonic micro-dispersion with AI circadian scheduling',
      'Seamless HomeKit, Matter, and Home Assistant automation',
    ],
    'biometric-tech': [
      'Clinical-grade HRV and arterial pulse contour measurement',
      'Zero monthly subscription paywalls or locked features',
      'Hypoallergenic diamond-like carbon (DLC) coating',
      '7+ days continuous biometric logging on a single wireless charge',
    ],
  };

  const consMap: Record<string, string[]> = {
    'cyberpunk-wearables': [
      'Calibration curve requires 5–10 minutes for optimal neural tuning',
      'Premium price tier reflects experimental artisanal engineering',
    ],
    'spatial-audio': [
      'Open-back planar design exhibits slight acoustic leakage in quiet public spaces',
      'Requires clean balanced DAC amplification to unleash full soundstage depth',
    ],
    'autonomous-drones': [
      'Suborbital speeds require spacious airspace or open outdoor clearance',
      'LiDAR point cloud raw telemetry files require high-throughput SSD storage',
    ],
    'minimalist-living': [
      'Bespoke aesthetic may not blend with traditional rustic decor',
      'Requires distilled water or organic pure botanical formulations for warranty',
    ],
    'biometric-tech': [
      'Requires precision sizing ring kit before permanent sizing selection',
      'Subtle haptic alerts can take a couple days to habituate to during sleep',
    ],
  };

  const defaultPros = [
    'Artisanal build standard and obsessive attention to industrial tolerances',
    'Rapid zero-defect dispatch backed by UnifiedCommerce escrow protection',
    'Verified multi-vendor warranty with 7-day instant return privileges',
  ];
  const defaultCons = [
    'Limited production batches due to strict artisan quality control standards',
  ];

  const category = product?.category || 'cyberpunk-wearables';
  const pros = prosMap[category] || defaultPros;
  const cons = consMap[category] || defaultCons;

  return {
    productId,
    totalReviewsAnalyzed: reviews.length * 37 + 12,
    overallScore: rating,
    pros,
    cons,
    verdict: `The ${product?.name ?? 'product'} sets the gold benchmark in its segment. For enthusiasts and practitioners seeking zero-compromise engineering and futureproof telemetry, it is an unequivocal top recommendation.`,
    aspects: [
      {
        aspect: 'Build Quality & Ergonomics',
        sentiment: 'POSITIVE',
        score: 0.98,
        summary: 'Praise for aerospace grade materials, tactile response, and lightweight durability.',
      },
      {
        aspect: 'Acoustic / Sensor Fidelity',
        sentiment: 'POSITIVE',
        score: 0.96,
        summary: 'Exceptional signal-to-noise ratio, unmatched frequency response, and accurate tracking.',
      },
      {
        aspect: 'Software & Ecosystem Integration',
        sentiment: 'POSITIVE',
        score: 0.91,
        summary: 'Zero friction pairing with immediate firmware auto-updates and cross-platform hooks.',
      },
      {
        aspect: 'Price-to-Performance Ratio',
        sentiment: rating >= 4.7 ? 'POSITIVE' : 'NEUTRAL',
        score: 0.88,
        summary: 'Positioned at the luxury-tier frontier, justified by bespoke componentry and zero subscription lockouts.',
      },
    ],
    recommendedFor: [
      'High-performance practitioners and creative technologists',
      'Users looking for uncompromising material longevity without subscriptions',
      'Cybernetic and spatial computing enthusiasts',
    ],
    notRecommendedFor: [
      'Casual bargain shoppers looking for disposable commodity alternatives',
      'Environments lacking modern Bluetooth 5.4 or high-bandwidth WiFi 7 infrastructure',
    ],
  };
}

export function getVisualSearchMatches(query: {
  categoryHint?: string;
  colorHint?: string;
  aesthetic?: string;
  tags?: string[];
}): VisualSearchMatch[] {
  const matches: VisualSearchMatch[] = [];

  const aestheticKeywords: Record<string, string[]> = {
    cyberpunk: ['cyberpunk', 'neural', 'neon', 'visor', 'ar', 'holographic', 'hud'],
    minimalist: ['minimalist', 'clean', 'zen', 'living', 'aura', 'mat', 'keyboard'],
    audiophile: ['audio', 'planar', 'hi-fi', 'sound', 'dac', 'earbuds', 'speaker'],
    aerospace: ['drone', 'lidar', 'autonomous', 'survey', 'carbon', 'fpv'],
    biometric: ['ring', 'biometric', 'health', 'sleep', 'ecg', 'sensor'],
  };

  for (const product of MOCK_PRODUCTS) {
    let score = 0.55; // baseline visual feature alignment
    const matchedFeatures: string[] = [];

    // Category matching
    if (query.categoryHint && product.category === query.categoryHint) {
      score += 0.22;
      matchedFeatures.push(`Category topology: ${product.category}`);
    }

    // Aesthetic theme matching
    if (query.aesthetic) {
      const keywords = aestheticKeywords[query.aesthetic.toLowerCase()] || [];
      const overlaps = product.tags.filter(t => keywords.includes(t.toLowerCase())).length;
      if (overlaps > 0) {
        score += Math.min(0.2, overlaps * 0.08);
        matchedFeatures.push(`Aesthetic signature: ${query.aesthetic} (${overlaps} tags matched)`);
      }
    }

    // Color/glow matching
    const glow = product.threedConfig?.glowColor?.toLowerCase() || '';
    if (query.colorHint && (glow.includes(query.colorHint.toLowerCase()) || product.headline.toLowerCase().includes(query.colorHint.toLowerCase()))) {
      score += 0.15;
      matchedFeatures.push(`Color palette harmonic: ${query.colorHint}`);
    } else {
      matchedFeatures.push(`Specular palette: ${product.threedConfig?.glowColor || '#00F2FE'}`);
    }

    // Clamp score to [0.65, 0.99]
    const clampedScore = Math.min(0.99, Math.max(0.65, parseFloat(score.toFixed(4))));

    matches.push({
      product,
      visualSimilarityScore: clampedScore,
      dominantColors: [
        product.threedConfig?.glowColor || '#00F2FE',
        '#07090E',
        '#7928CA',
      ],
      aestheticCategory: product.category,
      matchedFeatures,
    });
  }

  // Sort descending by visual similarity score
  matches.sort((a, b) => b.visualSimilarityScore - a.visualSimilarityScore);
  return matches.slice(0, 8);
}

export function generateProductAiMetadata(input: {
  name: string;
  category: string;
  keyFeatures?: string[];
  rawPrice?: number;
}): VendorAiMetadata {
  const cleanName = input.name.trim();
  const categoryClean = input.category.replace(/-/g, ' ');
  const features = input.keyFeatures && input.keyFeatures.length > 0
    ? input.keyFeatures
    : ['Precision aerospace tolerance', 'Next-gen reactive neural telemetry', 'Sub-millisecond latency'];

  const price = input.rawPrice || 499;
  const minPrice = Math.round(price * 0.88);
  const maxPrice = Math.round(price * 1.25);
  const optimalPrice = Math.round(price * 1.05);

  return {
    title: `${cleanName} — Next-Gen High-Fidelity ${categoryClean.toUpperCase()}`,
    headline: `Engineered for visionary practitioners demanding uncompromised ${categoryClean} supremacy.`,
    description: `The ${cleanName} introduces a paradigm leap in ${categoryClean}. Featuring ${features.join(', ')}, this hardware unit is handcrafted by verified artisans on UnifiedCommerce with zero planned obsolescence and full verifiable escrow protection.`,
    bulletPoints: [
      `Architected with military-spec durability and precision calibration tolerances.`,
      `Full integration with the UnifiedCommerce 3D telemetry and live WebXR preview suite.`,
      `Zero recurring subscription paywalls — all onboard neural firmware updates are lifetime complimentary.`,
      `Packaged in biodegradable electromagnetic-shielded recycled composites.`,
    ],
    tags: [
      'next-gen',
      'verified-artisan',
      'unified-commerce',
      ...input.category.split('-'),
      cleanName.toLowerCase().replace(/\s+/g, '-'),
    ],
    seoMetaTitle: `Buy ${cleanName} | Verified ${categoryClean} on UnifiedCommerce`,
    seoMetaDescription: `Order the ${cleanName} with instant D+1 dispatch, live radar parcel tracking, and escrow security on UnifiedCommerce.`,
    targetKeywords: [
      cleanName.toLowerCase(),
      `best ${categoryClean}`,
      `${categoryClean} review 2026`,
      `buy ${cleanName} online`,
      'verified artisan hardware',
    ],
    suggestedPriceRange: {
      min: minPrice,
      max: maxPrice,
      optimal: optimalPrice,
    },
  };
}

export function getPersonalizedProductRanking(profile: Partial<UserInterestProfile>): {
  featured: Product[];
  personalizedPicks: Product[];
  recommendedCategories: string[];
} {
  const preferredCats = profile.preferredCategories || [];
  const viewedIds = new Set(profile.recentViewedIds || []);
  const cartIds = new Set(profile.cartIntentIds || []);

  const scored = MOCK_PRODUCTS.map(product => {
    let score = 0;
    // Category preference boost
    if (preferredCats.includes(product.category)) {
      score += 40;
    }
    // High rating boost
    score += (product.rating - 4.0) * 15;
    // Trending boost
    if (product.isTrending) score += 10;
    if (product.isFeatured) score += 8;
    // Exclude or de-prioritize already viewed if exploring
    if (viewedIds.has(product.id)) {
      score += 5; // relevant but not top
    }
    if (cartIds.has(product.id)) {
      score += 25; // high purchase intent
    }
    return { product, score };
  });

  scored.sort((a, b) => b.score - a.score);

  const personalizedPicks = scored.slice(0, 8).map(s => s.product);
  const featured = MOCK_PRODUCTS.filter(p => p.isFeatured).slice(0, 6);

  const categories = preferredCats.length > 0
    ? Array.from(new Set([...preferredCats, 'cyberpunk-wearables', 'spatial-audio', 'autonomous-drones']))
    : ['cyberpunk-wearables', 'spatial-audio', 'autonomous-drones', 'minimalist-living', 'biometric-tech'];

  return {
    featured,
    personalizedPicks,
    recommendedCategories: categories.slice(0, 4),
  };
}

