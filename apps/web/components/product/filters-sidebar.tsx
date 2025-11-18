'use client';

import { Category } from '@repo/shared';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface FiltersSidebarProps {
  categories: Category[];
  selectedCategory?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  onCategoryChange: (categoryId: string | undefined) => void;
  onPriceChange: (min: number | undefined, max: number | undefined) => void;
  onRatingChange: (rating: number | undefined) => void;
  onClearFilters: () => void;
}

export function FiltersSidebar({
  categories,
  selectedCategory,
  minPrice,
  maxPrice,
  minRating,
  onCategoryChange,
  onPriceChange,
  onRatingChange,
  onClearFilters,
}: FiltersSidebarProps) {
  const ratings = [5, 4, 3, 2, 1];

  const handleMinPriceChange = (value: string) => {
    const num = parseFloat(value);
    onPriceChange(isNaN(num) ? undefined : num, maxPrice);
  };

  const handleMaxPriceChange = (value: string) => {
    const num = parseFloat(value);
    onPriceChange(minPrice, isNaN(num) ? undefined : num);
  };

  const rootCategories = categories.filter((cat) => !cat.parentId);

  const hasActiveFilters =
    selectedCategory ||
    minPrice !== undefined ||
    maxPrice !== undefined ||
    minRating !== undefined;

  return (
    <aside className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Filters</h2>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            Clear all
          </Button>
        )}
      </div>

      {/* Categories */}
      <div>
        <h3 className="font-medium mb-3">Categories</h3>
        <div className="space-y-2">
          {rootCategories.map((category) => {
            const subcategories = categories.filter(
              (cat) => cat.parentId === category.id
            );
            const isSelected = selectedCategory === category.id;

            return (
              <div key={category.id}>
                <button
                  onClick={() =>
                    onCategoryChange(isSelected ? undefined : category.id)
                  }
                  className={`w-full text-left px-3 py-2 rounded-md transition-colors hover:bg-accent ${
                    isSelected ? 'bg-accent font-medium' : ''
                  }`}
                >
                  {category.name}
                </button>
                {subcategories.length > 0 && (
                  <div className="ml-4 mt-1 space-y-1">
                    {subcategories.map((subcategory) => (
                      <button
                        key={subcategory.id}
                        onClick={() =>
                          onCategoryChange(
                            selectedCategory === subcategory.id
                              ? undefined
                              : subcategory.id
                          )
                        }
                        className={`w-full text-left text-sm px-3 py-1.5 rounded-md transition-colors hover:bg-accent ${
                          selectedCategory === subcategory.id
                            ? 'bg-accent font-medium'
                            : ''
                        }`}
                      >
                        {subcategory.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-medium mb-3">Price Range</h3>
        <div className="flex gap-2 items-center">
          <div className="flex-1">
            <Input
              type="number"
              placeholder="Min"
              value={minPrice ?? ''}
              onChange={(e) => handleMinPriceChange(e.target.value)}
              min={0}
              step={10}
            />
          </div>
          <span className="text-muted-foreground">-</span>
          <div className="flex-1">
            <Input
              type="number"
              placeholder="Max"
              value={maxPrice ?? ''}
              onChange={(e) => handleMaxPriceChange(e.target.value)}
              min={0}
              step={10}
            />
          </div>
        </div>
      </div>

      {/* Rating */}
      <div>
        <h3 className="font-medium mb-3">Minimum Rating</h3>
        <div className="space-y-2">
          {ratings.map((rating) => (
            <button
              key={rating}
              onClick={() =>
                onRatingChange(minRating === rating ? undefined : rating)
              }
              className={`w-full text-left px-3 py-2 rounded-md transition-colors hover:bg-accent flex items-center gap-2 ${
                minRating === rating ? 'bg-accent font-medium' : ''
              }`}
            >
              <span>{rating}</span>
              <span className="text-yellow-500">{'★'.repeat(rating)}</span>
              <span className="text-muted-foreground text-sm">& up</span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
