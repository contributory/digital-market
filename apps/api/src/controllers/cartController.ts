import { Request, Response } from 'express';
import { cartStore } from '../models/cartStore';
import {
  AddToCartSchema,
  UpdateCartItemSchema,
  ApplyPromoCodeSchema,
} from '@repo/shared';

export const getCart = (req: Request, res: Response) => {
  const userId = req.user?.id;
  const guestToken = req.headers['x-guest-token'] as string | undefined;

  const cart = cartStore.getCart(userId, guestToken);

  if (!cart) {
    const emptyCart = cartStore.getOrCreateCart(userId, guestToken);
    return res.json({ status: 'success', data: emptyCart });
  }

  res.json({ status: 'success', data: cart });
};

export const addToCart = (req: Request, res: Response) => {
  const result = AddToCartSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid request data',
      errors: result.error.errors,
    });
  }

  const { productId, quantity, variantId } = result.data;
  const userId = req.user?.id;
  const guestToken = req.headers['x-guest-token'] as string | undefined;

  const cart = cartStore.addItem(
    productId,
    quantity,
    variantId,
    userId,
    guestToken
  );

  if (!cart) {
    return res.status(400).json({
      status: 'error',
      message: 'Product not found or insufficient stock',
    });
  }

  res.json({ status: 'success', data: cart });
};

export const updateCartItem = (req: Request, res: Response) => {
  const { itemId } = req.params;
  const result = UpdateCartItemSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid request data',
      errors: result.error.errors,
    });
  }

  const { quantity } = result.data;
  const userId = req.user?.id;
  const guestToken = req.headers['x-guest-token'] as string | undefined;

  const cart = cartStore.updateItemQuantity(
    itemId,
    quantity,
    userId,
    guestToken
  );

  if (!cart) {
    return res.status(400).json({
      status: 'error',
      message: 'Cart item not found or insufficient stock',
    });
  }

  res.json({ status: 'success', data: cart });
};

export const removeCartItem = (req: Request, res: Response) => {
  const { itemId } = req.params;
  const userId = req.user?.id;
  const guestToken = req.headers['x-guest-token'] as string | undefined;

  const cart = cartStore.removeItem(itemId, userId, guestToken);

  if (!cart) {
    return res.status(404).json({
      status: 'error',
      message: 'Cart not found',
    });
  }

  res.json({ status: 'success', data: cart });
};

export const clearCart = (req: Request, res: Response) => {
  const userId = req.user?.id;
  const guestToken = req.headers['x-guest-token'] as string | undefined;

  cartStore.clearCart(userId, guestToken);

  res.json({ status: 'success', message: 'Cart cleared' });
};

export const getCartCount = (req: Request, res: Response) => {
  const userId = req.user?.id;
  const guestToken = req.headers['x-guest-token'] as string | undefined;

  const count = cartStore.getCartItemCount(userId, guestToken);

  res.json({ status: 'success', data: { count } });
};

export const applyPromoCode = (req: Request, res: Response) => {
  const result = ApplyPromoCodeSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid request data',
      errors: result.error.errors,
    });
  }

  const { promoCode } = result.data;
  const userId = req.user?.id;
  const guestToken = req.headers['x-guest-token'] as string | undefined;

  const cart = cartStore.applyPromoCode(promoCode, userId, guestToken);

  if (!cart) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid promo code or cart not found',
    });
  }

  res.json({ status: 'success', data: cart });
};

export const removePromoCode = (req: Request, res: Response) => {
  const userId = req.user?.id;
  const guestToken = req.headers['x-guest-token'] as string | undefined;

  const cart = cartStore.removePromoCode(userId, guestToken);

  if (!cart) {
    return res.status(404).json({
      status: 'error',
      message: 'Cart not found',
    });
  }

  res.json({ status: 'success', data: cart });
};

export const mergeCart = (req: Request, res: Response) => {
  const userId = req.user?.id;
  const guestToken = req.headers['x-guest-token'] as string | undefined;

  if (!userId || !guestToken) {
    return res.status(400).json({
      status: 'error',
      message: 'User ID and guest token required',
    });
  }

  const cart = cartStore.mergeGuestCartToUser(guestToken, userId);

  res.json({ status: 'success', data: cart });
};
