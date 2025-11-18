'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthApiClient } from '@/lib/useAuthApiClient';
import { UserReview, ReviewModerationStatus } from '@repo/shared';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RatingStars } from '@/components/ui/rating-stars';
import { useToast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import ReviewEditModal from './ReviewEditModal';

export default function ReviewsList() {
  const apiClient = useAuthApiClient();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingReview, setEditingReview] = useState<UserReview | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      const response = await apiClient.get<{ reviews: UserReview[] }>(
        '/account/reviews'
      );
      setReviews(response.data!.reviews);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load reviews',
        variant: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (review: UserReview) => {
    setEditingReview(review);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      await apiClient.delete(`/account/reviews/${id}`);
      setReviews(reviews.filter((review) => review.id !== id));
      toast({
        title: 'Success',
        description: 'Review deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete review',
        variant: 'danger',
      });
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingReview(null);
    loadReviews();
  };

  const getModerationBadge = (status: ReviewModerationStatus) => {
    switch (status) {
      case ReviewModerationStatus.APPROVED:
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Approved
          </Badge>
        );
      case ReviewModerationStatus.PENDING:
        return <Badge variant="secondary">Pending Review</Badge>;
      case ReviewModerationStatus.REJECTED:
        return (
          <Badge variant="outline" className="border-red-300 text-red-800">
            Rejected
          </Badge>
        );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg mb-2">No reviews yet</p>
        <p className="text-sm">Purchase and review products to see them here</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="border border-gray-200 rounded-lg p-4"
          >
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 bg-gray-100 rounded flex-shrink-0">
                <img
                  src={review.productImage}
                  alt={review.productName}
                  className="w-full h-full object-cover rounded"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <Link
                      href={`/products/${review.productId}`}
                      className="font-medium text-gray-900 hover:text-blue-600"
                    >
                      {review.productName}
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <RatingStars rating={review.rating} size="sm" />
                      {getModerationBadge(review.moderationStatus)}
                      {review.verified && (
                        <Badge variant="outline" className="text-xs">
                          Verified Purchase
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(review)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(review.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
                <div className="mt-3">
                  <h4 className="font-medium text-gray-900">{review.title}</h4>
                  <p className="mt-1 text-sm text-gray-600">{review.comment}</p>
                </div>
                <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                  <span>Posted on {formatDate(review.createdAt)}</span>
                  {review.helpful > 0 && (
                    <span>{review.helpful} people found this helpful</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && editingReview && (
        <ReviewEditModal review={editingReview} onClose={handleModalClose} />
      )}
    </>
  );
}
