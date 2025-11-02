/**
 * Filesystem Discovery Implementation
 * Scans filesystem for Webflow components and analyzes dependencies
 */

import { glob } from 'glob';
import { readFile, stat } from 'fs/promises';
import path from 'path';
import type { ComponentDiscovery, WebflowComponent, ComponentFiles } from './types';
import { DiscoveryError } from './types';

/**
 * Node.js built-in modules to exclude from dependencies
 */
const NODE_BUILTINS = new Set([
  'assert', 'buffer', 'child_process', 'cluster', 'crypto', 'dgram', 'dns',
  'domain', 'events', 'fs', 'http', 'https', 'net', 'os', 'path', 'punycode',
  'querystring', 'readline', 'stream', 'string_decoder', 'timers', 'tls',
  'tty', 'url', 'util', 'v8', 'vm', 'zlib', 'fs/promises',
]);

/**
 * Next.js-specific imports to exclude (not compatible with Shadow DOM)
 */
const NEXTJS_IMPORTS = new Set([
  'next/link',
  'next/image',
  'next/navigation',
  'next/router',
  'next/headers',
  'next/server',
]);

/**
 * Filesystem Discovery Implementation
 * Scans filesystem for Webflow component files
 */
export class FilesystemDiscovery implements ComponentDiscovery {
  readonly name = 'filesystem' as const;

  /**
   * Component glob pattern from webflow.json
   */
  private readonly COMPONENT_PATTERN = './src/**/*.webflow.@(js|jsx|mjs|ts|tsx)';

  /**
   * Project root directory
   */
  private readonly projectRoot: string;

  constructor() {
    this.projectRoot = process.cwd();
  }

  /**
   * List all available Webflow components
   */
  async listComponents(): Promise<WebflowComponent[]> {
    try {
      // Find all .webflow.tsx files
      const files = await glob(this.COMPONENT_PATTERN, {
        cwd: this.projectRoot,
        absolute: true,
      });

      // Parse each component file
      const components: WebflowComponent[] = [];

      for (const filePath of files) {
        try {
          const component = await this.parseComponentFile(filePath);
          if (component) {
            components.push(component);
          }
        } catch (error) {
          console.warn(`Failed to parse component ${filePath}:`, error);
          // Continue with other components
        }
      }

      return components;
    } catch (error) {
      throw new DiscoveryError(
        `Failed to list components: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'filesystem',
        'FILE_READ_ERROR',
        error
      );
    }
  }

  /**
   * Get component details by ID
   */
  async getComponentDetails(componentId: string): Promise<WebflowComponent | null> {
    const components = await this.listComponents();
    return components.find((c) => c.id === componentId) || null;
  }

  /**
   * Get file contents for selected components and their dependencies
   */
  async getComponentFiles(componentIds: string[]): Promise<ComponentFiles> {
    try {
      const allComponents = await this.listComponents();

      // Filter selected components
      const selectedComponents = allComponents.filter((c) =>
        componentIds.includes(c.id)
      );

      if (selectedComponents.length === 0) {
        throw new DiscoveryError(
          'No components found with provided IDs',
          'filesystem',
          'COMPONENT_NOT_FOUND'
        );
      }

      // Collect all component files
      const componentFiles: Array<{ path: string; content: string }> = [];

      for (const component of selectedComponents) {
        const content = await readFile(component.path, 'utf-8');
        componentFiles.push({
          path: component.path,
          content,
        });
      }

      // Collect all unique dependencies
      const allDeps = new Set<string>();
      for (const component of selectedComponents) {
        for (const dep of component.dependencies) {
          allDeps.add(dep);
        }
      }

      // Resolve dependency files
      const dependencyFiles: Array<{ path: string; content: string }> = [];

      for (const dep of allDeps) {
        try {
          const depPath = this.resolveDependencyPath(dep);
          if (depPath) {
            const content = await readFile(depPath, 'utf-8');
            dependencyFiles.push({
              path: depPath,
              content,
            });
          }
        } catch (error) {
          console.warn(`Failed to resolve dependency ${dep}:`, error);
          // Continue with other dependencies
        }
      }

      return {
        components: componentFiles,
        dependencies: dependencyFiles,
      };
    } catch (error) {
      if (error instanceof DiscoveryError) {
        throw error;
      }

      throw new DiscoveryError(
        `Failed to get component files: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'filesystem',
        'FILE_READ_ERROR',
        error
      );
    }
  }

  /**
   * Resolve all dependencies for a component
   */
  async getDependencies(componentId: string): Promise<string[]> {
    const component = await this.getComponentDetails(componentId);

    if (!component) {
      throw new DiscoveryError(
        `Component not found: ${componentId}`,
        'filesystem',
        'COMPONENT_NOT_FOUND'
      );
    }

    return component.dependencies;
  }

  /**
   * Parse a component file and extract metadata
   */
  private async parseComponentFile(filePath: string): Promise<WebflowComponent | null> {
    try {
      const content = await readFile(filePath, 'utf-8');
      const stats = await stat(filePath);

      // Generate component ID from filename
      const fileName = path.basename(filePath, '.webflow.tsx');
      const id = fileName.toLowerCase().replace(/\s+/g, '-');

      // Extract dependencies from imports
      const dependencies = this.extractDependencies(content);

      // Extract component metadata from declareComponent
      const metadata = this.extractMetadata(content);

      // Get relative path from project root
      const relativePath = path.relative(this.projectRoot, filePath);

      return {
        id,
        name: metadata.name || fileName,
        path: relativePath,
        description: metadata.description,
        group: metadata.group,
        dependencies,
        fileSize: stats.size,
        lastModified: stats.mtime,
      };
    } catch (error) {
      throw new DiscoveryError(
        `Failed to parse component file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'filesystem',
        'PARSE_ERROR',
        error
      );
    }
  }

  /**
   * Extract import dependencies from component source
   */
  private extractDependencies(source: string): string[] {
    const dependencies = new Set<string>();

    // Match ES6 import statements
    const importRegex = /import\s+(?:[\w*{}\s,]+\s+from\s+)?['"]([^'"]+)['"]/g;

    let match;
    while ((match = importRegex.exec(source)) !== null) {
      const importPath = match[1];

      // Skip Node.js built-ins
      if (NODE_BUILTINS.has(importPath)) {
        continue;
      }

      // Skip Next.js-specific imports
      if (NEXTJS_IMPORTS.has(importPath)) {
        continue;
      }

      // Skip Webflow-specific imports
      if (importPath.startsWith('@webflow/')) {
        continue;
      }

      dependencies.add(importPath);
    }

    return Array.from(dependencies);
  }

  /**
   * Extract metadata from declareComponent call
   */
  private extractMetadata(source: string): {
    name?: string;
    description?: string;
    group?: string;
  } {
    const metadata: Record<string, string> = {};

    // Try to extract name from declareComponent
    const nameMatch = source.match(/name:\s*['"]([^'"]+)['"]/);
    if (nameMatch) {
      metadata.name = nameMatch[1];
    }

    // Try to extract description
    const descMatch = source.match(/description:\s*['"]([^'"]+)['"]/);
    if (descMatch) {
      metadata.description = descMatch[1];
    }

    // Try to extract group
    const groupMatch = source.match(/group:\s*['"]([^'"]+)['"]/);
    if (groupMatch) {
      metadata.group = groupMatch[1];
    }

    return metadata;
  }

  /**
   * Resolve dependency path to absolute file path
   */
  private resolveDependencyPath(dep: string): string | null {
    // Handle path alias (@/ -> project root)
    if (dep.startsWith('@/')) {
      const relativePath = dep.replace('@/', '');
      return path.join(this.projectRoot, relativePath);
    }

    // Handle relative imports (./components/Button)
    if (dep.startsWith('./') || dep.startsWith('../')) {
      return path.join(this.projectRoot, 'src/components', dep);
    }

    // Skip external packages (node_modules)
    if (!dep.startsWith('@/') && !dep.startsWith('.')) {
      return null;
    }

    return null;
  }
}
