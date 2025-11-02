/**
 * Vercel Build Provider
 * Clones GitHub repository and executes Webflow component builds using Vercel Functions
 */

import { spawn } from 'child_process';
import { rm } from 'fs/promises';
import path from 'path';
import { nanoid } from 'nanoid';
import type { BuildProvider, BuildConfig, BuildResult } from './types';
import { BuildProviderError } from './types';

/**
 * Vercel Build Provider Implementation
 * Clones repo from GitHub, copies node_modules, runs webpack and Webflow CLI
 */
export class VercelBuildProvider implements BuildProvider {
  readonly name = 'vercel' as const;
  readonly supportsStreaming = true;

  /**
   * Build and deploy all components to Webflow
   */
  async buildComponents(config: BuildConfig): Promise<BuildResult> {
    const jobId = nanoid();
    const repoDir = path.join('/tmp', `webflow-export-${jobId}`);
    const logs: string[] = [];

    try {
      logs.push(`[${new Date().toISOString()}] Starting export job: ${jobId}`);

      // Step 1: Clone repository
      logs.push(`[${new Date().toISOString()}] Cloning repository...`);
      const cloneLogs = await this.cloneRepository(repoDir);
      logs.push(...cloneLogs);

      // Step 2: Copy node_modules from function
      logs.push(`[${new Date().toISOString()}] Copying node_modules...`);
      const copyLogs = await this.copyNodeModules(repoDir);
      logs.push(...copyLogs);

      // Step 3: Run webpack build
      logs.push(`[${new Date().toISOString()}] Running webpack compilation...`);
      const webpackLogs = await this.runCommand(
        'npx',
        ['webpack', '--config', 'webpack.webflow.js'],
        repoDir
      );
      logs.push(...webpackLogs);

      // Step 4: Run Webflow CLI deployment
      logs.push(`[${new Date().toISOString()}] Deploying to Webflow...`);
      const cliLogs = await this.runCommand(
        'npx',
        ['webflow', 'library', 'share', '--api-token', config.webflowToken, '--no-input'],
        repoDir
      );
      logs.push(...cliLogs);

      // Step 5: Extract deployment URL
      const deploymentUrl = this.extractDeploymentUrl(cliLogs);

      logs.push(`[${new Date().toISOString()}] ✅ Export completed successfully`);

      return {
        success: true,
        logs,
        deploymentUrl,
        artifacts: ['Client.js', 'manifest.json'],
      };
    } catch (error) {
      logs.push(`[${new Date().toISOString()}] ❌ Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);

      return {
        success: false,
        logs,
        error: error instanceof Error ? error.message : 'Export failed',
      };
    } finally {
      // Cleanup: delete cloned repo
      try {
        logs.push(`[${new Date().toISOString()}] Cleaning up temporary directory...`);
        await rm(repoDir, { recursive: true, force: true });
      } catch (cleanupError) {
        logs.push(`[${new Date().toISOString()}] ⚠️ Cleanup warning: ${cleanupError instanceof Error ? cleanupError.message : 'Unknown error'}`);
      }
    }
  }

  /**
   * Clone GitHub repository to temporary directory
   */
  private async cloneRepository(targetDir: string): Promise<string[]> {
    const logs: string[] = [];
    const token = process.env.GITHUB_TOKEN;
    const repoUrl = process.env.GITHUB_REPO_URL;

    if (!token) {
      throw new BuildProviderError(
        'GITHUB_TOKEN environment variable is not set',
        'vercel',
        'MISSING_GITHUB_TOKEN'
      );
    }

    if (!repoUrl) {
      throw new BuildProviderError(
        'GITHUB_REPO_URL environment variable is not set',
        'vercel',
        'MISSING_REPO_URL'
      );
    }

    // Insert token into URL for authentication
    // Format: https://token@github.com/user/repo.git
    const authenticatedUrl = repoUrl.replace('https://', `https://${token}@`);

    logs.push(`Cloning from ${repoUrl.replace(/https:\/\/.*@/, 'https://')}`); // Hide token in logs

    try {
      const cloneLogs = await this.runCommand(
        'git',
        ['clone', '--depth=1', '--single-branch', authenticatedUrl, targetDir],
        '/tmp'
      );
      logs.push(...cloneLogs);
      logs.push('✅ Repository cloned successfully');
    } catch (error) {
      throw new BuildProviderError(
        `Failed to clone repository: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'vercel',
        'CLONE_FAILED',
        error
      );
    }

    return logs;
  }

  /**
   * Copy node_modules from Vercel Function to cloned repository
   */
  private async copyNodeModules(targetDir: string): Promise<string[]> {
    const logs: string[] = [];
    const functionNodeModules = path.join(process.cwd(), 'node_modules');
    const targetNodeModules = path.join(targetDir, 'node_modules');

    logs.push(`Copying node_modules from ${functionNodeModules} to ${targetNodeModules}`);

    try {
      const cpLogs = await this.runCommand(
        'cp',
        ['-r', functionNodeModules, targetNodeModules],
        '/tmp'
      );
      logs.push(...cpLogs);
      logs.push('✅ node_modules copied successfully');
    } catch (error) {
      throw new BuildProviderError(
        `Failed to copy node_modules: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'vercel',
        'COPY_FAILED',
        error
      );
    }

    return logs;
  }

  /**
   * Run a shell command and collect output
   */
  private runCommand(command: string, args: string[], cwd: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const logs: string[] = [];

      const proc = spawn(command, args, {
        cwd,
        env: { ...process.env },
        shell: true,
      });

      proc.stdout.on('data', (data) => {
        const line = data.toString().trim();
        if (line) {
          logs.push(`[stdout] ${line}`);
        }
      });

      proc.stderr.on('data', (data) => {
        const line = data.toString().trim();
        if (line) {
          logs.push(`[stderr] ${line}`);
        }
      });

      proc.on('close', (code) => {
        if (code === 0) {
          resolve(logs);
        } else {
          reject(new BuildProviderError(
            `Command failed with exit code ${code}`,
            'vercel',
            'BUILD_FAILED',
            { command, args, logs }
          ));
        }
      });

      proc.on('error', (error) => {
        reject(new BuildProviderError(
          `Failed to run command: ${error.message}`,
          'vercel',
          'BUILD_FAILED',
          error
        ));
      });
    });
  }

  /**
   * Extract deployment URL from Webflow CLI logs
   */
  private extractDeploymentUrl(logs: string[]): string | undefined {
    for (const log of logs) {
      const match = log.match(/https?:\/\/[^\s]+/);
      if (match) {
        return match[0];
      }
    }
    return 'https://webflow.com/workspace/library/components';
  }
}
