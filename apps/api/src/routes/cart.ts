import { Router } from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  getCartCount,
  applyPromoCode,
  removePromoCode,
  mergeCart,
} from '../controllers/cartController';
import { optionalAuth } from '../middleware/auth';

const router = Router();

router.get('/', optionalAuth, getCart);
router.post('/', optionalAuth, addToCart);
router.put('/:itemId', optionalAuth, updateCartItem);
router.delete('/:itemId', optionalAuth, removeCartItem);
router.delete('/', optionalAuth, clearCart);
router.get('/count', optionalAuth, getCartCount);
router.post('/promo', optionalAuth, applyPromoCode);
router.delete('/promo', optionalAuth, removePromoCode);
router.post('/merge', optionalAuth, mergeCart);

export default router;
