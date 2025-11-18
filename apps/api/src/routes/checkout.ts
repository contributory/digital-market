import { Router } from 'express';
import {
  getDeliveryOptions,
  createCheckoutSession,
  handleWebhook,
  getOrderById,
  getOrderBySession,
  getUserOrders,
} from '../controllers/checkoutController';
import { optionalAuth, requireAuth } from '../middleware/auth';
import express from 'express';

const router = Router();

router.get('/delivery-options', getDeliveryOptions);
router.post('/create-session', optionalAuth, createCheckoutSession);
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  handleWebhook
);
router.get('/orders/:orderId', optionalAuth, getOrderById);
router.get('/session/:sessionId', getOrderBySession);
router.get('/orders', requireAuth, getUserOrders);

export default router;
