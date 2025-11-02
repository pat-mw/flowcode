/**
 * Vercel Build Provider
 * Executes Webflow component builds using Vercel Functions
 */

import { spawn } from 'child_process';
import { mkdir, writeFile, copyFile, rm } from 'fs/promises';
import path from 'path';
import { nanoid } from 'nanoid';
import type { BuildProvider, BuildConfig, BuildResult, ComponentFile } from './types';
import { BuildProviderError } from './types';

/**
 * Vercel Build Provider Implementation
 * Runs webpack and Webflow CLI in temporary isolated directory
 */
export class VercelBuildProvider implements BuildProvider {
  readonly name = 'vercel' as const;
  readonly supportsStreaming = true;

  /**
   * Build and deploy components to Webflow
   */
  async buildComponents(config: BuildConfig): Promise<BuildResult> {
    const jobId = nanoid();
    const tempDir = path.join('/tmp', `webflow-export-${jobId}`);
    const logs: string[] = [];

    try {
      logs.push(`[${new Date().toISOString()}] Starting build job: ${jobId}`);
      logs.push(`[${new Date().toISOString()}] Creating temporary directory: ${tempDir}`);

      // Create temp directory structure
      await mkdir(path.join(tempDir, 'src', 'components'), { recursive: true });

      // Copy component files
      logs.push(`[${new Date().toISOString()}] Copying ${config.componentFiles.length} files...`);
      for (const file of config.componentFiles) {
        const targetPath = path.join(tempDir, file.path);
        const targetDir = path.dirname(targetPath);

        await mkdir(targetDir, { recursive: true });
        await writeFile(targetPath, file.content, 'utf-8');
      }

      // Generate filtered webflow.json
      logs.push(`[${new Date().toISOString()}] Generating webflow.json...`);
      const webflowConfig = {
        version: '1.0.0',
        componentPaths: ['./src/**/*.webflow.@(js|jsx|mjs|ts|tsx)'],
        buildCommand: 'webpack --config webpack.webflow.js',
      };

      await writeFile(
        path.join(tempDir, 'webflow.json'),
        JSON.stringify(webflowConfig, null, 2),
        'utf-8'
      );

      // Copy webpack config and package.json
      logs.push(`[${new Date().toISOString()}] Copying build configuration...`);
      await copyFile(
        path.join(process.cwd(), 'webpack.webflow.js'),
        path.join(tempDir, 'webpack.webflow.js')
      );

      await copyFile(
        path.join(process.cwd(), 'package.json'),
        path.join(tempDir, 'package.json')
      );

      // Run webpack build
      logs.push(`[${new Date().toISOString()}] Running webpack compilation...`);
      const webpackLogs = await this.runCommand('npx', ['webpack', '--config', 'webpack.webflow.js'], tempDir);
      logs.push(...webpackLogs);

      // Run Webflow CLI deployment
      logs.push(`[${new Date().toISOString()}] Deploying to Webflow...`);
      const cliLogs = await this.runCommand(
        'npx',
        ['webflow', 'library', 'share', '--api-token', config.webflowToken, '--no-input'],
        tempDir
      );
      logs.push(...cliLogs);

      // Extract deployment URL from logs
      const deploymentUrl = this.extractDeploymentUrl(cliLogs);

      logs.push(`[${new Date().toISOString()}] ✅ Build completed successfully`);

      return {
        success: true,
        logs,
        deploymentUrl,
        artifacts: ['Client.js', 'manifest.json'],
      };
    } catch (error) {
      logs.push(`[${new Date().toISOString()}] ❌ Build failed: ${error instanceof Error ? error.message : 'Unknown error'}`);

      return {
        success: false,
        logs,
        error: error instanceof Error ? error.message : 'Build failed',
      };
    } finally {
      // Cleanup temp directory
      try {
        logs.push(`[${new Date().toISOString()}] Cleaning up temporary directory...`);
        await rm(tempDir, { recursive: true, force: true });
      } catch (cleanupError) {
        logs.push(`[${new Date().toISOString()}] ⚠️ Cleanup warning: ${cleanupError instanceof Error ? cleanupError.message : 'Unknown error'}`);
      }
    }
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

      // Timeout after 300 seconds (Vercel Function limit)
      setTimeout(() => {
        proc.kill();
        reject(new BuildProviderError(
          'Build timeout (300s limit exceeded)',
          'vercel',
          'BUILD_TIMEOUT'
        ));
      }, 300000);
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
