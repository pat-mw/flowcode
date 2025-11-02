/**
 * Webflow Router
 * Handles Webflow component export and token management
 * All procedures require authentication
 */

import { os } from '@orpc/server';
import { z } from 'zod';
import { protectedProcedure } from '../procedures';
import { ManualTokenProvider } from '@/lib/integrations/webflow/auth/manual-token';
import { FilesystemDiscovery } from '@/lib/integrations/webflow/discovery/filesystem';
import { VercelBuildProvider } from '@/lib/integrations/build-providers/vercel';

import type { Context } from '../context';

/**
 * Shared auth provider instance
 */
const authProvider = new ManualTokenProvider();

/**
 * Shared discovery provider instance
 */
const discovery = new FilesystemDiscovery();

/**
 * Shared build provider instance
 */
const buildProvider = new VercelBuildProvider();

/**
 * Save Webflow workspace token (encrypted)
 */
const saveWebflowToken = protectedProcedure
  .input(
    z.object({
      token: z.string().min(1, 'Token is required'),
    })
  )
  .handler(async ({ input, context }) => {
    const ctx = context as Context & { userId: string };

    await authProvider.saveToken(ctx.userId, input.token);

    return {
      success: true,
      message: 'Webflow token saved successfully',
    };
  });

/**
 * Check if user has stored Webflow token
 */
const getWebflowToken = protectedProcedure.handler(async ({ context }) => {
  const ctx = context as Context & { userId: string };

  const hasToken = await authProvider.hasToken(ctx.userId);

  return {
    hasToken,
  };
});

/**
 * Revoke/delete stored Webflow token
 */
const revokeWebflowToken = protectedProcedure.handler(async ({ context }) => {
  const ctx = context as Context & { userId: string };

  await authProvider.revokeToken(ctx.userId);

  return {
    success: true,
    message: 'Webflow token revoked successfully',
  };
});

/**
 * List all available Webflow components
 */
const listWebflowComponents = protectedProcedure.handler(async () => {
  const components = await discovery.listComponents();

  return components;
});

/**
 * Export all components to Webflow
 * Uses git clone approach - no component selection needed
 */
const exportComponents = protectedProcedure
  .input(z.object({})) // No input needed
  .handler(async ({ context }) => {
    const ctx = context as Context & { userId: string };

    // Get Webflow token
    const webflowToken = await authProvider.getToken(ctx.userId);

    // Build and deploy (git clone handles component discovery)
    const result = await buildProvider.buildComponents({
      webflowToken,
      outputDir: '/tmp',
    });

    return result;
  });

export const webflowRouter = os.router({
  saveWebflowToken,
  getWebflowToken,
  revokeWebflowToken,
  listWebflowComponents,
  exportComponents,
});
