import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@repo/shared';
import { Badge } from '@/components/ui/badge';
import { RatingStars } from '@/components/ui/rating-stars';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const hasDiscount =
    product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(
        ((product.compareAtPrice! - product.price) / product.compareAtPrice!) *
          100
      )
    : 0;

  return (
    <Link href={`/products/${product.slug}`} className="group">
      <article className="flex flex-col h-full border rounded-lg overflow-hidden transition-shadow hover:shadow-lg">
        <div className="relative aspect-square bg-muted">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {hasDiscount && (
            <Badge
              variant="destructive"
              className="absolute top-2 right-2 text-xs"
            >
              -{discountPercent}%
            </Badge>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="secondary">Out of Stock</Badge>
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col p-4 space-y-2">
          <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          <div className="flex items-center gap-2">
            <RatingStars rating={product.rating} size="sm" readonly />
            <span className="text-sm text-muted-foreground">
              ({product.reviewCount})
            </span>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2 flex-1">
            {product.description}
          </p>

          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold">
              ${product.price.toFixed(2)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-muted-foreground line-through">
                ${product.compareAtPrice!.toFixed(2)}
              </span>
            )}
          </div>

          {product.stock > 0 && product.stock <= 10 && (
            <p className="text-xs text-orange-600 dark:text-orange-400">
              Only {product.stock} left in stock
            </p>
          )}
        </div>
      </article>
    </Link>
  );
}
