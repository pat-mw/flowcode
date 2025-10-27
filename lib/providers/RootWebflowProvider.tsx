'use client';

import * as React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { ThemeProvider } from './theme-provider';

/**
 * RootWebflowProvider
 *
 * Provides all necessary providers for Webflow Code Components:
 * - ThemeProvider (next-themes) with dark mode default
 * - QueryClientProvider (TanStack Query)
 *
 * Usage in Webflow wrapper components:
 * ```tsx
 * import { RootWebflowProvider } from '@/lib/providers/RootWebflowProvider';
 *
 * export default declareComponent((props) => (
 *   <RootWebflowProvider>
 *     <YourComponent {...props} />
 *   </RootWebflowProvider>
 * ), { ... });
 * ```
 */
export function RootWebflowProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = getQueryClient();

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </ThemeProvider>
  );
}
