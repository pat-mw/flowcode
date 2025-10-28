/**
 * oRPC Client with TanStack Query Integration
 * Type-safe API client with automatic query/mutation generation
 *
 * This module provides:
 * - Type-safe oRPC client using RPCLink for HTTP transport
 * - TanStack Query utilities (queryOptions, mutationOptions, etc.)
 * - Automatic query key generation and cache management
 * - Support for queries, mutations, infinite queries, and streaming
 *
 * Usage Examples:
 *
 * @example Queries
 * ```typescript
 * import { useQuery } from '@tanstack/react-query';
 * import { orpc } from '@/lib/orpc-client';
 *
 * function Component() {
 *   const { data, isLoading } = useQuery(
 *     orpc.posts.list.queryOptions()
 *   );
 * }
 * ```
 *
 * @example Mutations
 * ```typescript
 * import { useMutation } from '@tanstack/react-query';
 * import { orpc } from '@/lib/orpc-client';
 *
 * function Component() {
 *   const createPost = useMutation(
 *     orpc.posts.create.mutationOptions({
 *       onSuccess: () => {
 *         queryClient.invalidateQueries({ queryKey: orpc.posts.key() });
 *       }
 *     })
 *   );
 *   createPost.mutate({ title: 'New Post', content: {...} });
 * }
 * ```
 *
 * @example Direct Client Calls
 * ```typescript
 * const post = await orpc.posts.getById.call({ id: '123' });
 * ```
 *
 * @see https://orpc.unnoq.com/docs/integrations/tanstack-query
 */

'use client';

import { appRouter, type AppRouter } from '@/lib/api';
import { createORPCClient } from '@orpc/client';
import { RPCLink } from '@orpc/client/fetch';
import { createTanstackQueryUtils } from '@orpc/tanstack-query';
import type { RouterClient } from '@orpc/server';
import { getToken } from '@/lib/token-storage';

// Validate required environment variable
if (!process.env.NEXT_PUBLIC_API_URL) {
  throw new Error(
    'NEXT_PUBLIC_API_URL is required. Please set it in your .env file.\n' +
    'Example: NEXT_PUBLIC_API_URL=http://localhost:3000'
  );
}

/**
 * RPCLink Configuration
 *
 * Configures HTTP transport for oRPC client:
 * - URL: API endpoint from environment variable
 * - Credentials: Include cookies for authentication
 * - Headers: Content-Type and custom headers as needed
 *
 * The link automatically handles:
 * - Request serialization (JSON)
 * - Response deserialization
 * - Error handling
 * - HTTP method selection (GET for queries, POST for mutations)
 */
const link = new RPCLink({
  url: `${process.env.NEXT_PUBLIC_API_URL}/api/orpc`,

  // Include credentials (cookies) for authentication
  // Required for Better Auth session cookies
  fetch: (input, init) => {
    return fetch(input, {
      ...init,
      credentials: 'include',
    });
  },

  // Custom headers (optional)
  // Add any custom headers needed for your API
  headers: () => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add bearer token for authentication (if available)
    // This bypasses third-party cookie restrictions in cross-origin contexts
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  },
});

/**
 * Type-safe oRPC Client
 *
 * Created with AppRouter type inference for full type safety.
 * All procedures from the server are available with proper TypeScript types.
 *
 * The RouterClient type ensures that the client matches the server router
 * structure exactly, providing compile-time type checking for all API calls.
 */
const client: RouterClient<typeof appRouter> = createORPCClient(link);

/**
 * TanStack Query Utilities
 *
 * Provides helpers for using oRPC with TanStack Query:
 *
 * Methods:
 * - .queryOptions() - For useQuery, useSuspenseQuery, prefetchQuery
 * - .mutationOptions() - For useMutation
 * - .infiniteOptions() - For useInfiniteQuery (pagination)
 * - .streamedOptions() - For streaming queries (experimental)
 * - .liveOptions() - For live/real-time queries (experimental)
 * - .key() - Generate cache keys for invalidation
 * - .queryKey() - Full key for query options
 * - .mutationKey() - Full key for mutation options
 * - .call() - Direct procedure call (bypasses React Query)
 *
 * Cache Key Management:
 * - orpc.posts.key() - Matches all posts queries
 * - orpc.posts.key({ type: 'query' }) - Only regular queries (not infinite)
 * - orpc.posts.getById.key({ input: { id: '123' } }) - Specific query
 *
 * @example Invalidating Queries
 * ```typescript
 * // Invalidate all posts queries
 * queryClient.invalidateQueries({ queryKey: orpc.posts.key() });
 *
 * // Invalidate specific post query
 * queryClient.invalidateQueries({
 *   queryKey: orpc.posts.getById.key({ input: { id: '123' } })
 * });
 * ```
 */
export const orpc = createTanstackQueryUtils(client);

/**
 * Re-export AppRouter type for external use
 *
 * Useful for:
 * - Type inference in custom hooks
 * - Generic utility functions
 * - Testing utilities
 */
export type { AppRouter };
