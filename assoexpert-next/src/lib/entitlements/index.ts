/**
 * §3.2 — Droits par fonctionnalités, jamais par nom de formule :
 * - Le code interroge des fonctions comme `hasFeature(org, 'brique.rh')`
 *   ou `getLimit(org, 'expert_questions_month')`.
 * - Il ne teste jamais une formule par son nom (`plan === 'pro'` est proscrit).
 * - Formules, droits et limites vivent en base.
 */

export type FeatureKey =
  | 'brique.rh'
  | 'brique.gouvernance'
  | 'brique.finance'
  | 'brique.conformite'
  | 'ai.model'
  | 'ai.max_tokens'
  | 'ai.max_input_chars'
  | 'expert_questions_month';

export interface OrgFeatureGrant {
  featureKey: FeatureKey;
  enabled: boolean;
  limitValue?: string | number | null;
}

export interface OrganizationEntitlementContext {
  organizationId: string;
  subscriptionStatus: 'active' | 'past_due' | 'canceled' | 'suspended';
  graceUntil?: Date | null;
  grants: OrgFeatureGrant[];
}

export function isSubscriptionEntitled(
  ctx: OrganizationEntitlementContext,
  now = new Date()
): boolean {
  if (ctx.subscriptionStatus === 'active') return true;
  if (ctx.subscriptionStatus === 'past_due' && ctx.graceUntil && now <= ctx.graceUntil) {
    return true;
  }
  return false;
}

export function hasFeature(
  ctx: OrganizationEntitlementContext,
  featureKey: FeatureKey,
  now = new Date()
): boolean {
  if (!isSubscriptionEntitled(ctx, now)) return false;
  const grant = ctx.grants.find((g) => g.featureKey === featureKey);
  return Boolean(grant?.enabled);
}

export function getLimit(
  ctx: OrganizationEntitlementContext,
  featureKey: FeatureKey,
  defaultValue = 0,
  now = new Date()
): number {
  if (!isSubscriptionEntitled(ctx, now)) return 0;
  const grant = ctx.grants.find((g) => g.featureKey === featureKey);
  if (!grant || !grant.enabled || grant.limitValue === null || grant.limitValue === undefined) {
    return defaultValue;
  }
  const parsed = Number(grant.limitValue);
  return Number.isFinite(parsed) ? parsed : defaultValue;
}

export function getConfigValue(
  ctx: OrganizationEntitlementContext,
  featureKey: FeatureKey,
  defaultValue: string
): string {
  const grant = ctx.grants.find((g) => g.featureKey === featureKey);
  if (!grant || !grant.enabled || !grant.limitValue) {
    return defaultValue;
  }
  return String(grant.limitValue);
}

