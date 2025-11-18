import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import * as accountController from '../controllers/account';

const router = Router();

router.use(authenticate);

router.get('/profile', asyncHandler(accountController.getProfile));
router.put('/profile', asyncHandler(accountController.updateProfile));

router.get('/addresses', asyncHandler(accountController.getAddresses));
router.post('/addresses', asyncHandler(accountController.createAddress));
router.put('/addresses/:id', asyncHandler(accountController.updateAddress));
router.delete('/addresses/:id', asyncHandler(accountController.deleteAddress));

router.get('/orders', asyncHandler(accountController.getOrders));
router.get('/orders/:id', asyncHandler(accountController.getOrderById));

router.get('/reviews', asyncHandler(accountController.getUserReviews));
router.put('/reviews/:id', asyncHandler(accountController.updateReview));
router.delete('/reviews/:id', asyncHandler(accountController.deleteReview));

router.post(
  '/security/change-password',
  asyncHandler(accountController.changePassword)
);
router.get('/security/logs', asyncHandler(accountController.getAuditLogs));

export default router;
