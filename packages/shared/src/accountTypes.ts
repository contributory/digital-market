import { z } from 'zod';

export const UpdateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number')
    .optional()
    .or(z.literal('')),
  marketingEmails: z.boolean().optional(),
  marketingSms: z.boolean().optional(),
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone?: string;
  marketingEmails: boolean;
  marketingSms: boolean;
  createdAt: string;
  updatedAt: string;
}

export const AddressSchema = z.object({
  id: z.string().optional(),
  type: z.enum(['shipping', 'billing']),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  address1: z.string().min(1, 'Address is required'),
  address2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State/Province is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
  isDefault: z.boolean().optional(),
});

export type AddressInput = z.infer<typeof AddressSchema>;

export interface Address {
  id: string;
  userId: string;
  type: 'shipping' | 'billing';
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  total: number;
}

export interface OrderTimeline {
  status: OrderStatus;
  timestamp: string;
  note?: string;
}

export interface Order {
  id: string;
  userId: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  shippingAddress: Address;
  billingAddress: Address;
  timeline: OrderTimeline[];
  createdAt: string;
  updatedAt: string;
}

export enum ReviewModerationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export interface UserReview {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  moderationStatus: ReviewModerationStatus;
  verified: boolean;
  helpful: number;
  createdAt: string;
  updatedAt: string;
}

export const UpdateReviewSchema = z.object({
  rating: z.number().min(1).max(5),
  title: z.string().min(3).max(100),
  comment: z.string().min(10).max(1000),
});

export type UpdateReviewInput = z.infer<typeof UpdateReviewSchema>;

export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain uppercase, lowercase, and number'
      ),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
}
