/**
 * Lot 4 — Service Assistant IA (Mode Simulateur Structuré & Couche Serveur Scopée)
 * §3.4, §3.7 & §7 Lot 4 :
 * - Assemble le prompt via `buildPrompt()` (socle -> briques actives -> profil -> retrieveContext).
 * - Vérifie les droits (`brique.rh`, `brique.gouvernance`, `brique.finance`, `brique.conformite`),
 *   la limite de caractères `ai.max_input_chars`, `ai.max_tokens` et le rate limit (10 req/min/user).
 * - Si le domaine demandé n'est pas souscrit : traite la question au niveau socle et propose l'upgrade.
 * - Stocke l'historique des conversations par organisation (supprimable) via `lib/db/scoped.ts`.
 * - Journalise `ai_usage` SANS aucun contenu de question ou de réponse.
 */

import { Domain, ChatMessage, AiUsageRecord } from '../../types';
import { generateAiResponse } from '../../services/aiSimulator';
import { buildPrompt, retrieveContext, PROMPT_VERSION } from './index';
import {
  orgHasFeature,
  orgGetLimit,
  orgGetConfigValue
} from '../billing/service';
import { getScopedOrganizationProfile } from '../org/service';
import { AuthenticatedSession, assertSessionCanAccessOrg } from '../auth';
import { createScopedRepository } from '../db/scoped';
import { checkRateLimit } from '../rate-limit';
import { FeatureKey } from '../entitlements';

export interface ScopedConversationRecord {
  id: string;
  organizationId: string;
  userId: string;
  domain: Domain;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
}

export interface ScopedAiUsageEntry extends AiUsageRecord {
  organizationId: string;
}

const conversationStore: ScopedConversationRecord[] = [];
const aiUsageStore: ScopedAiUsageEntry[] = [];

const DOMAIN_TO_FEATURE_KEY: Record<Domain, FeatureKey> = {
  rh: 'brique.rh',
  gouvernance: 'brique.gouvernance',
  finance: 'brique.finance',
  conformite: 'brique.conformite'
};

export function resetAiStoresForTests(): void {
  conversationStore.length = 0;
  aiUsageStore.length = 0;
}

export function recordAiUsageForTests(entry: ScopedAiUsageEntry): void {
  aiUsageStore.push(entry);
}

export async function handleScopedAiChatRequest(params: {
  session: AuthenticatedSession | null;
  organizationId: string;
  domain: Domain;
  question: string;
  conversationId?: string;
}): Promise<{
  conversationId: string;
  upgradeSuggested: boolean;
  brickUnlocked: boolean;
  promptVersion: string;
  systemPromptPreview: string;
  assistantMessage: ChatMessage;
  usage: Omit<ScopedAiUsageEntry, 'organizationId'>;
}> {
  const validSession = assertSessionCanAccessOrg(params.session, params.organizationId);
  const orgId = validSession.organizationId;

  // 1. Rate limiting (10 req/min/utilisateur)
  const rl = checkRateLimit(validSession.userId);
  if (!rl.allowed) {
    throw new Error('Limite de fréquence atteinte (10 requêtes/minute). Veuillez patienter.');
  }

  // 2. Contrôle de la longueur maximale de la question selon les droits (`ai.max_input_chars`)
  const maxInputChars = orgGetLimit(orgId, 'ai.max_input_chars', 2000);
  if (params.question.length > maxInputChars) {
    throw new Error(
      `Votre question dépasse la limite autorisée par votre formule (${maxInputChars} caractères maximum).`
    );
  }

  // 3. Vérification de la brique souscrite (§7 Lot 4 CA #1)
  const requiredFeature = DOMAIN_TO_FEATURE_KEY[params.domain];
  const brickUnlocked = orgHasFeature(orgId, requiredFeature);
  const activeBricks = (Object.values(DOMAIN_TO_FEATURE_KEY) as FeatureKey[]).filter((fk) =>
    orgHasFeature(orgId, fk)
  );

  // 4. Assemblage modulaire du prompt dans l'ordre strict : socle -> briques -> profil -> RAG
  const profile = getScopedOrganizationProfile(validSession, orgId);
  const retrievedContext = await retrieveContext(params.question, params.domain);
  const { systemPrompt, promptVersion } = buildPrompt({
    activeBricks,
    profile,
    retrievedContext
  });

  const modelConfigured = orgGetConfigValue(orgId, 'ai.model', 'claude-haiku-4-5-20251001');
  const maxTokens = orgGetLimit(orgId, 'ai.max_tokens', 1024);

  // 5. Génération de la réponse structurée (niveau socle + CTA upgrade si brique verrouillée)
  let structuredAnswer: NonNullable<ChatMessage['structuredAnswer']>;
  let tokensCount = 420;
  let costEur = 0.0042;

  if (!brickUnlocked) {
    structuredAnswer = {
      shortSummary: `[Niveau Socle Général] La brique « ${params.domain.toUpperCase()} » n'est pas incluse dans votre formule actuelle. Voici les principes généraux applicables à toute association loi 1901 (${profile.name}).`,
      detailedAnalysis: `Votre question porte sur le domaine « ${params.domain} ». Au niveau socle, nous vous rappelons les obligations générales du Code du travail et de la loi du 1er juillet 1901. Pour débloquer l'analyse approfondie intégrant votre convention collective (${profile.ccn}) et vos spécificités sectorielles (${profile.sector}), passez à la formule supérieure.`,
      references: [
        'Loi du 1er juillet 1901 relative au contrat d’association',
        `Profil association : ${profile.name} (${profile.employeesCount} salariés)`
      ],
      verificationNote:
        'À vérifier : Débloquez la brique dédiée ou sollicitez l’experte Laetitia Badji sous 48h pour une analyse conventionnelle complète.',
      suggestedTicketDomain: params.domain,
      suggestedTicketQuestion: params.question
    };
  } else {
    const simulated = generateAiResponse(params.question, params.domain, profile, {
      briqueRh: orgHasFeature(orgId, 'brique.rh'),
      briqueGouvernance: orgHasFeature(orgId, 'brique.gouvernance'),
      briqueFinance: orgHasFeature(orgId, 'brique.finance'),
      briqueConformite: orgHasFeature(orgId, 'brique.conformite'),
      aiModel: modelConfigured,
      maxTokens,
      maxInputChars,
      expertQuestionsMonth: orgGetLimit(orgId, 'expert_questions_month', 0)
    });
    structuredAnswer = simulated;
    tokensCount = Math.min(540, maxTokens);
    costEur = 0.0054;
  }

  // 6. Enregistrement dans l'historique scopé par organisation
  const convRepo = createScopedRepository<ScopedConversationRecord>(orgId, conversationStore);
  const convId = params.conversationId || `conv-${Date.now()}`;
  const nowTime = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  const userMsg: ChatMessage = {
    id: `msg-u-${Date.now()}`,
    domain: params.domain,
    role: 'user',
    content: params.question,
    createdAt: nowTime
  };

  const assistantMessage: ChatMessage = {
    id: `msg-a-${Date.now() + 1}`,
    domain: params.domain,
    role: 'assistant',
    structuredAnswer,
    createdAt: nowTime,
    modelUsed: modelConfigured,
    tokensCount
  };

  const existingConv = convRepo.findById(convId);
  if (existingConv) {
    existingConv.messages.push(userMsg, assistantMessage);
  } else {
    convRepo.insert({
      id: convId,
      userId: validSession.userId,
      domain: params.domain,
      title: params.question.slice(0, 60),
      messages: [userMsg, assistantMessage],
      createdAt: new Date().toISOString()
    });
  }

  // 7. Journalisation `ai_usage` SANS contenu de message (§3.7 & §7 Lot 4 CA #2 et #3)
  const usageRepo = createScopedRepository<ScopedAiUsageEntry>(orgId, aiUsageStore);
  const inputTokens = Math.round(tokensCount * 0.4);
  const outputTokens = Math.round(tokensCount * 0.6);

  const usageEntry = usageRepo.insert({
    id: `usage-${Date.now()}`,
    orgId,
    orgName: profile.name,
    model: modelConfigured,
    promptVersion: PROMPT_VERSION,
    inputTokens,
    outputTokens,
    costEstimateEur: costEur,
    createdAt: new Date().toISOString()
  });

  return {
    conversationId: convId,
    upgradeSuggested: !brickUnlocked,
    brickUnlocked,
    promptVersion,
    systemPromptPreview: systemPrompt,
    assistantMessage,
    usage: usageEntry
  };
}

export function listScopedConversations(
  session: AuthenticatedSession | null,
  targetOrgId: string
): ScopedConversationRecord[] {
  const validSession = assertSessionCanAccessOrg(session, targetOrgId);
  const convRepo = createScopedRepository<ScopedConversationRecord>(
    validSession.organizationId,
    conversationStore
  );
  return convRepo.findAll();
}

export function deleteScopedConversation(
  session: AuthenticatedSession | null,
  targetOrgId: string,
  conversationId: string
): boolean {
  const validSession = assertSessionCanAccessOrg(session, targetOrgId);
  const convRepo = createScopedRepository<ScopedConversationRecord>(
    validSession.organizationId,
    conversationStore
  );
  return convRepo.deleteById(conversationId);
}

/**
 * Retourne le coût IA agrégé par organisation pour l'admin (§7 Lot 4 CA #3)
 * Aucun contenu de question ou de réponse n'est stocké dans `aiUsageStore`.
 */
export function getAiUsageSummaryByOrg(): {
  records: ScopedAiUsageEntry[];
  totalCostByOrg: Record<string, number>;
} {
  const totalCostByOrg: Record<string, number> = {};
  for (const entry of aiUsageStore) {
    totalCostByOrg[entry.orgId] = Number(
      ((totalCostByOrg[entry.orgId] || 0) + entry.costEstimateEur).toFixed(6)
    );
  }
  return {
    records: [...aiUsageStore],
    totalCostByOrg
  };
}
