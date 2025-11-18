'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthApiClient } from '@/lib/useAuthApiClient';
import { Order, OrderStatus, PaymentStatus } from '@repo/shared';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface OrderDetailProps {
  orderId: string;
}

export default function OrderDetail({ orderId }: OrderDetailProps) {
  const apiClient = useAuthApiClient();
  const { toast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    try {
      const response = await apiClient.get<{ order: Order }>(
        `/account/orders/${orderId}`
      );
      setOrder(response.data!.order);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load order',
        variant: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = () => {
    toast({
      title: 'Invoice Download',
      description: 'PDF invoice generation coming soon!',
    });
  };

  const handleRequestSupport = () => {
    toast({
      title: 'Support Request',
      description: 'Support request feature coming soon!',
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.DELIVERED:
        return 'default';
      case OrderStatus.SHIPPED:
        return 'default';
      case OrderStatus.PROCESSING:
        return 'secondary';
      case OrderStatus.PENDING:
        return 'secondary';
      case OrderStatus.CANCELLED:
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getPaymentStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.PAID:
        return 'default';
      case PaymentStatus.PENDING:
        return 'secondary';
      case PaymentStatus.FAILED:
      case PaymentStatus.REFUNDED:
        return 'outline';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Order not found</p>
        <Link
          href="/account/orders"
          className="text-blue-600 hover:text-blue-800 mt-2 inline-block"
        >
          ← Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/account/orders"
            className="text-sm text-blue-600 hover:text-blue-800 mb-2 inline-block"
          >
            ← Back to Orders
          </Link>
          <h2 className="text-2xl font-bold text-gray-900">
            Order {order.orderNumber}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownloadInvoice}>
            Download Invoice
          </Button>
          <Button variant="outline" onClick={handleRequestSupport}>
            Request Support
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Order Status</h3>
            <div className="flex gap-2">
              <Badge variant={getStatusColor(order.status)}>
                {order.status}
              </Badge>
              <Badge variant={getPaymentStatusColor(order.paymentStatus)}>
                Payment: {order.paymentStatus}
              </Badge>
            </div>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-2">Shipping Address</h3>
            <div className="text-sm text-gray-600">
              <p className="font-medium text-gray-900">
                {order.shippingAddress.firstName}{' '}
                {order.shippingAddress.lastName}
              </p>
              <p>{order.shippingAddress.address1}</p>
              {order.shippingAddress.address2 && (
                <p>{order.shippingAddress.address2}</p>
              )}
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                {order.shippingAddress.postalCode}
              </p>
              <p>{order.shippingAddress.country}</p>
            </div>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-2">Billing Address</h3>
            <div className="text-sm text-gray-600">
              <p className="font-medium text-gray-900">
                {order.billingAddress.firstName} {order.billingAddress.lastName}
              </p>
              <p>{order.billingAddress.address1}</p>
              {order.billingAddress.address2 && (
                <p>{order.billingAddress.address2}</p>
              )}
              <p>
                {order.billingAddress.city}, {order.billingAddress.state}{' '}
                {order.billingAddress.postalCode}
              </p>
              <p>{order.billingAddress.country}</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-medium text-gray-900 mb-2">Order Timeline</h3>
          <div className="space-y-3">
            {order.timeline.map((event, index) => (
              <div key={index} className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {event.status}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(event.timestamp)}
                  </p>
                  {event.note && (
                    <p className="text-xs text-gray-600 mt-1">{event.note}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-medium text-gray-900 mb-4">Order Items</h3>
        <div className="border border-gray-200 rounded-lg divide-y">
          {order.items.map((item) => (
            <div key={item.id} className="p-4 flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-100 rounded flex-shrink-0">
                <img
                  src={item.productImage}
                  alt={item.productName}
                  className="w-full h-full object-cover rounded"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{item.productName}</p>
                <p className="text-sm text-gray-500">
                  Quantity: {item.quantity}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900">
                  ${item.total.toFixed(2)}
                </p>
                <p className="text-sm text-gray-500">
                  ${item.price.toFixed(2)} each
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t pt-4">
        <div className="max-w-md ml-auto space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="text-gray-900">${order.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tax</span>
            <span className="text-gray-900">${order.tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Shipping</span>
            <span className="text-gray-900">
              {order.shipping === 0 ? 'FREE' : `$${order.shipping.toFixed(2)}`}
            </span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t pt-2">
            <span>Total</span>
            <span>${order.total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
