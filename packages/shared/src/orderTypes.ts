import { z } from 'zod';
import { CartItemSchema } from './cartTypes';

export const ShippingAddressSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  addressLine1: z.string().min(1, 'Address line 1 is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
  phone: z.string().min(1, 'Phone number is required'),
});

export type ShippingAddress = z.infer<typeof ShippingAddressSchema>;

export const DeliveryOptionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  estimatedDays: z.number(),
});

export type DeliveryOption = z.infer<typeof DeliveryOptionSchema>;

export const OrderStatusSchema = z.enum([
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
]);

export type OrderStatus = z.infer<typeof OrderStatusSchema>;

export const OrderSchema = z.object({
  id: z.string(),
  userId: z.string().optional(),
  guestEmail: z.string().email().optional(),
  items: z.array(CartItemSchema),
  subtotal: z.number(),
  tax: z.number(),
  shipping: z.number(),
  discount: z.number().optional(),
  total: z.number(),
  promoCode: z.string().optional(),
  shippingAddress: ShippingAddressSchema,
  deliveryOption: DeliveryOptionSchema,
  status: OrderStatusSchema,
  stripeSessionId: z.string().optional(),
  stripePaymentIntentId: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Order = z.infer<typeof OrderSchema>;

export const CreateCheckoutSessionSchema = z.object({
  shippingAddress: ShippingAddressSchema,
  deliveryOptionId: z.string(),
  guestEmail: z.string().email().optional(),
});

export type CreateCheckoutSession = z.infer<typeof CreateCheckoutSessionSchema>;

export const CheckoutSessionResponseSchema = z.object({
  sessionId: z.string(),
  url: z.string(),
  orderId: z.string(),
});

export type CheckoutSessionResponse = z.infer<
  typeof CheckoutSessionResponseSchema
>;
