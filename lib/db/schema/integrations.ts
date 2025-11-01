/**
 * Cloud provider integrations table
 * Stores encrypted OAuth tokens and connection metadata for cloud providers
 * Supports multi-provider architecture (Vercel, Netlify, Railway, etc.)
 */

import { pgTable, text, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { users } from './users';

/**
 * Integrations table - Cloud provider connections
 * Each row represents a user's connection to a cloud provider
 * Tokens are encrypted at rest using AES-256-GCM
 */
export const integrations = pgTable('integrations', {
  id: text('id').primaryKey(),

  // User relationship
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  // Provider type (extensible for future providers)
  provider: text('provider').notNull(), // 'vercel', 'netlify', 'railway', etc.

  // Encrypted OAuth tokens
  // These fields store the output of AES-256-GCM encryption
  accessToken: text('access_token').notNull(), // Encrypted access token
  accessTokenIv: text('access_token_iv').notNull(), // Initialization vector
  accessTokenAuthTag: text('access_token_auth_tag').notNull(), // Authentication tag

  // Encrypted refresh token (nullable for providers that don't use refresh tokens)
  refreshToken: text('refresh_token'),
  refreshTokenIv: text('refresh_token_iv'),
  refreshTokenAuthTag: text('refresh_token_auth_tag'),

  // Token expiration (for automatic refresh)
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),

  // Provider-specific metadata (team ID, account ID, etc.)
  // Example: { teamId: 'team_xxx', accountId: 'acc_xxx' }
  metadata: jsonb('metadata').$type<Record<string, unknown>>(),

  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

/**
 * Type helper for integrations table
 */
export type Integration = typeof integrations.$inferSelect;
export type NewIntegration = typeof integrations.$inferInsert;
