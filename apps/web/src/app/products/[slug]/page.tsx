import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  getAllProducts,
  getProductBySlug,
  getVendorById,
  getCategoryBySlug,
  getRelatedProducts,
  getProductReviews,
  getProductBundle,
  getAllCategories,
} from '@unified-commerce/database';
import { ProductDetailView } from '../../../components/ProductDetailView';

export const dynamicParams = true;
export const revalidate = 60; // 60s cache revalidation

export async function generateStaticParams() {
  const products = getAllProducts();
  // Pre-generate top 25 flagship items at build time; others on demand
  return products.slice(0, 25).map((p) => ({
    slug: p.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const product = getProductBySlug(params.slug);
  if (!product) {
    return {
      title: 'Product Not Found — UnifiedCommerce',
    };
  }

  return {
    title: `${product.name} — UnifiedCommerce 3D Studio`,
    description: product.headline,
    openGraph: {
      title: product.name,
      description: product.headline,
      images: [{ url: product.images[0] }],
    },
  };
}

export default function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = getProductBySlug(params.slug);
  if (!product) {
    notFound();
  }

  const vendor = getVendorById(product.vendorId) || {
    id: product.vendorId,
    name: product.vendorName,
    slug: 'unknown',
    tagline: 'Verified Maker',
    description: 'Verified hardware laboratory.',
    logo: product.vendorAvatar,
    banner: '',
    rating: 4.9,
    reviewCount: 100,
    totalProducts: 1,
    commissionRate: 0.08,
    isVerified: true,
    kycStatus: 'VERIFIED' as const,
    location: 'Global',
    badge: 'Verified Maker' as const,
    metrics: { gmv: 100000, completionRate: 99, avgDeliveryDays: 2 },
  };

  const category = getCategoryBySlug(product.category);
  const relatedProducts = getRelatedProducts(product.id, 4);
  const reviews = getProductReviews(product.id);
  const bundle = getProductBundle(product.id);
  const allCategories = getAllCategories();

  return (
    <ProductDetailView
      product={product}
      vendor={vendor}
      category={category}
      relatedProducts={relatedProducts}
      reviews={reviews}
      bundle={bundle}
      allCategories={allCategories}
    />
  );
}
