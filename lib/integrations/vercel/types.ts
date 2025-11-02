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
 * For integrations with a slug, use the integration installation URL
 * This is the Vercel integration-specific flow, not standard OAuth
 * The installation URL is clean without query parameters
 */
export function getVercelOAuthAuthorizeUrl(slug?: string): string {
  if (slug) {
    return `https://vercel.com/integrations/${slug}/new`;
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

/**
 * Vercel deployment ready state
 */
export type VercelDeploymentReadyState =
  | 'QUEUED'
  | 'BUILDING'
  | 'READY'
  | 'ERROR'
  | 'CANCELED';

/**
 * Vercel deployment state (deprecated, use readyState)
 */
export type VercelDeploymentState = 'BUILDING' | 'READY' | 'ERROR' | 'CANCELED';

/**
 * Vercel deployment response
 */
export interface VercelDeployment {
  id: string;
  url: string;
  name: string;
  state?: VercelDeploymentState; // Deprecated
  readyState: VercelDeploymentReadyState;
  createdAt: number;
  creator: {
    uid: string;
    username?: string;
  };
  inspectorUrl?: string;
  meta?: Record<string, unknown>;
  target?: 'production' | 'staging' | 'preview';
  projectId?: string;
  alias?: string[];
}

/**
 * Git source configuration for deployment
 */
export interface VercelGitSource {
  type: 'github' | 'gitlab' | 'bitbucket';
  repo: string; // "owner/repo"
  ref?: string; // branch/tag (default: default branch)
  path?: string; // subdirectory path
}

/**
 * Project settings for deployment
 */
export interface VercelProjectSettings {
  framework?: 'nextjs' | 'vite' | 'create-react-app' | 'remix' | 'static' | null;
  buildCommand?: string;
  outputDirectory?: string;
  installCommand?: string;
  devCommand?: string;
}

/**
 * Deployment file for file-based deployments
 */
export interface VercelDeploymentFile {
  file: string; // File path
  data: string; // Base64 encoded content
}

/**
 * Vercel deployment configuration
 */
export interface VercelDeploymentConfig {
  name: string;
  gitSource?: VercelGitSource;
  files?: VercelDeploymentFile[];
  projectSettings?: VercelProjectSettings;
  target?: 'production' | 'staging';
  env?: Record<string, string>;
}

/**
 * Vercel deployment list response
 */
export interface VercelDeploymentList {
  deployments: VercelDeployment[];
  pagination: VercelPagination;
}
