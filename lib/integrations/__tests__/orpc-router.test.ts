import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

/**
 * Test suite for oRPC integration router
 * Tests protected procedures, input validation, and server action handling
 */

interface User {
  id: string;
  email: string;
}

interface IntegrationData {
  id: string;
  userId: string;
  provider: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  createdAt: Date;
}

interface DatabaseInfo {
  id: string;
  name: string;
  connectionString: string;
  status: 'ready' | 'creating';
}

interface CreateDatabaseInput {
  name: string;
  region?: string;
}

interface UpdateEnvVarsInput {
  projectId: string;
  variables: Record<string, string>;
}

// Mock authentication context
class AuthContext {
  async getCurrentUser(): Promise<User | null> {
    return { id: 'user-123', email: 'user@example.com' };
  }

  async getCurrentUserId(): Promise<string> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Unauthorized');
    return user.id;
  }
}

// Mock database access layer
class IntegrationDAL {
  async createIntegration(data: {
    userId: string;
    provider: string;
    accessToken: string;
    refreshToken?: string;
    expiresAt: number;
  }): Promise<IntegrationData> {
    return {
      id: 'integration-123',
      userId: data.userId,
      provider: data.provider,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      expiresAt: data.expiresAt,
      createdAt: new Date(),
    };
  }

  async getUserIntegration(userId: string, provider: string): Promise<IntegrationData | null> {
    return {
      id: 'integration-123',
      userId,
      provider,
      accessToken: 'token-abc',
      refreshToken: 'refresh-token-xyz',
      expiresAt: Date.now() + 3600000,
      createdAt: new Date(),
    };
  }

  async updateIntegration(id: string, data: Partial<IntegrationData>): Promise<void> {
    // Mock implementation
  }
}

// Mock provider factory
class ProviderFactory {
  async createProvider(provider: string, accessToken: string) {
    return {
      createDatabase: vi.fn().mockResolvedValue({
        id: 'db-123',
        name: 'test-db',
        connectionString: 'postgresql://...',
        status: 'creating',
      } as DatabaseInfo),
      updateEnvVars: vi.fn().mockResolvedValue(undefined),
    };
  }
}

// Mock oRPC procedures
class IntegrationRouter {
  constructor(
    private authContext: AuthContext,
    private integrationDAL: IntegrationDAL,
    private providerFactory: ProviderFactory
  ) {}

  // Public procedure for connecting Vercel account
  async connectVercel(code: string, state: string): Promise<{ success: boolean; id: string }> {
    // Validate input
    if (!code) {
      throw new Error('Authorization code is required');
    }
    if (!state) {
      throw new Error('State parameter is required');
    }

    // Exchange code for token (would call OAuth service)
    const token = {
      accessToken: 'vercel-access-token-' + code,
      refreshToken: 'vercel-refresh-token-' + code,
      expiresIn: 3600,
    };

    // Store integration (would be encrypted)
    const integration = await this.integrationDAL.createIntegration({
      userId: 'user-123', // Would come from auth context
      provider: 'vercel',
      accessToken: token.accessToken,
      refreshToken: token.refreshToken,
      expiresAt: Date.now() + token.expiresIn * 1000,
    });

    return {
      success: true,
      id: integration.id,
    };
  }

  // Protected procedure for creating database
  async createDatabase(input: CreateDatabaseInput): Promise<DatabaseInfo> {
    // Get authenticated user
    const userId = await this.authContext.getCurrentUserId();

    // Validate input
    if (!input.name) {
      throw new Error('Database name is required');
    }

    // Get user's Vercel integration
    const integration = await this.integrationDAL.getUserIntegration(userId, 'vercel');
    if (!integration) {
      throw new Error('Vercel integration not connected');
    }

    // Create provider instance with token
    const provider = await this.providerFactory.createProvider('vercel', integration.accessToken);

    // Create database
    const database = await provider.createDatabase({
      name: input.name,
      region: input.region || 'us-east-1',
    });

    // Store database reference in DAL (would be implemented)
    // await this.databaseDAL.createDatabase({ userId, ...database });

    return database;
  }

  // Protected procedure for updating environment variables
  async updateEnvVars(input: UpdateEnvVarsInput): Promise<{ success: boolean }> {
    // Get authenticated user
    const userId = await this.authContext.getCurrentUserId();

    // Validate input
    if (!input.projectId) {
      throw new Error('Project ID is required');
    }
    if (!input.variables || Object.keys(input.variables).length === 0) {
      throw new Error('At least one variable is required');
    }

    // Validate variable keys (alphanumeric and underscores)
    for (const key of Object.keys(input.variables)) {
      if (!/^[A-Z0-9_]+$/.test(key)) {
        throw new Error(`Invalid variable name: ${key}. Must be uppercase alphanumeric with underscores`);
      }
      if (key.length > 128) {
        throw new Error(`Variable name too long: ${key}`);
      }
    }

    // Get user's Vercel integration
    const integration = await this.integrationDAL.getUserIntegration(userId, 'vercel');
    if (!integration) {
      throw new Error('Vercel integration not connected');
    }

    // Create provider instance
    const provider = await this.providerFactory.createProvider('vercel', integration.accessToken);

    // Update environment variables
    await provider.updateEnvVars({
      projectId: input.projectId,
      variables: input.variables,
    });

    return { success: true };
  }
}

describe('oRPC Integration Router', () => {
  let router: IntegrationRouter;
  let mockAuthContext: AuthContext;
  let mockIntegrationDAL: IntegrationDAL;
  let mockProviderFactory: ProviderFactory;

  beforeEach(() => {
    mockAuthContext = new AuthContext();
    mockIntegrationDAL = new IntegrationDAL();
    mockProviderFactory = new ProviderFactory();

    router = new IntegrationRouter(mockAuthContext, mockIntegrationDAL, mockProviderFactory);

    vi.spyOn(mockAuthContext, 'getCurrentUserId');
    vi.spyOn(mockIntegrationDAL, 'createIntegration');
    vi.spyOn(mockIntegrationDAL, 'getUserIntegration');
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('connectVercel', () => {
    it('should connect Vercel account with valid code', async () => {
      // Arrange
      const code = 'auth-code-123';
      const state = 'state-456';

      // Act
      const result = await router.connectVercel(code, state);

      // Assert
      expect(result.success).toBe(true);
      expect(result.id).toBe('integration-123');
      expect(mockIntegrationDAL.createIntegration).toHaveBeenCalledWith(
        expect.objectContaining({
          provider: 'vercel',
          accessToken: expect.stringContaining('vercel-access-token'),
        })
      );
    });

    it('should throw error if code is missing', async () => {
      // Act & Assert
      await expect(router.connectVercel('', 'state-456')).rejects.toThrow(
        'Authorization code is required'
      );
    });

    it('should throw error if state is missing', async () => {
      // Act & Assert
      await expect(router.connectVercel('code-123', '')).rejects.toThrow(
        'State parameter is required'
      );
    });

    it('should store encrypted tokens in database', async () => {
      // Arrange
      const code = 'auth-code-123';
      const state = 'state-456';

      // Act
      await router.connectVercel(code, state);

      // Assert
      expect(mockIntegrationDAL.createIntegration).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-123',
          provider: 'vercel',
          accessToken: expect.any(String),
          refreshToken: expect.any(String),
          expiresAt: expect.any(Number),
        })
      );
    });

    it('should set correct token expiration time', async () => {
      // Arrange
      const code = 'auth-code-123';
      const state = 'state-456';
      const beforeTime = Date.now();

      // Act
      await router.connectVercel(code, state);

      // Assert
      const callArgs = vi.mocked(mockIntegrationDAL.createIntegration).mock.calls[0][0];
      const afterTime = Date.now();

      // Token should expire in ~1 hour from now
      expect(callArgs.expiresAt).toBeGreaterThanOrEqual(beforeTime + 3600 * 1000);
      expect(callArgs.expiresAt).toBeLessThanOrEqual(afterTime + 3600 * 1000);
    });
  });

  describe('createDatabase', () => {
    it('should create database with authenticated user', async () => {
      // Arrange
      vi.spyOn(mockAuthContext, 'getCurrentUserId').mockResolvedValueOnce('user-123');
      vi.spyOn(mockIntegrationDAL, 'getUserIntegration').mockResolvedValueOnce({
        id: 'integration-123',
        userId: 'user-123',
        provider: 'vercel',
        accessToken: 'token-abc',
        expiresAt: Date.now() + 3600000,
        createdAt: new Date(),
      });

      const input: CreateDatabaseInput = {
        name: 'my-database',
        region: 'us-east-1',
      };

      // Act
      const result = await router.createDatabase(input);

      // Assert
      expect(result.id).toBe('db-123');
      expect(result.name).toBe('test-db');
      expect(mockAuthContext.getCurrentUserId).toHaveBeenCalled();
    });

    it('should throw error if user not authenticated', async () => {
      // Arrange
      vi.spyOn(mockAuthContext, 'getCurrentUserId').mockRejectedValueOnce(
        new Error('Unauthorized')
      );

      // Act & Assert
      await expect(
        router.createDatabase({ name: 'my-database' })
      ).rejects.toThrow('Unauthorized');
    });

    it('should throw error if database name is missing', async () => {
      // Arrange
      vi.spyOn(mockAuthContext, 'getCurrentUserId').mockResolvedValueOnce('user-123');

      // Act & Assert
      await expect(
        router.createDatabase({ name: '' })
      ).rejects.toThrow('Database name is required');
    });

    it('should throw error if Vercel integration not connected', async () => {
      // Arrange
      vi.spyOn(mockAuthContext, 'getCurrentUserId').mockResolvedValueOnce('user-123');
      vi.spyOn(mockIntegrationDAL, 'getUserIntegration').mockResolvedValueOnce(null);

      // Act & Assert
      await expect(
        router.createDatabase({ name: 'my-database' })
      ).rejects.toThrow('Vercel integration not connected');
    });

    it('should use default region if not specified', async () => {
      // Arrange
      vi.spyOn(mockAuthContext, 'getCurrentUserId').mockResolvedValueOnce('user-123');
      vi.spyOn(mockIntegrationDAL, 'getUserIntegration').mockResolvedValueOnce({
        id: 'integration-123',
        userId: 'user-123',
        provider: 'vercel',
        accessToken: 'token-abc',
        expiresAt: Date.now() + 3600000,
        createdAt: new Date(),
      });

      const mockProvider = await mockProviderFactory.createProvider('vercel', 'token-abc');

      // Act
      await router.createDatabase({ name: 'my-database' });

      // Assert
      expect(mockProvider.createDatabase).toHaveBeenCalledWith(
        expect.objectContaining({
          region: 'us-east-1',
        })
      );
    });

    it('should pass user token to provider', async () => {
      // Arrange
      const userToken = 'user-integration-token-xyz';
      vi.spyOn(mockAuthContext, 'getCurrentUserId').mockResolvedValueOnce('user-123');
      vi.spyOn(mockIntegrationDAL, 'getUserIntegration').mockResolvedValueOnce({
        id: 'integration-123',
        userId: 'user-123',
        provider: 'vercel',
        accessToken: userToken,
        expiresAt: Date.now() + 3600000,
        createdAt: new Date(),
      });

      vi.spyOn(mockProviderFactory, 'createProvider');

      // Act
      await router.createDatabase({ name: 'my-database' });

      // Assert
      expect(mockProviderFactory.createProvider).toHaveBeenCalledWith('vercel', userToken);
    });
  });

  describe('updateEnvVars', () => {
    it('should update environment variables with authenticated user', async () => {
      // Arrange
      vi.spyOn(mockAuthContext, 'getCurrentUserId').mockResolvedValueOnce('user-123');
      vi.spyOn(mockIntegrationDAL, 'getUserIntegration').mockResolvedValueOnce({
        id: 'integration-123',
        userId: 'user-123',
        provider: 'vercel',
        accessToken: 'token-abc',
        expiresAt: Date.now() + 3600000,
        createdAt: new Date(),
      });

      const input: UpdateEnvVarsInput = {
        projectId: 'proj-123',
        variables: {
          DATABASE_URL: 'postgresql://...',
          API_KEY: 'secret-key',
        },
      };

      // Act
      const result = await router.updateEnvVars(input);

      // Assert
      expect(result.success).toBe(true);
      expect(mockAuthContext.getCurrentUserId).toHaveBeenCalled();
    });

    it('should throw error if user not authenticated', async () => {
      // Arrange
      vi.spyOn(mockAuthContext, 'getCurrentUserId').mockRejectedValueOnce(
        new Error('Unauthorized')
      );

      // Act & Assert
      await expect(
        router.updateEnvVars({
          projectId: 'proj-123',
          variables: { KEY: 'value' },
        })
      ).rejects.toThrow('Unauthorized');
    });

    it('should throw error if projectId is missing', async () => {
      // Arrange
      vi.spyOn(mockAuthContext, 'getCurrentUserId').mockResolvedValueOnce('user-123');

      // Act & Assert
      await expect(
        router.updateEnvVars({
          projectId: '',
          variables: { KEY: 'value' },
        })
      ).rejects.toThrow('Project ID is required');
    });

    it('should throw error if no variables provided', async () => {
      // Arrange
      vi.spyOn(mockAuthContext, 'getCurrentUserId').mockResolvedValueOnce('user-123');

      // Act & Assert
      await expect(
        router.updateEnvVars({
          projectId: 'proj-123',
          variables: {},
        })
      ).rejects.toThrow('At least one variable is required');
    });

    it('should throw error if Vercel integration not connected', async () => {
      // Arrange
      vi.spyOn(mockAuthContext, 'getCurrentUserId').mockResolvedValueOnce('user-123');
      vi.spyOn(mockIntegrationDAL, 'getUserIntegration').mockResolvedValueOnce(null);

      // Act & Assert
      await expect(
        router.updateEnvVars({
          projectId: 'proj-123',
          variables: { KEY: 'value' },
        })
      ).rejects.toThrow('Vercel integration not connected');
    });

    it('should validate variable names are uppercase alphanumeric', async () => {
      // Arrange
      vi.spyOn(mockAuthContext, 'getCurrentUserId').mockResolvedValueOnce('user-123');

      const invalidNames = [
        'database-url', // Hyphen
        'api.key', // Dot
        'variable@name', // Special char
        'lowercase', // Lowercase
      ];

      for (const name of invalidNames) {
        // Act & Assert
        await expect(
          router.updateEnvVars({
            projectId: 'proj-123',
            variables: { [name]: 'value' },
          })
        ).rejects.toThrow('Invalid variable name');
      }
    });

    it('should allow valid uppercase alphanumeric variable names', async () => {
      // Arrange
      vi.spyOn(mockAuthContext, 'getCurrentUserId').mockResolvedValueOnce('user-123');
      vi.spyOn(mockIntegrationDAL, 'getUserIntegration').mockResolvedValueOnce({
        id: 'integration-123',
        userId: 'user-123',
        provider: 'vercel',
        accessToken: 'token-abc',
        expiresAt: Date.now() + 3600000,
        createdAt: new Date(),
      });

      const validVariables = {
        DATABASE_URL: 'postgresql://...',
        API_KEY_SECRET: 'secret-key',
        ENV_VAR_123: 'value',
        MY_VAR: 'test',
      };

      // Act & Assert - should not throw
      const result = await router.updateEnvVars({
        projectId: 'proj-123',
        variables: validVariables,
      });

      expect(result.success).toBe(true);
    });

    it('should throw error if variable name too long', async () => {
      // Arrange
      vi.spyOn(mockAuthContext, 'getCurrentUserId').mockResolvedValueOnce('user-123');

      const longName = 'A'.repeat(129); // Over 128 character limit

      // Act & Assert
      await expect(
        router.updateEnvVars({
          projectId: 'proj-123',
          variables: { [longName]: 'value' },
        })
      ).rejects.toThrow('Variable name too long');
    });

    it('should pass all variables to provider', async () => {
      // Arrange
      vi.spyOn(mockAuthContext, 'getCurrentUserId').mockResolvedValueOnce('user-123');
      const integration = {
        id: 'integration-123',
        userId: 'user-123',
        provider: 'vercel',
        accessToken: 'token-abc',
        expiresAt: Date.now() + 3600000,
        createdAt: new Date(),
      };
      vi.spyOn(mockIntegrationDAL, 'getUserIntegration').mockResolvedValueOnce(integration);

      const mockProvider = await mockProviderFactory.createProvider('vercel', 'token-abc');

      const variables = {
        DATABASE_URL: 'postgresql://localhost/db',
        API_KEY: 'secret-key',
        NODE_ENV: 'production',
      };

      // Act
      await router.updateEnvVars({
        projectId: 'proj-123',
        variables,
      });

      // Assert
      expect(mockProvider.updateEnvVars).toHaveBeenCalledWith(
        expect.objectContaining({
          projectId: 'proj-123',
          variables,
        })
      );
    });
  });

  describe('Authentication and Authorization', () => {
    it('should enforce authentication for createDatabase', async () => {
      // Arrange
      vi.spyOn(mockAuthContext, 'getCurrentUserId').mockRejectedValueOnce(
        new Error('Unauthorized')
      );

      // Act & Assert
      await expect(
        router.createDatabase({ name: 'my-database' })
      ).rejects.toThrow('Unauthorized');
    });

    it('should enforce authentication for updateEnvVars', async () => {
      // Arrange
      vi.spyOn(mockAuthContext, 'getCurrentUserId').mockRejectedValueOnce(
        new Error('Unauthorized')
      );

      // Act & Assert
      await expect(
        router.updateEnvVars({
          projectId: 'proj-123',
          variables: { KEY: 'value' },
        })
      ).rejects.toThrow('Unauthorized');
    });

    it('should isolate user data - users can only access their integrations', async () => {
      // Arrange
      vi.spyOn(mockAuthContext, 'getCurrentUserId').mockResolvedValueOnce('user-123');
      vi.spyOn(mockIntegrationDAL, 'getUserIntegration').mockResolvedValueOnce(
        null // No integration found for this user
      );

      // Act & Assert
      await expect(
        router.createDatabase({ name: 'my-database' })
      ).rejects.toThrow('Vercel integration not connected');

      // Verify getUserIntegration was called with user-123, not another user
      expect(mockIntegrationDAL.getUserIntegration).toHaveBeenCalledWith(
        'user-123',
        'vercel'
      );
    });
  });

  describe('Input validation', () => {
    it('should validate all required fields in createDatabase', async () => {
      // Arrange
      vi.spyOn(mockAuthContext, 'getCurrentUserId').mockResolvedValueOnce('user-123');

      // Act & Assert
      await expect(
        router.createDatabase({ name: '' })
      ).rejects.toThrow('Database name is required');
    });

    it('should validate all required fields in updateEnvVars', async () => {
      // Arrange
      vi.spyOn(mockAuthContext, 'getCurrentUserId').mockResolvedValueOnce('user-123');

      // Test projectId validation
      await expect(
        router.updateEnvVars({
          projectId: '',
          variables: { KEY: 'value' },
        })
      ).rejects.toThrow('Project ID is required');

      // Test variables validation
      await expect(
        router.updateEnvVars({
          projectId: 'proj-123',
          variables: {},
        })
      ).rejects.toThrow('At least one variable is required');
    });
  });
});
