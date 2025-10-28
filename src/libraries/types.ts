export interface LibraryConfig {
  /** Human-readable library name */
  name: string;

  /** Description shown in Webflow */
  description: string;

  /** Unique identifier for the library */
  id: string;

  /** Glob pattern(s) for component discovery */
  components: string | string[];

  /** Path to webpack bundle configuration */
  bundleConfig?: string;

  /** Bundle size limit in MB */
  bundleSizeLimit?: number;

  /** External dependencies (not bundled) */
  externals?: string[];

  /** Main dependencies that affect bundle size */
  dependencies?: string[];

  /** Environment variables exposed to components */
  env?: Record<string, string | undefined>;

  /** Deployment configuration */
  deploy?: {
    enabled: boolean;
    workspaceToken?: string;
  };
}

export type LibraryRegistry = Record<string, LibraryConfig>;

/**
 * Type-safe library definition helper
 * Provides autocomplete and validation
 */
export function defineLibraries<T extends LibraryRegistry>(config: T): T {
  return config;
}

/**
 * Validate library configuration
 * Called at build time to ensure correctness
 */
export function validateLibraryConfig(
  config: LibraryConfig
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!config.name) errors.push("Library name is required");
  if (!config.id) errors.push("Library ID is required");
  if (!config.components) errors.push("Component patterns are required");

  if (config.bundleSizeLimit && config.bundleSizeLimit <= 0) {
    errors.push("Bundle size limit must be positive");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
