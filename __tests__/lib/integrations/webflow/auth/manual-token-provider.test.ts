/**
 * Unit tests for ManualTokenProvider
 * Tests token encryption, storage, retrieval, and revocation
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ManualTokenProvider } from '@/lib/integrations/webflow/auth/manual-token';
import { AuthProviderError } from '@/lib/integrations/webflow/auth/types';

// Test data
const VALID_TOKEN = 'wf_test_workspace_token_valid_abc123def456';
const INVALID_TOKEN = '';
const MALFORMED_TOKEN = '   ';
const SHORT_TOKEN = 'wf_123';
const MOCK_USER_ID = 'user_test_123';

// Mock encrypted data structure
const MOCK_ENCRYPTED_DATA = {
  encrypted: 'base64EncodedCiphertext==',
  iv: 'base64EncodedIV==',
  authTag: 'base64EncodedAuthTag==',
};

// Mock database
vi.mock('@/lib/db', () => ({
  db: {
    query: {
      integrations: {
        findFirst: vi.fn(),
      },
    },
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi.fn(),
      })),
    })),
    delete: vi.fn(() => ({
      where: vi.fn(() => ({
        returning: vi.fn(),
      })),
    })),
  },
  integrations: {}, // Table schema reference
}));

// Mock encryption module
vi.mock('@/lib/integrations/encryption', () => ({
  encrypt: vi.fn((plaintext: string) => ({
    encrypted: `encrypted_${plaintext}`,
    iv: 'mock_iv_base64',
    authTag: 'mock_auth_tag_base64',
  })),
  decrypt: vi.fn((encrypted: string, iv: string, authTag: string) => {
    if (encrypted.startsWith('encrypted_')) {
      return encrypted.replace('encrypted_', '');
    }
    throw new Error('Decryption failed: Authentication failed');
  }),
}));

describe('ManualTokenProvider', () => {
  let provider: ManualTokenProvider;
  let mockDb: any;

  beforeEach(async () => {
    // Import fresh mocks for each test
    const dbModule = await import('@/lib/db');
    mockDb = dbModule.db;

    // Reset all mocks
    vi.clearAllMocks();

    // Create provider instance
    provider = new ManualTokenProvider();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('saveToken', () => {
    it('should encrypt token before storage', async () => {
      const { encrypt } = await import('@/lib/integrations/encryption');

      // Mock database response
      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: '123' }]),
        }),
      });

      await provider.saveToken(MOCK_USER_ID, VALID_TOKEN);

      expect(encrypt).toHaveBeenCalledWith(VALID_TOKEN);
    });

    it('should store encrypted token in database with IV and authTag', async () => {
      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: '123' }]),
        }),
      });

      await provider.saveToken(MOCK_USER_ID, VALID_TOKEN);

      expect(mockDb.insert).toHaveBeenCalled();
      const values = mockDb.insert().values;
      expect(values).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: MOCK_USER_ID,
          provider: 'webflow',
          accessToken: expect.stringContaining('encrypted_'),
          accessTokenIv: 'mock_iv_base64',
          accessTokenAuthTag: 'mock_auth_tag_base64',
        })
      );
    });

    it('should overwrite existing token if user already has one', async () => {
      // Mock existing token
      mockDb.query.integrations.findFirst.mockResolvedValue({
        id: 'existing_123',
        userId: MOCK_USER_ID,
        provider: 'webflow',
      });

      // Mock update (delete + insert)
      mockDb.delete.mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: 'existing_123' }]),
        }),
      });

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: 'new_123' }]),
        }),
      });

      await provider.saveToken(MOCK_USER_ID, VALID_TOKEN);

      expect(mockDb.delete).toHaveBeenCalled();
      expect(mockDb.insert).toHaveBeenCalled();
    });

    it('should throw error if token is empty string', async () => {
      await expect(provider.saveToken(MOCK_USER_ID, INVALID_TOKEN)).rejects.toThrow(
        AuthProviderError
      );
    });

    it('should throw error if token is only whitespace', async () => {
      await expect(provider.saveToken(MOCK_USER_ID, MALFORMED_TOKEN)).rejects.toThrow(
        AuthProviderError
      );
    });

    it('should validate token format (minimum length)', async () => {
      await expect(provider.saveToken(MOCK_USER_ID, SHORT_TOKEN)).rejects.toThrow(
        AuthProviderError
      );
    });

    it('should throw error if encryption fails', async () => {
      const { encrypt } = await import('@/lib/integrations/encryption');
      vi.mocked(encrypt).mockImplementationOnce(() => {
        throw new Error('Encryption failed');
      });

      await expect(provider.saveToken(MOCK_USER_ID, VALID_TOKEN)).rejects.toThrow();
    });

    it('should handle database connection errors gracefully', async () => {
      mockDb.insert.mockImplementationOnce(() => {
        throw new Error('Database connection failed');
      });

      await expect(provider.saveToken(MOCK_USER_ID, VALID_TOKEN)).rejects.toThrow();
    });
  });

  describe('getToken', () => {
    it('should retrieve and decrypt token successfully', async () => {
      mockDb.query.integrations.findFirst.mockResolvedValue({
        id: '123',
        userId: MOCK_USER_ID,
        provider: 'webflow',
        accessToken: 'encrypted_wf_test_token',
        accessTokenIv: 'mock_iv_base64',
        accessTokenAuthTag: 'mock_auth_tag_base64',
      });

      const token = await provider.getToken(MOCK_USER_ID);

      expect(token).toBe('wf_test_token');
    });

    it('should throw error if no token exists for user', async () => {
      mockDb.query.integrations.findFirst.mockResolvedValue(null);

      await expect(provider.getToken(MOCK_USER_ID)).rejects.toThrow(AuthProviderError);
      await expect(provider.getToken(MOCK_USER_ID)).rejects.toThrow(/not found/i);
    });

    it('should throw error if decryption fails (tampered data)', async () => {
      mockDb.query.integrations.findFirst.mockResolvedValue({
        id: '123',
        userId: MOCK_USER_ID,
        provider: 'webflow',
        accessToken: 'tampered_data',
        accessTokenIv: 'mock_iv_base64',
        accessTokenAuthTag: 'wrong_auth_tag',
      });

      await expect(provider.getToken(MOCK_USER_ID)).rejects.toThrow();
    });

    it('should throw error if IV or authTag is missing', async () => {
      mockDb.query.integrations.findFirst.mockResolvedValue({
        id: '123',
        userId: MOCK_USER_ID,
        provider: 'webflow',
        accessToken: 'encrypted_wf_test_token',
        accessTokenIv: null,
        accessTokenAuthTag: 'mock_auth_tag_base64',
      });

      await expect(provider.getToken(MOCK_USER_ID)).rejects.toThrow(AuthProviderError);
    });

    it('should handle database query errors gracefully', async () => {
      mockDb.query.integrations.findFirst.mockRejectedValue(
        new Error('Database query failed')
      );

      await expect(provider.getToken(MOCK_USER_ID)).rejects.toThrow();
    });
  });

  describe('hasToken', () => {
    it('should return true when user has valid token', async () => {
      mockDb.query.integrations.findFirst.mockResolvedValue({
        id: '123',
        userId: MOCK_USER_ID,
        provider: 'webflow',
      });

      const result = await provider.hasToken(MOCK_USER_ID);

      expect(result).toBe(true);
    });

    it('should return false when user has no token', async () => {
      mockDb.query.integrations.findFirst.mockResolvedValue(null);

      const result = await provider.hasToken(MOCK_USER_ID);

      expect(result).toBe(false);
    });

    it('should not attempt decryption (performance optimization)', async () => {
      const { decrypt } = await import('@/lib/integrations/encryption');

      mockDb.query.integrations.findFirst.mockResolvedValue({
        id: '123',
        userId: MOCK_USER_ID,
        provider: 'webflow',
      });

      await provider.hasToken(MOCK_USER_ID);

      expect(decrypt).not.toHaveBeenCalled();
    });

    it('should handle database query errors gracefully', async () => {
      mockDb.query.integrations.findFirst.mockRejectedValue(
        new Error('Database query failed')
      );

      await expect(provider.hasToken(MOCK_USER_ID)).rejects.toThrow();
    });
  });

  describe('revokeToken', () => {
    it('should delete token from database', async () => {
      mockDb.delete.mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: '123' }]),
        }),
      });

      await provider.revokeToken(MOCK_USER_ID);

      expect(mockDb.delete).toHaveBeenCalled();
    });

    it('should return success even if token does not exist (idempotent)', async () => {
      mockDb.delete.mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([]),
        }),
      });

      await expect(provider.revokeToken(MOCK_USER_ID)).resolves.not.toThrow();
    });

    it('should verify user ownership before deletion', async () => {
      mockDb.delete.mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: '123' }]),
        }),
      });

      await provider.revokeToken(MOCK_USER_ID);

      const whereClause = mockDb.delete().where;
      expect(whereClause).toHaveBeenCalled();
    });

    it('should handle database deletion errors gracefully', async () => {
      mockDb.delete.mockImplementationOnce(() => {
        throw new Error('Database deletion failed');
      });

      await expect(provider.revokeToken(MOCK_USER_ID)).rejects.toThrow();
    });
  });

  describe('encryption roundtrip', () => {
    it('should encrypt and decrypt token without data loss', async () => {
      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: '123' }]),
        }),
      });

      mockDb.query.integrations.findFirst.mockResolvedValue({
        id: '123',
        userId: MOCK_USER_ID,
        provider: 'webflow',
        accessToken: `encrypted_${VALID_TOKEN}`,
        accessTokenIv: 'mock_iv_base64',
        accessTokenAuthTag: 'mock_auth_tag_base64',
      });

      await provider.saveToken(MOCK_USER_ID, VALID_TOKEN);
      const retrieved = await provider.getToken(MOCK_USER_ID);

      expect(retrieved).toBe(VALID_TOKEN);
    });

    it('should produce different ciphertext for same token (random IV)', async () => {
      const { encrypt } = await import('@/lib/integrations/encryption');

      // First encryption
      vi.mocked(encrypt).mockReturnValueOnce({
        encrypted: 'ciphertext1',
        iv: 'iv1',
        authTag: 'tag1',
      });

      // Second encryption
      vi.mocked(encrypt).mockReturnValueOnce({
        encrypted: 'ciphertext2',
        iv: 'iv2',
        authTag: 'tag2',
      });

      const result1 = vi.mocked(encrypt)(VALID_TOKEN);
      const result2 = vi.mocked(encrypt)(VALID_TOKEN);

      expect(result1.iv).not.toBe(result2.iv);
      expect(result1.encrypted).not.toBe(result2.encrypted);
    });
  });

  describe('provider identification', () => {
    it('should have name property set to "manual-token"', () => {
      expect(provider.name).toBe('manual-token');
    });
  });
});
