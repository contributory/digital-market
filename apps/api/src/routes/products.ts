import { Router } from 'express';
import {
  getProducts,
  getProductById,
  getProductBySlug,
  getFeaturedProducts,
  getTrendingProducts,
  getRelatedProducts,
  getProductReviews,
  getRatingDistribution,
  createReview,
} from '../controllers/productController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/trending', getTrendingProducts);
router.get('/id/:id', getProductById);
router.get('/slug/:slug', getProductBySlug);
router.get('/:id/related', getRelatedProducts);
router.get('/:id/reviews', getProductReviews);
router.get('/:id/reviews/distribution', getRatingDistribution);
router.post('/reviews', authenticate, createReview);

export default router;
