import { Suspense } from 'react';
import { Metadata } from 'next';
import { ProductListingContent } from './product-listing-content';
import { ProductGridSkeleton } from '@/components/product/product-skeleton';

export const metadata: Metadata = {
  title: 'Products | E-Commerce Store',
  description: 'Browse our wide selection of quality products',
};

export default function ProductsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">All Products</h1>
      <Suspense fallback={<ProductGridSkeleton count={12} />}>
        <ProductListingContent />
      </Suspense>
    </div>
  );
}
