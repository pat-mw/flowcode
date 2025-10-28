/**
 * Database migration runner
 * Run with: pnpm tsx lib/db/migrate.ts
 */

import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';

async function runMigrations() {
  // Use non-pooling connection for migrations if available (recommended for Supabase)
  const databaseUrl =
    process.env.DRIZZLE_DATABASE_URL

  if (!databaseUrl) {
    throw new Error('DRIZZLE_DATABASE_URL is not defined. Please add it to your .env file.');
  }

  console.log('🔄 Running database migrations...');
  console.log('📡 Using connection:', databaseUrl.replace(/:[^:@]+@/, ':****@'));

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: databaseUrl.includes('supabase.com') ? {
      rejectUnauthorized: false, // Required for Supabase
    } : undefined,
  });

  const db = drizzle(pool);

  try {
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('✅ Migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

runMigrations();
