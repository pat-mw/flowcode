/**
 * AES-256-GCM encryption utilities for securing sensitive data at rest
 * Used to encrypt OAuth tokens, API keys, and other sensitive credentials
 *
 * Security features:
 * - AES-256-GCM algorithm (authenticated encryption)
 * - Random IV (Initialization Vector) for each encryption
 * - Authentication tag for integrity verification
 * - Constant-time comparison to prevent timing attacks
 *
 * @module lib/integrations/encryption
 */

import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

/**
 * Encryption algorithm configuration
 */
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 128 bits for GCM
const AUTH_TAG_LENGTH = 16; // 128 bits
const KEY_LENGTH = 32; // 256 bits

/**
 * Result of encryption operation
 */
export interface EncryptedData {
  encrypted: string; // Base64 encoded ciphertext
  iv: string; // Base64 encoded initialization vector
  authTag: string; // Base64 encoded authentication tag
}

/**
 * Get the encryption key from environment variables
 * Validates key length and format
 *
 * @throws {Error} If ENCRYPTION_SECRET is not defined or invalid
 * @returns {Buffer} 32-byte encryption key
 */
function getEncryptionKey(): Buffer {
  const secret = process.env.ENCRYPTION_SECRET;

  if (!secret) {
    throw new Error(
      'ENCRYPTION_SECRET environment variable is not defined. ' +
      'Please add it to your .env file. Generate with: ' +
      'openssl rand -hex 32'
    );
  }

  // Convert hex string to buffer
  const key = Buffer.from(secret, 'hex');

  if (key.length !== KEY_LENGTH) {
    throw new Error(
      `ENCRYPTION_SECRET must be exactly ${KEY_LENGTH} bytes (${KEY_LENGTH * 2} hex characters). ` +
      `Current length: ${key.length} bytes. Generate a new one with: openssl rand -hex 32`
    );
  }

  return key;
}

/**
 * Encrypt sensitive data using AES-256-GCM
 *
 * Each encryption uses a random IV, so encrypting the same plaintext
 * multiple times will produce different ciphertexts (semantic security)
 *
 * @param {string} plaintext - The data to encrypt
 * @returns {EncryptedData} Encrypted data with IV and auth tag
 * @throws {Error} If encryption fails
 *
 * @example
 * const token = 'secret-access-token';
 * const encrypted = encrypt(token);
 * // Store encrypted.encrypted, encrypted.iv, encrypted.authTag in database
 */
export function encrypt(plaintext: string): EncryptedData {
  try {
    const key = getEncryptionKey();
    const iv = randomBytes(IV_LENGTH);

    const cipher = createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(plaintext, 'utf8', 'base64');
    encrypted += cipher.final('base64');

    const authTag = cipher.getAuthTag();

    return {
      encrypted,
      iv: iv.toString('base64'),
      authTag: authTag.toString('base64'),
    };
  } catch (error) {
    // Never log the plaintext
    throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Decrypt data that was encrypted with encrypt()
 *
 * Verifies the authentication tag to ensure data integrity
 * Uses constant-time comparison to prevent timing attacks
 *
 * @param {string} encrypted - Base64 encoded ciphertext
 * @param {string} iv - Base64 encoded initialization vector
 * @param {string} authTag - Base64 encoded authentication tag
 * @returns {string} Decrypted plaintext
 * @throws {Error} If decryption fails or authentication fails
 *
 * @example
 * const decrypted = decrypt(
 *   encrypted.encrypted,
 *   encrypted.iv,
 *   encrypted.authTag
 * );
 * // Use decrypted token
 */
export function decrypt(encrypted: string, iv: string, authTag: string): string {
  try {
    const key = getEncryptionKey();
    const ivBuffer = Buffer.from(iv, 'base64');
    const authTagBuffer = Buffer.from(authTag, 'base64');

    if (ivBuffer.length !== IV_LENGTH) {
      throw new Error(`Invalid IV length: ${ivBuffer.length}, expected ${IV_LENGTH}`);
    }

    if (authTagBuffer.length !== AUTH_TAG_LENGTH) {
      throw new Error(`Invalid auth tag length: ${authTagBuffer.length}, expected ${AUTH_TAG_LENGTH}`);
    }

    const decipher = createDecipheriv(ALGORITHM, key, ivBuffer);
    decipher.setAuthTag(authTagBuffer);

    let decrypted = decipher.update(encrypted, 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    // Never log encrypted data or keys
    if (error instanceof Error) {
      if (error.message.includes('Unsupported state or unable to authenticate data')) {
        throw new Error('Decryption failed: Authentication failed. Data may have been tampered with.');
      }
      throw new Error(`Decryption failed: ${error.message}`);
    }
    throw new Error('Decryption failed: Unknown error');
  }
}

/**
 * Validate that encryption is properly configured
 * Call this at application startup to fail fast
 *
 * @throws {Error} If encryption setup is invalid
 */
export function validateEncryptionSetup(): void {
  try {
    const testData = 'test-data-for-validation';
    const encrypted = encrypt(testData);
    const decrypted = decrypt(encrypted.encrypted, encrypted.iv, encrypted.authTag);

    if (decrypted !== testData) {
      throw new Error('Encryption round-trip validation failed');
    }
  } catch (error) {
    throw new Error(
      `Encryption setup validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
