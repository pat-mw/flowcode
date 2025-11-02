/**
 * Centralized CORS configuration
 * Automatically includes BETTER_AUTH_URL and NEXT_PUBLIC_API_URL as allowed origins
 */

/**
 * Get the list of allowed CORS origins
 *
 * Automatically includes:
 * - BETTER_AUTH_URL (your backend URL)
 * - NEXT_PUBLIC_API_URL (your frontend URL)
 * - Custom origins from ALLOWED_CORS_ORIGINS env var
 * - Hardcoded defaults for development
 *
 * @returns Array of allowed origin URLs
 */
export function getAllowedOrigins(): string[] {
  const origins = new Set<string>();

  // Add hardcoded defaults
  origins.add('http://localhost:3000');
  origins.add('http://127.0.0.1:3000');
  origins.add('https://blogflow-three.webflow.io');

  // Automatically add auth URL (your backend)
  if (process.env.BETTER_AUTH_URL) {
    origins.add(process.env.BETTER_AUTH_URL);
  }

  // Automatically add public API URL (might be different in some setups)
  if (process.env.NEXT_PUBLIC_API_URL) {
    origins.add(process.env.NEXT_PUBLIC_API_URL);
  }

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
  return allowedOrigins.includes(origin);
}
