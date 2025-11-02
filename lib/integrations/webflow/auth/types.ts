/**
 * Webflow Auth Provider Interface
 * Abstraction for different authentication methods (Manual Token, OAuth, etc.)
 */

export interface WebflowAuthProvider {
  /** Provider name */
  name: 'manual-token' | 'oauth';

  /**
   * Get decrypted Webflow workspace token for user
   * @param userId User ID
   * @returns Decrypted token
   * @throws {AuthProviderError} If token not found or decryption fails
   */
  getToken(userId: string): Promise<string>;

  /**
   * Save Webflow workspace token for user (encrypted)
   * @param userId User ID
   * @param token Webflow workspace API token
   * @throws {AuthProviderError} If encryption or storage fails
   */
  saveToken(userId: string, token: string): Promise<void>;

  /**
   * Check if user has a stored token (without decrypting)
   * @param userId User ID
   * @returns True if token exists
   */
  hasToken(userId: string): Promise<boolean>;

  /**
   * Revoke/delete stored token for user
   * @param userId User ID
   * @throws {AuthProviderError} If deletion fails
   */
  revokeToken(userId: string): Promise<void>;
}

/**
 * Error thrown by auth providers
 */
export class AuthProviderError extends Error {
  constructor(
    message: string,
    public provider: string,
    public code?: 'TOKEN_NOT_FOUND' | 'ENCRYPTION_FAILED' | 'DECRYPTION_FAILED' | 'STORAGE_FAILED',
    public details?: unknown
  ) {
    super(message);
    this.name = 'AuthProviderError';
  }
}
