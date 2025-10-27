/**
 * Drizzle Kit configuration
 * Used for generating and running database migrations
 */

import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

// Load environment variables from .env file
config();

export default defineConfig({
  schema: './lib/db/schema/*.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || process.env.POSTGRES_URL!,
    ssl: {
      rejectUnauthorized: false, // Required for Supabase and cloud providers
    },
  },
  verbose: true,
  strict: true,
});
