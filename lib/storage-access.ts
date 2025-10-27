/**
 * Storage Access API Helper
 * Requests permission to use third-party cookies in cross-origin contexts
 * Required for Webflow components to access Vercel session cookies
 *
 * Chrome and other browsers block third-party cookies by default.
 * This API allows us to request permission to use cookies cross-origin.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Storage_Access_API
 */

'use client';

/**
 * Request storage access (cookie access) for cross-origin requests
 * Must be called in response to a user gesture (click, etc.)
 *
 * @returns Promise<boolean> - true if access granted, false otherwise
 */
export async function requestStorageAccess(): Promise<boolean> {
  // Check if Storage Access API is available
  if (!document.requestStorageAccess) {
    console.warn('[StorageAccess] Storage Access API not available in this browser');
    return false;
  }

  try {
    // Check if we already have access
    const hasAccess = await document.hasStorageAccess();
    if (hasAccess) {
      console.log('[StorageAccess] ✅ Already have storage access');
      return true;
    }

    // Request access (must be called from user gesture)
    console.log('[StorageAccess] Requesting storage access...');
    await document.requestStorageAccess();
    console.log('[StorageAccess] ✅ Storage access granted!');
    return true;

  } catch (error) {
    console.error('[StorageAccess] ❌ Failed to get storage access:', error);

    // Provide helpful error messages
    if (error instanceof DOMException) {
      if (error.name === 'NotAllowedError') {
        console.error('[StorageAccess] User denied storage access or not called from user gesture');
      } else if (error.name === 'InvalidStateError') {
        console.error('[StorageAccess] Document is not allowed to request storage access');
      }
    }

    return false;
  }
}

/**
 * Check if we have storage access without requesting it
 *
 * @returns Promise<boolean> - true if we have access, false otherwise
 */
export async function hasStorageAccess(): Promise<boolean> {
  if (!document.hasStorageAccess) {
    return false;
  }

  try {
    return await document.hasStorageAccess();
  } catch (error) {
    console.error('[StorageAccess] Error checking storage access:', error);
    return false;
  }
}

/**
 * Request storage access and execute a callback if successful
 * Useful for wrapping API calls that require cookies
 *
 * @param callback - Function to execute if storage access is granted
 * @returns Promise<T | null> - Result of callback or null if access denied
 */
export async function withStorageAccess<T>(
  callback: () => Promise<T>
): Promise<T | null> {
  const hasAccess = await requestStorageAccess();

  if (!hasAccess) {
    console.error('[StorageAccess] Cannot proceed without storage access');
    return null;
  }

  return await callback();
}
