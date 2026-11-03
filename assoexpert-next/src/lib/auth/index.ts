/**
 * @deprecated Module hérité, conservé uniquement pour les anciens services en mémoire
 * (`lib/org`, `lib/tickets`, `lib/ai/chat-service`).
 * L'authentification de production est assurée par `services/auth.service.ts`
 * (sessions hachées en base, magic links et réinitialisation via `verification_tokens`).
 *
 * Supprimé pour raisons de sécurité : sessions de démonstration à jeton connu,
 * magic links générés avec `Math.random`, authentification par en-tête `x-authenticated-org-id`.
 */

import crypto from 'crypto';
import { CrossTenantAccessError, assertValidOrganizationId } from '../db/scoped';

export type { PasswordHasher } from './password';
export { ScryptPasswordHasher } from './password';

export interface AuthenticatedSession {
  userId: string;
  email: string;
  organizationId: string;
  roleInOrg: string;
  appRole: 'owner' | 'admin_platform';
}

const activeSessionStore = new Map<string, AuthenticatedSession>();

export function createSessionForOrg(params: {
  userId: string;
  email: string;
  organizationId: string;
  roleInOrg?: string;
  appRole?: 'owner' | 'admin_platform';
}): { sessionToken: string; session: AuthenticatedSession } {
  const validOrgId = assertValidOrganizationId(params.organizationId);
  const sessionToken = `session_${crypto.randomBytes(32).toString('hex')}`;
  const session: AuthenticatedSession = {
    userId: params.userId,
    email: params.email,
    organizationId: validOrgId,
    roleInOrg: params.roleInOrg || 'Direction',
    appRole: params.appRole || 'owner'
  };
  activeSessionStore.set(sessionToken, session);
  return { sessionToken, session };
}

/**
 * Vérifie que la session authentifiée a le droit d'accéder à `targetOrganizationId`.
 * Lève `CrossTenantAccessError` si l'utilisateur de l'organisation A tente d'accéder
 * aux données de l'organisation B (§7 Lot 2 CA).
 */
export function assertSessionCanAccessOrg(
  session: AuthenticatedSession | null,
  targetOrganizationId: string
): AuthenticatedSession {
  if (!session) {
    throw new CrossTenantAccessError('Authentification requise.');
  }
  const validTargetOrgId = assertValidOrganizationId(targetOrganizationId);
  if (session.organizationId !== validTargetOrgId) {
    throw new CrossTenantAccessError(
      `Accès refusé : l'utilisateur de l'organisation '${session.organizationId}' ne peut accéder à aucune donnée de l'organisation '${validTargetOrgId}'.`
    );
  }
  return session;
}
