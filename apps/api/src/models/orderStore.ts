import { Order, DeliveryOption, ShippingAddress } from '@repo/shared';
import { v4 as uuidv4 } from 'uuid';
import { cartStore } from './cartStore';

class OrderStore {
  private orders: Map<string, Order> = new Map();

  private deliveryOptions: DeliveryOption[] = [
    {
      id: 'standard',
      name: 'Standard Shipping',
      description: 'Delivery in 5-7 business days',
      price: 5.99,
      estimatedDays: 7,
    },
    {
      id: 'express',
      name: 'Express Shipping',
      description: 'Delivery in 2-3 business days',
      price: 12.99,
      estimatedDays: 3,
    },
    {
      id: 'overnight',
      name: 'Overnight Shipping',
      description: 'Delivery next business day',
      price: 24.99,
      estimatedDays: 1,
    },
  ];

  getDeliveryOptions(): DeliveryOption[] {
    return this.deliveryOptions;
  }

  getDeliveryOption(id: string): DeliveryOption | undefined {
    return this.deliveryOptions.find((option) => option.id === id);
  }

  createOrder(
    shippingAddress: ShippingAddress,
    deliveryOptionId: string,
    userId?: string,
    guestToken?: string,
    guestEmail?: string
  ): Order | null {
    const cart = cartStore.getCart(userId, guestToken);
    if (!cart || cart.items.length === 0) {
      return null;
    }

    const deliveryOption = this.getDeliveryOption(deliveryOptionId);
    if (!deliveryOption) {
      return null;
    }

    const now = new Date().toISOString();
    const order: Order = {
      id: uuidv4(),
      userId,
      guestEmail: guestEmail || undefined,
      items: [...cart.items],
      subtotal: cart.subtotal,
      tax: cart.tax,
      shipping: deliveryOption.price,
      discount: cart.discount,
      total: cart.total + deliveryOption.price - (cart.discount || 0),
      promoCode: cart.promoCode,
      shippingAddress,
      deliveryOption,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };

    this.orders.set(order.id, order);
    return order;
  }

  getOrderById(id: string): Order | undefined {
    return this.orders.get(id);
  }

  getOrdersByUser(userId: string): Order[] {
    return Array.from(this.orders.values()).filter(
      (order) => order.userId === userId
    );
  }

  updateOrderStatus(id: string, status: Order['status']): Order | undefined {
    const order = this.orders.get(id);
    if (!order) {
      return undefined;
    }

    order.status = status;
    order.updatedAt = new Date().toISOString();
    return order;
  }

  updateOrderStripeSession(
    id: string,
    stripeSessionId: string
  ): Order | undefined {
    const order = this.orders.get(id);
    if (!order) {
      return undefined;
    }

    order.stripeSessionId = stripeSessionId;
    order.updatedAt = new Date().toISOString();
    return order;
  }

  updateOrderPaymentIntent(
    id: string,
    stripePaymentIntentId: string
  ): Order | undefined {
    const order = this.orders.get(id);
    if (!order) {
      return undefined;
    }

    order.stripePaymentIntentId = stripePaymentIntentId;
    order.updatedAt = new Date().toISOString();
    return order;
  }

  getOrderByStripeSession(sessionId: string): Order | undefined {
    return Array.from(this.orders.values()).find(
      (order) => order.stripeSessionId === sessionId
    );
  }
}

export const orderStore = new OrderStore();
