/**
 * oRPC Client
 * Type-safe API client exports
 * Used in components - will be enhanced in Phase 2 when implementing components
 */

'use client';

import { appRouter } from '@/lib/api';

if (!process.env.NEXT_PUBLIC_API_URL) {
  throw new Error('NEXT_PUBLIC_API_URL is required');
}

// Export the app router for type inference and direct use
export type AppRouter = typeof appRouter;
export { appRouter };

// Note: Full client implementation with TanStack Query will be added in Phase 2
// when we implement the actual components
