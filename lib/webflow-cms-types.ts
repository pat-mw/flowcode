/**
 * Webflow CMS Data Type Definitions
 * Matches the schema defined in docs/webflow-cms-schema.md
 */

/**
 * Component data from Webflow CMS Components Collection
 * Collection ID: 6908065569747d13e82a4416
 */
export interface WebflowCMSComponent {
  /** Component name (PlainText, required) */
  name?: string;

  /** URL slug (PlainText, required, auto-generated) */
  slug?: string;

  /** Unique component identifier (PlainText) */
  componentId?: string;

  /** Component description (RichText) */
  description?: string;

  /** Component category (PlainText) */
  category?: string;

  /** Library reference ID (Reference → Libraries Collection) */
  libraryId?: string;

  /** Comma-separated or array of tags (PlainText) */
  tags?: string | string[];

  /** Comma-separated or array of npm dependencies (PlainText) */
  dependencies?: string | string[];

  /** Comma-separated or array of backend endpoints (PlainText) */
  backendDependencies?: string | string[];

  /** Code usage example (RichText) */
  usageExample?: string;

  /** File path to component (PlainText) */
  filePath?: string;

  /** Component props metadata (if available) */
  props?: Array<{
    name: string;
    type: string;
    description: string;
    defaultValue?: unknown;
    required?: boolean;
    options?: Array<{ label: string; value: string }>;
  }>;
}

/**
 * Library data from Webflow CMS Libraries Collection
 * Collection ID: 69080ad05b5bb9a43ab2897f
 */
export interface WebflowCMSLibrary {
  /** Library name (PlainText, required) */
  name?: string;

  /** URL slug (PlainText, required, auto-generated) */
  slug?: string;

  /** Unique library identifier (PlainText) */
  libraryId?: string;

  /** Library description (RichText) */
  description?: string;

  /** Whether library is enabled for deployment (Switch/Boolean) */
  deployEnabled?: boolean;

  /** Array of component IDs in this library (MultiReference → Components) */
  componentIds?: string[];

  /** Populated components (if fetched with references) */
  components?: WebflowCMSComponent[];
}

/**
 * Helper function to normalize tags/dependencies from CMS
 * Handles both comma-separated strings and arrays
 */
export function normalizeCMSArray(value: string | string[] | undefined): string[] | undefined {
  if (!value) return undefined;

  if (Array.isArray(value)) {
    return value;
  }

  // Split comma-separated string and trim whitespace
  return value.split(',').map(item => item.trim()).filter(Boolean);
}

/**
 * Helper function to merge CMS data with registry data
 * CMS data takes precedence, registry data is fallback
 */
export function mergeCMSWithRegistry<T extends Record<string, any>>(
  cmsData: Partial<T> | undefined,
  registryData: T | undefined
): T | undefined {
  if (!cmsData && !registryData) return undefined;
  if (!cmsData) return registryData;
  if (!registryData) return cmsData as T;

  return {
    ...registryData,
    ...Object.fromEntries(
      Object.entries(cmsData).filter(([_, value]) => value !== undefined)
    ),
  } as T;
}
