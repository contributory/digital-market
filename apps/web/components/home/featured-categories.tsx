import Link from 'next/link';
import Image from 'next/image';
import { Category } from '@repo/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FeaturedCategoriesProps {
  categories: Category[];
}

export function FeaturedCategories({ categories }: FeaturedCategoriesProps) {
  const rootCategories = categories.filter((cat) => !cat.parentId);

  if (rootCategories.length === 0) return null;

  return (
    <section aria-labelledby="categories-heading">
      <h2 id="categories-heading" className="text-3xl font-bold mb-6">
        Shop by Category
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {rootCategories.map((category) => (
          <Link
            key={category.id}
            href={`/products?category=${category.id}`}
            className="group"
          >
            <Card className="overflow-hidden transition-shadow hover:shadow-lg">
              {category.imageUrl && (
                <div className="relative aspect-video bg-muted">
                  <Image
                    src={category.imageUrl}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                </div>
              )}
              <CardHeader>
                <CardTitle className="group-hover:text-primary transition-colors">
                  {category.name}
                </CardTitle>
              </CardHeader>
              {category.description && (
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {category.description}
                  </p>
                </CardContent>
              )}
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
