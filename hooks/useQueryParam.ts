/**
 * useQueryParam Hook
 * Read query parameters from URL
 * Essential for Webflow routing (uses query params instead of dynamic segments)
 */

'use client';

import { useSearchParams } from 'next/navigation';

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
  const searchParams = useSearchParams();
  return searchParams.get(key);
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
  const searchParams = useSearchParams();
  const params: Record<string, string> = {};

  searchParams.forEach((value, key) => {
    params[key] = value;
  });

  return params;
}
