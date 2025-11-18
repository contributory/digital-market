import { Request, Response } from 'express';
import { productStore } from '../models/productStore';
import { CreateReviewSchema } from '@repo/shared';
import { AuthRequest } from '../middleware/auth';

export const getProducts = (req: Request, res: Response) => {
  const {
    categoryId,
    minPrice,
    maxPrice,
    minRating,
    tags,
    search,
    sortField = 'createdAt',
    sortOrder = 'desc',
    page = '1',
    limit = '12',
  } = req.query;

  const filters = {
    categoryId: categoryId as string | undefined,
    minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
    maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
    minRating: minRating ? parseFloat(minRating as string) : undefined,
    tags: tags ? (tags as string).split(',') : undefined,
    search: search as string | undefined,
  };

  const sort = {
    field: sortField as 'price' | 'rating' | 'createdAt' | 'name',
    order: sortOrder as 'asc' | 'desc',
  };

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);

  const { products, total } = productStore.getAllProducts(
    filters,
    sort,
    pageNum,
    limitNum
  );

  res.json({
    status: 'success',
    data: products,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  });
};

export const getProductById = (req: Request, res: Response) => {
  const { id } = req.params;
  const product = productStore.getProductById(id);

  if (!product) {
    return res.status(404).json({
      status: 'error',
      message: 'Product not found',
    });
  }

  res.json({
    status: 'success',
    data: product,
  });
};

export const getProductBySlug = (req: Request, res: Response) => {
  const { slug } = req.params;
  const product = productStore.getProductBySlug(slug);

  if (!product) {
    return res.status(404).json({
      status: 'error',
      message: 'Product not found',
    });
  }

  res.json({
    status: 'success',
    data: product,
  });
};

export const getFeaturedProducts = (_req: Request, res: Response) => {
  const products = productStore.getFeaturedProducts();
  res.json({
    status: 'success',
    data: products,
  });
};

export const getTrendingProducts = (_req: Request, res: Response) => {
  const products = productStore.getTrendingProducts();
  res.json({
    status: 'success',
    data: products,
  });
};

export const getRelatedProducts = (req: Request, res: Response) => {
  const { id } = req.params;
  const products = productStore.getRelatedProducts(id);
  res.json({
    status: 'success',
    data: products,
  });
};

export const getProductReviews = (req: Request, res: Response) => {
  const { id } = req.params;
  const { page = '1', limit = '10' } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);

  const { reviews, total } = productStore.getProductReviews(
    id,
    pageNum,
    limitNum
  );

  res.json({
    status: 'success',
    data: reviews,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  });
};

export const getRatingDistribution = (req: Request, res: Response) => {
  const { id } = req.params;
  const distribution = productStore.getRatingDistribution(id);

  res.json({
    status: 'success',
    data: distribution,
  });
};

export const createReview = (req: AuthRequest, res: Response) => {
  try {
    const validatedData = CreateReviewSchema.parse(req.body);
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });
    }

    const product = productStore.getProductById(validatedData.productId);
    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found',
      });
    }

    const review = productStore.createReview(
      validatedData.productId,
      user.id,
      user.name || user.email,
      validatedData.rating,
      validatedData.title,
      validatedData.comment
    );

    res.status(201).json({
      status: 'success',
      data: review,
    });
  } catch (error) {
    const err = error as Error & { errors?: unknown };
    res.status(400).json({
      status: 'error',
      message: err.message || 'Invalid review data',
      errors: err.errors,
    });
  }
};
