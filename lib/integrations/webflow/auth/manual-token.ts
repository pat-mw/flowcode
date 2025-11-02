/**
 * Manual Token Provider
 * Handles manual Webflow workspace token entry with encrypted storage
 */

import { db, integrations } from '@/lib/db';
import { eq, and } from 'drizzle-orm';
import { encrypt, decrypt } from '@/lib/integrations/encryption';
import { nanoid } from 'nanoid';
import type { WebflowAuthProvider } from './types';
import { AuthProviderError } from './types';

/**
 * Minimum token length for validation
 */
const MIN_TOKEN_LENGTH = 20;

/**
 * Manual Token Provider Implementation
 * Stores and retrieves Webflow workspace tokens with AES-256-GCM encryption
 */
export class ManualTokenProvider implements WebflowAuthProvider {
  readonly name = 'manual-token' as const;

  /**
   * Save Webflow workspace token for user (encrypted)
   */
  async saveToken(userId: string, token: string): Promise<void> {
    try {
      // Validate token
      if (!token || token.trim().length === 0) {
        throw new AuthProviderError(
          'Token cannot be empty',
          'manual-token',
          'STORAGE_FAILED'
        );
      }

      if (token.trim().length < MIN_TOKEN_LENGTH) {
        throw new AuthProviderError(
          `Token must be at least ${MIN_TOKEN_LENGTH} characters`,
          'manual-token',
          'STORAGE_FAILED'
        );
      }

      const trimmedToken = token.trim();

      // Encrypt token
      const encrypted = encrypt(trimmedToken);

      // Check if user already has a Webflow token
      const existing = await db.query.integrations.findFirst({
        where: and(
          eq(integrations.userId, userId),
          eq(integrations.provider, 'webflow')
        ),
      });

      // Delete existing token if present (to ensure clean update)
      if (existing) {
        await db
          .delete(integrations)
          .where(
            and(
              eq(integrations.id, existing.id),
              eq(integrations.userId, userId)
            )
          )
          .returning();
      }

      // Insert new token
      await db
        .insert(integrations)
        .values({
          id: nanoid(),
          userId,
          provider: 'webflow',
          accessToken: encrypted.encrypted,
          accessTokenIv: encrypted.iv,
          accessTokenAuthTag: encrypted.authTag,
          metadata: null,
        })
        .returning();
    } catch (error) {
      if (error instanceof AuthProviderError) {
        throw error;
      }

      throw new AuthProviderError(
        `Failed to save token: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'manual-token',
        'STORAGE_FAILED',
        error
      );
    }
  }

  /**
   * Get decrypted Webflow workspace token for user
   */
  async getToken(userId: string): Promise<string> {
    try {
      // Find user's Webflow integration
      const integration = await db.query.integrations.findFirst({
        where: and(
          eq(integrations.userId, userId),
          eq(integrations.provider, 'webflow')
        ),
      });

      if (!integration) {
        throw new AuthProviderError(
          'Webflow token not found for this user',
          'manual-token',
          'TOKEN_NOT_FOUND'
        );
      }

      // Validate encrypted data
      if (!integration.accessTokenIv || !integration.accessTokenAuthTag) {
        throw new AuthProviderError(
          'Token encryption data is incomplete',
          'manual-token',
          'DECRYPTION_FAILED'
        );
      }

      // Decrypt token
      const decrypted = decrypt(
        integration.accessToken,
        integration.accessTokenIv,
        integration.accessTokenAuthTag
      );

      return decrypted;
    } catch (error) {
      if (error instanceof AuthProviderError) {
        throw error;
      }

      throw new AuthProviderError(
        `Failed to retrieve token: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'manual-token',
        'DECRYPTION_FAILED',
        error
      );
    }
  }

  /**
   * Check if user has a stored token (without decrypting)
   */
  async hasToken(userId: string): Promise<boolean> {
    try {
      const integration = await db.query.integrations.findFirst({
        where: and(
          eq(integrations.userId, userId),
          eq(integrations.provider, 'webflow')
        ),
        columns: {
          id: true, // Only select ID for performance
        },
      });

      return integration !== null && integration !== undefined;
    } catch (error) {
      throw new AuthProviderError(
        `Failed to check token existence: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'manual-token',
        undefined,
        error
      );
    }
  }

  /**
   * Revoke/delete stored token for user
   */
  async revokeToken(userId: string): Promise<void> {
    try {
      await db
        .delete(integrations)
        .where(
          and(
            eq(integrations.userId, userId),
            eq(integrations.provider, 'webflow')
          )
        )
        .returning();

      // Note: Deletion is idempotent - no error if token doesn't exist
    } catch (error) {
      throw new AuthProviderError(
        `Failed to revoke token: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'manual-token',
        'STORAGE_FAILED',
        error
      );
    }
  }
}
