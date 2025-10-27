/**
 * Auth Store
 * Global authentication state management using Zustand with localStorage persistence
 * Works across Shadow DOM boundaries in Webflow components
 */

'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  image?: string | null;
}

interface Person {
  id: string;
  userId: string;
  displayName: string;
  bio?: string | null;
  avatar?: string | null;
  website?: string | null;
}

interface AuthState {
  user: User | null;
  person: Person | null;
  isAuthenticated: boolean;

  // Actions
  setAuth: (user: User, person: Person) => void;
  clearAuth: () => void;
  updatePerson: (person: Person) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      person: null,
      isAuthenticated: false,

      setAuth: (user, person) =>
        set({
          user,
          person,
          isAuthenticated: true,
        }),

      clearAuth: () =>
        set({
          user: null,
          person: null,
          isAuthenticated: false,
        }),

      updatePerson: (person) =>
        set(() => ({
          person,
        })),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => {
        // Check if window is available (client-side only)
        if (typeof window !== 'undefined') {
          return localStorage;
        }
        // Fallback for SSR
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
    }
  )
);

/**
 * Revalidate session with Better Auth on app load
 * Call this in your root layout or app initialization
 * This ensures the persisted auth state is still valid with the server
 */
export async function revalidateAuthSession() {
  if (typeof window === 'undefined') return;

  const store = useAuthStore.getState();

  // If we have stored auth, verify it's still valid with Better Auth
  if (store.isAuthenticated && store.user) {
    try {
      // Check if session is still valid by fetching from Better Auth
      const response = await fetch('/api/orpc/auth/getSession', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        const sessionData = await response.json();

        if (sessionData?.user && sessionData?.person) {
          // Session is valid, update store with fresh data
          store.setAuth(sessionData.user, sessionData.person);
        } else {
          // Session invalid or expired, clear auth
          store.clearAuth();
        }
      } else {
        // Session invalid or expired, clear auth
        store.clearAuth();
      }
    } catch (error) {
      console.error('Failed to revalidate session:', error);
      // On error, keep the stored auth (user might be offline)
    }
  }
}

/**
 * Sync auth state across Shadow DOM components
 * Call this in components that need to react to auth changes from other components
 */
export function syncAuthAcrossShadowDOM() {
  if (typeof window === 'undefined') return;

  // Listen for storage events (cross-tab sync)
  window.addEventListener('storage', (e) => {
    if (e.key === 'auth-storage') {
      // Force a re-read from storage
      const store = useAuthStore.getState();
      // Trigger a state update to force re-render
      store.setAuth(store.user!, store.person!);
    }
  });
}
