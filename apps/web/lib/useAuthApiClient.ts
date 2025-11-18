'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { apiClient } from './apiClient';

export function useAuthApiClient() {
  const { data: session } = useSession();

  useEffect(() => {
    apiClient.setTokenProvider(async () => {
      if (session?.accessToken) {
        return session.accessToken as string;
      }
      return null;
    });
  }, [session]);

  return apiClient;
}
