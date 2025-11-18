'use client';

import { useState } from 'react';
import { Product } from '@repo/shared';
import { ProductCard } from '@/components/product/product-card';
import { Button } from '@/components/ui/button';

interface ProductCarouselProps {
  products: Product[];
  title: string;
}

export function ProductCarousel({ products, title }: ProductCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = 4;

  if (products.length === 0) return null;

  const maxIndex = Math.max(0, products.length - itemsPerPage);

  const handlePrevious = () => {
    setCurrentIndex((prev) => Math.max(0, prev - itemsPerPage));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + itemsPerPage));
  };

  const visibleProducts = products.slice(
    currentIndex,
    currentIndex + itemsPerPage
  );

  return (
    <section
      aria-labelledby={`${title.toLowerCase().replace(/\s+/g, '-')}-heading`}
    >
      <div className="flex items-center justify-between mb-6">
        <h2
          id={`${title.toLowerCase().replace(/\s+/g, '-')}-heading`}
          className="text-3xl font-bold"
        >
          {title}
        </h2>
        {products.length > itemsPerPage && (
          <div
            className="flex gap-2"
            role="group"
            aria-label="Carousel navigation"
          >
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              aria-label="Previous products"
            >
              ←
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              disabled={currentIndex >= maxIndex}
              aria-label="Next products"
            >
              →
            </Button>
          </div>
        )}
      </div>

      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        role="region"
        aria-live="polite"
        aria-atomic="true"
      >
        {visibleProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {products.length > itemsPerPage && (
        <div className="mt-4 text-center text-sm text-muted-foreground">
          Showing {currentIndex + 1} -{' '}
          {Math.min(currentIndex + itemsPerPage, products.length)} of{' '}
          {products.length}
        </div>
      )}
    </section>
  );
}
