import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

/**
 * Test suite for Vercel OAuth flow
 * Tests OAuth 2.0 authorization, token exchange, and token refresh
 */

interface OAuthToken {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  expiresAt: number;
  tokenType: string;
}

interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

class VercelOAuth {
  private config: OAuthConfig;
  private authorizationUrl = 'https://vercel.com/oauth/authorize';
  private tokenUrl = 'https://api.vercel.com/oauth/access_token';

  constructor(config: OAuthConfig) {
    this.validateConfig(config);
    this.config = config;
  }

  private validateConfig(config: OAuthConfig) {
    if (!config.clientId) throw new Error('clientId is required');
    if (!config.clientSecret) throw new Error('clientSecret is required');
    if (!config.redirectUri) throw new Error('redirectUri is required');
  }

  generateAuthUrl(state: string, scope: string[] = ['read', 'write']): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      scope: scope.join(' '),
      state,
    });

    return `${this.authorizationUrl}?${params.toString()}`;
  }

  async exchangeCodeForToken(code: string): Promise<OAuthToken> {
    if (!code) {
      throw new Error('Authorization code is required');
    }

    const response = await fetch(this.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        code,
        redirect_uri: this.config.redirectUri,
        grant_type: 'authorization_code',
      }).toString(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OAuth token exchange failed: ${error.error_description}`);
    }

    const data = await response.json();

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
      expiresAt: Date.now() + data.expires_in * 1000,
      tokenType: data.token_type || 'Bearer',
    };
  }

  async refreshAccessToken(refreshToken: string): Promise<OAuthToken> {
    if (!refreshToken) {
      throw new Error('Refresh token is required');
    }

    const response = await fetch(this.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }).toString(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Token refresh failed: ${error.error_description}`);
    }

    const data = await response.json();

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || refreshToken,
      expiresIn: data.expires_in,
      expiresAt: Date.now() + data.expires_in * 1000,
      tokenType: data.token_type || 'Bearer',
    };
  }

  isTokenExpired(token: OAuthToken): boolean {
    return Date.now() >= token.expiresAt;
  }

  isTokenExpiringSoon(token: OAuthToken, bufferMs: number = 300000): boolean {
    return Date.now() + bufferMs >= token.expiresAt;
  }
}

describe('Vercel OAuth', () => {
  let oauth: VercelOAuth;
  const mockConfig: OAuthConfig = {
    clientId: 'test-client-id',
    clientSecret: 'test-client-secret',
    redirectUri: 'http://localhost:3000/callback',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
    oauth = new VercelOAuth(mockConfig);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('constructor', () => {
    it('should create instance with valid config', () => {
      // Act
      const instance = new VercelOAuth(mockConfig);

      // Assert
      expect(instance).toBeDefined();
    });

    it('should throw error if clientId is missing', () => {
      // Act & Assert
      expect(() => {
        new VercelOAuth({
          ...mockConfig,
          clientId: '',
        });
      }).toThrow('clientId is required');
    });

    it('should throw error if clientSecret is missing', () => {
      // Act & Assert
      expect(() => {
        new VercelOAuth({
          ...mockConfig,
          clientSecret: '',
        });
      }).toThrow('clientSecret is required');
    });

    it('should throw error if redirectUri is missing', () => {
      // Act & Assert
      expect(() => {
        new VercelOAuth({
          ...mockConfig,
          redirectUri: '',
        });
      }).toThrow('redirectUri is required');
    });
  });

  describe('generateAuthUrl()', () => {
    it('should generate correct authorization URL', () => {
      // Arrange
      const state = 'test-state-123';

      // Act
      const url = oauth.generateAuthUrl(state);

      // Assert
      expect(url).toContain('https://vercel.com/oauth/authorize');
      expect(url).toContain(`client_id=${mockConfig.clientId}`);
      expect(url).toContain(`redirect_uri=${encodeURIComponent(mockConfig.redirectUri)}`);
      expect(url).toContain('response_type=code');
      expect(url).toContain('state=test-state-123');
    });

    it('should include default scopes', () => {
      // Arrange
      const state = 'test-state';

      // Act
      const url = oauth.generateAuthUrl(state);

      // Assert
      expect(url).toContain('scope=read+write');
    });

    it('should include custom scopes', () => {
      // Arrange
      const state = 'test-state';
      const customScopes = ['read', 'write', 'delete'];

      // Act
      const url = oauth.generateAuthUrl(state, customScopes);

      // Assert
      expect(url).toContain('scope=read+write+delete');
    });

    it('should handle single scope', () => {
      // Arrange
      const state = 'test-state';

      // Act
      const url = oauth.generateAuthUrl(state, ['read']);

      // Assert
      expect(url).toContain('scope=read');
    });

    it('should properly URL encode redirect URI', () => {
      // Arrange
      const oauth2 = new VercelOAuth({
        ...mockConfig,
        redirectUri: 'http://localhost:3000/api/oauth/callback?step=2',
      });
      const state = 'test-state';

      // Act
      const url = oauth2.generateAuthUrl(state);

      // Assert
      expect(url).toContain(encodeURIComponent('http://localhost:3000/api/oauth/callback?step=2'));
    });

    it('should preserve state parameter exactly', () => {
      // Arrange
      const state = 'complex-state-with-special_chars.123';

      // Act
      const url = oauth.generateAuthUrl(state);

      // Assert
      expect(url).toContain(`state=${state}`);
    });
  });

  describe('exchangeCodeForToken()', () => {
    it('should exchange authorization code for access token', async () => {
      // Arrange
      const code = 'auth-code-abc123';
      const mockTokenResponse: OAuthToken = {
        accessToken: 'access-token-xyz789',
        refreshToken: 'refresh-token-uvw456',
        expiresIn: 3600,
        expiresAt: Date.now() + 3600000,
        tokenType: 'Bearer',
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: mockTokenResponse.accessToken,
          refresh_token: mockTokenResponse.refreshToken,
          expires_in: mockTokenResponse.expiresIn,
          token_type: mockTokenResponse.tokenType,
        }),
      });

      // Act
      const result = await oauth.exchangeCodeForToken(code);

      // Assert
      expect(result.accessToken).toBe(mockTokenResponse.accessToken);
      expect(result.refreshToken).toBe(mockTokenResponse.refreshToken);
      expect(result.expiresIn).toBe(3600);
      expect(result.tokenType).toBe('Bearer');
      expect(result.expiresAt).toBeDefined();
    });

    it('should throw error if code is empty', async () => {
      // Act & Assert
      await expect(oauth.exchangeCodeForToken('')).rejects.toThrow(
        'Authorization code is required'
      );
    });

    it('should throw error if code is undefined', async () => {
      // Act & Assert
      await expect(oauth.exchangeCodeForToken(undefined as unknown as string)).rejects.toThrow(
        'Authorization code is required'
      );
    });

    it('should throw error on invalid authorization code', async () => {
      // Arrange
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: 'invalid_code',
          error_description: 'The authorization code is invalid or has expired',
        }),
      });

      // Act & Assert
      await expect(oauth.exchangeCodeForToken('invalid-code')).rejects.toThrow(
        'The authorization code is invalid or has expired'
      );
    });

    it('should throw error on expired authorization code', async () => {
      // Arrange
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: 'expired_code',
          error_description: 'The authorization code has expired',
        }),
      });

      // Act & Assert
      await expect(oauth.exchangeCodeForToken('expired-code')).rejects.toThrow(
        'The authorization code has expired'
      );
    });

    it('should make correct POST request to token endpoint', async () => {
      // Arrange
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'token',
          refresh_token: 'refresh',
          expires_in: 3600,
        }),
      });

      // Act
      await oauth.exchangeCodeForToken('code-123');

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.vercel.com/oauth/access_token',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        })
      );

      // Verify request body contains required parameters
      const callArgs = vi.mocked(global.fetch).mock.calls[0];
      const bodyParams = new URLSearchParams(callArgs[1].body);
      expect(bodyParams.get('client_id')).toBe(mockConfig.clientId);
      expect(bodyParams.get('client_secret')).toBe(mockConfig.clientSecret);
      expect(bodyParams.get('code')).toBe('code-123');
      expect(bodyParams.get('grant_type')).toBe('authorization_code');
    });

    it('should handle network errors', async () => {
      // Arrange
      global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'));

      // Act & Assert
      await expect(oauth.exchangeCodeForToken('code-123')).rejects.toThrow(
        'Network error'
      );
    });

    it('should not expose client secret in error messages', async () => {
      // Arrange
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: 'invalid_request',
          error_description: 'Invalid request',
        }),
      });

      // Act & Assert
      const error = await oauth.exchangeCodeForToken('code-123').catch((e) => e);
      expect(error.message).not.toContain(mockConfig.clientSecret);
    });

    it('should calculate correct expiration time', async () => {
      // Arrange
      const expiresIn = 7200; // 2 hours
      const beforeTime = Date.now();

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'token',
          refresh_token: 'refresh',
          expires_in: expiresIn,
        }),
      });

      // Act
      const result = await oauth.exchangeCodeForToken('code-123');
      const afterTime = Date.now();

      // Assert
      expect(result.expiresAt).toBeGreaterThanOrEqual(beforeTime + expiresIn * 1000);
      expect(result.expiresAt).toBeLessThanOrEqual(afterTime + expiresIn * 1000);
    });
  });

  describe('refreshAccessToken()', () => {
    it('should refresh access token using refresh token', async () => {
      // Arrange
      const refreshToken = 'refresh-token-123';
      const newAccessToken = 'new-access-token-456';

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: newAccessToken,
          refresh_token: refreshToken, // May return same refresh token
          expires_in: 3600,
        }),
      });

      // Act
      const result = await oauth.refreshAccessToken(refreshToken);

      // Assert
      expect(result.accessToken).toBe(newAccessToken);
      expect(result.refreshToken).toBe(refreshToken);
    });

    it('should return new refresh token if provided', async () => {
      // Arrange
      const refreshToken = 'refresh-token-123';
      const newRefreshToken = 'new-refresh-token-789';

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'new-access-token',
          refresh_token: newRefreshToken,
          expires_in: 3600,
        }),
      });

      // Act
      const result = await oauth.refreshAccessToken(refreshToken);

      // Assert
      expect(result.refreshToken).toBe(newRefreshToken);
    });

    it('should throw error if refresh token is empty', async () => {
      // Act & Assert
      await expect(oauth.refreshAccessToken('')).rejects.toThrow(
        'Refresh token is required'
      );
    });

    it('should throw error on invalid refresh token', async () => {
      // Arrange
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: 'invalid_grant',
          error_description: 'The refresh token is invalid or has expired',
        }),
      });

      // Act & Assert
      await expect(oauth.refreshAccessToken('invalid-refresh-token')).rejects.toThrow(
        'The refresh token is invalid or has expired'
      );
    });

    it('should make correct POST request with refresh_token grant', async () => {
      // Arrange
      const refreshToken = 'refresh-token-123';

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'token',
          refresh_token: refreshToken,
          expires_in: 3600,
        }),
      });

      // Act
      await oauth.refreshAccessToken(refreshToken);

      // Assert
      const callArgs = vi.mocked(global.fetch).mock.calls[0];
      const bodyParams = new URLSearchParams(callArgs[1].body);
      expect(bodyParams.get('grant_type')).toBe('refresh_token');
      expect(bodyParams.get('refresh_token')).toBe(refreshToken);
    });

    it('should maintain client credentials in refresh request', async () => {
      // Arrange
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'token',
          refresh_token: 'refresh',
          expires_in: 3600,
        }),
      });

      // Act
      await oauth.refreshAccessToken('refresh-token-123');

      // Assert
      const callArgs = vi.mocked(global.fetch).mock.calls[0];
      const bodyParams = new URLSearchParams(callArgs[1].body);
      expect(bodyParams.get('client_id')).toBe(mockConfig.clientId);
      expect(bodyParams.get('client_secret')).toBe(mockConfig.clientSecret);
    });
  });

  describe('isTokenExpired()', () => {
    it('should return true if token is expired', () => {
      // Arrange
      const expiredToken: OAuthToken = {
        accessToken: 'token',
        refreshToken: 'refresh',
        expiresIn: 3600,
        expiresAt: Date.now() - 1000, // 1 second ago
        tokenType: 'Bearer',
      };

      // Act
      const result = oauth.isTokenExpired(expiredToken);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false if token is not expired', () => {
      // Arrange
      const validToken: OAuthToken = {
        accessToken: 'token',
        refreshToken: 'refresh',
        expiresIn: 3600,
        expiresAt: Date.now() + 3600000, // 1 hour from now
        tokenType: 'Bearer',
      };

      // Act
      const result = oauth.isTokenExpired(validToken);

      // Assert
      expect(result).toBe(false);
    });

    it('should return true if token expiration time equals current time', () => {
      // Arrange
      const now = Date.now();
      const token: OAuthToken = {
        accessToken: 'token',
        refreshToken: 'refresh',
        expiresIn: 3600,
        expiresAt: now,
        tokenType: 'Bearer',
      };

      // Act
      const result = oauth.isTokenExpired(token);

      // Assert
      expect(result).toBe(true);
    });
  });

  describe('isTokenExpiringSoon()', () => {
    it('should return true if token expiring within buffer time', () => {
      // Arrange
      const token: OAuthToken = {
        accessToken: 'token',
        refreshToken: 'refresh',
        expiresIn: 3600,
        expiresAt: Date.now() + 60000, // 1 minute from now
        tokenType: 'Bearer',
      };

      // Act
      const result = oauth.isTokenExpiringSoon(token, 300000); // 5 minute buffer

      // Assert
      expect(result).toBe(true);
    });

    it('should return false if token not expiring soon', () => {
      // Arrange
      const token: OAuthToken = {
        accessToken: 'token',
        refreshToken: 'refresh',
        expiresIn: 3600,
        expiresAt: Date.now() + 600000, // 10 minutes from now
        tokenType: 'Bearer',
      };

      // Act
      const result = oauth.isTokenExpiringSoon(token, 300000); // 5 minute buffer

      // Assert
      expect(result).toBe(false);
    });

    it('should use default buffer of 5 minutes', () => {
      // Arrange
      const token: OAuthToken = {
        accessToken: 'token',
        refreshToken: 'refresh',
        expiresIn: 3600,
        expiresAt: Date.now() + 240000, // 4 minutes from now
        tokenType: 'Bearer',
      };

      // Act
      const result = oauth.isTokenExpiringSoon(token); // Default 5 minute buffer

      // Assert
      expect(result).toBe(true);
    });

    it('should allow custom buffer time', () => {
      // Arrange
      const token: OAuthToken = {
        accessToken: 'token',
        refreshToken: 'refresh',
        expiresIn: 3600,
        expiresAt: Date.now() + 120000, // 2 minutes from now
        tokenType: 'Bearer',
      };

      // Act
      const result = oauth.isTokenExpiringSoon(token, 60000); // 1 minute buffer

      // Assert
      expect(result).toBe(true);
    });
  });

  describe('OAuth flow security', () => {
    it('should not expose client secret in authorization URL', () => {
      // Arrange
      const state = 'test-state';

      // Act
      const url = oauth.generateAuthUrl(state);

      // Assert
      expect(url).not.toContain(mockConfig.clientSecret);
    });

    it('should use client_secret in token exchange', async () => {
      // Arrange
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'token',
          refresh_token: 'refresh',
          expires_in: 3600,
        }),
      });

      // Act
      await oauth.exchangeCodeForToken('code-123');

      // Assert
      const callArgs = vi.mocked(global.fetch).mock.calls[0];
      const bodyParams = new URLSearchParams(callArgs[1].body);
      expect(bodyParams.get('client_secret')).toBe(mockConfig.clientSecret);
    });

    it('should require HTTPS for token endpoint', () => {
      // Assert
      expect(oauth['tokenUrl']).toMatch(/^https:\/\//);
    });

    it('should require HTTPS for authorization endpoint', () => {
      // Assert
      expect(oauth['authorizationUrl']).toMatch(/^https:\/\//);
    });
  });
});
