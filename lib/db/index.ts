/**
 * Database connection and exports
 * Configures Drizzle ORM with PostgreSQL using postgres-js
 *
 * Uses postgres-js instead of node-postgres (pg) for better serverless compatibility
 * and to avoid SSL certificate issues in Vercel/Supabase environments
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as usersSchema from './schema/users';
import * as peopleSchema from './schema/people';
import * as postsSchema from './schema/posts';

// Use DRIZZLE_DATABASE_URL for Drizzle connections
// Falls back to other common env vars if not set
const connectionString =
  process.env.DRIZZLE_DATABASE_URL ||
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL;

if (!connectionString) {
  throw new Error(
    'DRIZZLE_DATABASE_URL, DATABASE_URL, or POSTGRES_URL is not defined. Please add it to your .env file.\n' +
    'Example: DRIZZLE_DATABASE_URL="postgresql://user:password@host:port/database"'
  );
}

// Create postgres-js client
// Disable prefetch as it's not supported for "Transaction" pool mode (PgBouncer)
// This is recommended by Supabase for serverless environments
const client = postgres(connectionString, {
  prepare: false, // Disable prepared statements for transaction pooling mode
});

// Initialize Drizzle ORM
export const db = drizzle(client, {
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

// Export client for raw queries if needed
export { client };
