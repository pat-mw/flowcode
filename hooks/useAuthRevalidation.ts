/**
 * Auth Session Revalidation Hook
 * Revalidates the persisted auth session with Better Auth on component mount
 * Use this in WebflowProvidersWrapper to ensure auth works across Shadow DOM
 */

'use client';

import { useEffect, useState } from 'react';
import { useAuthStore, revalidateAuthSession } from '@/lib/stores/authStore';

export function useAuthRevalidation() {
  const [hasHydrated, setHasHydrated] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    // Mark as hydrated after first render (Zustand persist will have loaded)
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    // Only revalidate after Zustand has hydrated and if we have stored auth
    if (hasHydrated && isAuthenticated) {
      // Small delay to ensure Better Auth cookies are readable
      const timer = setTimeout(() => {
        revalidateAuthSession();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [hasHydrated, isAuthenticated]);

  // Return the auth state for convenience
  return { isAuthenticated };
}
