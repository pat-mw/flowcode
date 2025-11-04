/**
 * useQueryParam Hook
 * Read query parameters from URL
 * Essential for Webflow routing (uses query params instead of dynamic segments)
 *
 * IMPORTANT: Uses browser-native URLSearchParams for Shadow DOM compatibility
 * Works in both Next.js and Webflow Code Components
 */

'use client';

import { useMemo } from 'react';

/**
 * Get a query parameter value from the URL
 * @param key - The query parameter key
 * @returns The query parameter value or null if not found
 *
 * @example
 * // URL: /dashboard/edit?post=123
 * const postId = useQueryParam('post'); // Returns '123'
 */
export function useQueryParam(key: string): string | null {
  return useMemo(() => {
    // Use browser-native URLSearchParams for Shadow DOM compatibility
    if (typeof window === 'undefined') return null;

    const params = new URLSearchParams(window.location.search);
    return params.get(key);
  }, [key]);
}

/**
 * Get all query parameters as an object
 * @returns Object with all query parameters
 *
 * @example
 * // URL: /dashboard?status=draft&search=hello
 * const params = useQueryParams(); // Returns { status: 'draft', search: 'hello' }
 */
export function useQueryParams(): Record<string, string> {
  return useMemo(() => {
    // Use browser-native URLSearchParams for Shadow DOM compatibility
    if (typeof window === 'undefined') return {};

    const searchParams = new URLSearchParams(window.location.search);
    const params: Record<string, string> = {};

    searchParams.forEach((value, key) => {
      params[key] = value;
    });

    return params;
  }, []);
}
