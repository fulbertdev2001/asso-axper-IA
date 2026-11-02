/**
 * Lot 2 — Service Multi-Tenant Organisations, Memberships & Profil Association
 * Applique systématiquement la couche `lib/db/scoped.ts` (§3.1 & §7 Lot 2).
 */

import { Organization } from '../../types';
import { INITIAL_ORGANIZATIONS } from '../../data/mockData';
import { createScopedRepository } from '../db/scoped';
import {
  AuthenticatedSession,
  assertSessionCanAccessOrg,
  createSessionForOrg
} from '../auth';

export interface ScopedOrgRecord extends Organization {
  organizationId: string;
}

export interface MembershipRecord {
  id: string;
  userId: string;
  organizationId: string;
  roleInOrg: string;
  appRole: 'owner' | 'admin_platform';
  createdAt: string;
}

const orgStore: ScopedOrgRecord[] = INITIAL_ORGANIZATIONS.map((o) => ({
  ...o,
  organizationId: o.id,
  mainFunders: [...o.mainFunders]
}));

const membershipStore: MembershipRecord[] = INITIAL_ORGANIZATIONS.map((o, idx) => ({
  id: `mem-${idx + 1}`,
  userId: `user-${o.id}`,
  organizationId: o.id,
  roleInOrg: 'Direction',
  appRole: 'owner',
  createdAt: new Date().toISOString()
}));

export function resetOrgStoreForTests(): void {
  orgStore.length = 0;
  for (const o of INITIAL_ORGANIZATIONS) {
    orgStore.push({
      ...o,
      organizationId: o.id,
      mainFunders: [...o.mainFunders]
    });
  }
}

/**
 * Création de l'organisation, du membership `owner` et du profil à l'inscription (Onboarding Lot 2)
 */
export function registerOrganizationOnSignup(input: {
  email: string;
  roleInOrg?: string;
  organization: Omit<Organization, 'id'> & { id?: string };
}): {
  organization: Organization;
  membership: MembershipRecord;
  sessionToken: string;
  session: AuthenticatedSession;
} {
  const newOrgId = input.organization.id || `org-${Date.now()}`;
  const repo = createScopedRepository<ScopedOrgRecord>(newOrgId, orgStore);

  const inserted = repo.insert({
    id: newOrgId,
    name: input.organization.name,
    siren: input.organization.siren || '',
    rna: input.organization.rna || '',
    sector: input.organization.sector || '',
    employeesCount: Number(input.organization.employeesCount || 1),
    annualBudget: Number(input.organization.annualBudget || 0),
    ccn: input.organization.ccn || '',
    fiscalYearEnd: input.organization.fiscalYearEnd || '31 décembre',
    usualAgMonth: input.organization.usualAgMonth || 'Juin',
    governanceSummary: input.organization.governanceSummary || '',
    mainFunders: Array.isArray(input.organization.mainFunders)
      ? input.organization.mainFunders
      : [],
    establishmentsCount: Number(input.organization.establishmentsCount || 1),
    members: input.organization.members || [],
    accountEmail: input.email
  });

  const membershipRepo = createScopedRepository<MembershipRecord>(newOrgId, membershipStore);
  const membership = membershipRepo.insert({
    id: `mem-${Date.now()}`,
    userId: `user-${newOrgId}`,
    roleInOrg: input.roleInOrg || 'Direction',
    appRole: 'owner',
    createdAt: new Date().toISOString()
  });

  const { sessionToken, session } = createSessionForOrg({
    userId: membership.userId,
    email: input.email,
    organizationId: newOrgId,
    roleInOrg: membership.roleInOrg,
    appRole: 'owner'
  });

  return {
    organization: inserted,
    membership,
    sessionToken,
    session
  };
}

/**
 * Lecture scopée du profil d'une organisation.
 * Lève `CrossTenantAccessError` si l'utilisateur tente de lire une autre organisation.
 */
export function getScopedOrganizationProfile(
  session: AuthenticatedSession | null,
  targetOrgId: string
): Organization {
  const validSession = assertSessionCanAccessOrg(session, targetOrgId);
  const repo = createScopedRepository<ScopedOrgRecord>(validSession.organizationId, orgStore);
  const record = repo.findAll()[0];
  if (!record) {
    throw new Error(`Profil introuvable pour l'organisation ${validSession.organizationId}`);
  }
  return { ...record };
}

/**
 * Modification scopée du profil association après l'onboarding (§7 Lot 2 CA).
 */
export function updateScopedOrganizationProfile(
  session: AuthenticatedSession | null,
  targetOrgId: string,
  patch: Partial<Omit<Organization, 'id'>>
): Organization {
  const validSession = assertSessionCanAccessOrg(session, targetOrgId);
  const repo = createScopedRepository<ScopedOrgRecord>(validSession.organizationId, orgStore);
  const current = repo.findAll()[0];
  if (!current) {
    throw new Error(`Profil introuvable pour l'organisation ${validSession.organizationId}`);
  }

  const index = orgStore.findIndex((o) => o.organizationId === validSession.organizationId);
  const updated: ScopedOrgRecord = {
    ...current,
    ...patch,
    id: current.id,
    organizationId: validSession.organizationId
  };
  orgStore[index] = updated;
  return { ...updated };
}

/**
 * Suppression / réinitialisation des données du profil association (§6 & §7 Lot 2 :
 * "tous les champs sont modifiables et supprimables par l'utilisateur").
 */
export function deleteScopedOrganizationProfile(
  session: AuthenticatedSession | null,
  targetOrgId: string
): Organization {
  const validSession = assertSessionCanAccessOrg(session, targetOrgId);
  return updateScopedOrganizationProfile(validSession, targetOrgId, {
    siren: '',
    rna: '',
    sector: 'Non renseigné',
    employeesCount: 0,
    annualBudget: 0,
    ccn: 'Aucune / Code du travail',
    fiscalYearEnd: '',
    usualAgMonth: '',
    governanceSummary: '',
    mainFunders: [],
    establishmentsCount: 1,
    members: []
  });
}

