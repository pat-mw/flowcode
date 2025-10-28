'use client';

import { useEffect, useState } from 'react';
import { useAuthStore, revalidateAuthSession } from '@/lib/stores/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuthStore();
  const [isHydrated, setIsHydrated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Wait for Zustand persist to hydrate from localStorage
    const unsubscribe = useAuthStore.persist.onFinishHydration(() => {
      setIsHydrated(true);
    });

    // Fallback: If already hydrated (sync storage), mark as ready
    if (useAuthStore.persist.hasHydrated()) {
      setIsHydrated(true);
    }

    return unsubscribe;
  }, []);

  useEffect(() => {
    // After hydration, validate session with server
    if (!isHydrated) return;

    const checkAuth = async () => {
      if (isAuthenticated) {
        // Revalidate stored session with Better Auth
        await revalidateAuthSession();
      }

      // Check again after revalidation
      const currentAuth = useAuthStore.getState().isAuthenticated;

      if (!currentAuth) {
        // Not authenticated - redirect to login
        window.location.href = '/auth/login';
      } else {
        // Authenticated - show content
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [isHydrated, isAuthenticated]);

  // Show loading while hydrating or checking auth
  if (!isHydrated || isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If authenticated, show children
  return <>{children}</>;
}
