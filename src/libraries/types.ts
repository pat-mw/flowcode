/**
 * Component prop documentation
 */
export interface ComponentProp {
  name: string;
  type: "Text" | "Number" | "Boolean" | "Variant" | "JSON" | "Image" | "Link" | "RichText" | "Slot";
  description: string;
  defaultValue?: unknown;
  required?: boolean;
  options?: Array<{ label: string; value: string }>; // For Variant type
}

/**
 * Rich metadata for individual components
 */
export interface ComponentMetadata {
  /** Unique identifier (e.g., "core-login-form") */
  id: string;

  /** Display name (e.g., "Login Form") */
  name: string;

  /** Brief description */
  description: string;

  /** Optional category within library */
  category?: string;

  /** npm packages this component depends on */
  dependencies?: string[];

  /** Backend endpoints this component uses */
  backendDependencies?: string[];

  /** Component props documentation */
  props?: ComponentProp[];

  /** Code usage example */
  usageExample?: string;

  /** Searchable tags */
  tags?: string[];

  /** Path to component file (auto-generated) */
  filePath?: string;

  /** Preview image URL for component showcase */
  previewImage?: string;
}

export interface LibraryConfig {
  /** Human-readable library name */
  name: string;

  /** Description shown in Webflow */
  description: string;

  /** Unique identifier for the library */
  id: string;

  /**
   * Glob pattern(s) for component discovery
   * If not provided, defaults to: ./src/libraries/{key}/**\/*.webflow.@(ts|tsx)
   */
  components?: string | string[];

  /** Rich component metadata (optional, for component library viewer) */
  componentMetadata?: ComponentMetadata[];

  /** Path to webpack bundle configuration */
  bundleConfig?: string;

  /** External dependencies (not bundled) */
  externals?: string[];

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

  return {
    valid: errors.length === 0,
    errors,
  };
}
