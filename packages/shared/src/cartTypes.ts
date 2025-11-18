import { z } from 'zod';

export const CartItemSchema = z.object({
  id: z.string(),
  productId: z.string(),
  productName: z.string(),
  productSlug: z.string(),
  productImage: z.string(),
  price: z.number(),
  quantity: z.number().int().min(1),
  stock: z.number().int().min(0),
  variantId: z.string().optional(),
  variantName: z.string().optional(),
});

export type CartItem = z.infer<typeof CartItemSchema>;

export const CartSchema = z.object({
  id: z.string(),
  userId: z.string().optional(),
  guestToken: z.string().optional(),
  items: z.array(CartItemSchema),
  subtotal: z.number(),
  tax: z.number(),
  total: z.number(),
  promoCode: z.string().optional(),
  discount: z.number().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Cart = z.infer<typeof CartSchema>;

export const AddToCartSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().min(1).default(1),
  variantId: z.string().optional(),
});

export type AddToCart = z.infer<typeof AddToCartSchema>;

export const UpdateCartItemSchema = z.object({
  quantity: z.number().int().min(1),
});

export type UpdateCartItem = z.infer<typeof UpdateCartItemSchema>;

export const ApplyPromoCodeSchema = z.object({
  promoCode: z.string().min(1),
});

export type ApplyPromoCode = z.infer<typeof ApplyPromoCodeSchema>;
