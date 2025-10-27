/**
 * TanStack Query Client Factory
 * Creates QueryClient instances with oRPC serialization support
 *
 * Features:
 * - SSR-compatible query key hashing with RPC JSON Serializer
 * - Automatic serialization/deserialization for hydration
 * - Optimized caching and retry strategies
 * - Support for all oRPC types (Date, BigInt, custom types)
 *
 * @see https://orpc.unnoq.com/docs/integrations/tanstack-query
 */

'use client';

import { defaultShouldDehydrateQuery, QueryClient } from '@tanstack/react-query';
import { serializer } from './serializer';

/**
 * Create a new QueryClient instance with oRPC serialization support
 *
 * This factory is used by both:
 * - Next.js App Router (via getQueryClient with cache())
 * - Webflow components (direct instantiation for Shadow DOM isolation)
 *
 * Configuration includes:
 * - queryKeyHashFn: Serializes query keys for proper SSR hydration
 * - dehydrate: Serializes query data for server-side rendering
 * - hydrate: Deserializes query data on client-side
 * - Optimized cache timing (1min stale, 10min gc)
 */
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Query key hashing with oRPC serializer
        // Ensures query keys are properly serialized for SSR
        queryKeyHashFn(queryKey) {
          const [json, meta] = serializer.serialize(queryKey);
          return JSON.stringify({ json, meta });
        },
        staleTime: 60 * 1000, // 1 minute
        gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
        refetchOnWindowFocus: false,
        retry: 1,
      },
      mutations: {
        retry: 1,
      },
      dehydrate: {
        // Include pending queries in SSR hydration
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) || query.state.status === 'pending',
        // Serialize data for SSR
        serializeData(data) {
          const [json, meta] = serializer.serialize(data);
          return { json, meta };
        },
      },
      hydrate: {
        // Deserialize data on client
        deserializeData(data: { json: unknown; meta: unknown }) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return serializer.deserialize(data.json, data.meta as any);
        },
      },
    },
  });
}

/**
 * Singleton QueryClient for Next.js App Router
 *
 * NOTE: For Server Components, use the cached version from lib/query/hydration.ts
 * which wraps this in React cache() for proper SSR behavior.
 *
 * For Client Components, this singleton ensures a single instance per app lifecycle.
 */
let browserQueryClient: QueryClient | undefined;

export function getQueryClient() {
  // Server-side: Always create a new client
  if (typeof window === 'undefined') {
    return createQueryClient();
  }

  // Client-side: Use singleton pattern
  if (!browserQueryClient) {
    browserQueryClient = createQueryClient();
  }
  return browserQueryClient;
}
