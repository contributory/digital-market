import { Review } from '@repo/shared';
import { RatingStars } from '@/components/ui/rating-stars';

interface ReviewListProps {
  reviews: Review[];
}

export function ReviewList({ reviews }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No reviews yet. Be the first to review this product!
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <article key={review.id} className="border-b pb-6 last:border-b-0">
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold">{review.userName}</h4>
                {review.verified && (
                  <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-0.5 rounded">
                    Verified Purchase
                  </span>
                )}
              </div>
              <RatingStars rating={review.rating} size="sm" readonly />
            </div>
            <time
              className="text-sm text-muted-foreground"
              dateTime={review.createdAt}
            >
              {new Date(review.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
          </div>

          <h5 className="font-medium mb-2">{review.title}</h5>
          <p className="text-muted-foreground">{review.comment}</p>

          {review.helpful !== undefined && review.helpful > 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              {review.helpful} {review.helpful === 1 ? 'person' : 'people'}{' '}
              found this helpful
            </p>
          )}
        </article>
      ))}
    </div>
  );
}
