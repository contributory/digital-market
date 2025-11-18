import { z } from 'zod';

export const CategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional(),
  parentId: z.string().nullable().optional(),
  imageUrl: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Category = z.infer<typeof CategorySchema>;

export const ProductVariantSchema = z.object({
  id: z.string(),
  name: z.string(),
  sku: z.string(),
  price: z.number(),
  stock: z.number(),
  attributes: z.record(z.string()).optional(),
});

export type ProductVariant = z.infer<typeof ProductVariantSchema>;

export const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  price: z.number(),
  compareAtPrice: z.number().optional(),
  categoryId: z.string(),
  category: CategorySchema.optional(),
  images: z.array(z.string()),
  stock: z.number(),
  sku: z.string(),
  rating: z.number().min(0).max(5),
  reviewCount: z.number(),
  variants: z.array(ProductVariantSchema).optional(),
  tags: z.array(z.string()).optional(),
  isFeatured: z.boolean().optional(),
  isTrending: z.boolean().optional(),
  shippingInfo: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Product = z.infer<typeof ProductSchema>;

export const ReviewSchema = z.object({
  id: z.string(),
  productId: z.string(),
  userId: z.string(),
  userName: z.string(),
  rating: z.number().min(1).max(5),
  title: z.string(),
  comment: z.string(),
  verified: z.boolean().optional(),
  helpful: z.number().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Review = z.infer<typeof ReviewSchema>;

export const CreateReviewSchema = z.object({
  productId: z.string(),
  rating: z.number().min(1).max(5),
  title: z.string().min(3).max(100),
  comment: z.string().min(10).max(1000),
});

export type CreateReview = z.infer<typeof CreateReviewSchema>;

export interface ProductFilters {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  tags?: string[];
  search?: string;
}

export interface ProductSort {
  field: 'price' | 'rating' | 'createdAt' | 'name';
  order: 'asc' | 'desc';
}

export interface RatingDistribution {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
}
