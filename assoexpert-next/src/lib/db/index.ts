import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http';
import { drizzle as drizzlePostgres } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Retry automatique en cas de réveil (cold start) de Neon PostgreSQL Serverless
neonConfig.fetchFunction = async (url: string, options?: RequestInit) => {
  let lastError: unknown;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      return await fetch(url, options);
    } catch (err) {
      lastError = err;
      if (attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, 400 * attempt));
      }
    }
  }
  throw lastError;
};

const connectionString = process.env.DATABASE_URL || '';

/**
 * Client SQL direct Neon Serverless (`const sql = neon(process.env.DATABASE_URL)`)
 */
export function getNeonSql() {
  if (!connectionString) {
    throw new Error('DATABASE_URL non définie dans les variables d’environnement.');
  }
  return neon(connectionString);
}

/**
 * Instance Drizzle ORM compatible à la fois avec :
 * - Neon PostgreSQL Serverless (`@neondatabase/serverless` + `drizzle-orm/neon-http`)
 * - PostgreSQL standard (Docker local / Coolify via `postgres-js`)
 */
function createDrizzleClient() {
  if (!connectionString) return null;

  if (connectionString.includes('neon.tech')) {
    const sql = neon(connectionString);
    return drizzleNeon(sql, { schema });
  }

  const queryClient = postgres(connectionString, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 15
  });
  return drizzlePostgres(queryClient, { schema });
}

export const db = createDrizzleClient();
export type Database = typeof db;
