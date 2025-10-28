/**
 * Better Auth client configuration
 * Used in frontend components for authentication
 */

'use client';

import { createAuthClient } from 'better-auth/react';

if (!process.env.NEXT_PUBLIC_API_URL) {
  throw new Error('NEXT_PUBLIC_API_URL is required');
}

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
} = authClient;
