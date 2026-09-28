import React from 'react';
import { Metadata } from 'next';
import { getAllProducts, getAllCategories, getAllVendors } from '@unified-commerce/database';
import { CatalogExplorer } from '../../components/CatalogExplorer';

export const metadata: Metadata = {
  title: 'Hardware & Cybernetic Catalog — UnifiedCommerce',
  description:
    'Explore 50+ cutting-edge verified multi-vendor products with interactive 3D inspection, planar acoustics, and neural telemetry.',
};

export default function ProductsPage({
  searchParams,
}: {
  searchParams: { category?: string; q?: string };
}) {
  const products = getAllProducts();
  const categories = getAllCategories();
  const vendors = getAllVendors();

  return (
    <CatalogExplorer
      initialProducts={products}
      categories={categories}
      vendors={vendors}
      initialCategory={searchParams.category || 'all'}
      initialQuery={searchParams.q || ''}
    />
  );
}
