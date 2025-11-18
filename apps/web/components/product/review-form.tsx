'use client';

import { useState } from 'react';
import { CreateReview } from '@repo/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RatingStars } from '@/components/ui/rating-stars';
import { useToast } from '@/components/ui/use-toast';

interface ReviewFormProps {
  productId: string;
  onSubmitSuccess?: () => void;
}

export function ReviewForm({ productId, onSubmitSuccess }: ReviewFormProps) {
  const { toast } = useToast();
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (title.length < 3) {
      toast({
        title: 'Error',
        description: 'Title must be at least 3 characters long',
        variant: 'destructive',
      });
      return;
    }

    if (comment.length < 10) {
      toast({
        title: 'Error',
        description: 'Comment must be at least 10 characters long',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const reviewData: CreateReview = {
        productId,
        rating,
        title,
        comment,
      };

      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit review');
      }

      toast({
        title: 'Success',
        description: 'Your review has been submitted!',
      });

      setRating(5);
      setTitle('');
      setComment('');

      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to submit review',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Your Rating</label>
        <RatingStars
          rating={rating}
          size="lg"
          readonly={false}
          onChange={(newRating) => setRating(newRating)}
        />
      </div>

      <div>
        <label
          htmlFor="review-title"
          className="block text-sm font-medium mb-2"
        >
          Review Title
        </label>
        <Input
          id="review-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Sum up your experience"
          maxLength={100}
          required
        />
        <p className="text-xs text-muted-foreground mt-1">
          {title.length}/100 characters
        </p>
      </div>

      <div>
        <label
          htmlFor="review-comment"
          className="block text-sm font-medium mb-2"
        >
          Your Review
        </label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your thoughts about this product"
          className="w-full min-h-[120px] px-3 py-2 rounded-md border bg-background"
          maxLength={1000}
          required
        />
        <p className="text-xs text-muted-foreground mt-1">
          {comment.length}/1000 characters
        </p>
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit Review'}
      </Button>
    </form>
  );
}
