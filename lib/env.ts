/**
 * Environment variable helpers with automatic Vercel URL detection
 *
 * Vercel automatically provides VERCEL_URL for all deployments:
 * - Production: your-app.vercel.app
 * - Preview: your-app-git-branch-team.vercel.app
 * - Local dev: undefined (falls back to localhost:3000)
 */

/**
 * Get the base URL for the application
 *
 * Priority:
 * 1. BETTER_AUTH_URL (if explicitly set)
 * 2. VERCEL_URL (automatic in Vercel deployments)
 * 3. http://localhost:3000 (local development fallback)
 *
 * @returns The base URL with protocol (e.g., https://your-app.vercel.app)
 */
export function getBaseUrl(): string {
  // Explicit override
  if (process.env.BETTER_AUTH_URL) {
    return process.env.BETTER_AUTH_URL;
  }

  // Vercel deployment (production or preview)
  if (process.env.VERCEL_URL) {
    // VERCEL_URL doesn't include protocol, always use https
    return `https://${process.env.VERCEL_URL}`;
  }

  // Local development fallback
  return 'http://localhost:3000';
}

/**
 * Get the API URL for client-side requests
 *
 * Priority:
 * 1. NEXT_PUBLIC_API_URL (if explicitly set)
 * 2. VERCEL_URL (automatic in Vercel deployments)
 * 3. window.location.origin (in browser)
 * 4. http://localhost:3000 (SSR fallback)
 *
 * @returns The API base URL (without /api/orpc suffix)
 */
export function getApiBaseUrl(): string {
  // Explicit override
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  // In browser, use current origin
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  // Vercel deployment (SSR context)
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // Local development fallback
  return 'http://localhost:3000';
}

/**
 * Check if running in Vercel environment
 */
export function isVercel(): boolean {
  return Boolean(process.env.VERCEL);
}

/**
 * Check if running in production
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}
