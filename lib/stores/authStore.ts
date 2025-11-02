/**
 * Auth Store
 * Global authentication state management using Zustand with localStorage persistence
 * Works across Shadow DOM boundaries in Webflow components
 */

'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { clearToken, getToken } from '@/lib/token-storage';
import { getApiBaseUrl } from '@/lib/env';

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

      clearAuth: () => {
        // Clear bearer token from localStorage
        clearToken();

        set({
          user: null,
          person: null,
          isAuthenticated: false,
        });
      },

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
      // Skip hydration check during SSR
      skipHydration: typeof window === 'undefined',
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

  console.log('[Auth] Starting session revalidation...', {
    hasStoredAuth: store.isAuthenticated,
    hasUser: !!store.user,
  });

  // If we have stored auth, verify it's still valid with Better Auth
  if (store.isAuthenticated && store.user) {
    try {
      // Check if session is still valid by fetching from Better Auth
      // Use full URL for cross-origin requests (Webflow → Vercel)
      const apiUrl = getApiBaseUrl();

      // Build headers including bearer token if available
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add bearer token for cross-origin authentication
      const token = getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${apiUrl}/api/orpc/auth/getSession`, {
        method: 'POST',
        credentials: 'include',
        headers,
      });

      console.log('[Auth] Session check response:', {
        status: response.status,
        ok: response.ok,
      });

      if (response.ok) {
        const responseData = await response.json();
        // oRPC wraps the response in a "json" property
        const sessionData = responseData.json;

        console.log('[Auth] Session data received:', {
          hasUser: !!sessionData?.user,
          hasPerson: !!sessionData?.person,
          isNull: sessionData === null,
        });

        if (sessionData?.user && sessionData?.person) {
          // Session is valid, update store with fresh data
          store.setAuth(sessionData.user, sessionData.person);
          console.log('[Auth] ✅ Session revalidated successfully');
        } else if (sessionData === null) {
          // Explicitly null response means session doesn't exist - clear auth
          console.log('[Auth] ❌ No active session, clearing stored auth');
          store.clearAuth();
        } else {
          console.warn('[Auth] ⚠️ Unexpected session data format, keeping stored auth');
        }
        // If sessionData is undefined or missing fields, keep existing auth (might be loading)
      } else if (response.status === 401) {
        // Explicit unauthorized - session definitely expired
        console.log('[Auth] ❌ Session expired (401), clearing auth');
        store.clearAuth();
      } else {
        console.warn('[Auth] ⚠️ Unexpected response status:', response.status);
      }
      // For other errors (500, etc), keep existing auth - server might be down
    } catch (error) {
      console.error('[Auth] ❌ Failed to revalidate session:', error);
      // On network error, keep the stored auth (user might be offline)
    }
  } else {
    console.log('[Auth] No stored auth to revalidate');
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
