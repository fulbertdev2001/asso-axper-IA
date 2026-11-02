import fs from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'drizzle-kit';

function loadEnvLocalDatabaseUrl(): string {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  const envLocalPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envLocalPath)) {
    const content = fs.readFileSync(envLocalPath, 'utf8');
    const match = content.match(/^DATABASE_URL=["']?([^"'\r\n]+)["']?/m);
    if (match?.[1]) {
      return match[1].trim();
    }
  }
  return '';
}

export default defineConfig({
  schema: './src/lib/db/schema.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: loadEnvLocalDatabaseUrl()
  },
  verbose: true,
  strict: false
});
