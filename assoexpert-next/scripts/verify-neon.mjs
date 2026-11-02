import fs from 'fs';
import path from 'path';
import { neon } from '@neondatabase/serverless';

const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const match = envContent.match(/^DATABASE_URL=["']?([^"'\r\n]+)["']?/m);
const databaseUrl = match ? match[1] : process.env.DATABASE_URL;

async function main() {
  const sql = neon(databaseUrl);
  const profile = await sql`SELECT * FROM organization_profiles WHERE org_id = '7dfc7048-512d-46dc-8483-7a03f040e0b9'`;
  const sub = await sql`SELECT * FROM subscriptions WHERE org_id = '7dfc7048-512d-46dc-8483-7a03f040e0b9'`;
  console.log('=== PROFILE ===', profile[0]);
  console.log('=== SUBSCRIPTION ===', sub[0]);
}

main();
