import { RatingDistribution as RatingDist } from '@repo/shared';

interface RatingDistributionProps {
  distribution: RatingDist;
  totalReviews: number;
}

export function RatingDistribution({
  distribution,
  totalReviews,
}: RatingDistributionProps) {
  const ratings = [5, 4, 3, 2, 1] as const;

  return (
    <div className="space-y-2">
      {ratings.map((rating) => {
        const count = distribution[rating];
        const percentage =
          totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;

        return (
          <div key={rating} className="flex items-center gap-3">
            <span className="text-sm font-medium w-12">
              {rating} star{rating !== 1 ? 's' : ''}
            </span>
            <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
              <div
                className="bg-primary h-full transition-all"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="text-sm text-muted-foreground w-12 text-right">
              {count}
            </span>
          </div>
        );
      })}
    </div>
  );
}
