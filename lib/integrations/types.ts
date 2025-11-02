/**
 * Provider abstraction layer for cloud platform integrations
 * Defines interfaces and types for extensible multi-provider support
 *
 * Supported operations:
 * - Database provisioning (Postgres, MySQL, Redis, etc.)
 * - Environment variable management
 * - Project/deployment management
 *
 * @module lib/integrations/types
 */

/**
 * Configuration for creating a new database
 */
export interface DatabaseConfig {
  /** User-friendly name for the database */
  name: string;

  /** Deployment region (e.g., 'us-east-1', 'eu-west-1') */
  region?: string;

  /** Plan/tier (e.g., 'hobby', 'pro', 'enterprise') */
  plan?: string;

  /** Additional provider-specific options */
  options?: Record<string, unknown>;
}

/**
 * Result of database creation
 */
export interface DatabaseResult {
  /** Unique identifier for the database */
  id: string;

  /** Database name */
  name: string;

  /** Connection string for accessing the database */
  connectionString: string;

  /** Database type (postgres, mysql, redis, etc.) */
  type: string;

  /** Deployment region */
  region: string;

  /** Current status (creating, active, error, deleting) */
  status: 'creating' | 'active' | 'error' | 'deleting';

  /** Creation timestamp */
  createdAt: Date;

  /** Provider-specific metadata */
  metadata?: unknown;
}

/**
 * Configuration for updating environment variables
 */
export interface EnvVarsConfig {
  /** Project or application identifier */
  projectId: string;

  /** Environment variables to set (replaces existing values) */
  vars: Record<string, string>;

  /** Target environment(s) */
  target?: ('production' | 'preview' | 'development')[];
}

/**
 * Result of environment variable update
 */
export interface EnvVarsResult {
  /** Whether the update was successful */
  success: boolean;

  /** Number of variables updated */
  updated: number;

  /** Provider-specific response metadata */
  metadata?: unknown;
}

/**
 * OAuth configuration for provider authentication
 */
export interface OAuthConfig {
  /** OAuth client ID */
  clientId: string;

  /** OAuth client secret */
  clientSecret: string;

  /** Redirect URI for OAuth callback */
  redirectUri: string;

  /** OAuth scopes to request */
  scopes: string[];
}

/**
 * OAuth tokens returned from authorization
 */
export interface OAuthTokens {
  /** Access token for API requests */
  accessToken: string;

  /** Refresh token for obtaining new access tokens */
  refreshToken?: string;

  /** Access token expiration timestamp */
  expiresAt?: Date;

  /** Token type (usually 'Bearer') */
  tokenType?: string;

  /** Granted OAuth scopes */
  scope?: string;

  /** Team ID (for team-scoped integrations like Vercel) */
  teamId?: string;
}

/**
 * Provider capabilities and metadata
 */
export interface ProviderInfo {
  /** Provider identifier (vercel, netlify, railway, etc.) */
  id: string;

  /** Human-readable name */
  name: string;

  /** Supported database types */
  supportedDatabases: string[];

  /** Whether the provider requires team/organization context */
  requiresTeam: boolean;

  /** OAuth authorization URL pattern */
  oauthAuthUrl?: string;

  /** OAuth token endpoint */
  oauthTokenUrl?: string;
}

/**
 * Cloud provider interface
 * All providers must implement this interface for consistent API
 */
export interface CloudProvider {
  /** Provider information */
  readonly info: ProviderInfo;

  /**
   * Generate OAuth authorization URL
   * @param config OAuth configuration
   * @param state CSRF protection state parameter
   * @returns Authorization URL to redirect user to
   */
  generateAuthUrl(config: OAuthConfig, state: string): string;

  /**
   * Exchange authorization code for access tokens
   * @param code Authorization code from OAuth callback
   * @param config OAuth configuration
   * @returns OAuth tokens
   */
  exchangeCodeForTokens(code: string, config: OAuthConfig): Promise<OAuthTokens>;

  /**
   * Refresh an expired access token
   * @param refreshToken Refresh token
   * @returns New OAuth tokens
   */
  refreshAccessToken(refreshToken: string): Promise<OAuthTokens>;

  /**
   * Create a new database
   * @param config Database configuration
   * @param accessToken User's access token
   * @returns Created database information
   */
  createDatabase(config: DatabaseConfig, accessToken: string): Promise<DatabaseResult>;

  /**
   * List user's databases
   * @param accessToken User's access token
   * @returns Array of databases
   */
  listDatabases(accessToken: string): Promise<DatabaseResult[]>;

  /**
   * Delete a database
   * @param databaseId Database identifier
   * @param accessToken User's access token
   * @returns Whether deletion was successful
   */
  deleteDatabase(databaseId: string, accessToken: string): Promise<boolean>;

  /**
   * Update environment variables for a project
   * @param config Environment variables configuration
   * @param accessToken User's access token
   * @returns Update result
   */
  updateEnvVars(config: EnvVarsConfig, accessToken: string): Promise<EnvVarsResult>;
}

/**
 * Provider-specific error types
 */
export class ProviderError extends Error {
  constructor(
    message: string,
    public readonly provider: string,
    public readonly code?: string,
    public readonly statusCode?: number,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ProviderError';
  }
}

export class AuthenticationError extends ProviderError {
  constructor(provider: string, message: string = 'Authentication failed') {
    super(message, provider, 'AUTHENTICATION_ERROR', 401);
    this.name = 'AuthenticationError';
  }
}

export class RateLimitError extends ProviderError {
  constructor(
    provider: string,
    public readonly resetAt?: Date,
    message: string = 'Rate limit exceeded'
  ) {
    super(message, provider, 'RATE_LIMIT_ERROR', 429, { resetAt });
    this.name = 'RateLimitError';
  }
}

export class QuotaExceededError extends ProviderError {
  constructor(
    provider: string,
    public readonly resource: string,
    message: string = 'Quota exceeded'
  ) {
    super(message, provider, 'QUOTA_EXCEEDED', 403, { resource });
    this.name = 'QuotaExceededError';
  }
}
