/**
 * Vercel API client implementation
 * Implements CloudProvider interface for Vercel platform
 *
 * @module lib/integrations/vercel/client
 */

import 'server-only';

import type {
  CloudProvider,
  DatabaseConfig,
  DatabaseResult,
  EnvVarsConfig,
  EnvVarsResult,
  OAuthConfig,
  OAuthTokens,
  ProviderInfo,
} from '../types';
import {
  AuthenticationError,
  ProviderError,
  QuotaExceededError,
  RateLimitError,
} from '../types';
import type {
  VercelDatabaseRegion,
  VercelDeployment,
  VercelDeploymentConfig,
  VercelDeploymentList,
  VercelErrorResponse,
  VercelPostgresConfig,
  VercelPostgresDatabase,
  VercelProject,
  VercelRateLimitInfo,
} from './types';
import {
  VERCEL_API_BASE,
  VERCEL_OAUTH_TOKEN_URL,
  getVercelOAuthAuthorizeUrl,
} from './types';

/**
 * Vercel cloud provider implementation
 */
export class VercelProvider implements CloudProvider {
  readonly info: ProviderInfo = {
    id: 'vercel',
    name: 'Vercel',
    supportedDatabases: ['postgres'],
    requiresTeam: false,
    oauthAuthUrl:
      process.env.VERCEL_OAUTH_AUTHORIZE_URL ||
      getVercelOAuthAuthorizeUrl(process.env.VERCEL_INTEGRATION_SLUG),
    oauthTokenUrl: VERCEL_OAUTH_TOKEN_URL,
  };

  private rateLimitInfo: VercelRateLimitInfo | null = null;

  /**
   * Make an authenticated request to Vercel API
   */
  private async request<T>(
    endpoint: string,
    accessToken: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${VERCEL_API_BASE}${endpoint}`;

    console.log('[VercelProvider] Making request:', { url, method: options.method || 'GET' });

    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    console.log('[VercelProvider] Response status:', response.status, response.statusText);

    // Track rate limit information
    this.updateRateLimitInfo(response);

    if (!response.ok) {
      await this.handleErrorResponse(response);
    }

    return response.json() as Promise<T>;
  }

  /**
   * Update rate limit tracking from response headers
   */
  private updateRateLimitInfo(response: Response): void {
    const limit = response.headers.get('x-ratelimit-limit');
    const remaining = response.headers.get('x-ratelimit-remaining');
    const reset = response.headers.get('x-ratelimit-reset');

    if (limit && remaining && reset) {
      this.rateLimitInfo = {
        limit: parseInt(limit, 10),
        remaining: parseInt(remaining, 10),
        reset: parseInt(reset, 10),
      };
    }
  }

  /**
   * Handle error responses from Vercel API
   */
  private async handleErrorResponse(response: Response): Promise<never> {
    const contentType = response.headers.get('content-type');
    let errorData: VercelErrorResponse | null = null;
    let rawBody: string | null = null;

    if (contentType?.includes('application/json')) {
      try {
        const text = await response.text();
        rawBody = text;
        errorData = JSON.parse(text);
      } catch {
        // Failed to parse error response
      }
    }

    console.log('[VercelProvider] Error response details:', {
      status: response.status,
      statusText: response.statusText,
      contentType,
      rawBody,
      errorData
    });

    const errorMessage = errorData?.error?.message || response.statusText;
    const errorCode = errorData?.error?.code;

    // Rate limit error
    if (response.status === 429) {
      const resetAt = this.rateLimitInfo?.reset
        ? new Date(this.rateLimitInfo.reset * 1000)
        : undefined;
      throw new RateLimitError('vercel', resetAt, errorMessage);
    }

    // Authentication error
    if (response.status === 401 || response.status === 403) {
      if (errorCode?.includes('quota') || errorCode?.includes('limit')) {
        throw new QuotaExceededError('vercel', 'unknown', errorMessage);
      }
      throw new AuthenticationError('vercel', errorMessage);
    }

    // Generic error
    throw new ProviderError(errorMessage, 'vercel', errorCode, response.status);
  }

  /**
   * Generate OAuth authorization URL
   *
   * Vercel integrations use a clean installation URL without OAuth query parameters.
   * All configuration (redirect_uri, scopes, etc.) is set in the Vercel dashboard.
   * The client_id and client_secret are only used during token exchange, not in the URL.
   */
  generateAuthUrl(config: OAuthConfig, state: string): string {
    // Support either full URL or slug-based construction
    const baseUrl =
      process.env.VERCEL_OAUTH_AUTHORIZE_URL ||
      getVercelOAuthAuthorizeUrl(process.env.VERCEL_INTEGRATION_SLUG);

    // Vercel integration flow uses a clean URL: https://vercel.com/integrations/{slug}/new
    // No query parameters needed - everything is configured in Vercel dashboard
    return baseUrl;
  }

  /**
   * Exchange authorization code for access tokens
   */
  async exchangeCodeForTokens(code: string, config: OAuthConfig): Promise<OAuthTokens> {
    const response = await fetch(VERCEL_OAUTH_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code,
        redirect_uri: config.redirectUri,
      }),
    });

    if (!response.ok) {
      throw new AuthenticationError('vercel', 'Failed to exchange authorization code');
    }

    const data = await response.json();

    return {
      accessToken: data.access_token,
      tokenType: data.token_type,
      // Vercel tokens don't expire by default
    };
  }

  /**
   * Refresh access token (Vercel tokens don't expire, so this is a no-op)
   */
  async refreshAccessToken(refreshToken: string): Promise<OAuthTokens> {
    throw new ProviderError(
      'Vercel tokens do not expire and cannot be refreshed',
      'vercel',
      'NOT_SUPPORTED'
    );
  }

  /**
   * Create a Postgres database
   */
  async createDatabase(config: DatabaseConfig, accessToken: string, teamId?: string): Promise<DatabaseResult> {
    const vercelConfig: VercelPostgresConfig = {
      name: config.name,
      region: (config.region as VercelDatabaseRegion) || 'us-east-1',
    };

    const endpoint = teamId
      ? `/v1/postgres/databases?teamId=${teamId}`
      : '/v1/postgres/databases';

    const response = await this.request<VercelPostgresDatabase>(
      endpoint,
      accessToken,
      {
        method: 'POST',
        body: JSON.stringify(vercelConfig),
      }
    );

    return {
      id: response.id,
      name: response.name,
      connectionString: response.pooler?.connectionString || '',
      type: 'postgres',
      region: response.region,
      status: response.status === 'ready' ? 'active' : response.status,
      createdAt: new Date(response.createdAt),
      metadata: response,
    };
  }

  /**
   * List all Postgres databases
   */
  async listDatabases(accessToken: string, teamId?: string): Promise<DatabaseResult[]> {
    const endpoint = teamId
      ? `/v1/postgres/databases?teamId=${teamId}`
      : '/v1/postgres/databases';

    const response = await this.request<{ databases: VercelPostgresDatabase[] }>(
      endpoint,
      accessToken
    );

    return response.databases.map((db) => ({
      id: db.id,
      name: db.name,
      connectionString: db.pooler?.connectionString || '',
      type: 'postgres',
      region: db.region,
      status: db.status === 'ready' ? 'active' : db.status,
      createdAt: new Date(db.createdAt),
      metadata: db,
    }));
  }

  /**
   * Delete a Postgres database
   */
  async deleteDatabase(databaseId: string, accessToken: string, teamId?: string): Promise<boolean> {
    try {
      const endpoint = teamId
        ? `/v1/postgres/databases/${databaseId}?teamId=${teamId}`
        : `/v1/postgres/databases/${databaseId}`;

      await this.request(endpoint, accessToken, {
        method: 'DELETE',
      });
      return true;
    } catch (error) {
      if (error instanceof ProviderError && error.statusCode === 404) {
        return false; // Database doesn't exist
      }
      throw error;
    }
  }

  /**
   * Update environment variables for a project
   */
  async updateEnvVars(config: EnvVarsConfig, accessToken: string): Promise<EnvVarsResult> {
    const target = config.target || ['production', 'preview', 'development'];

    // Vercel requires creating/updating env vars one at a time
    let updated = 0;

    for (const [key, value] of Object.entries(config.vars)) {
      try {
        await this.request(`/v10/projects/${config.projectId}/env`, accessToken, {
          method: 'POST',
          body: JSON.stringify({
            key,
            value,
            target,
            type: 'encrypted',
          }),
        });
        updated++;
      } catch (error) {
        // If env var already exists, update it
        if (error instanceof ProviderError && error.statusCode === 400) {
          // Note: Updating requires fetching existing env var ID first
          // Simplified implementation assumes creation succeeds
          continue;
        }
        throw error;
      }
    }

    return {
      success: updated > 0,
      updated,
    };
  }

  /**
   * Get current rate limit information
   */
  getRateLimitInfo(): VercelRateLimitInfo | null {
    return this.rateLimitInfo;
  }

  /**
   * Create a new deployment
   */
  async createDeployment(
    config: VercelDeploymentConfig,
    accessToken: string,
    teamId?: string
  ): Promise<VercelDeployment> {
    // Build query parameters
    const params = new URLSearchParams({ skipAutoDetectionConfirmation: '1' });
    if (teamId) params.set('teamId', teamId);

    return this.request<VercelDeployment>(
      `/v13/deployments?${params.toString()}`,
      accessToken,
      {
        method: 'POST',
        body: JSON.stringify(config),
      }
    );
  }

  /**
   * Get deployment status by ID
   */
  async getDeployment(
    deploymentId: string,
    accessToken: string
  ): Promise<VercelDeployment> {
    return this.request<VercelDeployment>(
      `/v13/deployments/${deploymentId}`,
      accessToken
    );
  }

  /**
   * List deployments (optionally filtered by project)
   */
  async listDeployments(
    accessToken: string,
    projectId?: string
  ): Promise<VercelDeploymentList> {
    const endpoint = projectId
      ? `/v6/deployments?projectId=${projectId}`
      : '/v6/deployments';

    return this.request<VercelDeploymentList>(endpoint, accessToken);
  }

  /**
   * List all projects
   */
  async listProjects(accessToken: string): Promise<{ projects: VercelProject[] }> {
    return this.request<{ projects: VercelProject[] }>('/v9/projects', accessToken);
  }

  /**
   * Create a new project
   */
  async createProject(
    name: string,
    accessToken: string,
    framework?: string
  ): Promise<VercelProject> {
    return this.request<VercelProject>('/v10/projects', accessToken, {
      method: 'POST',
      body: JSON.stringify({ name, framework }),
    });
  }
}
