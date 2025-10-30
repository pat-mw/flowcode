/**
 * Better Auth client configuration
 * Used in frontend components for authentication
 */

'use client';

import { createAuthClient } from 'better-auth/react';

// Note: NEXT_PUBLIC_API_URL is replaced at build time by webpack DefinePlugin
// The value is hardcoded into the bundle during webpack build
// Do not validate at runtime as it breaks Webflow CLI metadata collection
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '',
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
} = authClient;
