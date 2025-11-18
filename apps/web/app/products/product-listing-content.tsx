'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import {
  Product,
  Category,
  PaginatedResponse,
  ApiResponse,
} from '@repo/shared';
import { ProductGrid } from '@/components/product/product-grid';
import { FiltersSidebar } from '@/components/product/filters-sidebar';
import { SortControls } from '@/components/product/sort-controls';
import { Pagination } from '@/components/product/pagination';
import { ProductGridSkeleton } from '@/components/product/product-skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export function ProductListingContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1,
  });

  const selectedCategory = searchParams.get('category') || undefined;
  const minPrice = searchParams.get('minPrice')
    ? parseFloat(searchParams.get('minPrice')!)
    : undefined;
  const maxPrice = searchParams.get('maxPrice')
    ? parseFloat(searchParams.get('maxPrice')!)
    : undefined;
  const minRating = searchParams.get('rating')
    ? parseInt(searchParams.get('rating')!)
    : undefined;
  const search = searchParams.get('search') || undefined;
  const sortValue = searchParams.get('sort') || 'createdAt-desc';
  const currentPage = searchParams.get('page')
    ? parseInt(searchParams.get('page')!)
    : 1;

  const [sortField, sortOrder] = sortValue.split('-') as [
    'price' | 'rating' | 'createdAt' | 'name',
    'asc' | 'desc',
  ];

  const updateURL = (params: Record<string, string | undefined>) => {
    const newParams = new URLSearchParams(searchParams.toString());

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });

    router.push(`${pathname}?${newParams.toString()}`, { scroll: false });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [productsRes, categoriesRes] = await Promise.all([
          fetch(
            `/api/products?${new URLSearchParams({
              ...(selectedCategory && { categoryId: selectedCategory }),
              ...(minPrice !== undefined && {
                minPrice: minPrice.toString(),
              }),
              ...(maxPrice !== undefined && {
                maxPrice: maxPrice.toString(),
              }),
              ...(minRating !== undefined && {
                minRating: minRating.toString(),
              }),
              ...(search && { search }),
              sortField,
              sortOrder,
              page: currentPage.toString(),
              limit: '12',
            })}`
          ),
          fetch('/api/categories'),
        ]);

        if (!productsRes.ok || !categoriesRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const productsData: PaginatedResponse<Product> =
          await productsRes.json();
        const categoriesData: ApiResponse<Category[]> =
          await categoriesRes.json();

        setProducts(productsData.data || []);
        setPagination(productsData.pagination);
        setCategories(categoriesData.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [
    selectedCategory,
    minPrice,
    maxPrice,
    minRating,
    search,
    sortField,
    sortOrder,
    currentPage,
  ]);

  const handleCategoryChange = (categoryId: string | undefined) => {
    updateURL({ category: categoryId, page: '1' });
  };

  const handlePriceChange = (
    min: number | undefined,
    max: number | undefined
  ) => {
    updateURL({
      minPrice: min?.toString(),
      maxPrice: max?.toString(),
      page: '1',
    });
  };

  const handleRatingChange = (rating: number | undefined) => {
    updateURL({ rating: rating?.toString(), page: '1' });
  };

  const handleSortChange = (value: string) => {
    updateURL({ sort: value, page: '1' });
  };

  const handlePageChange = (page: number) => {
    updateURL({ page: page.toString() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearFilters = () => {
    router.push(pathname);
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          <p className="mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Filters Sidebar */}
      <div className="lg:col-span-1">
        <div className="sticky top-4">
          <FiltersSidebar
            categories={categories}
            selectedCategory={selectedCategory}
            minPrice={minPrice}
            maxPrice={maxPrice}
            minRating={minRating}
            onCategoryChange={handleCategoryChange}
            onPriceChange={handlePriceChange}
            onRatingChange={handleRatingChange}
            onClearFilters={handleClearFilters}
          />
        </div>
      </div>

      {/* Products Grid */}
      <div className="lg:col-span-3 space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {loading ? (
              'Loading...'
            ) : (
              <>
                Showing {products.length} of {pagination.total} products
              </>
            )}
          </p>
          <SortControls value={sortValue} onChange={handleSortChange} />
        </div>

        {loading ? (
          <ProductGridSkeleton count={12} />
        ) : (
          <>
            <ProductGrid products={products} />
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>
    </div>
  );
}
