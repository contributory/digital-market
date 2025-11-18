'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import {
  DeliveryOption,
  CreateCheckoutSession,
  CheckoutSessionResponse,
  Order,
} from '@repo/shared';
import { useGuestToken } from './useGuestToken';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function fetchDeliveryOptions(): Promise<DeliveryOption[]> {
  const response = await fetch(`${API_URL}/checkout/delivery-options`);

  if (!response.ok) {
    throw new Error('Failed to fetch delivery options');
  }

  const data = await response.json();
  return data.data;
}

async function createCheckoutSession(
  data: CreateCheckoutSession,
  token?: string,
  guestToken?: string
): Promise<CheckoutSessionResponse> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (guestToken) {
    headers['X-Guest-Token'] = guestToken;
  }

  const response = await fetch(`${API_URL}/checkout/create-session`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create checkout session');
  }

  const result = await response.json();
  return result.data;
}

async function fetchOrderBySession(sessionId: string): Promise<Order> {
  const response = await fetch(`${API_URL}/checkout/session/${sessionId}`);

  if (!response.ok) {
    throw new Error('Failed to fetch order');
  }

  const data = await response.json();
  return data.data;
}

async function fetchOrder(orderId: string, token?: string): Promise<Order> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}/checkout/orders/${orderId}`, {
    headers,
  });

  if (!response.ok) {
    throw new Error('Failed to fetch order');
  }

  const data = await response.json();
  return data.data;
}

export function useDeliveryOptions() {
  return useQuery({
    queryKey: ['delivery-options'],
    queryFn: fetchDeliveryOptions,
  });
}

export function useCheckout() {
  const { data: session } = useSession();
  const { guestToken } = useGuestToken();
  const token = session?.accessToken;

  const createSessionMutation = useMutation({
    mutationFn: (data: CreateCheckoutSession) =>
      createCheckoutSession(data, token, guestToken),
  });

  return {
    createCheckoutSession: createSessionMutation.mutate,
    isCreating: createSessionMutation.isPending,
    error: createSessionMutation.error,
    data: createSessionMutation.data,
  };
}

export function useOrderBySession(sessionId?: string) {
  return useQuery({
    queryKey: ['order', 'session', sessionId],
    queryFn: () => fetchOrderBySession(sessionId!),
    enabled: !!sessionId,
  });
}

export function useOrder(orderId?: string) {
  const { data: session } = useSession();
  const token = session?.accessToken;

  return useQuery({
    queryKey: ['order', orderId],
    queryFn: () => fetchOrder(orderId!, token),
    enabled: !!orderId,
  });
}
