import { Order, OrderStatus, PaymentStatus, OrderTimeline } from '@repo/shared';
import { v4 as uuidv4 } from 'uuid';

class OrderStore {
  private orders: Map<string, Order> = new Map();
  private userOrderIndex: Map<string, Set<string>> = new Map();

  constructor() {
    this.seedOrders();
  }

  private seedOrders() {
    const now = new Date().toISOString();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sampleOrder: Order = {
      id: 'order-1',
      userId: 'user-sample',
      orderNumber: 'ORD-2024-0001',
      status: OrderStatus.DELIVERED,
      paymentStatus: PaymentStatus.PAID,
      items: [
        {
          id: 'item-1',
          productId: 'prod-1',
          productName: 'Premium Wireless Headphones',
          productImage: '/products/headphones-1.jpg',
          quantity: 1,
          price: 299.99,
          total: 299.99,
        },
      ],
      subtotal: 299.99,
      tax: 24.0,
      shipping: 0,
      total: 323.99,
      shippingAddress: {
        id: 'addr-1',
        userId: 'user-sample',
        type: 'shipping',
        firstName: 'John',
        lastName: 'Doe',
        address1: '123 Main St',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'United States',
        isDefault: true,
        createdAt: now,
        updatedAt: now,
      },
      billingAddress: {
        id: 'addr-2',
        userId: 'user-sample',
        type: 'billing',
        firstName: 'John',
        lastName: 'Doe',
        address1: '123 Main St',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'United States',
        isDefault: true,
        createdAt: now,
        updatedAt: now,
      },
      timeline: [
        {
          status: OrderStatus.PENDING,
          timestamp: thirtyDaysAgo.toISOString(),
          note: 'Order placed',
        },
        {
          status: OrderStatus.PROCESSING,
          timestamp: new Date(thirtyDaysAgo.getTime() + 3600000).toISOString(),
          note: 'Payment confirmed',
        },
        {
          status: OrderStatus.SHIPPED,
          timestamp: new Date(thirtyDaysAgo.getTime() + 86400000).toISOString(),
          note: 'Shipped via FedEx - Tracking: 1Z999AA10123456784',
        },
        {
          status: OrderStatus.DELIVERED,
          timestamp: new Date(
            thirtyDaysAgo.getTime() + 259200000
          ).toISOString(),
          note: 'Delivered and signed',
        },
      ],
      createdAt: thirtyDaysAgo.toISOString(),
      updatedAt: now,
    };

    this.orders.set(sampleOrder.id, sampleOrder);
    const userOrders = new Set([sampleOrder.id]);
    this.userOrderIndex.set(sampleOrder.userId, userOrders);
  }

  async getUserOrders(
    userId: string,
    page = 1,
    limit = 10
  ): Promise<{ orders: Order[]; total: number }> {
    const orderIds = this.userOrderIndex.get(userId) || new Set();
    const allOrders = Array.from(orderIds)
      .map((id) => this.orders.get(id))
      .filter((order): order is Order => order !== undefined)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

    const total = allOrders.length;
    const start = (page - 1) * limit;
    const paginatedOrders = allOrders.slice(start, start + limit);

    return { orders: paginatedOrders, total };
  }

  async getOrderById(
    orderId: string,
    userId: string
  ): Promise<Order | undefined> {
    const order = this.orders.get(orderId);
    if (!order || order.userId !== userId) return undefined;
    return order;
  }

  async createOrder(orderData: Omit<Order, 'id'>): Promise<Order> {
    const id = uuidv4();
    const order: Order = {
      ...orderData,
      id,
    };

    this.orders.set(id, order);

    const userOrders = this.userOrderIndex.get(order.userId) || new Set();
    userOrders.add(id);
    this.userOrderIndex.set(order.userId, userOrders);

    return order;
  }

  async updateOrderStatus(
    orderId: string,
    userId: string,
    status: OrderStatus,
    note?: string
  ): Promise<Order | undefined> {
    const order = this.orders.get(orderId);
    if (!order || order.userId !== userId) return undefined;

    const timelineEntry: OrderTimeline = {
      status,
      timestamp: new Date().toISOString(),
      note,
    };

    const updatedOrder = {
      ...order,
      status,
      timeline: [...order.timeline, timelineEntry],
      updatedAt: new Date().toISOString(),
    };

    this.orders.set(orderId, updatedOrder);
    return updatedOrder;
  }
}

export const orderStore = new OrderStore();
