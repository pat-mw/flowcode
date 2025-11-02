/**
 * Integrations Router
 * Handles cloud provider integrations (Vercel, Netlify, etc.)
 * All procedures require authentication
 */

import { os } from '@orpc/server';
import { z } from 'zod';
import { protectedProcedure } from '../procedures';
import { db, integrations } from '@/lib/db';
import { eq, and } from 'drizzle-orm';
import { encrypt, decrypt } from '@/lib/integrations/encryption';
import { VercelProvider } from '@/lib/integrations/vercel/client';
import { nanoid } from 'nanoid';

import type { Context } from '../context';

/**
 * Connect Vercel account via OAuth
 * Stores encrypted access token in database
 */
const connectVercel = protectedProcedure
  .input(
    z.object({
      accessToken: z.string().min(1),
      teamId: z.string().optional(),
    })
  )
  .handler(async ({ input, context }) => {
    const ctx = context as Context & { userId: string };

    // Encrypt the access token
    const encrypted = encrypt(input.accessToken);

    // Store in database
    const [integration] = await db
      .insert(integrations)
      .values({
        id: nanoid(),
        userId: ctx.userId,
        provider: 'vercel',
        accessToken: encrypted.encrypted,
        accessTokenIv: encrypted.iv,
        accessTokenAuthTag: encrypted.authTag,
        metadata: input.teamId ? { teamId: input.teamId } : null,
      })
      .returning();

    return {
      id: integration.id,
      provider: integration.provider,
      connected: true,
    };
  });

/**
 * List user's cloud provider integrations
 */
const listIntegrations = protectedProcedure.handler(async ({ context }) => {
  const ctx = context as Context & { userId: string };

  const userIntegrations = await db.query.integrations.findMany({
    where: eq(integrations.userId, ctx.userId),
    columns: {
      id: true,
      provider: true,
      createdAt: true,
      updatedAt: true,
      metadata: true,
      // Don't expose encrypted tokens
      accessToken: false,
      accessTokenIv: false,
      accessTokenAuthTag: false,
      refreshToken: false,
      refreshTokenIv: false,
      refreshTokenAuthTag: false,
    },
  });

  return userIntegrations;
});

/**
 * Disconnect a cloud provider integration
 */
const disconnectIntegration = protectedProcedure
  .input(
    z.object({
      integrationId: z.string(),
    })
  )
  .handler(async ({ input, context }) => {
    const ctx = context as Context & { userId: string };

    // Ensure user owns this integration
    const result = await db
      .delete(integrations)
      .where(
        and(
          eq(integrations.id, input.integrationId),
          eq(integrations.userId, ctx.userId)
        )
      )
      .returning();

    if (result.length === 0) {
      throw new Error('Integration not found or access denied');
    }

    return { success: true };
  });

/**
 * Create a Postgres database on Vercel
 */
const createVercelDatabase = protectedProcedure
  .input(
    z.object({
      integrationId: z.string(),
      name: z.string().min(1).max(64),
      region: z.enum(['us-east-1', 'us-west-1', 'eu-west-1', 'ap-southeast-1', 'ap-northeast-1']).optional(),
    })
  )
  .handler(async ({ input, context }) => {
    const ctx = context as Context & { userId: string };

    try {
      // Get user's Vercel integration
      const integration = await db.query.integrations.findFirst({
        where: and(
          eq(integrations.id, input.integrationId),
          eq(integrations.userId, ctx.userId),
          eq(integrations.provider, 'vercel')
        ),
      });

      if (!integration) {
        console.error('[createVercelDatabase] Integration not found:', { integrationId: input.integrationId, userId: ctx.userId });
        throw new Error('Vercel integration not found');
      }

      // Debug integration metadata
      console.log('[createVercelDatabase] Integration details:', {
        id: integration.id,
        userId: integration.userId,
        provider: integration.provider,
        metadata: integration.metadata,
        metadataType: typeof integration.metadata,
        metadataKeys: integration.metadata ? Object.keys(integration.metadata) : 'null',
      });

      // Decrypt access token
      console.log('[createVercelDatabase] Decrypting access token...');
      const accessToken = decrypt(
        integration.accessToken,
        integration.accessTokenIv,
        integration.accessTokenAuthTag
      );
      console.log('[createVercelDatabase] Token decrypted successfully');

      // Get teamId from metadata
      const teamId = integration.metadata?.teamId as string | undefined;
      console.log('[createVercelDatabase] TeamId:', teamId);

      // Create database using Vercel provider
      const provider = new VercelProvider();
      console.log('[createVercelDatabase] Creating database:', { name: input.name, region: input.region });
      const database = await provider.createDatabase(
        {
          name: input.name,
          region: input.region,
        },
        accessToken,
        teamId
      );
      console.log('[createVercelDatabase] Database created successfully:', database.id);

      return database;
    } catch (error) {
      console.error('[createVercelDatabase] Error:', error);
      throw error;
    }
  });

/**
 * List Vercel databases
 */
const listVercelDatabases = protectedProcedure
  .input(
    z.object({
      integrationId: z.string(),
    })
  )
  .handler(async ({ input, context }) => {
    const ctx = context as Context & { userId: string };

    try {
      // Get user's Vercel integration
      const integration = await db.query.integrations.findFirst({
        where: and(
          eq(integrations.id, input.integrationId),
          eq(integrations.userId, ctx.userId),
          eq(integrations.provider, 'vercel')
        ),
      });

      if (!integration) {
        console.error('[listVercelDatabases] Integration not found:', { integrationId: input.integrationId, userId: ctx.userId });
        throw new Error('Vercel integration not found');
      }

      // Decrypt access token
      console.log('[listVercelDatabases] Decrypting access token...');
      const accessToken = decrypt(
        integration.accessToken,
        integration.accessTokenIv,
        integration.accessTokenAuthTag
      );
      console.log('[listVercelDatabases] Token decrypted successfully');

      // Get teamId from metadata
      const teamId = integration.metadata?.teamId as string | undefined;
      console.log('[listVercelDatabases] TeamId:', teamId);

      // List databases using Vercel provider
      const provider = new VercelProvider();
      console.log('[listVercelDatabases] Calling Vercel API...');
      const databases = await provider.listDatabases(accessToken, teamId);
      console.log('[listVercelDatabases] Success:', databases.length, 'databases found');

      return databases;
    } catch (error) {
      console.error('[listVercelDatabases] Error:', error);
      throw error;
    }
  });

/**
 * Delete a Vercel database
 */
const deleteVercelDatabase = protectedProcedure
  .input(
    z.object({
      integrationId: z.string(),
      databaseId: z.string(),
    })
  )
  .handler(async ({ input, context }) => {
    const ctx = context as Context & { userId: string };

    // Get user's Vercel integration
    const integration = await db.query.integrations.findFirst({
      where: and(
        eq(integrations.id, input.integrationId),
        eq(integrations.userId, ctx.userId),
        eq(integrations.provider, 'vercel')
      ),
    });

    if (!integration) {
      throw new Error('Vercel integration not found');
    }

    // Decrypt access token
    const accessToken = decrypt(
      integration.accessToken,
      integration.accessTokenIv,
      integration.accessTokenAuthTag
    );

    // Get teamId from metadata
    const teamId = integration.metadata?.teamId as string | undefined;

    // Delete database using Vercel provider
    const provider = new VercelProvider();
    const success = await provider.deleteDatabase(input.databaseId, accessToken, teamId);

    return { success };
  });

/**
 * Update environment variables for a Vercel project
 */
const updateVercelEnvVars = protectedProcedure
  .input(
    z.object({
      integrationId: z.string(),
      projectId: z.string(),
      vars: z.record(z.string(), z.string()),
      target: z.array(z.enum(['production', 'preview', 'development'])).optional(),
    })
  )
  .handler(async ({ input, context }) => {
    const ctx = context as Context & { userId: string };

    // Get user's Vercel integration
    const integration = await db.query.integrations.findFirst({
      where: and(
        eq(integrations.id, input.integrationId),
        eq(integrations.userId, ctx.userId),
        eq(integrations.provider, 'vercel')
      ),
    });

    if (!integration) {
      throw new Error('Vercel integration not found');
    }

    // Decrypt access token
    const accessToken = decrypt(
      integration.accessToken,
      integration.accessTokenIv,
      integration.accessTokenAuthTag
    );

    // Update environment variables using Vercel provider
    const provider = new VercelProvider();
    const result = await provider.updateEnvVars(
      {
        projectId: input.projectId,
        vars: input.vars,
        target: input.target,
      },
      accessToken
    );

    return result;
  });

/**
 * Create a Vercel deployment
 */
const createVercelDeployment = protectedProcedure
  .input(
    z.object({
      integrationId: z.string(),
      name: z.string().min(1).max(64),
      template: z.enum(['static', 'nextjs-hello-world']).default('static'),
    })
  )
  .handler(async ({ input, context }) => {
    const ctx = context as Context & { userId: string };

    try {
      console.log('[createVercelDeployment] Starting deployment creation:', { name: input.name, template: input.template });

      // Get user's Vercel integration
      const integration = await db.query.integrations.findFirst({
        where: and(
          eq(integrations.id, input.integrationId),
          eq(integrations.userId, ctx.userId),
          eq(integrations.provider, 'vercel')
        ),
      });

      if (!integration) {
        console.error('[createVercelDeployment] Integration not found:', { integrationId: input.integrationId, userId: ctx.userId });
        throw new Error('Vercel integration not found');
      }

      console.log('[createVercelDeployment] Integration found:', { id: integration.id });

      // Decrypt access token
      const accessToken = decrypt(
        integration.accessToken,
        integration.accessTokenIv,
        integration.accessTokenAuthTag
      );

      console.log('[createVercelDeployment] Access token decrypted');

      // Prepare deployment config based on template
      let deploymentConfig;

    if (input.template === 'static') {
      // Simple static HTML deployment
      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${input.name}</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    .container {
      text-align: center;
      padding: 2rem;
    }
    h1 {
      font-size: 3rem;
      margin-bottom: 1rem;
    }
    p {
      font-size: 1.25rem;
      opacity: 0.9;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🚀 ${input.name}</h1>
    <p>Your deployment is live!</p>
    <p>Created with Blogflow Vercel Integration</p>
  </div>
</body>
</html>`;

      deploymentConfig = {
        name: input.name,
        files: [
          {
            file: 'index.html',
            data: html,
          },
        ],
        target: 'production' as const,
      };
    } else {
      // Next.js hello-world example from Vercel
      deploymentConfig = {
        name: input.name,
        gitSource: {
          type: 'github' as const,
          repo: 'vercel/next.js',
          ref: 'canary',
          path: 'examples/hello-world',
        },
        target: 'production' as const,
      };
    }

      // Get teamId from metadata
      const teamId = integration.metadata?.teamId as string | undefined;
      console.log('[createVercelDeployment] TeamId:', teamId);

      // Create deployment using Vercel provider
      console.log('[createVercelDeployment] Creating deployment with config:', { name: deploymentConfig.name });
      const provider = new VercelProvider();
      const deployment = await provider.createDeployment(deploymentConfig, accessToken, teamId);

      console.log('[createVercelDeployment] Deployment created successfully:', { id: deployment.id, url: deployment.url });
      return deployment;
    } catch (error) {
      console.error('[createVercelDeployment] Error:', error);
      throw error;
    }
  });

/**
 * Get Vercel deployment status
 */
const getVercelDeploymentStatus = protectedProcedure
  .input(
    z.object({
      integrationId: z.string(),
      deploymentId: z.string(),
    })
  )
  .handler(async ({ input, context }) => {
    const ctx = context as Context & { userId: string };

    // Get user's Vercel integration
    const integration = await db.query.integrations.findFirst({
      where: and(
        eq(integrations.id, input.integrationId),
        eq(integrations.userId, ctx.userId),
        eq(integrations.provider, 'vercel')
      ),
    });

    if (!integration) {
      throw new Error('Vercel integration not found');
    }

    // Decrypt access token
    const accessToken = decrypt(
      integration.accessToken,
      integration.accessTokenIv,
      integration.accessTokenAuthTag
    );

    // Get deployment status using Vercel provider
    const provider = new VercelProvider();
    const deployment = await provider.getDeployment(input.deploymentId, accessToken);

    return deployment;
  });

/**
 * List Vercel deployments
 */
const listVercelDeployments = protectedProcedure
  .input(
    z.object({
      integrationId: z.string(),
      projectId: z.string().optional(),
    })
  )
  .handler(async ({ input, context }) => {
    const ctx = context as Context & { userId: string };

    // Get user's Vercel integration
    const integration = await db.query.integrations.findFirst({
      where: and(
        eq(integrations.id, input.integrationId),
        eq(integrations.userId, ctx.userId),
        eq(integrations.provider, 'vercel')
      ),
    });

    if (!integration) {
      throw new Error('Vercel integration not found');
    }

    // Decrypt access token
    const accessToken = decrypt(
      integration.accessToken,
      integration.accessTokenIv,
      integration.accessTokenAuthTag
    );

    // List deployments using Vercel provider
    const provider = new VercelProvider();
    const deploymentList = await provider.listDeployments(accessToken, input.projectId);

    return deploymentList;
  });

/**
 * List Vercel projects
 */
const listVercelProjects = protectedProcedure
  .input(
    z.object({
      integrationId: z.string(),
    })
  )
  .handler(async ({ input, context }) => {
    const ctx = context as Context & { userId: string };

    // Get user's Vercel integration
    const integration = await db.query.integrations.findFirst({
      where: and(
        eq(integrations.id, input.integrationId),
        eq(integrations.userId, ctx.userId),
        eq(integrations.provider, 'vercel')
      ),
    });

    if (!integration) {
      throw new Error('Vercel integration not found');
    }

    // Decrypt access token
    const accessToken = decrypt(
      integration.accessToken,
      integration.accessTokenIv,
      integration.accessTokenAuthTag
    );

    // List projects using Vercel provider
    const provider = new VercelProvider();
    const projectList = await provider.listProjects(accessToken);

    return projectList;
  });

export const integrationsRouter = os.router({
  connectVercel,
  listIntegrations,
  disconnectIntegration,
  createVercelDatabase,
  listVercelDatabases,
  deleteVercelDatabase,
  updateVercelEnvVars,
  createVercelDeployment,
  getVercelDeploymentStatus,
  listVercelDeployments,
  listVercelProjects,
});
