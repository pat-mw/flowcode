import { describe, it, expect, beforeEach } from 'vitest';

/**
 * Test suite for provider abstraction types and interfaces
 * Tests the CloudProvider interface contract and registry pattern
 */

// Types that will be tested
interface CreateDatabaseConfig {
  name: string;
  region?: string;
  plan?: 'free' | 'pro' | 'enterprise';
}

interface DatabaseInfo {
  id: string;
  name: string;
  provider: string;
  connectionString: string;
  region?: string;
  createdAt: Date;
}

interface EnvVarUpdateConfig {
  projectId: string;
  variables: Record<string, string>;
  sensitive?: boolean;
}

interface CloudProvider {
  name: string;
  version: string;
  createDatabase(config: CreateDatabaseConfig): Promise<DatabaseInfo>;
  getDatabases(): Promise<DatabaseInfo[]>;
  deleteDatabase(id: string): Promise<void>;
  updateEnvVars(config: EnvVarUpdateConfig): Promise<void>;
  validateCredentials(): Promise<boolean>;
}

// Registry implementation
class ProviderRegistry {
  private providers: Map<string, CloudProvider> = new Map();

  registerProvider(provider: CloudProvider): void {
    if (!provider.name) {
      throw new Error('Provider must have a name');
    }
    this.providers.set(provider.name.toLowerCase(), provider);
  }

  getProvider(name: string): CloudProvider {
    const provider = this.providers.get(name.toLowerCase());
    if (!provider) {
      throw new Error(`Provider "${name}" not found in registry`);
    }
    return provider;
  }

  hasProvider(name: string): boolean {
    return this.providers.has(name.toLowerCase());
  }

  listProviders(): string[] {
    return Array.from(this.providers.keys());
  }

  unregisterProvider(name: string): void {
    this.providers.delete(name.toLowerCase());
  }
}

describe('CloudProvider Interface', () => {
  describe('interface contract', () => {
    it('should define required methods', () => {
      // This test verifies TypeScript will enforce the interface at compile time
      // Create a mock implementation to verify structure
      const mockProvider: CloudProvider = {
        name: 'test',
        version: '1.0.0',
        createDatabase: async () => ({
          id: '1',
          name: 'test-db',
          provider: 'test',
          connectionString: 'postgresql://test',
          createdAt: new Date(),
        }),
        getDatabases: async () => [],
        deleteDatabase: async () => {},
        updateEnvVars: async () => {},
        validateCredentials: async () => true,
      };

      expect(mockProvider).toBeDefined();
      expect(typeof mockProvider.createDatabase).toBe('function');
      expect(typeof mockProvider.getDatabases).toBe('function');
      expect(typeof mockProvider.deleteDatabase).toBe('function');
      expect(typeof mockProvider.updateEnvVars).toBe('function');
      expect(typeof mockProvider.validateCredentials).toBe('function');
    });

    it('should support provider metadata', () => {
      // Arrange
      const mockProvider: CloudProvider = {
        name: 'vercel',
        version: '1.2.3',
        createDatabase: async () => ({
          id: '1',
          name: 'test-db',
          provider: 'vercel',
          connectionString: 'postgresql://test',
          createdAt: new Date(),
        }),
        getDatabases: async () => [],
        deleteDatabase: async () => {},
        updateEnvVars: async () => {},
        validateCredentials: async () => true,
      };

      // Assert
      expect(mockProvider.name).toBe('vercel');
      expect(mockProvider.version).toBe('1.2.3');
    });
  });

  describe('method signatures', () => {
    it('createDatabase should accept config and return DatabaseInfo', async () => {
      // Arrange
      const mockProvider: CloudProvider = {
        name: 'test',
        version: '1.0.0',
        createDatabase: async (config: CreateDatabaseConfig) => ({
          id: '1',
          name: config.name,
          provider: 'test',
          connectionString: 'postgresql://localhost/testdb',
          region: config.region,
          createdAt: new Date(),
        }),
        getDatabases: async () => [],
        deleteDatabase: async () => {},
        updateEnvVars: async () => {},
        validateCredentials: async () => true,
      };

      // Act
      const result = await mockProvider.createDatabase({
        name: 'my-database',
        region: 'us-east-1',
      });

      // Assert
      expect(result.id).toBeDefined();
      expect(result.name).toBe('my-database');
      expect(result.provider).toBe('test');
      expect(result.connectionString).toBeDefined();
      expect(result.region).toBe('us-east-1');
      expect(result.createdAt).toBeInstanceOf(Date);
    });

    it('getDatabases should return array of DatabaseInfo', async () => {
      // Arrange
      const mockProvider: CloudProvider = {
        name: 'test',
        version: '1.0.0',
        createDatabase: async () => ({
          id: '1',
          name: 'test-db',
          provider: 'test',
          connectionString: 'postgresql://test',
          createdAt: new Date(),
        }),
        getDatabases: async () => [
          {
            id: '1',
            name: 'db1',
            provider: 'test',
            connectionString: 'postgresql://test1',
            createdAt: new Date(),
          },
          {
            id: '2',
            name: 'db2',
            provider: 'test',
            connectionString: 'postgresql://test2',
            createdAt: new Date(),
          },
        ],
        deleteDatabase: async () => {},
        updateEnvVars: async () => {},
        validateCredentials: async () => true,
      };

      // Act
      const databases = await mockProvider.getDatabases();

      // Assert
      expect(Array.isArray(databases)).toBe(true);
      expect(databases.length).toBe(2);
      expect(databases[0].id).toBe('1');
      expect(databases[1].id).toBe('2');
    });

    it('deleteDatabase should accept id parameter', async () => {
      // Arrange
      let deletedId: string | null = null;
      const mockProvider: CloudProvider = {
        name: 'test',
        version: '1.0.0',
        createDatabase: async () => ({
          id: '1',
          name: 'test-db',
          provider: 'test',
          connectionString: 'postgresql://test',
          createdAt: new Date(),
        }),
        getDatabases: async () => [],
        deleteDatabase: async (id: string) => {
          deletedId = id;
        },
        updateEnvVars: async () => {},
        validateCredentials: async () => true,
      };

      // Act
      await mockProvider.deleteDatabase('db-123');

      // Assert
      expect(deletedId).toBe('db-123');
    });

    it('updateEnvVars should accept config parameter', async () => {
      // Arrange
      let receivedConfig: EnvVarUpdateConfig | null = null;
      const mockProvider: CloudProvider = {
        name: 'test',
        version: '1.0.0',
        createDatabase: async () => ({
          id: '1',
          name: 'test-db',
          provider: 'test',
          connectionString: 'postgresql://test',
          createdAt: new Date(),
        }),
        getDatabases: async () => [],
        deleteDatabase: async () => {},
        updateEnvVars: async (config: EnvVarUpdateConfig) => {
          receivedConfig = config;
        },
        validateCredentials: async () => true,
      };

      // Act
      const config: EnvVarUpdateConfig = {
        projectId: 'proj-123',
        variables: {
          DATABASE_URL: 'postgresql://localhost/db',
          API_KEY: 'secret-key',
        },
      };
      await mockProvider.updateEnvVars(config);

      // Assert
      expect(receivedConfig).toEqual(config);
    });

    it('validateCredentials should return boolean', async () => {
      // Arrange
      const mockProvider: CloudProvider = {
        name: 'test',
        version: '1.0.0',
        createDatabase: async () => ({
          id: '1',
          name: 'test-db',
          provider: 'test',
          connectionString: 'postgresql://test',
          createdAt: new Date(),
        }),
        getDatabases: async () => [],
        deleteDatabase: async () => {},
        updateEnvVars: async () => {},
        validateCredentials: async () => true,
      };

      // Act
      const result = await mockProvider.validateCredentials();

      // Assert
      expect(typeof result).toBe('boolean');
      expect(result).toBe(true);
    });
  });
});

describe('ProviderRegistry', () => {
  let registry: ProviderRegistry;

  beforeEach(() => {
    registry = new ProviderRegistry();
  });

  describe('registerProvider()', () => {
    it('should register a provider', () => {
      // Arrange
      const mockProvider: CloudProvider = {
        name: 'vercel',
        version: '1.0.0',
        createDatabase: async () => ({
          id: '1',
          name: 'test-db',
          provider: 'vercel',
          connectionString: 'postgresql://test',
          createdAt: new Date(),
        }),
        getDatabases: async () => [],
        deleteDatabase: async () => {},
        updateEnvVars: async () => {},
        validateCredentials: async () => true,
      };

      // Act
      registry.registerProvider(mockProvider);

      // Assert
      expect(registry.hasProvider('vercel')).toBe(true);
    });

    it('should throw error if provider has no name', () => {
      // Arrange
      const mockProvider = {
        name: '',
        version: '1.0.0',
      } as any;

      // Act & Assert
      expect(() => {
        registry.registerProvider(mockProvider);
      }).toThrow('Provider must have a name');
    });

    it('should handle case-insensitive provider names', () => {
      // Arrange
      const mockProvider: CloudProvider = {
        name: 'Vercel',
        version: '1.0.0',
        createDatabase: async () => ({
          id: '1',
          name: 'test-db',
          provider: 'vercel',
          connectionString: 'postgresql://test',
          createdAt: new Date(),
        }),
        getDatabases: async () => [],
        deleteDatabase: async () => {},
        updateEnvVars: async () => {},
        validateCredentials: async () => true,
      };

      // Act
      registry.registerProvider(mockProvider);

      // Assert
      expect(registry.hasProvider('vercel')).toBe(true);
      expect(registry.hasProvider('VERCEL')).toBe(true);
      expect(registry.hasProvider('Vercel')).toBe(true);
    });

    it('should overwrite existing provider with same name', () => {
      // Arrange
      const provider1: CloudProvider = {
        name: 'vercel',
        version: '1.0.0',
        createDatabase: async () => ({
          id: '1',
          name: 'test-db',
          provider: 'vercel',
          connectionString: 'postgresql://test1',
          createdAt: new Date(),
        }),
        getDatabases: async () => [],
        deleteDatabase: async () => {},
        updateEnvVars: async () => {},
        validateCredentials: async () => true,
      };

      const provider2: CloudProvider = {
        name: 'vercel',
        version: '2.0.0',
        createDatabase: async () => ({
          id: '2',
          name: 'test-db',
          provider: 'vercel',
          connectionString: 'postgresql://test2',
          createdAt: new Date(),
        }),
        getDatabases: async () => [],
        deleteDatabase: async () => {},
        updateEnvVars: async () => {},
        validateCredentials: async () => true,
      };

      // Act
      registry.registerProvider(provider1);
      registry.registerProvider(provider2);

      // Assert
      const retrieved = registry.getProvider('vercel');
      expect(retrieved.version).toBe('2.0.0');
    });
  });

  describe('getProvider()', () => {
    it('should retrieve registered provider', () => {
      // Arrange
      const mockProvider: CloudProvider = {
        name: 'vercel',
        version: '1.0.0',
        createDatabase: async () => ({
          id: '1',
          name: 'test-db',
          provider: 'vercel',
          connectionString: 'postgresql://test',
          createdAt: new Date(),
        }),
        getDatabases: async () => [],
        deleteDatabase: async () => {},
        updateEnvVars: async () => {},
        validateCredentials: async () => true,
      };
      registry.registerProvider(mockProvider);

      // Act
      const retrieved = registry.getProvider('vercel');

      // Assert
      expect(retrieved).toBe(mockProvider);
      expect(retrieved.name).toBe('vercel');
    });

    it('should throw error for non-existent provider', () => {
      // Act & Assert
      expect(() => {
        registry.getProvider('nonexistent');
      }).toThrow('Provider "nonexistent" not found in registry');
    });

    it('should handle case-insensitive retrieval', () => {
      // Arrange
      const mockProvider: CloudProvider = {
        name: 'vercel',
        version: '1.0.0',
        createDatabase: async () => ({
          id: '1',
          name: 'test-db',
          provider: 'vercel',
          connectionString: 'postgresql://test',
          createdAt: new Date(),
        }),
        getDatabases: async () => [],
        deleteDatabase: async () => {},
        updateEnvVars: async () => {},
        validateCredentials: async () => true,
      };
      registry.registerProvider(mockProvider);

      // Act & Assert
      expect(registry.getProvider('VERCEL')).toBe(mockProvider);
      expect(registry.getProvider('Vercel')).toBe(mockProvider);
      expect(registry.getProvider('vercel')).toBe(mockProvider);
    });
  });

  describe('hasProvider()', () => {
    it('should return true for registered provider', () => {
      // Arrange
      const mockProvider: CloudProvider = {
        name: 'vercel',
        version: '1.0.0',
        createDatabase: async () => ({
          id: '1',
          name: 'test-db',
          provider: 'vercel',
          connectionString: 'postgresql://test',
          createdAt: new Date(),
        }),
        getDatabases: async () => [],
        deleteDatabase: async () => {},
        updateEnvVars: async () => {},
        validateCredentials: async () => true,
      };
      registry.registerProvider(mockProvider);

      // Act & Assert
      expect(registry.hasProvider('vercel')).toBe(true);
    });

    it('should return false for non-existent provider', () => {
      // Act & Assert
      expect(registry.hasProvider('nonexistent')).toBe(false);
    });
  });

  describe('listProviders()', () => {
    it('should list all registered providers', () => {
      // Arrange
      const provider1: CloudProvider = {
        name: 'vercel',
        version: '1.0.0',
        createDatabase: async () => ({
          id: '1',
          name: 'test-db',
          provider: 'vercel',
          connectionString: 'postgresql://test',
          createdAt: new Date(),
        }),
        getDatabases: async () => [],
        deleteDatabase: async () => {},
        updateEnvVars: async () => {},
        validateCredentials: async () => true,
      };

      const provider2: CloudProvider = {
        name: 'netlify',
        version: '1.0.0',
        createDatabase: async () => ({
          id: '1',
          name: 'test-db',
          provider: 'netlify',
          connectionString: 'postgresql://test',
          createdAt: new Date(),
        }),
        getDatabases: async () => [],
        deleteDatabase: async () => {},
        updateEnvVars: async () => {},
        validateCredentials: async () => true,
      };

      // Act
      registry.registerProvider(provider1);
      registry.registerProvider(provider2);
      const providers = registry.listProviders();

      // Assert
      expect(providers.length).toBe(2);
      expect(providers).toContain('vercel');
      expect(providers).toContain('netlify');
    });

    it('should return empty array when no providers registered', () => {
      // Act
      const providers = registry.listProviders();

      // Assert
      expect(providers).toEqual([]);
    });
  });

  describe('unregisterProvider()', () => {
    it('should unregister a provider', () => {
      // Arrange
      const mockProvider: CloudProvider = {
        name: 'vercel',
        version: '1.0.0',
        createDatabase: async () => ({
          id: '1',
          name: 'test-db',
          provider: 'vercel',
          connectionString: 'postgresql://test',
          createdAt: new Date(),
        }),
        getDatabases: async () => [],
        deleteDatabase: async () => {},
        updateEnvVars: async () => {},
        validateCredentials: async () => true,
      };
      registry.registerProvider(mockProvider);

      // Act
      registry.unregisterProvider('vercel');

      // Assert
      expect(registry.hasProvider('vercel')).toBe(false);
    });

    it('should handle case-insensitive unregister', () => {
      // Arrange
      const mockProvider: CloudProvider = {
        name: 'vercel',
        version: '1.0.0',
        createDatabase: async () => ({
          id: '1',
          name: 'test-db',
          provider: 'vercel',
          connectionString: 'postgresql://test',
          createdAt: new Date(),
        }),
        getDatabases: async () => [],
        deleteDatabase: async () => {},
        updateEnvVars: async () => {},
        validateCredentials: async () => true,
      };
      registry.registerProvider(mockProvider);

      // Act
      registry.unregisterProvider('VERCEL');

      // Assert
      expect(registry.hasProvider('vercel')).toBe(false);
    });
  });

  describe('multiple providers', () => {
    it('should support multiple providers simultaneously', () => {
      // Arrange
      const vercelProvider: CloudProvider = {
        name: 'vercel',
        version: '1.0.0',
        createDatabase: async () => ({
          id: '1',
          name: 'test-db',
          provider: 'vercel',
          connectionString: 'postgresql://vercel',
          createdAt: new Date(),
        }),
        getDatabases: async () => [],
        deleteDatabase: async () => {},
        updateEnvVars: async () => {},
        validateCredentials: async () => true,
      };

      const netlifyProvider: CloudProvider = {
        name: 'netlify',
        version: '1.0.0',
        createDatabase: async () => ({
          id: '1',
          name: 'test-db',
          provider: 'netlify',
          connectionString: 'postgresql://netlify',
          createdAt: new Date(),
        }),
        getDatabases: async () => [],
        deleteDatabase: async () => {},
        updateEnvVars: async () => {},
        validateCredentials: async () => true,
      };

      const railwayProvider: CloudProvider = {
        name: 'railway',
        version: '1.0.0',
        createDatabase: async () => ({
          id: '1',
          name: 'test-db',
          provider: 'railway',
          connectionString: 'postgresql://railway',
          createdAt: new Date(),
        }),
        getDatabases: async () => [],
        deleteDatabase: async () => {},
        updateEnvVars: async () => {},
        validateCredentials: async () => true,
      };

      // Act
      registry.registerProvider(vercelProvider);
      registry.registerProvider(netlifyProvider);
      registry.registerProvider(railwayProvider);

      // Assert
      expect(registry.hasProvider('vercel')).toBe(true);
      expect(registry.hasProvider('netlify')).toBe(true);
      expect(registry.hasProvider('railway')).toBe(true);
      expect(registry.listProviders().length).toBe(3);

      const retrievedVercel = registry.getProvider('vercel');
      const retrievedNetlify = registry.getProvider('netlify');
      const retrievedRailway = registry.getProvider('railway');

      expect(retrievedVercel.name).toBe('vercel');
      expect(retrievedNetlify.name).toBe('netlify');
      expect(retrievedRailway.name).toBe('railway');
    });
  });
});
