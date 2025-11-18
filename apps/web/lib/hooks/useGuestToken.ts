'use client';

import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

const GUEST_TOKEN_KEY = 'guest-cart-token';

function getOrCreateToken(): string {
  if (typeof window === 'undefined') return '';

  let token = localStorage.getItem(GUEST_TOKEN_KEY);
  if (!token) {
    token = uuidv4();
    localStorage.setItem(GUEST_TOKEN_KEY, token);
  }
  return token;
}

export function useGuestToken() {
  const [guestToken] = useState<string>(getOrCreateToken);

  const clearGuestToken = useCallback(() => {
    localStorage.removeItem(GUEST_TOKEN_KEY);
  }, []);

  return { guestToken, clearGuestToken };
}
