import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function HeroBanner() {
  return (
    <section
      className="relative bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-24 px-4 rounded-lg"
      aria-labelledby="hero-heading"
    >
      <div className="container mx-auto text-center">
        <h1 id="hero-heading" className="text-5xl font-bold mb-4">
          Welcome to Our Store
        </h1>
        <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
          Discover amazing products at unbeatable prices. Shop the latest trends
          and elevate your lifestyle today.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/products">
            <Button size="lg" variant="secondary">
              Shop Now
            </Button>
          </Link>
          <Link href="/products?sort=createdAt-desc">
            <Button
              size="lg"
              variant="outline"
              className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"
            >
              New Arrivals
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
