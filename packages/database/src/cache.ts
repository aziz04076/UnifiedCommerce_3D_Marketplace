import { Product, ProductCategory } from '@unified-commerce/types';

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const DEFAULT_TTL_MS = 1000 * 60 * 5; // 5 minutes cache TTL
const cacheStore = new Map<string, CacheEntry<any>>();

/**
 * Fast in-memory cache with TTL and programmatic invalidation
 */
export function getFromCache<T>(key: string): T | null {
  const entry = cacheStore.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cacheStore.delete(key);
    return null;
  }
  return entry.data;
}

export function setInCache<T>(key: string, data: T, ttlMs = DEFAULT_TTL_MS): void {
  cacheStore.set(key, {
    data,
    expiresAt: Date.now() + ttlMs,
  });
}

export function invalidateCatalogCache(): void {
  cacheStore.clear();
}

/**
 * Cached Category Hierarchy & Tree
 */
export function getCachedCategories(fetcher: () => ProductCategory[]): ProductCategory[] {
  const cacheKey = 'catalog:categories:all';
  const cached = getFromCache<ProductCategory[]>(cacheKey);
  if (cached) return cached;

  const fresh = fetcher();
  setInCache(cacheKey, fresh, 1000 * 60 * 15); // 15 mins for category tree
  return fresh;
}

/**
 * Cached Deals of the Day (highest % discount)
 */
export function getCachedDealsOfTheDay(products: Product[], limit = 8): (Product & { discountPercentage: number })[] {
  const cacheKey = `catalog:merchandising:deals:${limit}`;
  const cached = getFromCache<(Product & { discountPercentage: number })[]>(cacheKey);
  if (cached) return cached;

  const discounted = products
    .filter((p) => p.originalPrice && p.originalPrice > p.price)
    .map((p) => {
      const discountPercentage = Math.round(
        (((p.originalPrice! - p.price) / p.originalPrice!) * 100)
      );
      return { ...p, discountPercentage };
    })
    .sort((a, b) => b.discountPercentage - a.discountPercentage)
    .slice(0, limit);

  setInCache(cacheKey, discounted, 1000 * 60 * 5);
  return discounted;
}

/**
 * Cached Trending Products (high demand score + reviews)
 */
export function getCachedTrendingProducts(products: Product[], limit = 8): Product[] {
  const cacheKey = `catalog:merchandising:trending:${limit}`;
  const cached = getFromCache<Product[]>(cacheKey);
  if (cached) return cached;

  const trending = [...products]
    .filter((p) => p.isTrending || (p.aiInsights?.demandScore || 0) > 80)
    .sort((a, b) => (b.aiInsights?.demandScore || 0) - (a.aiInsights?.demandScore || 0))
    .slice(0, limit);

  setInCache(cacheKey, trending, 1000 * 60 * 5);
  return trending;
}

/**
 * Cached New Arrivals
 */
export function getCachedNewArrivals(products: Product[], limit = 8): Product[] {
  const cacheKey = `catalog:merchandising:new-arrivals:${limit}`;
  const cached = getFromCache<Product[]>(cacheKey);
  if (cached) return cached;

  // Newest items from catalog end
  const newArrivals = [...products].reverse().slice(0, limit);

  setInCache(cacheKey, newArrivals, 1000 * 60 * 5);
  return newArrivals;
}

/**
 * Cached Top Rated in Category
 */
export function getCachedTopRatedInCategory(products: Product[], categorySlug: string, limit = 6): Product[] {
  const cacheKey = `catalog:merchandising:top-rated:${categorySlug}:${limit}`;
  const cached = getFromCache<Product[]>(cacheKey);
  if (cached) return cached;

  const topRated = products
    .filter((p) => p.category === categorySlug)
    .sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount)
    .slice(0, limit);

  setInCache(cacheKey, topRated, 1000 * 60 * 10);
  return topRated;
}
