/**
 * Centralized CORS configuration
 * Automatically uses VERCEL_URL when deployed to Vercel
 */

import { getBaseUrl } from '@/lib/env';

/**
 * Get the list of allowed CORS origins
 *
 * Automatically includes:
 * - Current deployment URL (via VERCEL_URL or BETTER_AUTH_URL)
 * - Custom origins from ALLOWED_CORS_ORIGINS env var
 * - Hardcoded defaults (localhost, Webflow site)
 *
 * @returns Array of allowed origin URLs
 */
export function getAllowedOrigins(): string[] {
  const origins = new Set<string>();

  // Add hardcoded defaults
  origins.add('http://localhost:3000');
  origins.add('http://127.0.0.1:3000');
  origins.add('https://blogflow-three.webflow.io');

  // Automatically add current deployment URL
  // This uses VERCEL_URL on Vercel, or BETTER_AUTH_URL if explicitly set
  const baseUrl = getBaseUrl();
  origins.add(baseUrl);

  // Add custom origins from env (comma-separated)
  if (process.env.ALLOWED_CORS_ORIGINS) {
    const customOrigins = process.env.ALLOWED_CORS_ORIGINS
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean);

    customOrigins.forEach((origin) => origins.add(origin));
  }

  const result = Array.from(origins);

  console.log('[CORS] Allowed origins configured:', result);

  return result;
}

/**
 * Check if an origin is allowed
 */
export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;

  const allowedOrigins = getAllowedOrigins();

  // Exact match
  if (allowedOrigins.includes(origin)) {
    return true;
  }

  // Allow all Vercel deployment URLs (*.vercel.app)
  // This covers production, preview, and git branch deployments
  if (origin.endsWith('.vercel.app') && origin.startsWith('https://')) {
    return true;
  }

  return false;
}
