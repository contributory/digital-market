'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthApiClient } from '@/lib/useAuthApiClient';
import { Order, OrderStatus } from '@repo/shared';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function OrdersList() {
  const apiClient = useAuthApiClient();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const response = await apiClient.get<Order[]>('/account/orders');
      setOrders(response.data || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load orders',
        variant: 'danger',
      });
    } finally {
      setLoading(false);
    }
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg mb-2">No orders yet</p>
        <p className="text-sm">When you place orders, they will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div
          key={order.id}
          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-medium text-gray-900">
                  Order {order.orderNumber}
                </h3>
                <Badge variant={getStatusColor(order.status)}>
                  {order.status}
                </Badge>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Placed on {formatDate(order.createdAt)}
              </p>
            </div>
            <div className="mt-2 sm:mt-0 text-right">
              <p className="text-lg font-semibold text-gray-900">
                ${order.total.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500">
                {order.items.length} item{order.items.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            {order.items.slice(0, 2).map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-100 rounded flex-shrink-0">
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    className="w-full h-full object-cover rounded"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 truncate">
                    {item.productName}
                  </p>
                  <p className="text-xs text-gray-500">
                    Qty: {item.quantity} × ${item.price.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
            {order.items.length > 2 && (
              <p className="text-xs text-gray-500 pl-15">
                +{order.items.length - 2} more item
                {order.items.length - 2 !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <Link
              href={`/account/orders/${order.id}`}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              View Details
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
