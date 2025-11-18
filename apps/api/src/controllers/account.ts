import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { userStore } from '../models/userStore';
import { addressStore } from '../models/addressStore';
import { orderStore } from '../models/orderStore';
import { productStore } from '../models/productStore';
import { auditStore } from '../models/auditStore';
import { AppError } from '../middleware/errorHandler';
import {
  UpdateProfileSchema,
  AddressSchema,
  UpdateReviewSchema,
  ChangePasswordSchema,
} from '@repo/shared';
import bcrypt from 'bcryptjs';

export const getProfile = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const profile = await userStore.getProfile(userId);

  if (!profile) {
    throw new AppError(404, 'Profile not found');
  }

  res.json({
    status: 'success',
    data: { profile },
  });
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const validatedData = UpdateProfileSchema.parse(req.body);

  const profile = await userStore.updateProfile(userId, validatedData);

  if (!profile) {
    throw new AppError(404, 'Profile not found');
  }

  await auditStore.createLog(
    userId,
    'profile_update',
    req.ip || 'unknown',
    req.get('user-agent') || 'unknown'
  );

  res.json({
    status: 'success',
    data: { profile },
    message: 'Profile updated successfully',
  });
};

export const getAddresses = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const addresses = await addressStore.getUserAddresses(userId);

  res.json({
    status: 'success',
    data: { addresses },
  });
};

export const createAddress = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const validatedData = AddressSchema.parse(req.body);

  const { id: _, ...addressData } = validatedData;
  const address = await addressStore.createAddress(userId, addressData);

  res.status(201).json({
    status: 'success',
    data: { address },
    message: 'Address created successfully',
  });
};

export const updateAddress = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const { id } = req.params;
  const validatedData = AddressSchema.parse(req.body);

  const { id: _, ...updates } = validatedData;
  const address = await addressStore.updateAddress(id, userId, updates);

  if (!address) {
    throw new AppError(404, 'Address not found');
  }

  res.json({
    status: 'success',
    data: { address },
    message: 'Address updated successfully',
  });
};

export const deleteAddress = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const { id } = req.params;

  const deleted = await addressStore.deleteAddress(id, userId);

  if (!deleted) {
    throw new AppError(404, 'Address not found');
  }

  res.json({
    status: 'success',
    message: 'Address deleted successfully',
  });
};

export const getOrders = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  const { orders, total } = await orderStore.getUserOrders(userId, page, limit);

  res.json({
    status: 'success',
    data: orders,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
};

export const getOrderById = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const { id } = req.params;

  const order = await orderStore.getOrderById(id, userId);

  if (!order) {
    throw new AppError(404, 'Order not found');
  }

  res.json({
    status: 'success',
    data: { order },
  });
};

export const getUserReviews = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const reviews = productStore.getUserReviews(userId);

  res.json({
    status: 'success',
    data: { reviews },
  });
};

export const updateReview = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const { id } = req.params;
  const validatedData = UpdateReviewSchema.parse(req.body);

  const review = productStore.updateReview(id, userId, validatedData);

  if (!review) {
    throw new AppError(404, 'Review not found');
  }

  res.json({
    status: 'success',
    data: { review },
    message: 'Review updated successfully',
  });
};

export const deleteReview = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const { id } = req.params;

  const deleted = productStore.deleteReview(id, userId);

  if (!deleted) {
    throw new AppError(404, 'Review not found');
  }

  res.json({
    status: 'success',
    message: 'Review deleted successfully',
  });
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const validatedData = ChangePasswordSchema.parse(req.body);

  const user = await userStore.findById(userId);
  if (!user) {
    throw new AppError(404, 'User not found');
  }

  const isValidPassword = await bcrypt.compare(
    validatedData.currentPassword,
    user.passwordHash
  );

  if (!isValidPassword) {
    throw new AppError(401, 'Current password is incorrect');
  }

  const newPasswordHash = await bcrypt.hash(validatedData.newPassword, 10);
  await userStore.updatePassword(userId, newPasswordHash);

  await auditStore.createLog(
    userId,
    'password_change',
    req.ip || 'unknown',
    req.get('user-agent') || 'unknown'
  );

  res.json({
    status: 'success',
    message: 'Password changed successfully',
  });
};

export const getAuditLogs = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const limit = parseInt(req.query.limit as string) || 20;

  const { logs, total } = await auditStore.getUserLogs(userId, limit);

  res.json({
    status: 'success',
    data: { logs, total },
  });
};
