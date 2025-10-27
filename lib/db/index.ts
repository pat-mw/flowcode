/**
 * Database connection and exports
 * Configures Drizzle ORM with PostgreSQL
 */

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as usersSchema from './schema/users';
import * as peopleSchema from './schema/people';
import * as postsSchema from './schema/posts';

// Validate DATABASE_URL or POSTGRES_URL exists
// Use POSTGRES_URL (pooled) for runtime, POSTGRES_URL_NON_POOLING for migrations
const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_URL_NON_POOLING;
if (!databaseUrl) {
  throw new Error(
    'DATABASE_URL or POSTGRES_URL is not defined. Please add it to your .env file.\n' +
    'Example: DATABASE_URL="postgresql://user:password@host:port/database"'
  );
}

// Determine if we're in production (Vercel) or local dev
const isProduction = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
const isLocal = databaseUrl.includes('localhost') || databaseUrl.includes('127.0.0.1');

// For non-local environments, ensure SSL parameters are in the connection string
// This is more reliable in serverless environments than Pool config alone
let finalConnectionString = databaseUrl;
if (!isLocal && !databaseUrl.includes('sslmode=')) {
  // Append sslmode=require to bypass certificate validation for Supabase/Vercel
  const separator = databaseUrl.includes('?') ? '&' : '?';
  finalConnectionString = `${databaseUrl}${separator}sslmode=require`;
}

// SSL configuration for different environments
const sslConfig = isLocal
  ? false // No SSL for localhost
  : {
      rejectUnauthorized: false, // Allow self-signed certificates
      // This combined with sslmode=require handles Supabase/Vercel SSL properly
    };

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: finalConnectionString,
  max: isProduction ? 20 : 10, // More connections in production
  idleTimeoutMillis: 30000, // Close idle clients after 30s
  connectionTimeoutMillis: 2000, // Timeout for new client connections
  ssl: sslConfig,
});

// Initialize Drizzle ORM
export const db = drizzle(pool, {
  schema: {
    ...usersSchema,
    ...peopleSchema,
    ...postsSchema,
  },
});

// Export all schemas
export * from './schema/users';
export * from './schema/people';
export * from './schema/posts';

// Export pool for raw queries if needed
export { pool };
