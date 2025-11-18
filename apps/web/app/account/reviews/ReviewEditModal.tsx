'use client';

import { useState } from 'react';
import { useAuthApiClient } from '@/lib/useAuthApiClient';
import { UserReview, UpdateReviewInput } from '@repo/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
} from '@/components/ui/modal';
import { RatingStars } from '@/components/ui/rating-stars';
import { useToast } from '@/components/ui/use-toast';

interface ReviewEditModalProps {
  review: UserReview;
  onClose: () => void;
}

export default function ReviewEditModal({
  review,
  onClose,
}: ReviewEditModalProps) {
  const apiClient = useAuthApiClient();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<UpdateReviewInput>({
    rating: review.rating,
    title: review.title,
    comment: review.comment,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});

    try {
      await apiClient.put(`/account/reviews/${review.id}`, formData);
      toast({
        title: 'Success',
        description: 'Review updated successfully',
      });
      onClose();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to update review';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'danger',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={true} onOpenChange={(open) => !open && onClose()}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Edit Review</ModalTitle>
        </ModalHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              {review.productName}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormData({ ...formData, rating: star })}
                  className="text-2xl focus:outline-none"
                >
                  {star <= formData.rating ? '⭐' : '☆'}
                </button>
              ))}
            </div>
            {errors.rating && (
              <p className="mt-1 text-sm text-red-600">{errors.rating}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Review Title
            </label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Sum up your review in one line"
              required
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="comment"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Review
            </label>
            <textarea
              id="comment"
              value={formData.comment}
              onChange={(e) =>
                setFormData({ ...formData, comment: e.target.value })
              }
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="What did you like or dislike? What did you use this product for?"
              required
            />
            {errors.comment && (
              <p className="mt-1 text-sm text-red-600">{errors.comment}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Minimum 10 characters, maximum 1000 characters
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Update Review'}
            </Button>
          </div>
        </form>
      </ModalContent>
    </Modal>
  );
}
