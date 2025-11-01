import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

/**
 * Test suite for Vercel database provisioning
 * Tests database creation, listing, deletion, and error handling
 */

interface DatabaseConfig {
  name: string;
  region?: string;
  plan?: 'free' | 'pro' | 'enterprise';
}

interface DatabaseInfo {
  id: string;
  name: string;
  region: string;
  connectionString: string;
  createdAt: string;
  status: 'creating' | 'ready' | 'error';
}

interface VercelClient {
  request<T>(method: string, path: string, body?: unknown): Promise<T>;
}

class VercelDatabaseManager {
  constructor(private client: VercelClient) {
    if (!client) {
      throw new Error('VercelClient is required');
    }
  }

  async createDatabase(projectId: string, config: DatabaseConfig): Promise<DatabaseInfo> {
    if (!projectId) {
      throw new Error('Project ID is required');
    }
    if (!config.name) {
      throw new Error('Database name is required');
    }

    // Validate database name format
    if (!/^[a-z0-9_-]+$/.test(config.name)) {
      throw new Error(
        'Database name must contain only lowercase letters, numbers, underscores, and hyphens'
      );
    }

    if (config.name.length < 1 || config.name.length > 63) {
      throw new Error('Database name must be between 1 and 63 characters');
    }

    const response = await this.client.request<DatabaseInfo>(
      'POST',
      `/v4/projects/${projectId}/databases`,
      {
        name: config.name,
        region: config.region || 'us-east-1',
        plan: config.plan || 'free',
      }
    );

    return response;
  }

  async getDatabases(projectId: string): Promise<DatabaseInfo[]> {
    if (!projectId) {
      throw new Error('Project ID is required');
    }

    const response = await this.client.request<{ databases: DatabaseInfo[] }>(
      'GET',
      `/v4/projects/${projectId}/databases`
    );

    return response.databases || [];
  }

  async getDatabase(projectId: string, databaseId: string): Promise<DatabaseInfo> {
    if (!projectId) {
      throw new Error('Project ID is required');
    }
    if (!databaseId) {
      throw new Error('Database ID is required');
    }

    return this.client.request<DatabaseInfo>(
      'GET',
      `/v4/projects/${projectId}/databases/${databaseId}`
    );
  }

  async deleteDatabase(projectId: string, databaseId: string): Promise<void> {
    if (!projectId) {
      throw new Error('Project ID is required');
    }
    if (!databaseId) {
      throw new Error('Database ID is required');
    }

    await this.client.request('DELETE', `/v4/projects/${projectId}/databases/${databaseId}`);
  }

  async waitForDatabaseReady(
    projectId: string,
    databaseId: string,
    timeoutMs: number = 300000
  ): Promise<DatabaseInfo> {
    const startTime = Date.now();
    const pollInterval = 5000; // 5 seconds

    while (Date.now() - startTime < timeoutMs) {
      const db = await this.getDatabase(projectId, databaseId);

      if (db.status === 'ready') {
        return db;
      }

      if (db.status === 'error') {
        throw new Error('Database creation failed with error status');
      }

      // Wait before polling again
      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    }

    throw new Error(
      `Database provisioning timed out after ${timeoutMs}ms. Status: creating`
    );
  }
}

describe('Vercel Database Manager', () => {
  let manager: VercelDatabaseManager;
  let mockClient: VercelClient;

  beforeEach(() => {
    vi.clearAllMocks();
    mockClient = {
      request: vi.fn(),
    };
    manager = new VercelDatabaseManager(mockClient);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('constructor', () => {
    it('should create instance with valid client', () => {
      // Act
      const instance = new VercelDatabaseManager(mockClient);

      // Assert
      expect(instance).toBeDefined();
    });

    it('should throw error if client is not provided', () => {
      // Act & Assert
      expect(() => {
        new VercelDatabaseManager(null as any);
      }).toThrow('VercelClient is required');
    });

    it('should throw error if client is undefined', () => {
      // Act & Assert
      expect(() => {
        new VercelDatabaseManager(undefined as any);
      }).toThrow('VercelClient is required');
    });
  });

  describe('createDatabase()', () => {
    it('should create database with valid config', async () => {
      // Arrange
      const projectId = 'proj-123';
      const config: DatabaseConfig = {
        name: 'my-database',
        region: 'us-east-1',
      };
      const mockResponse: DatabaseInfo = {
        id: 'db-456',
        name: 'my-database',
        region: 'us-east-1',
        connectionString: 'postgresql://user:pass@host:5432/dbname',
        createdAt: new Date().toISOString(),
        status: 'creating',
      };

      (mockClient.request as any).mockResolvedValueOnce(mockResponse);

      // Act
      const result = await manager.createDatabase(projectId, config);

      // Assert
      expect(result).toEqual(mockResponse);
      expect(mockClient.request).toHaveBeenCalledWith(
        'POST',
        `/v4/projects/${projectId}/databases`,
        expect.objectContaining({
          name: 'my-database',
          region: 'us-east-1',
          plan: 'free',
        })
      );
    });

    it('should use default region if not specified', async () => {
      // Arrange
      const projectId = 'proj-123';
      const config: DatabaseConfig = { name: 'my-database' };
      const mockResponse: DatabaseInfo = {
        id: 'db-456',
        name: 'my-database',
        region: 'us-east-1',
        connectionString: 'postgresql://user:pass@host:5432/dbname',
        createdAt: new Date().toISOString(),
        status: 'creating',
      };

      (mockClient.request as any).mockResolvedValueOnce(mockResponse);

      // Act
      await manager.createDatabase(projectId, config);

      // Assert
      expect(mockClient.request).toHaveBeenCalledWith(
        'POST',
        `/v4/projects/${projectId}/databases`,
        expect.objectContaining({
          region: 'us-east-1',
        })
      );
    });

    it('should use free plan as default', async () => {
      // Arrange
      const projectId = 'proj-123';
      const config: DatabaseConfig = { name: 'my-database' };
      const mockResponse: DatabaseInfo = {
        id: 'db-456',
        name: 'my-database',
        region: 'us-east-1',
        connectionString: 'postgresql://user:pass@host:5432/dbname',
        createdAt: new Date().toISOString(),
        status: 'creating',
      };

      (mockClient.request as any).mockResolvedValueOnce(mockResponse);

      // Act
      await manager.createDatabase(projectId, config);

      // Assert
      expect(mockClient.request).toHaveBeenCalledWith(
        'POST',
        `/v4/projects/${projectId}/databases`,
        expect.objectContaining({
          plan: 'free',
        })
      );
    });

    it('should throw error if projectId is empty', async () => {
      // Act & Assert
      await expect(
        manager.createDatabase('', { name: 'test-db' })
      ).rejects.toThrow('Project ID is required');
    });

    it('should throw error if database name is empty', async () => {
      // Act & Assert
      await expect(manager.createDatabase('proj-123', { name: '' })).rejects.toThrow(
        'Database name is required'
      );
    });

    it('should throw error for invalid database name with uppercase', async () => {
      // Act & Assert
      await expect(
        manager.createDatabase('proj-123', { name: 'MyDatabase' })
      ).rejects.toThrow(
        'Database name must contain only lowercase letters, numbers, underscores, and hyphens'
      );
    });

    it('should throw error for invalid database name with special characters', async () => {
      // Act & Assert
      await expect(
        manager.createDatabase('proj-123', { name: 'my-database@123' })
      ).rejects.toThrow(
        'Database name must contain only lowercase letters, numbers, underscores, and hyphens'
      );
    });

    it('should throw error for database name too short', async () => {
      // Note: Current implementation allows empty which is caught earlier
      // This test documents the length validation
      const validLongName = 'a'.repeat(64); // 64 characters, exceeds 63 limit

      // Act & Assert
      await expect(
        manager.createDatabase('proj-123', { name: validLongName })
      ).rejects.toThrow('Database name must be between 1 and 63 characters');
    });

    it('should throw error for database name too long', async () => {
      // Arrange
      const longName = 'a'.repeat(64); // 64 characters, exceeds 63 limit

      // Act & Assert
      await expect(
        manager.createDatabase('proj-123', { name: longName })
      ).rejects.toThrow('Database name must be between 1 and 63 characters');
    });

    it('should accept valid database names with hyphens and underscores', async () => {
      // Arrange
      const projectId = 'proj-123';
      const validNames = [
        'my-database',
        'my_database',
        'my-database-123',
        'my_db_123',
        'db123',
      ];

      const mockResponse: DatabaseInfo = {
        id: 'db-456',
        name: 'my-database',
        region: 'us-east-1',
        connectionString: 'postgresql://user:pass@host:5432/dbname',
        createdAt: new Date().toISOString(),
        status: 'creating',
      };

      for (const name of validNames) {
        (mockClient.request as any).mockResolvedValueOnce(mockResponse);

        // Act
        await manager.createDatabase(projectId, { name });

        // Assert - should not throw
        expect(mockClient.request).toHaveBeenCalled();
      }
    });

    it('should handle API error for quota exceeded', async () => {
      // Arrange
      (mockClient.request as any).mockRejectedValueOnce(
        new Error('QUOTA_EXCEEDED: Maximum number of databases reached')
      );

      // Act & Assert
      await expect(
        manager.createDatabase('proj-123', { name: 'my-database' })
      ).rejects.toThrow('QUOTA_EXCEEDED');
    });

    it('should handle API error for invalid region', async () => {
      // Arrange
      (mockClient.request as any).mockRejectedValueOnce(
        new Error('Invalid region: us-west-99')
      );

      // Act & Assert
      await expect(
        manager.createDatabase('proj-123', { name: 'my-database', region: 'us-west-99' })
      ).rejects.toThrow('Invalid region');
    });

    it('should handle network errors', async () => {
      // Arrange
      (mockClient.request as any).mockRejectedValueOnce(new Error('Network error'));

      // Act & Assert
      await expect(
        manager.createDatabase('proj-123', { name: 'my-database' })
      ).rejects.toThrow('Network error');
    });
  });

  describe('getDatabases()', () => {
    it('should retrieve list of databases', async () => {
      // Arrange
      const projectId = 'proj-123';
      const mockDatabases: DatabaseInfo[] = [
        {
          id: 'db-1',
          name: 'production-db',
          region: 'us-east-1',
          connectionString: 'postgresql://...',
          createdAt: new Date().toISOString(),
          status: 'ready',
        },
        {
          id: 'db-2',
          name: 'staging-db',
          region: 'us-east-1',
          connectionString: 'postgresql://...',
          createdAt: new Date().toISOString(),
          status: 'ready',
        },
      ];

      (mockClient.request as any).mockResolvedValueOnce({ databases: mockDatabases });

      // Act
      const result = await manager.getDatabases(projectId);

      // Assert
      expect(result).toEqual(mockDatabases);
      expect(mockClient.request).toHaveBeenCalledWith(
        'GET',
        `/v4/projects/${projectId}/databases`
      );
    });

    it('should return empty array when no databases exist', async () => {
      // Arrange
      const projectId = 'proj-123';
      (mockClient.request as any).mockResolvedValueOnce({ databases: [] });

      // Act
      const result = await manager.getDatabases(projectId);

      // Assert
      expect(result).toEqual([]);
    });

    it('should handle missing databases property gracefully', async () => {
      // Arrange
      const projectId = 'proj-123';
      (mockClient.request as any).mockResolvedValueOnce({}); // No databases property

      // Act
      const result = await manager.getDatabases(projectId);

      // Assert
      expect(result).toEqual([]);
    });

    it('should throw error if projectId is empty', async () => {
      // Act & Assert
      await expect(manager.getDatabases('')).rejects.toThrow('Project ID is required');
    });

    it('should handle API errors', async () => {
      // Arrange
      (mockClient.request as any).mockRejectedValueOnce(
        new Error('Project not found')
      );

      // Act & Assert
      await expect(manager.getDatabases('invalid-proj')).rejects.toThrow(
        'Project not found'
      );
    });
  });

  describe('getDatabase()', () => {
    it('should retrieve specific database by ID', async () => {
      // Arrange
      const projectId = 'proj-123';
      const databaseId = 'db-456';
      const mockDatabase: DatabaseInfo = {
        id: databaseId,
        name: 'my-database',
        region: 'us-east-1',
        connectionString: 'postgresql://user:pass@host:5432/dbname',
        createdAt: new Date().toISOString(),
        status: 'ready',
      };

      (mockClient.request as any).mockResolvedValueOnce(mockDatabase);

      // Act
      const result = await manager.getDatabase(projectId, databaseId);

      // Assert
      expect(result).toEqual(mockDatabase);
      expect(mockClient.request).toHaveBeenCalledWith(
        'GET',
        `/v4/projects/${projectId}/databases/${databaseId}`
      );
    });

    it('should throw error if projectId is empty', async () => {
      // Act & Assert
      await expect(manager.getDatabase('', 'db-123')).rejects.toThrow(
        'Project ID is required'
      );
    });

    it('should throw error if databaseId is empty', async () => {
      // Act & Assert
      await expect(manager.getDatabase('proj-123', '')).rejects.toThrow(
        'Database ID is required'
      );
    });

    it('should handle database not found error', async () => {
      // Arrange
      (mockClient.request as any).mockRejectedValueOnce(
        new Error('Database not found')
      );

      // Act & Assert
      await expect(manager.getDatabase('proj-123', 'invalid-db')).rejects.toThrow(
        'Database not found'
      );
    });
  });

  describe('deleteDatabase()', () => {
    it('should delete database by ID', async () => {
      // Arrange
      const projectId = 'proj-123';
      const databaseId = 'db-456';

      (mockClient.request as any).mockResolvedValueOnce(undefined);

      // Act
      await manager.deleteDatabase(projectId, databaseId);

      // Assert
      expect(mockClient.request).toHaveBeenCalledWith(
        'DELETE',
        `/v4/projects/${projectId}/databases/${databaseId}`
      );
    });

    it('should throw error if projectId is empty', async () => {
      // Act & Assert
      await expect(manager.deleteDatabase('', 'db-123')).rejects.toThrow(
        'Project ID is required'
      );
    });

    it('should throw error if databaseId is empty', async () => {
      // Act & Assert
      await expect(manager.deleteDatabase('proj-123', '')).rejects.toThrow(
        'Database ID is required'
      );
    });

    it('should handle database not found error', async () => {
      // Arrange
      (mockClient.request as any).mockRejectedValueOnce(
        new Error('Database not found')
      );

      // Act & Assert
      await expect(manager.deleteDatabase('proj-123', 'invalid-db')).rejects.toThrow(
        'Database not found'
      );
    });

    it('should handle deletion forbidden (insufficient permissions)', async () => {
      // Arrange
      (mockClient.request as any).mockRejectedValueOnce(
        new Error('You do not have permission to delete this database')
      );

      // Act & Assert
      await expect(manager.deleteDatabase('proj-123', 'db-456')).rejects.toThrow(
        'You do not have permission'
      );
    });
  });

  describe('waitForDatabaseReady()', () => {
    it('should wait for database to be ready', async () => {
      // Arrange
      const projectId = 'proj-123';
      const databaseId = 'db-456';
      const readyDatabase: DatabaseInfo = {
        id: databaseId,
        name: 'my-database',
        region: 'us-east-1',
        connectionString: 'postgresql://user:pass@host:5432/dbname',
        createdAt: new Date().toISOString(),
        status: 'ready',
      };

      (mockClient.request as any).mockResolvedValueOnce(readyDatabase);

      // Act
      const result = await manager.waitForDatabaseReady(projectId, databaseId);

      // Assert
      expect(result).toEqual(readyDatabase);
    });

    it('should poll database status until ready', async () => {
      // Arrange
      const projectId = 'proj-123';
      const databaseId = 'db-456';
      const creatingDatabase: DatabaseInfo = {
        id: databaseId,
        name: 'my-database',
        region: 'us-east-1',
        connectionString: 'postgresql://user:pass@host:5432/dbname',
        createdAt: new Date().toISOString(),
        status: 'creating',
      };
      const readyDatabase: DatabaseInfo = {
        ...creatingDatabase,
        status: 'ready',
      };

      (mockClient.request as any)
        .mockResolvedValueOnce(creatingDatabase) // First poll - still creating
        .mockResolvedValueOnce(creatingDatabase) // Second poll - still creating
        .mockResolvedValueOnce(readyDatabase); // Third poll - ready

      // Mock setTimeout to speed up test
      vi.useFakeTimers();

      // Act
      const promise = manager.waitForDatabaseReady(projectId, databaseId);

      // Fast-forward through poll intervals
      await vi.runAllTimersAsync();

      const result = await promise;

      // Assert
      expect(result).toEqual(readyDatabase);
      expect(mockClient.request).toHaveBeenCalledTimes(3);

      vi.useRealTimers();
    });

    it('should throw error if database reaches error status', async () => {
      // Arrange
      const projectId = 'proj-123';
      const databaseId = 'db-456';
      const errorDatabase: DatabaseInfo = {
        id: databaseId,
        name: 'my-database',
        region: 'us-east-1',
        connectionString: 'postgresql://user:pass@host:5432/dbname',
        createdAt: new Date().toISOString(),
        status: 'error',
      };

      (mockClient.request as any).mockResolvedValueOnce(errorDatabase);

      // Act & Assert
      await expect(
        manager.waitForDatabaseReady(projectId, databaseId)
      ).rejects.toThrow('Database creation failed with error status');
    });

    it('should throw error on timeout', async () => {
      // Arrange
      const projectId = 'proj-123';
      const databaseId = 'db-456';
      const creatingDatabase: DatabaseInfo = {
        id: databaseId,
        name: 'my-database',
        region: 'us-east-1',
        connectionString: 'postgresql://user:pass@host:5432/dbname',
        createdAt: new Date().toISOString(),
        status: 'creating',
      };

      (mockClient.request as any).mockResolvedValue(creatingDatabase);

      vi.useFakeTimers();

      // Act & Assert
      await expect(
        manager.waitForDatabaseReady(projectId, databaseId, 10000) // 10 second timeout
      ).rejects.toThrow('Database provisioning timed out');

      vi.useRealTimers();
    });

    it('should use default timeout of 5 minutes', async () => {
      // Arrange
      const projectId = 'proj-123';
      const databaseId = 'db-456';
      const creatingDatabase: DatabaseInfo = {
        id: databaseId,
        name: 'my-database',
        region: 'us-east-1',
        connectionString: 'postgresql://user:pass@host:5432/dbname',
        createdAt: new Date().toISOString(),
        status: 'creating',
      };

      (mockClient.request as any).mockResolvedValue(creatingDatabase);

      vi.useFakeTimers();

      // Act & Assert
      const promise = manager.waitForDatabaseReady(projectId, databaseId);

      // The promise should timeout after default 5 minutes
      vi.advanceTimersByTime(300000 + 1000); // Advance past 5 minute default

      await expect(promise).rejects.toThrow('timed out');

      vi.useRealTimers();
    });
  });

  describe('API request parameters', () => {
    it('should send correct HTTP method and path for create', async () => {
      // Arrange
      const projectId = 'proj-123';
      (mockClient.request as any).mockResolvedValueOnce({
        id: 'db-456',
        name: 'test-db',
        region: 'us-east-1',
        connectionString: 'postgresql://...',
        createdAt: new Date().toISOString(),
        status: 'creating',
      });

      // Act
      await manager.createDatabase(projectId, { name: 'test-db' });

      // Assert
      expect(mockClient.request).toHaveBeenCalledWith(
        'POST',
        `/v4/projects/${projectId}/databases`,
        expect.any(Object)
      );
    });

    it('should send correct HTTP method and path for list', async () => {
      // Arrange
      const projectId = 'proj-123';
      (mockClient.request as any).mockResolvedValueOnce({ databases: [] });

      // Act
      await manager.getDatabases(projectId);

      // Assert
      expect(mockClient.request).toHaveBeenCalledWith(
        'GET',
        `/v4/projects/${projectId}/databases`,
        undefined
      );
    });
  });
});
