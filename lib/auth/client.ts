/**
 * Better Auth client configuration
 * Used in frontend components for authentication
 *
 * Automatically uses:
 * - NEXT_PUBLIC_API_URL (if set)
 * - window.location.origin (in browser)
 * - VERCEL_URL (on Vercel)
 * - http://localhost:3000 (fallback)
 */

'use client';

import { createAuthClient } from 'better-auth/react';
import { getApiBaseUrl } from '@/lib/env';

export const authClient = createAuthClient({
  baseURL: getApiBaseUrl(),
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
} = authClient;
