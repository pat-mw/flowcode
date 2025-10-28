/**
 * Shared Webflow Providers Utility
 *
 * This module provides a centralized provider setup for all Webflow Code Components.
 * It ensures consistent QueryClient configuration and eliminates code duplication
 * across multiple Webflow wrapper files.
 *
 * Key Features:
 * - oRPC-compatible QueryClient with serialization support
 * - Shadow DOM isolation (singleton pattern works across components)
 * - Authentication session revalidation on mount
 * - Dark mode theme provider
 *
 * Usage in Webflow wrapper files:
 * ```typescript
 * import { WebflowProvidersWrapper } from '@/lib/webflow/providers';
 *
 * export default declareComponent((props) => (
 *   <WebflowProvidersWrapper>
 *     <YourComponent {...props} />
 *   </WebflowProvidersWrapper>
 * ), { ... });
 * ```
 */

'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useAuthRevalidation } from '@/hooks/useAuthRevalidation';
import { ThemeProvider } from '@/lib/providers/theme-provider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { createQueryClient } from '@/lib/query-client';

/**
 * Singleton QueryClient for Webflow Code Components
 *
 * This ensures a single QueryClient instance across all Webflow components
 * even in Shadow DOM environments. The configuration includes:
 *
 * - oRPC serializer support (for Date, BigInt, custom types)
 * - Optimized cache timing (1min stale, 10min gc)
 * - Disabled window focus refetching (better for Webflow context)
 * - Automatic retry on failure (1 attempt)
 *
 * Why singleton?
 * - Webflow components render in separate Shadow DOM roots
 * - Singleton pattern ensures shared cache across all components
 * - React Context doesn't cross Shadow DOM boundaries, but module-level
 *   singletons do!
 *
 * Note: This uses the same createQueryClient factory as Next.js pages,
 * ensuring consistent behavior across both contexts.
 */
export const webflowQueryClient = createQueryClient();

interface WebflowProvidersWrapperProps {
  children: ReactNode;
}

/**
 * WebflowProvidersWrapper
 *
 * Wraps Webflow Code Components with necessary providers and Webflow-specific styling.
 * Use this in all Webflow wrapper files to ensure consistent provider setup.
 *
 * Features:
 * - ThemeProvider with dark mode default (next-themes)
 * - QueryClient provider for React Query
 * - Auth session revalidation on mount (persists login across refreshes)
 * - Font inheritance wrapper (font-family: inherit) for Webflow site typography
 * - Works correctly in Shadow DOM environments
 *
 * Benefits:
 * - DRY principle: No code duplication across wrapper files
 * - Maintainability: Provider logic centralized in one place
 * - Consistency: All Webflow components use the same providers
 * - Future-proof: Easy to add more providers (oRPC client, etc.) here
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
  // Revalidate auth session on mount (ensures login persists across refreshes)
  useAuthRevalidation();

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      <QueryClientProvider client={webflowQueryClient}>
        <TooltipProvider delayDuration={200}>
          <div className="font-inherit">
            {children}
          </div>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
