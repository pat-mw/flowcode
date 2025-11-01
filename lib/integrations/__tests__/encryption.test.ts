import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import crypto from 'crypto';

/**
 * Test suite for encryption module
 * Tests AES-256-GCM encryption/decryption functionality
 */

// Mock encryption key (32 bytes for AES-256)
const MOCK_ENCRYPTION_KEY = crypto.randomBytes(32).toString('hex');

// Helper functions that will be tested
function encrypt(data: string): { encrypted: string; iv: string; authTag: string } {
  const key = Buffer.from(MOCK_ENCRYPTION_KEY, 'hex');
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
  };
}

function decrypt(encrypted: string, iv: string, authTag: string): string {
  const key = Buffer.from(MOCK_ENCRYPTION_KEY, 'hex');
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    key,
    Buffer.from(iv, 'hex')
  );

  decipher.setAuthTag(Buffer.from(authTag, 'hex'));

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

describe('Encryption Module', () => {
  describe('encrypt()', () => {
    it('should encrypt data and return encrypted string, IV, and auth tag', () => {
      // Arrange
      const plaintext = 'test-token-value-12345';

      // Act
      const result = encrypt(plaintext);

      // Assert
      expect(result).toHaveProperty('encrypted');
      expect(result).toHaveProperty('iv');
      expect(result).toHaveProperty('authTag');
      expect(typeof result.encrypted).toBe('string');
      expect(typeof result.iv).toBe('string');
      expect(typeof result.authTag).toBe('string');
    });

    it('should produce different ciphertexts for same plaintext (different IVs)', () => {
      // Arrange
      const plaintext = 'test-token';

      // Act
      const result1 = encrypt(plaintext);
      const result2 = encrypt(plaintext);

      // Assert
      expect(result1.encrypted).not.toBe(result2.encrypted);
      expect(result1.iv).not.toBe(result2.iv);
      expect(result1.authTag).not.toBe(result2.authTag);
    });

    it('should handle empty strings', () => {
      // Arrange
      const plaintext = '';

      // Act
      const result = encrypt(plaintext);

      // Assert
      expect(result.encrypted).toBeDefined();
      expect(result.iv).toBeDefined();
      expect(result.authTag).toBeDefined();
    });

    it('should handle special characters and unicode', () => {
      // Arrange
      const plaintext = 'Token with special chars: !@#$%^&*()_+-={}[]|:;"<>,.?/~`';

      // Act
      const result = encrypt(plaintext);

      // Assert
      expect(result.encrypted).toBeDefined();
      expect(result.iv).toBeDefined();
      expect(result.authTag).toBeDefined();
    });

    it('should handle unicode characters', () => {
      // Arrange
      const plaintext = 'Token with emoji: 🔐 and Chinese: 加密 and Arabic: تشفير';

      // Act
      const result = encrypt(plaintext);

      // Assert
      expect(result.encrypted).toBeDefined();
      expect(result.iv).toBeDefined();
      expect(result.authTag).toBeDefined();
    });

    it('should handle long tokens (1000+ characters)', () => {
      // Arrange
      const plaintext = 'x'.repeat(1000) + 'vercel-api-token-xyz';

      // Act
      const result = encrypt(plaintext);

      // Assert
      expect(result.encrypted).toBeDefined();
      expect(result.encrypted.length).toBeGreaterThan(0);
    });
  });

  describe('decrypt()', () => {
    it('should decrypt encrypted data correctly', () => {
      // Arrange
      const plaintext = 'test-vercel-token-abc123';
      const { encrypted, iv, authTag } = encrypt(plaintext);

      // Act
      const decrypted = decrypt(encrypted, iv, authTag);

      // Assert
      expect(decrypted).toBe(plaintext);
    });

    it('should decrypt special characters correctly', () => {
      // Arrange
      const plaintext = 'Token: !@#$%^&*()_+-=[]{}|;:",./<>?~`';
      const { encrypted, iv, authTag } = encrypt(plaintext);

      // Act
      const decrypted = decrypt(encrypted, iv, authTag);

      // Assert
      expect(decrypted).toBe(plaintext);
    });

    it('should decrypt unicode characters correctly', () => {
      // Arrange
      const plaintext = 'Unicode: 🔐加密تشفير';
      const { encrypted, iv, authTag } = encrypt(plaintext);

      // Act
      const decrypted = decrypt(encrypted, iv, authTag);

      // Assert
      expect(decrypted).toBe(plaintext);
    });

    it('should decrypt empty strings', () => {
      // Arrange
      const plaintext = '';
      const { encrypted, iv, authTag } = encrypt(plaintext);

      // Act
      const decrypted = decrypt(encrypted, iv, authTag);

      // Assert
      expect(decrypted).toBe(plaintext);
    });

    it('should throw error with corrupted ciphertext', () => {
      // Arrange
      const plaintext = 'test-token';
      const { encrypted, iv, authTag } = encrypt(plaintext);
      const corruptedCiphertext = encrypted.slice(0, -4) + 'ffff'; // Corrupt last 2 bytes

      // Act & Assert
      expect(() => {
        decrypt(corruptedCiphertext, iv, authTag);
      }).toThrow();
    });

    it('should throw error with corrupted auth tag', () => {
      // Arrange
      const plaintext = 'test-token';
      const { encrypted, iv, authTag } = encrypt(plaintext);
      const corruptedAuthTag = authTag.slice(0, -4) + 'ffff'; // Corrupt last 2 bytes

      // Act & Assert
      expect(() => {
        decrypt(encrypted, iv, corruptedAuthTag);
      }).toThrow();
    });

    it('should throw error with corrupted IV', () => {
      // Arrange
      const plaintext = 'test-token';
      const { encrypted, iv, authTag } = encrypt(plaintext);
      const corruptedIV = iv.slice(0, -4) + 'ffff'; // Corrupt last 2 bytes

      // Act & Assert
      expect(() => {
        decrypt(encrypted, corruptedIV, authTag);
      }).toThrow();
    });

    it('should throw error with wrong auth tag', () => {
      // Arrange
      const plaintext = 'test-token';
      const { encrypted, iv } = encrypt(plaintext);
      const wrongAuthTag = crypto.randomBytes(16).toString('hex');

      // Act & Assert
      expect(() => {
        decrypt(encrypted, iv, wrongAuthTag);
      }).toThrow();
    });

    it('should throw error with invalid IV format', () => {
      // Arrange
      const encrypted = 'someciphertext';
      const iv = 'not-a-valid-hex';
      const authTag = 'also-invalid';

      // Act & Assert
      expect(() => {
        decrypt(encrypted, iv, authTag);
      }).toThrow();
    });

    it('should throw error with invalid hex encoding', () => {
      // Arrange
      const encrypted = 'not-hex-GGGG';
      const iv = 'not-hex-GGGG';
      const authTag = 'not-hex-GGGG';

      // Act & Assert
      expect(() => {
        decrypt(encrypted, iv, authTag);
      }).toThrow();
    });
  });

  describe('Round-trip encryption/decryption', () => {
    it('should correctly encrypt and decrypt arbitrary data', () => {
      // Arrange
      const testCases = [
        'simple-token',
        'token_with_underscores',
        'token-with-dashes',
        '12345-67890',
        'UPPERCASE_TOKEN',
        'mixed_Case_Token',
        'very-long-token-' + 'x'.repeat(500),
        'token!@#$%^&*()',
        'https://example.com/callback?code=abc123',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0', // JWT-like
      ];

      testCases.forEach((testCase) => {
        // Act
        const { encrypted, iv, authTag } = encrypt(testCase);
        const decrypted = decrypt(encrypted, iv, authTag);

        // Assert
        expect(decrypted).toBe(testCase);
      });
    });

    it('should maintain data integrity for sensitive tokens', () => {
      // Arrange
      const sensitiveToken = 'vercel_pw_abc123def456ghi789jkl012mno345';

      // Act
      const { encrypted, iv, authTag } = encrypt(sensitiveToken);
      const decrypted = decrypt(encrypted, iv, authTag);

      // Assert
      expect(decrypted).toBe(sensitiveToken);
      expect(encrypted).not.toContain(sensitiveToken);
      expect(iv).not.toContain(sensitiveToken);
    });

    it('should not leak plaintext in encrypted output', () => {
      // Arrange
      const plaintext = 'secret-token-12345';

      // Act
      const { encrypted, iv, authTag } = encrypt(plaintext);

      // Assert
      expect(encrypted).not.toContain(plaintext);
      expect(iv).not.toContain(plaintext);
      expect(authTag).not.toContain(plaintext);
    });
  });

  describe('Key management', () => {
    it('should use correct encryption key', () => {
      // This test ensures the encryption key is used consistently
      // Arrange
      const plaintext = 'test-token';
      const { encrypted, iv, authTag } = encrypt(plaintext);

      // Act
      const decrypted = decrypt(encrypted, iv, authTag);

      // Assert
      expect(decrypted).toBe(plaintext);
    });

    it('should fail to decrypt with different key', () => {
      // Arrange
      const plaintext = 'test-token';
      const { encrypted, iv, authTag } = encrypt(plaintext);

      // Create a function with different key to simulate wrong key
      const decryptWithWrongKey = (
        encrypted: string,
        iv: string,
        authTag: string
      ) => {
        const wrongKey = crypto.randomBytes(32); // Different random key
        const decipher = crypto.createDecipheriv(
          'aes-256-gcm',
          wrongKey,
          Buffer.from(iv, 'hex')
        );
        decipher.setAuthTag(Buffer.from(authTag, 'hex'));
        return decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8');
      };

      // Act & Assert
      expect(() => {
        decryptWithWrongKey(encrypted, iv, authTag);
      }).toThrow();
    });
  });

  describe('Performance', () => {
    it('should encrypt and decrypt reasonably fast', () => {
      // Arrange
      const plaintext = 'test-token-' + 'x'.repeat(200);
      const iterations = 100;

      // Act
      const startEncrypt = performance.now();
      const encryptedResults = [];
      for (let i = 0; i < iterations; i++) {
        encryptedResults.push(encrypt(plaintext));
      }
      const endEncrypt = performance.now();

      const startDecrypt = performance.now();
      encryptedResults.forEach((result) => {
        decrypt(result.encrypted, result.iv, result.authTag);
      });
      const endDecrypt = performance.now();

      // Assert
      const encryptTime = endEncrypt - startEncrypt;
      const decryptTime = endDecrypt - startDecrypt;

      // Encryption and decryption should complete in reasonable time
      expect(encryptTime).toBeLessThan(5000); // Less than 5 seconds for 100 operations
      expect(decryptTime).toBeLessThan(5000);
    });
  });
});
