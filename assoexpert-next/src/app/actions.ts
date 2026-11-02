'use server';

import { neon } from '@neondatabase/serverless';
import { assertValidOrganizationId } from '../lib/db/scoped';

/**
 * Server Actions connectées à Neon PostgreSQL (`@neondatabase/serverless`)
 * Toutes les requêtes métier respectent l'isolation multi-tenant (§3.1).
 */
export async function checkDatabaseConnection() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return { connected: false, mode: 'local-fallback', version: null };
  }

  const sql = neon(databaseUrl);
  const rows = await sql`SELECT version() AS version, current_database() AS db_name`;
  return {
    connected: true,
    mode: 'neon-serverless',
    version: rows[0]?.version ?? null,
    dbName: rows[0]?.db_name ?? null
  };
}

/**
 * Récupère les données scopées d'une organisation depuis Neon PostgreSQL
 */
export async function getOrganizationScopedData(organizationId: string) {
  const validOrgId = assertValidOrganizationId(organizationId);
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return { organization: null, profile: null, subscription: null };
  }

  const sql = neon(databaseUrl);
  const [organization] = await sql`
    SELECT id, name, siren, rna, created_at
    FROM organizations
    WHERE id = ${validOrgId}
    LIMIT 1
  `;

  const [profile] = await sql`
    SELECT org_id, sector, employees_count, annual_budget, ccn, fiscal_year_end,
           usual_ag_month, governance_summary, main_funders, establishments_count
    FROM organization_profiles
    WHERE org_id = ${validOrgId}
    LIMIT 1
  `;

  const [subscription] = await sql`
    SELECT org_id, stripe_customer_id, stripe_subscription_id, plan_code,
           status, current_period_end, grace_until
    FROM subscriptions
    WHERE org_id = ${validOrgId}
    LIMIT 1
  `;

  return {
    organization: organization ?? null,
    profile: profile ?? null,
    subscription: subscription ?? null
  };
}

