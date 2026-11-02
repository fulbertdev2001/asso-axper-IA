import { and, eq, SQL } from 'drizzle-orm';
import {
  organizationProfiles,
  memberships,
  subscriptions,
  conversations,
  messages,
  aiUsage,
  expertTickets
} from './schema';

/**
 * §3.1 — Multi-tenant par organisation :
 * "L'unité métier est l'`organization`, pas l'utilisateur. Tout objet métier porte
 * un `organization_id`. L'isolation est garantie par une couche d'accès aux données
 * unique (`lib/db/scoped.ts`) qui injecte systématiquement le filtre d'organisation.
 * Aucune requête métier ne doit contourner cette couche."
 */

export class CrossTenantAccessError extends Error {
  constructor(message = 'Violation isolation multi-tenant : organization_id invalide ou manquant.') {
    super(message);
    this.name = 'CrossTenantAccessError';
  }
}

export function assertValidOrganizationId(organizationId: string): string {
  if (!organizationId || typeof organizationId !== 'string' || organizationId.trim().length === 0) {
    throw new CrossTenantAccessError('organizationId obligatoire pour toute opération métier.');
  }
  return organizationId.trim();
}

/**
 * Construit une clause SQL Drizzle scopée par `organizationId` pour n'importe quelle table métier.
 */
export function withOrgScope<TColumn extends { name: string }>(
  orgColumn: TColumn,
  organizationId: string,
  extraCondition?: SQL
): SQL {
  const validOrgId = assertValidOrganizationId(organizationId);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const baseFilter = eq(orgColumn as any, validOrgId);
  return extraCondition ? (and(baseFilter, extraCondition) as SQL) : baseFilter;
}

/**
 * Filtre en mémoire ou en couche repository garantissant qu'aucun enregistrement
 * appartenant à une autre organisation ne puisse être lu ou modifié.
 */
export function createScopedRepository<T extends { organizationId: string }>(
  organizationId: string,
  records: T[]
) {
  const validOrgId = assertValidOrganizationId(organizationId);

  return {
    organizationId: validOrgId,

    findAll(): T[] {
      return records.filter((r) => r.organizationId === validOrgId);
    },

    findById(id: string & keyof T extends never ? string : string): (T & { id?: string }) | null {
      const found = records.find(
        (r) => (r as T & { id?: string }).id === id && r.organizationId === validOrgId
      );
      return found ?? null;
    },

    insert<Payload extends Omit<T, 'organizationId'>>(payload: Payload): T {
      // Force systématiquement l'organizationId du scope actif (ignore toute tentative d'injection)
      const record = {
        ...payload,
        organizationId: validOrgId
      } as unknown as T;
      records.push(record);
      return record;
    },

    deleteById(id: string): boolean {
      const index = records.findIndex(
        (r) => (r as T & { id?: string }).id === id && r.organizationId === validOrgId
      );
      if (index === -1) return false;
      records.splice(index, 1);
      return true;
    }
  };
}

/**
 * Tables métier soumises à l'isolation stricte par `organization_id`
 */
export const SCOPED_TABLES = {
  organizationProfiles,
  memberships,
  subscriptions,
  conversations,
  messages,
  aiUsage,
  expertTickets
} as const;

