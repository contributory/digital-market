import Link from 'next/link';
import { auth } from '@/lib/auth';
import { Product, Category, ApiResponse } from '@repo/shared';
import { HeroBanner } from '@/components/home/hero-banner';
import { FeaturedCategories } from '@/components/home/featured-categories';
import { ProductCarousel } from '@/components/home/product-carousel';
import { PromotionalBanner } from '@/components/home/promotional-banner';
import { Button } from '@/components/ui/button';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const response = await fetch(`${API_URL}/products/featured`, {
      next: { revalidate: 300 },
    });
    if (!response.ok) return [];
    const data: ApiResponse<Product[]> = await response.json();
    return data.data || [];
  } catch (_error) {
    return [];
  }
}

async function getTrendingProducts(): Promise<Product[]> {
  try {
    const response = await fetch(`${API_URL}/products/trending`, {
      next: { revalidate: 300 },
    });
    if (!response.ok) return [];
    const data: ApiResponse<Product[]> = await response.json();
    return data.data || [];
  } catch (_error) {
    return [];
  }
}

async function getCategories(): Promise<Category[]> {
  try {
    const response = await fetch(`${API_URL}/categories`, {
      next: { revalidate: 300 },
    });
    if (!response.ok) return [];
    const data: ApiResponse<Category[]> = await response.json();
    return data.data || [];
  } catch (_error) {
    return [];
  }
}

export default async function Home() {
  const session = await auth();

  const [featuredProducts, trendingProducts, categories] = await Promise.all([
    getFeaturedProducts(),
    getTrendingProducts(),
    getCategories(),
  ]);

  return (
    <div className="container mx-auto py-8 px-4 space-y-12">
      {/* Hero Banner */}
      <HeroBanner />

      {/* Featured Categories */}
      <FeaturedCategories categories={categories} />

      {/* Trending Products */}
      {trendingProducts.length > 0 && (
        <ProductCarousel products={trendingProducts} title="Trending Now" />
      )}

      {/* Promotional Banner */}
      <PromotionalBanner />

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <ProductCarousel
          products={featuredProducts}
          title="Featured Products"
        />
      )}

      {/* Quick Actions */}
      <section className="text-center py-8">
        <h2 className="text-2xl font-bold mb-4">
          {session
            ? `Welcome back, ${session.user.name || session.user.email}!`
            : 'Start Your Shopping Journey'}
        </h2>
        <p className="text-muted-foreground mb-6">
          {session
            ? 'Explore our latest products and exclusive deals'
            : 'Sign in to access exclusive features and track your orders'}
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link href="/products">
            <Button size="lg">Browse All Products</Button>
          </Link>
          {!session && (
            <>
              <Link href="/login">
                <Button size="lg" variant="outline">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button size="lg" variant="secondary">
                  Create Account
                </Button>
              </Link>
            </>
          )}
          {session && (
            <Link href="/account">
              <Button size="lg" variant="outline">
                My Account
              </Button>
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
