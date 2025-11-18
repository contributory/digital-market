'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { Cart, AddToCart, UpdateCartItem, ApplyPromoCode } from '@repo/shared';
import { useGuestToken } from './useGuestToken';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function fetchCart(token?: string, guestToken?: string): Promise<Cart> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (guestToken) {
    headers['X-Guest-Token'] = guestToken;
  }

  const response = await fetch(`${API_URL}/cart`, { headers });

  if (!response.ok) {
    throw new Error('Failed to fetch cart');
  }

  const data = await response.json();
  return data.data;
}

async function addToCart(
  data: AddToCart,
  token?: string,
  guestToken?: string
): Promise<Cart> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (guestToken) {
    headers['X-Guest-Token'] = guestToken;
  }

  const response = await fetch(`${API_URL}/cart`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to add to cart');
  }

  const result = await response.json();
  return result.data;
}

async function updateCartItem(
  itemId: string,
  data: UpdateCartItem,
  token?: string,
  guestToken?: string
): Promise<Cart> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (guestToken) {
    headers['X-Guest-Token'] = guestToken;
  }

  const response = await fetch(`${API_URL}/cart/${itemId}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update cart item');
  }

  const result = await response.json();
  return result.data;
}

async function removeCartItem(
  itemId: string,
  token?: string,
  guestToken?: string
): Promise<Cart> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (guestToken) {
    headers['X-Guest-Token'] = guestToken;
  }

  const response = await fetch(`${API_URL}/cart/${itemId}`, {
    method: 'DELETE',
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to remove cart item');
  }

  const result = await response.json();
  return result.data;
}

async function clearCart(token?: string, guestToken?: string): Promise<void> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (guestToken) {
    headers['X-Guest-Token'] = guestToken;
  }

  const response = await fetch(`${API_URL}/cart`, {
    method: 'DELETE',
    headers,
  });

  if (!response.ok) {
    throw new Error('Failed to clear cart');
  }
}

async function applyPromoCode(
  data: ApplyPromoCode,
  token?: string,
  guestToken?: string
): Promise<Cart> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (guestToken) {
    headers['X-Guest-Token'] = guestToken;
  }

  const response = await fetch(`${API_URL}/cart/promo`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Invalid promo code');
  }

  const result = await response.json();
  return result.data;
}

async function removePromoCode(
  token?: string,
  guestToken?: string
): Promise<Cart> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (guestToken) {
    headers['X-Guest-Token'] = guestToken;
  }

  const response = await fetch(`${API_URL}/cart/promo`, {
    method: 'DELETE',
    headers,
  });

  if (!response.ok) {
    throw new Error('Failed to remove promo code');
  }

  const result = await response.json();
  return result.data;
}

export function useCart() {
  const { data: session } = useSession();
  const { guestToken } = useGuestToken();
  const queryClient = useQueryClient();
  const token = session?.accessToken;

  const cartQuery = useQuery({
    queryKey: ['cart', token, guestToken],
    queryFn: () => fetchCart(token, guestToken),
    staleTime: 0,
  });

  const addMutation = useMutation({
    mutationFn: (data: AddToCart) => addToCart(data, token, guestToken),
    onSuccess: (cart) => {
      queryClient.setQueryData(['cart', token, guestToken], cart);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ itemId, data }: { itemId: string; data: UpdateCartItem }) =>
      updateCartItem(itemId, data, token, guestToken),
    onSuccess: (cart) => {
      queryClient.setQueryData(['cart', token, guestToken], cart);
    },
  });

  const removeMutation = useMutation({
    mutationFn: (itemId: string) => removeCartItem(itemId, token, guestToken),
    onSuccess: (cart) => {
      queryClient.setQueryData(['cart', token, guestToken], cart);
    },
  });

  const clearMutation = useMutation({
    mutationFn: () => clearCart(token, guestToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const applyPromoMutation = useMutation({
    mutationFn: (data: ApplyPromoCode) =>
      applyPromoCode(data, token, guestToken),
    onSuccess: (cart) => {
      queryClient.setQueryData(['cart', token, guestToken], cart);
    },
  });

  const removePromoMutation = useMutation({
    mutationFn: () => removePromoCode(token, guestToken),
    onSuccess: (cart) => {
      queryClient.setQueryData(['cart', token, guestToken], cart);
    },
  });

  return {
    cart: cartQuery.data,
    isLoading: cartQuery.isLoading,
    error: cartQuery.error,
    addToCart: addMutation.mutate,
    updateCartItem: updateMutation.mutate,
    removeCartItem: removeMutation.mutate,
    clearCart: clearMutation.mutate,
    applyPromoCode: applyPromoMutation.mutate,
    removePromoCode: removePromoMutation.mutate,
    isAddingToCart: addMutation.isPending,
    isUpdating: updateMutation.isPending,
    isRemoving: removeMutation.isPending,
  };
}

export function useCartCount() {
  const { cart } = useCart();
  return cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;
}
