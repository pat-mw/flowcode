/**
 * Shared Webflow Providers Utility
 *
 * This module provides a centralized provider setup for all Webflow Code Components.
 * It ensures consistent QueryClient configuration and eliminates code duplication
 * across multiple Webflow wrapper files.
 */

'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

/**
 * Singleton QueryClient for Webflow Code Components
 *
 * This ensures a single QueryClient instance across all Webflow components
 * even in Shadow DOM environments. The configuration is optimized for
 * Webflow's rendering context.
 */
export const webflowQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
    },
  },
});

interface WebflowProvidersWrapperProps {
  children: ReactNode;
}

/**
 * WebflowProvidersWrapper
 *
 * Wraps Webflow Code Components with necessary providers (QueryClient, etc.)
 * Use this in all Webflow wrapper files to ensure consistent provider setup.
 *
 * Benefits:
 * - DRY principle: No code duplication across wrapper files
 * - Maintainability: Provider logic centralized in one place
 * - Consistency: All Webflow components use the same providers
 * - Future-proof: Easy to add more providers (oRPC client, auth, etc.) here
 *
 * @example
 * ```tsx
 * import { WebflowProvidersWrapper } from '@/lib/webflow/providers';
 *
 * function ComponentWrapper({ prop1, prop2 }: Props) {
 *   return (
 *     <WebflowProvidersWrapper>
 *       <Component prop1={prop1} prop2={prop2} />
 *     </WebflowProvidersWrapper>
 *   );
 * }
 * ```
 */
export function WebflowProvidersWrapper({ children }: WebflowProvidersWrapperProps) {
  return (
    <QueryClientProvider client={webflowQueryClient}>
      {children}
    </QueryClientProvider>
  );
}
