/**
 * useParamOrProp Hook
 * Generic hook that prioritizes URL search params over component props
 * Useful for components that can be controlled via URL or props
 */

'use client';

import { useQueryParam } from './useQueryParam';

/**
 * Get a value from URL search params, falling back to a prop value
 * URL search params take precedence over props when both are provided
 *
 * @param paramKey - The URL search parameter key to check
 * @param propValue - The fallback prop value to use if param is not found
 * @returns The URL param value if present, otherwise the prop value
 *
 * @example
 * // URL: /post?id=123
 * // Component prop: postId="456"
 * const postId = useParamOrProp('id', postId); // Returns '123' (URL takes precedence)
 *
 * @example
 * // URL: /post (no query param)
 * // Component prop: postId="456"
 * const postId = useParamOrProp('id', postId); // Returns '456' (falls back to prop)
 */
export function useParamOrProp<T = string>(
  paramKey: string,
  propValue: T | undefined
): T | string | undefined {
  const paramValue = useQueryParam(paramKey);

  // URL param takes precedence if present
  if (paramValue !== null) {
    return paramValue;
  }

  // Fall back to prop value
  return propValue;
}

/**
 * Get multiple values from URL search params, falling back to prop values
 *
 * @param params - Object mapping param keys to prop values
 * @returns Object with resolved values (URL params taking precedence)
 *
 * @example
 * const { postId, mode } = useParamsOrProps({
 *   post: postIdProp,
 *   mode: modeProp,
 * });
 */
export function useParamsOrProps<T extends Record<string, unknown>>(
  params: T
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, propValue] of Object.entries(params)) {
    result[key] = useParamOrProp(key, propValue);
  }

  return result;
}
