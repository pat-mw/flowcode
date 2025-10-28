/**
 * TanStack Query Hydration Utilities for Next.js App Router
 *
 * Provides SSR/SSG support with proper hydration for oRPC + TanStack Query:
 * - Server-side query prefetching
 * - Automatic state serialization/deserialization
 * - Hydration boundary for client components
 *
 * Usage in Server Components:
 *
 * @example
 * ```typescript
 * import { getQueryClient, HydrateClient } from '@/lib/query/hydration';
 * import { orpc } from '@/lib/orpc-client';
 *
 * export default async function Page() {
 *   const queryClient = getQueryClient();
 *
 *   // Prefetch data on server
 *   await queryClient.prefetchQuery(
 *     orpc.posts.list.queryOptions()
 *   );
 *
 *   return (
 *     <HydrateClient>
 *       <PostsList />
 *     </HydrateClient>
 *   );
 * }
 * ```
 *
 * Benefits:
 * - Instant page loads (data fetched during SSR)
 * - SEO-friendly (content rendered on server)
 * - Smooth client-side hydration
 * - Prevents duplicate requests on mount
 *
 * @see https://orpc.unnoq.com/docs/integrations/tanstack-query#server-side-rendering-ssr--hydration
 * @see https://tanstack.com/query/latest/docs/framework/react/guides/ssr
 */

import { cache } from 'react';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { createQueryClient } from '@/lib/query-client';

/**
 * Get or create a QueryClient for server components
 *
 * Uses React cache() to ensure a single QueryClient instance per request.
 * This is critical for SSR - each request should have its own isolated cache.
 *
 * Why cache()?
 * - Ensures one QueryClient per server request
 * - Prevents data leaking between requests
 * - Enables sharing query results across server components in same request
 *
 * @returns QueryClient instance (cached per request)
 */
export const getQueryClient = cache(createQueryClient);

/**
 * HydrateClient Component
 *
 * Wraps client components with TanStack Query hydration boundary.
 * Automatically serializes server-fetched data and rehydrates on client.
 *
 * How it works:
 * 1. Server: QueryClient prefetches data during SSR
 * 2. Server: dehydrate() serializes query cache to JSON
 * 3. Client: HydrationBoundary deserializes and populates cache
 * 4. Client: Components read from cache (no refetch needed)
 *
 * Must be used in Server Components that wrap Client Components.
 * The queryClient passed must be from getQueryClient() above.
 *
 * @param props.children - Client components that use TanStack Query
 * @param props.client - QueryClient instance (optional, auto-creates if not provided)
 *
 * @example Basic Usage
 * ```typescript
 * // app/page.tsx (Server Component)
 * export default async function Page() {
 *   const queryClient = getQueryClient();
 *   await queryClient.prefetchQuery(orpc.posts.list.queryOptions());
 *
 *   return (
 *     <HydrateClient>
 *       <ClientComponent />
 *     </HydrateClient>
 *   );
 * }
 * ```
 *
 * @example With Multiple Prefetches
 * ```typescript
 * export default async function DashboardPage() {
 *   const queryClient = getQueryClient();
 *
 *   // Prefetch multiple queries in parallel
 *   await Promise.all([
 *     queryClient.prefetchQuery(orpc.posts.list.queryOptions()),
 *     queryClient.prefetchQuery(orpc.auth.getSession.queryOptions()),
 *   ]);
 *
 *   return (
 *     <HydrateClient>
 *       <Dashboard />
 *     </HydrateClient>
 *   );
 * }
 * ```
 */
export function HydrateClient(props: {
  children: React.ReactNode;
  client?: QueryClient;
}) {
  const queryClient = props.client ?? getQueryClient();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {props.children}
    </HydrationBoundary>
  );
}
