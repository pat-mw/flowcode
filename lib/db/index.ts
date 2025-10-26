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
const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!databaseUrl) {
  throw new Error(
    'DATABASE_URL or POSTGRES_URL is not defined. Please add it to your .env file.\n' +
    'Example: DATABASE_URL="postgresql://user:password@host:port/database"'
  );
}

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: databaseUrl,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30s
  connectionTimeoutMillis: 2000, // Timeout for new client connections
  ssl: {
    rejectUnauthorized: false, // Required for Supabase and other cloud providers
  },
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
