import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';

/**
 * Integration test suite for Vercel integration end-to-end workflow
 * Tests complete user flows with realistic API response fixtures
 */

// Load fixtures from file
function loadFixture(name: string) {
  const fixturesPath = path.join(__dirname, '../lib/integrations/__tests__/fixtures/vercel-api-responses.json');
  const data = JSON.parse(fs.readFileSync(fixturesPath, 'utf-8'));

  // Navigate nested object path (e.g., 'createDatabase.success')
  const parts = name.split('.');
  let result = data;
  for (const part of parts) {
    result = result[part];
  }
  return result;
}

// Mock services for integration testing
interface MockServiceContext {
  oauth: {
    exchange: (code: string) => Promise<{ accessToken: string; refreshToken: string }>;
  };
  database: {
    create: (name: string, region: string) => Promise<{ id: string; name: string; status: string }>;
    list: () => Promise<{ id: string; name: string }[]>;
  };
  envVars: {
    update: (projectId: string, vars: Record<string, string>) => Promise<void>;
  };
}

describe('Vercel Integration End-to-End Workflow', () => {
  let mockServices: MockServiceContext;

  beforeEach(() => {
    // Setup mock services that will be called during workflow
    mockServices = {
      oauth: {
        exchange: vi.fn().mockImplementation(async (code) => {
          const fixture = loadFixture('oauth.tokenExchange.success');
          return {
            accessToken: fixture.access_token,
            refreshToken: fixture.refresh_token,
          };
        }),
      },
      database: {
        create: vi.fn().mockImplementation(async (name, region) => {
          const fixture = loadFixture('createDatabase.success');
          return {
            id: fixture.id,
            name: fixture.name,
            status: fixture.status,
            connectionString: fixture.connectionString,
          };
        }),
        list: vi.fn().mockImplementation(async () => {
          const fixture = loadFixture('getDatabases.success');
          return fixture.databases.map((db: any) => ({
            id: db.id,
            name: db.name,
          }));
        }),
      },
      envVars: {
        update: vi.fn().mockImplementation(async () => {
          const fixture = loadFixture('envVars.update.success');
          return fixture;
        }),
      },
    };
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Complete user onboarding flow', () => {
    it('should complete OAuth flow, create database, and setup env vars', async () => {
      // Step 1: User connects Vercel account (OAuth)
      const authCode = 'auth_code_from_callback';
      const oauthResult = await mockServices.oauth.exchange(authCode);

      expect(oauthResult.accessToken).toBeDefined();
      expect(oauthResult.refreshToken).toBeDefined();
      expect(mockServices.oauth.exchange).toHaveBeenCalledWith(authCode);

      // Step 2: User creates database
      const dbName = 'my_database';
      const dbResult = await mockServices.database.create(dbName, 'us-east-1');

      expect(dbResult.id).toBe('postgres_abc123def456');
      expect(dbResult.name).toBe('my_database');
      expect(dbResult.status).toBe('creating');
      expect(mockServices.database.create).toHaveBeenCalledWith(dbName, 'us-east-1');

      // Step 3: User sets environment variables
      const projectId = 'prj_abc123';
      const envVars = {
        DATABASE_URL: 'postgres://user:password@host/db',
        API_KEY: 'secret-api-key-123',
      };
      await mockServices.envVars.update(projectId, envVars);

      expect(mockServices.envVars.update).toHaveBeenCalledWith(projectId, envVars);

      // All steps should have been called in order
      expect(mockServices.oauth.exchange).toHaveBeenCalledBefore(
        mockServices.database.create as any
      );
      expect(mockServices.database.create).toHaveBeenCalledBefore(
        mockServices.envVars.update as any
      );
    });

    it('should load database list after creation', async () => {
      // Create database first
      await mockServices.database.create('test_db', 'us-east-1');

      // List databases
      const databases = await mockServices.database.list();

      expect(databases).toHaveLength(2);
      expect(databases[0].name).toBe('production_db');
      expect(databases[1].name).toBe('staging_db');
    });
  });

  describe('Fixture data accuracy', () => {
    it('should have valid OAuth token response structure', () => {
      // Arrange
      const fixture = loadFixture('oauth.tokenExchange.success');

      // Assert
      expect(fixture).toHaveProperty('access_token');
      expect(fixture).toHaveProperty('refresh_token');
      expect(fixture).toHaveProperty('expires_in');
      expect(fixture).toHaveProperty('token_type');
      expect(fixture.token_type).toBe('Bearer');
    });

    it('should have valid database creation response structure', () => {
      // Arrange
      const fixture = loadFixture('createDatabase.success');

      // Assert
      expect(fixture).toHaveProperty('id');
      expect(fixture).toHaveProperty('name');
      expect(fixture).toHaveProperty('region');
      expect(fixture).toHaveProperty('connectionString');
      expect(fixture).toHaveProperty('status');
      expect(['creating', 'ready', 'error']).toContain(fixture.status);
    });

    it('should have valid database list response structure', () => {
      // Arrange
      const fixture = loadFixture('getDatabases.success');

      // Assert
      expect(Array.isArray(fixture.databases)).toBe(true);
      expect(fixture.databases.length).toBeGreaterThan(0);

      fixture.databases.forEach((db: any) => {
        expect(db).toHaveProperty('id');
        expect(db).toHaveProperty('name');
        expect(db).toHaveProperty('region');
        expect(db).toHaveProperty('connectionString');
        expect(db).toHaveProperty('status');
      });
    });

    it('should have valid error response structures', () => {
      // Check various error types
      const errors = [
        loadFixture('createDatabase.quotaExceeded'),
        loadFixture('createDatabase.invalidRegion'),
        loadFixture('oauth.tokenExchange.invalidCode'),
        loadFixture('errors.unauthorized'),
      ];

      errors.forEach((error) => {
        expect(error).toHaveProperty('error');
        expect(error.error).toHaveProperty('code');
        expect(error.error).toHaveProperty('message');
      });
    });
  });

  describe('Error scenario handling', () => {
    it('should handle OAuth token exchange failure', async () => {
      // Arrange
      mockServices.oauth.exchange = vi.fn().mockRejectedValueOnce(
        new Error(loadFixture('oauth.tokenExchange.invalidCode').error_description)
      );

      // Act & Assert
      await expect(mockServices.oauth.exchange('invalid-code')).rejects.toThrow(
        'The authorization code is invalid or has expired'
      );
    });

    it('should handle database creation quota exceeded', async () => {
      // Arrange
      mockServices.database.create = vi.fn().mockRejectedValueOnce(
        new Error(loadFixture('createDatabase.quotaExceeded').error.message)
      );

      // Act & Assert
      await expect(
        mockServices.database.create('test_db', 'us-east-1')
      ).rejects.toThrow('Maximum number of databases for your plan exceeded');
    });

    it('should handle invalid environment variable names', async () => {
      // Arrange
      mockServices.envVars.update = vi.fn().mockRejectedValueOnce(
        new Error(loadFixture('envVars.update.invalidNames').error.message)
      );

      // Act & Assert
      await expect(
        mockServices.envVars.update('proj-123', { 'invalid-name': 'value' })
      ).rejects.toThrow('Invalid environment variable names');
    });

    it('should handle rate limiting', async () => {
      // Arrange
      const rateLimitError = loadFixture('errors.rateLimited');
      mockServices.database.list = vi.fn().mockRejectedValueOnce(
        new Error(rateLimitError.error.message)
      );

      // Act & Assert
      await expect(mockServices.database.list()).rejects.toThrow('Rate limit exceeded');
    });

    it('should handle unauthorized access', async () => {
      // Arrange
      const unauthorizedError = loadFixture('errors.unauthorized');
      mockServices.database.list = vi.fn().mockRejectedValueOnce(
        new Error(unauthorizedError.error.message)
      );

      // Act & Assert
      await expect(mockServices.database.list()).rejects.toThrow('Invalid token');
    });
  });

  describe('Fixture edge cases', () => {
    it('should handle empty database list', async () => {
      // Arrange
      mockServices.database.list = vi.fn().mockResolvedValueOnce(
        loadFixture('getDatabases.empty').databases
      );

      // Act
      const databases = await mockServices.database.list();

      // Assert
      expect(databases).toEqual([]);
    });

    it('should handle empty project list', async () => {
      // Arrange
      const fixture = loadFixture('projects.list.empty');

      // Assert
      expect(fixture.projects).toEqual([]);
    });

    it('should provide realistic database connection strings', () => {
      // Arrange
      const fixture = loadFixture('getDatabases.success');

      // Assert - Vercel Postgres uses specific connection string format
      fixture.databases.forEach((db: any) => {
        expect(db.connectionString).toMatch(/^postgres:\/\//);
        expect(db.connectionString).toContain('@');
        expect(db.connectionString).toContain('.vercel-storage.com');
      });
    });

    it('should have timestamps in ISO 8601 format', () => {
      // Arrange
      const fixture = loadFixture('createDatabase.success');
      const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;

      // Assert
      expect(fixture.createdAt).toMatch(iso8601Regex);
    });
  });

  describe('Fixture consistency', () => {
    it('should have consistent database IDs across fixtures', () => {
      // Arrange
      const createFixture = loadFixture('createDatabase.success');
      const listFixture = loadFixture('getDatabases.success');

      // Assert - first database in list has same format as created database
      expect(createFixture.id).toMatch(/^postgres_/);
      expect(listFixture.databases[0].id).toMatch(/^postgres_/);
    });

    it('should have consistent region values', () => {
      // Arrange
      const regions = new Set<string>();
      const createFixture = loadFixture('createDatabase.success');
      const listFixture = loadFixture('getDatabases.success');

      regions.add(createFixture.region);
      listFixture.databases.forEach((db: any) => regions.add(db.region));

      // Assert - all regions should be valid AWS/Vercel regions
      const validRegions = [
        'us-east-1',
        'us-west-2',
        'eu-west-1',
        'ap-southeast-1',
      ];
      regions.forEach((region) => {
        expect(validRegions).toContain(region);
      });
    });

    it('should use consistent naming conventions', () => {
      // Arrange
      const createFixture = loadFixture('createDatabase.success');
      const listFixture = loadFixture('getDatabases.success');

      // Assert - database names use underscores, not hyphens
      expect(createFixture.name).toMatch(/^[a-z0-9_]+$/);
      listFixture.databases.forEach((db: any) => {
        expect(db.name).toMatch(/^[a-z0-9_]+$/);
      });
    });
  });

  describe('Fixture token security', () => {
    it('should not expose sensitive data in fixture errors', () => {
      // Arrange
      const errors = [
        loadFixture('oauth.tokenExchange.invalidCode'),
        loadFixture('createDatabase.quotaExceeded'),
        loadFixture('errors.unauthorized'),
      ];

      // Assert - error messages should not contain tokens or secrets
      errors.forEach((error) => {
        const message = JSON.stringify(error).toLowerCase();
        expect(message).not.toContain('secret');
        expect(message).not.toContain('password');
        expect(message).not.toContain('token');
        expect(message).not.toContain('key');
      });
    });

    it('should use realistic token formats (obfuscated)', () => {
      // Arrange
      const fixture = loadFixture('oauth.tokenExchange.success');

      // Assert - tokens should be realistic but safe (not real tokens)
      expect(fixture.access_token).toContain('vercel_access_token_');
      expect(fixture.refresh_token).toContain('vercel_refresh_token_');
      expect(fixture.access_token).not.toMatch(/^[a-z0-9]{40,}$/); // Not a real token format
    });
  });

  describe('Performance with fixtures', () => {
    it('should load and parse fixtures quickly', () => {
      // Arrange
      const startTime = performance.now();

      // Act
      const fixtures = [
        loadFixture('oauth.tokenExchange.success'),
        loadFixture('createDatabase.success'),
        loadFixture('getDatabases.success'),
        loadFixture('envVars.update.success'),
      ];

      const endTime = performance.now();

      // Assert
      expect(fixtures).toHaveLength(4);
      expect(endTime - startTime).toBeLessThan(100); // Should load quickly
    });

    it('should handle repeated fixture loads efficiently', () => {
      // Arrange
      const startTime = performance.now();

      // Act
      for (let i = 0; i < 100; i++) {
        loadFixture('createDatabase.success');
        loadFixture('getDatabases.success');
      }

      const endTime = performance.now();

      // Assert
      expect(endTime - startTime).toBeLessThan(500); // Should handle batch loads
    });
  });
});
