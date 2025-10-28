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
    url: process.env.DRIZZLE_DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
