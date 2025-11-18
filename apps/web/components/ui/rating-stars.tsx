import * as React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  className?: string;
  onChange?: (rating: number) => void;
  readonly?: boolean;
}

const sizeMap = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
};

export function RatingStars({
  rating,
  maxRating = 5,
  size = 'md',
  showValue = false,
  className,
  onChange,
  readonly = true,
}: RatingStarsProps) {
  const [hoverRating, setHoverRating] = React.useState<number | null>(null);

  const handleClick = (value: number) => {
    if (!readonly && onChange) {
      onChange(value);
    }
  };

  const handleMouseEnter = (value: number) => {
    if (!readonly) {
      setHoverRating(value);
    }
  };

  const handleMouseLeave = () => {
    setHoverRating(null);
  };

  const displayRating = hoverRating ?? rating;

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div
        className="flex items-center gap-0.5"
        onMouseLeave={handleMouseLeave}
        role={readonly ? 'img' : 'radiogroup'}
        aria-label={`Rating: ${rating} out of ${maxRating} stars`}
      >
        {Array.from({ length: maxRating }, (_, i) => {
          const starValue = i + 1;
          const isFilled = starValue <= displayRating;
          const isPartial =
            starValue > displayRating && starValue - 1 < displayRating;

          return (
            <button
              key={i}
              type="button"
              onClick={() => handleClick(starValue)}
              onMouseEnter={() => handleMouseEnter(starValue)}
              disabled={readonly}
              className={cn(
                'relative',
                !readonly &&
                  'cursor-pointer hover:scale-110 transition-transform',
                readonly && 'cursor-default'
              )}
              aria-label={`${starValue} star${starValue !== 1 ? 's' : ''}`}
              role={readonly ? 'presentation' : 'radio'}
              aria-checked={!readonly ? starValue === rating : undefined}
            >
              <Star
                className={cn(
                  sizeMap[size],
                  'transition-colors',
                  isFilled
                    ? 'fill-yellow-400 text-yellow-400'
                    : isPartial
                      ? 'fill-yellow-400/50 text-yellow-400'
                      : 'fill-none text-gray-300'
                )}
              />
            </button>
          );
        })}
      </div>
      {showValue && (
        <span className="text-sm text-muted-foreground ml-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
