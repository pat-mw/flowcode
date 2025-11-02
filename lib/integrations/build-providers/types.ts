/**
 * Build Provider Interface
 * Abstraction for different serverless function providers (Vercel, AWS Lambda, etc.)
 */

export interface BuildConfig {
  /** IDs of components to build */
  componentIds: string[];
  /** Webflow workspace API token */
  webflowToken: string;
  /** Temporary directory for build isolation */
  outputDir: string;
  /** Component files and dependencies */
  componentFiles: ComponentFile[];
}

export interface ComponentFile {
  /** Relative path from project root */
  path: string;
  /** File content */
  content: string;
  /** Whether this is a dependency (not a main component) */
  isDependency?: boolean;
}

export interface BuildResult {
  /** Whether build succeeded */
  success: boolean;
  /** Build and deployment logs */
  logs: string[];
  /** Webflow deployment URL (if successful) */
  deploymentUrl?: string;
  /** Error message (if failed) */
  error?: string;
  /** Build artifacts generated */
  artifacts?: string[];
}

export interface BuildProvider {
  /** Provider name */
  name: 'vercel' | 'aws-lambda';

  /** Whether provider supports streaming logs */
  supportsStreaming: boolean;

  /**
   * Build and deploy selected components to Webflow
   * @param config Build configuration
   * @returns Build result with logs and deployment URL
   */
  buildComponents(config: BuildConfig): Promise<BuildResult>;
}

/**
 * Error thrown by build providers
 */
export class BuildProviderError extends Error {
  constructor(
    message: string,
    public provider: string,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'BuildProviderError';
  }
}
