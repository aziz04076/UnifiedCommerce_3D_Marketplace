import React from 'react';
import { getAllProducts, getAllCategories, getAllVendors } from '@unified-commerce/database';
import { ClientMarketplace } from '../components/ClientMarketplace';

export const revalidate = 60; // 60s cache revalidation

export default function HomePage() {
  const allProducts = getAllProducts();
  // Provide curated top products for the home page showcase to keep initial HTML payload < 150 KB
  const curatedProducts = allProducts.slice(0, 36);
  const categories = getAllCategories();
  const vendors = getAllVendors();

  return (
    <ClientMarketplace
      initialProducts={curatedProducts}
      totalCatalogCount={allProducts.length}
      categories={categories}
      vendors={vendors}
    />
  );
}
