import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function PromotionalBanner() {
  return (
    <section
      className="bg-muted p-8 rounded-lg"
      aria-labelledby="promo-heading"
    >
      <div className="container mx-auto text-center">
        <h2 id="promo-heading" className="text-2xl font-bold mb-2">
          Special Offer!
        </h2>
        <p className="text-muted-foreground mb-4">
          Get free shipping on all orders over $50. Limited time only!
        </p>
        <Link href="/products">
          <Button>Shop Now</Button>
        </Link>
      </div>
    </section>
  );
}
