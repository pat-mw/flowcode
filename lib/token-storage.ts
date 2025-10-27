/**
 * Bearer Token Storage Utility
 * Manages authentication tokens in localStorage for cross-origin requests
 *
 * This utility stores bearer tokens that can be sent in Authorization headers,
 * bypassing third-party cookie restrictions in Webflow Shadow DOM components.
 */

'use client';

const TOKEN_KEY = 'better-auth.bearer-token';

/**
 * Store bearer token in localStorage
 * @param token - JWT bearer token from Better Auth
 */
export function setToken(token: string): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(TOKEN_KEY, token);
    console.log('[TokenStorage] ✅ Token stored successfully');
  } catch (error) {
    console.error('[TokenStorage] Failed to store token:', error);
  }
}

/**
 * Retrieve bearer token from localStorage
 * @returns Bearer token or null if not found
 */
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    const token = localStorage.getItem(TOKEN_KEY);
    return token;
  } catch (error) {
    console.error('[TokenStorage] Failed to retrieve token:', error);
    return null;
  }
}

/**
 * Remove bearer token from localStorage (on logout)
 */
export function clearToken(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(TOKEN_KEY);
    console.log('[TokenStorage] ✅ Token cleared');
  } catch (error) {
    console.error('[TokenStorage] Failed to clear token:', error);
  }
}

/**
 * Check if a valid token exists
 * @returns true if token exists in storage
 */
export function hasToken(): boolean {
  return getToken() !== null;
}
