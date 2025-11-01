/**
 * Type definitions for Vercel API
 * Based on Vercel REST API v13 documentation
 *
 * @module lib/integrations/vercel/types
 */

/**
 * Vercel API base URL
 */
export const VERCEL_API_BASE = 'https://api.vercel.com';

/**
 * Vercel OAuth endpoints
 * Note: For integrations with a slug, use getVercelOAuthAuthorizeUrl() instead
 */
export const VERCEL_OAUTH_TOKEN_URL = 'https://api.vercel.com/v2/oauth/access_token';

/**
 * Get Vercel OAuth authorize URL
 * For integrations with a slug, use the integration-specific URL
 * For integrations without a slug (deprecated), use the generic URL
 */
export function getVercelOAuthAuthorizeUrl(slug?: string): string {
  if (slug) {
    return `https://vercel.com/integrations/${slug}/oauth/authorize`;
  }
  return 'https://vercel.com/oauth/authorize';
}

/**
 * Vercel database types
 */
export type VercelDatabaseType = 'postgres' | 'redis' | 'blob';

/**
 * Vercel database regions
 */
export type VercelDatabaseRegion =
  | 'us-east-1'
  | 'us-west-1'
  | 'eu-west-1'
  | 'ap-southeast-1'
  | 'ap-northeast-1';

/**
 * Vercel Postgres database configuration
 */
export interface VercelPostgresConfig {
  name: string;
  region?: VercelDatabaseRegion;
}

/**
 * Vercel Postgres database response
 */
export interface VercelPostgresDatabase {
  id: string;
  name: string;
  region: string;
  createdAt: number;
  status: 'creating' | 'ready' | 'error';
  pooler?: {
    connectionString: string;
  };
}

/**
 * Vercel environment variable target
 */
export type VercelEnvTarget = 'production' | 'preview' | 'development';

/**
 * Vercel environment variable type
 */
export type VercelEnvType = 'encrypted' | 'secret' | 'system' | 'plain';

/**
 * Vercel environment variable
 */
export interface VercelEnvVar {
  id?: string;
  key: string;
  value: string;
  target: VercelEnvTarget[];
  type?: VercelEnvType;
  configurationId?: string | null;
  createdAt?: number;
  updatedAt?: number;
}

/**
 * Vercel project information
 */
export interface VercelProject {
  id: string;
  name: string;
  accountId: string;
  createdAt: number;
  updatedAt: number;
  framework: string | null;
}

/**
 * Vercel team information
 */
export interface VercelTeam {
  id: string;
  slug: string;
  name: string;
  createdAt: number;
}

/**
 * Vercel user information
 */
export interface VercelUser {
  id: string;
  email: string;
  name: string | null;
  username: string;
}

/**
 * Vercel API error response
 */
export interface VercelErrorResponse {
  error: {
    code: string;
    message: string;
  };
}

/**
 * Vercel API pagination
 */
export interface VercelPagination {
  count: number;
  next?: number;
  prev?: number;
}

/**
 * Vercel rate limit information
 */
export interface VercelRateLimitInfo {
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp
}
