/**
 * Provider registry for managing cloud platform integrations
 * Provides centralized registration and lookup of cloud providers
 *
 * @module lib/integrations/registry
 */

import type { CloudProvider } from './types';

/**
 * Global registry of cloud providers
 */
const providers = new Map<string, CloudProvider>();

/**
 * Register a cloud provider
 *
 * @param provider Cloud provider instance implementing CloudProvider interface
 * @throws {Error} If provider with same ID is already registered
 *
 * @example
 * import { VercelProvider } from './vercel/client';
 * const vercel = new VercelProvider();
 * registerProvider(vercel);
 */
export function registerProvider(provider: CloudProvider): void {
  const id = provider.info.id;

  if (providers.has(id)) {
    throw new Error(`Provider "${id}" is already registered`);
  }

  providers.set(id, provider);
}

/**
 * Get a registered cloud provider by ID
 *
 * @param providerId Provider identifier (e.g., 'vercel', 'netlify')
 * @returns Cloud provider instance
 * @throws {Error} If provider is not registered
 *
 * @example
 * const vercel = getProvider('vercel');
 * const databases = await vercel.listDatabases(accessToken);
 */
export function getProvider(providerId: string): CloudProvider {
  const provider = providers.get(providerId);

  if (!provider) {
    const available = Array.from(providers.keys()).join(', ') || 'none';
    throw new Error(
      `Provider "${providerId}" is not registered. Available providers: ${available}`
    );
  }

  return provider;
}

/**
 * Check if a provider is registered
 *
 * @param providerId Provider identifier
 * @returns true if provider is registered
 *
 * @example
 * if (hasProvider('vercel')) {
 *   const vercel = getProvider('vercel');
 * }
 */
export function hasProvider(providerId: string): boolean {
  return providers.has(providerId);
}

/**
 * Get all registered provider IDs
 *
 * @returns Array of provider identifiers
 *
 * @example
 * const allProviders = getProviderIds();
 * console.log('Registered providers:', allProviders);
 */
export function getProviderIds(): string[] {
  return Array.from(providers.keys());
}

/**
 * Get all registered providers
 *
 * @returns Array of cloud provider instances
 *
 * @example
 * const allProviders = getAllProviders();
 * allProviders.forEach(provider => {
 *   console.log(provider.info.name);
 * });
 */
export function getAllProviders(): CloudProvider[] {
  return Array.from(providers.values());
}

/**
 * Unregister a provider (primarily for testing)
 *
 * @param providerId Provider identifier to remove
 * @returns true if provider was removed, false if not found
 *
 * @example
 * unregisterProvider('vercel'); // Remove for testing
 */
export function unregisterProvider(providerId: string): boolean {
  return providers.delete(providerId);
}

/**
 * Clear all registered providers (primarily for testing)
 *
 * @example
 * clearProviders(); // Reset state between tests
 */
export function clearProviders(): void {
  providers.clear();
}
