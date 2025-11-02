/**
 * Component Discovery Interface
 * Abstraction for different component registry methods (Filesystem, Database, etc.)
 */

export interface WebflowComponent {
  /** Unique component identifier */
  id: string;

  /** Component name (from declareComponent) */
  name: string;

  /** File path relative to project root */
  path: string;

  /** Component description */
  description?: string;

  /** Component group/category */
  group?: string;

  /** Direct dependencies (import paths) */
  dependencies: string[];

  /** File size in bytes */
  fileSize?: number;

  /** Last modified timestamp */
  lastModified?: Date;
}

export interface ComponentFiles {
  /** Main component files */
  components: Array<{
    path: string;
    content: string;
  }>;

  /** Dependency files (shadcn/ui, utilities, etc.) */
  dependencies: Array<{
    path: string;
    content: string;
  }>;
}

export interface ComponentDiscovery {
  /** Discovery method name */
  name: 'filesystem' | 'database';

  /**
   * List all available Webflow components
   * @returns Array of component metadata
   */
  listComponents(): Promise<WebflowComponent[]>;

  /**
   * Get component details by ID
   * @param componentId Component ID
   * @returns Component metadata or null if not found
   */
  getComponentDetails(componentId: string): Promise<WebflowComponent | null>;

  /**
   * Get file contents for selected components and their dependencies
   * @param componentIds Array of component IDs to include
   * @returns Component and dependency files
   */
  getComponentFiles(componentIds: string[]): Promise<ComponentFiles>;

  /**
   * Resolve all dependencies for a component (transitive)
   * @param componentId Component ID
   * @returns Array of dependency import paths
   */
  getDependencies(componentId: string): Promise<string[]>;
}

/**
 * Error thrown by discovery providers
 */
export class DiscoveryError extends Error {
  constructor(
    message: string,
    public provider: string,
    public code?: 'COMPONENT_NOT_FOUND' | 'FILE_READ_ERROR' | 'PARSE_ERROR' | 'CIRCULAR_DEPENDENCY',
    public details?: unknown
  ) {
    super(message);
    this.name = 'DiscoveryError';
  }
}
