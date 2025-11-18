'use client';

import { useState, useEffect, useOptimistic } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  Product,
  Review,
  RatingDistribution as RatingDist,
  ApiResponse,
  PaginatedResponse,
} from '@repo/shared';
import { ImageGallery } from '@/components/product/image-gallery';
import { RatingStars } from '@/components/ui/rating-stars';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { ProductCard } from '@/components/product/product-card';
import { ReviewList } from '@/components/product/review-list';
import { ReviewForm } from '@/components/product/review-form';
import { RatingDistribution } from '@/components/product/rating-distribution';
import { ProductSkeleton } from '@/components/product/product-skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { useCart } from '@/lib/hooks/useCart';

interface ProductDetailContentProps {
  product: Product;
}

export function ProductDetailContent({ product }: ProductDetailContentProps) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const { addToCart, isAddingToCart } = useCart();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [optimisticReviews, addOptimisticReview] = useOptimistic(
    reviews,
    (state, newReview: Review) => [newReview, ...state]
  );
  const [distribution, setDistribution] = useState<RatingDist>({
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  });
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const hasDiscount =
    product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(
        ((product.compareAtPrice! - product.price) / product.compareAtPrice!) *
          100
      )
    : 0;

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    ...(product.category
      ? [
          {
            label: product.category.name,
            href: `/products?category=${product.category.id}`,
          },
        ]
      : []),
    { label: product.name },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reviewsRes, distributionRes, relatedRes] = await Promise.all([
          fetch(`/api/products/${product.id}/reviews`),
          fetch(`/api/products/${product.id}/reviews/distribution`),
          fetch(`/api/products/${product.id}/related`),
        ]);

        if (reviewsRes.ok) {
          const reviewsData: PaginatedResponse<Review> =
            await reviewsRes.json();
          setReviews(reviewsData.data || []);
        }

        if (distributionRes.ok) {
          const distributionData: ApiResponse<RatingDist> =
            await distributionRes.json();
          setDistribution(
            distributionData.data || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
          );
        }

        if (relatedRes.ok) {
          const relatedData: ApiResponse<Product[]> = await relatedRes.json();
          setRelatedProducts(relatedData.data || []);
        }
      } catch (_error) {
        // Silent error - we'll show empty states for missing data
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [product.id]);

  const handleAddToCart = () => {
    addToCart(
      { productId: product.id, quantity: 1 },
      {
        onSuccess: () => {
          toast({
            title: 'Added to cart',
            description: `${product.name} has been added to your cart.`,
          });
        },
        onError: (error) => {
          toast({
            title: 'Error',
            description: error.message || 'Failed to add item to cart',
            variant: 'destructive',
          });
        },
      }
    );
  };

  const handleReviewSubmit = () => {
    // Optimistic update - add a temporary review
    const tempReview: Review = {
      id: `temp-${Date.now()}`,
      productId: product.id,
      userId: session?.user?.id || '',
      userName: session?.user?.name || session?.user?.email || 'Anonymous',
      rating: 5,
      title: 'Review being submitted...',
      comment: '',
      verified: false,
      helpful: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addOptimisticReview(tempReview);

    // Refresh reviews after a short delay
    setTimeout(async () => {
      try {
        const response = await fetch(`/api/products/${product.id}/reviews`);
        if (response.ok) {
          const data: PaginatedResponse<Review> = await response.json();
          setReviews(data.data || []);
        }
      } catch (error) {
        console.error('Failed to refresh reviews:', error);
      }
    }, 1000);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Breadcrumbs items={breadcrumbItems} className="mb-6" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Image Gallery */}
        <ImageGallery images={product.images} productName={product.name} />

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <RatingStars rating={product.rating} size="sm" readonly />
                <span className="text-sm text-muted-foreground">
                  {product.rating.toFixed(1)} ({product.reviewCount} reviews)
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-bold">
              ${product.price.toFixed(2)}
            </span>
            {hasDiscount && (
              <>
                <span className="text-xl text-muted-foreground line-through">
                  ${product.compareAtPrice!.toFixed(2)}
                </span>
                <Badge variant="destructive">Save {discountPercent}%</Badge>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {product.stock > 0 ? (
              <Badge variant="default">
                In Stock ({product.stock} available)
              </Badge>
            ) : (
              <Badge variant="secondary">Out of Stock</Badge>
            )}
          </div>

          <p className="text-muted-foreground leading-relaxed">
            {product.description}
          </p>

          {product.shippingInfo && (
            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-semibold mb-1">Shipping Information</h3>
              <p className="text-sm text-muted-foreground">
                {product.shippingInfo}
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              size="lg"
              className="flex-1"
              onClick={handleAddToCart}
              disabled={product.stock === 0 || isAddingToCart}
            >
              {isAddingToCart ? 'Adding...' : 'Add to Cart'}
            </Button>
            <Button size="lg" variant="outline">
              ♡
            </Button>
          </div>

          {product.sku && (
            <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
          )}
        </div>
      </div>

      {/* Tabs for Description and Reviews */}
      <Tabs defaultValue="reviews" className="mb-12">
        <TabsList>
          <TabsTrigger value="reviews">
            Reviews ({product.reviewCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reviews" className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="sticky top-4">
                <h3 className="text-lg font-semibold mb-4">Rating Overview</h3>
                <div className="text-center mb-6 p-6 bg-muted rounded-lg">
                  <div className="text-5xl font-bold mb-2">
                    {product.rating.toFixed(1)}
                  </div>
                  <RatingStars rating={product.rating} size="lg" readonly />
                  <p className="text-sm text-muted-foreground mt-2">
                    Based on {product.reviewCount} reviews
                  </p>
                </div>
                <RatingDistribution
                  distribution={distribution}
                  totalReviews={product.reviewCount}
                />
              </div>
            </div>

            <div className="lg:col-span-2">
              {session ? (
                <div className="mb-8 p-6 border rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
                  <ReviewForm
                    productId={product.id}
                    onSubmitSuccess={handleReviewSubmit}
                  />
                </div>
              ) : (
                <div className="mb-8 p-6 border rounded-lg text-center">
                  <p className="text-muted-foreground mb-4">
                    Sign in to write a review
                  </p>
                  <Link href="/login">
                    <Button>Sign In</Button>
                  </Link>
                </div>
              )}

              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-32 bg-muted animate-pulse rounded"
                    />
                  ))}
                </div>
              ) : (
                <ReviewList reviews={optimisticReviews} />
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Related Products</h2>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
