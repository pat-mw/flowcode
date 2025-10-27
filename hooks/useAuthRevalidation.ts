/**
 * Auth Session Revalidation Hook
 * Revalidates the persisted auth session with Better Auth on component mount
 * Use this in WebflowProvidersWrapper to ensure auth works across Shadow DOM
 */

'use client';

import { useEffect } from 'react';
import { useAuthStore, revalidateAuthSession } from '@/lib/stores/authStore';

export function useAuthRevalidation() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    // Only revalidate if we have stored auth
    if (isAuthenticated) {
      revalidateAuthSession();
    }
  }, []); // Run once on mount

  // Return the auth state for convenience
  return { isAuthenticated };
}
