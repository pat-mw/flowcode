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
import * as waitlistSchema from './schema/waitlist';

// Use DRIZZLE_DATABASE_URL for Drizzle connections
// Falls back to other common env vars if not set
const connectionString =
  process.env.DRIZZLE_DATABASE_URL

if (!connectionString) {
  throw new Error(
    'DRIZZLE_DATABASE_URL is not defined. Please add it to your .env file.\n' +
    'Example: DRIZZLE_DATABASE_URL="postgresql://user:password@host:port/database"'
  );
}

// Create postgres-js client
// Disable prefetch as it's not supported for "Transaction" pool mode (PgBouncer)
// This is recommended by Supabase for serverless environments
const client = postgres(connectionString, {
  prepare: false, // Disable prepared statements for transaction pooling mode
});

// Initialize Drizzle ORM with schema including relations
export const db = drizzle(client, {
  schema: {
    ...usersSchema,
    ...peopleSchema,
    ...postsSchema,
    ...waitlistSchema,
  },
});

// Export all schemas
export * from './schema/users';
export * from './schema/people';
export * from './schema/posts';
export * from './schema/waitlist';

// Export client for raw queries if needed
export { client };
