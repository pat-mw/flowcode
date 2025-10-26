/**
 * TanStack Query Client
 * Singleton instance for React Query configuration
 * Used across all components for API state management
 */

'use client';

import { QueryClient } from '@tanstack/react-query';

// Create a singleton query client
let queryClient: QueryClient | undefined;

export function getQueryClient() {
  if (!queryClient) {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60 * 1000, // 60 seconds
          gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
          refetchOnWindowFocus: false,
          retry: 1,
        },
        mutations: {
          retry: 1,
        },
      },
    });
  }
  return queryClient;
}
