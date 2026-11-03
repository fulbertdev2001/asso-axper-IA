/**
 * §3.4 & §4 — Couche IA isolée (`lib/ai/`) avec SDK officiel Anthropic (`@anthropic-ai/sdk`) :
 * - `buildPrompt()` assemble les éléments dans cet ordre :
 *   socle → briques actives → profil association → contexte récupéré.
 * - `retrieveContext()` existe dès le MVP mais retourne `[]`. C'est le point d'entrée du futur RAG.
 * - Modèles par défaut en configuration : `claude-haiku-4-5-20251001` et `claude-sonnet-5`.
 *   (`claude-sonnet-4-6` des CDC est strictement proscrit — §4).
 * - Les prompts sont versionnés, et la version utilisée est journalisée à chaque appel.
 */

import Anthropic from '@anthropic-ai/sdk';
import { Domain, StructuredAnswer } from '../../domain/models';

export const PROMPT_VERSION = '2026.10.v1';

export interface AssociationProfileContext {
  name: string;
  sector: string;
  employeesCount: number;
  annualBudget: number;
  ccn: string;
  fiscalYearEnd: string;
  usualAgMonth: string;
  governanceSummary: string;
  mainFunders: string[];
  establishmentsCount: number;
}

export interface RetrievedChunk {
  source: string;
  excerpt: string;
}

/**
 * Point d'entrée du futur RAG (Phase 2).
 * Retourne obligatoirement `[]` au MVP (§3.4).
 */
export async function retrieveContext(_query: string, _domain: string): Promise<RetrievedChunk[]> {
  return [];
}

const SOCLE_PROMPT = `[SOCLE ASSOEXPERT IA — VERSION ${PROMPT_VERSION}]
Vous êtes AssoExpert IA, l'assistant juridique, social et financier du Cabinet Maé pour les associations françaises employeuses (loi 1901).
RÈGLES IMPÉRATIVES (§4 du cahier des charges) :
1. Ne jamais inventer de chiffre, taux, seuil ou date réglementaire (votre connaissance fiable s'arrête à février 2025 pour Haiku 4.5 et janvier 2026 pour Sonnet 5).
2. Signaler systématiquement ce qui doit être vérifié au regard de la convention collective ou des statuts.
3. Proposer l'escalade vers l'experte humaine (Laetitia Badji — réponse sous 48h) sur tout sujet daté, litigieux ou engageant.
4. Structurer chaque réponse ainsi : Réponse courte → Développement → Références citées → Mention "À vérifier / date".`;

const BRIQUE_PROMPTS: Record<string, string> = {
  'brique.rh': `[BRIQUE ACTIVE : RH & CONVENTIONS COLLECTIVES] Couverture : contrats, temps de travail, CCN66, CCN51, ÉCLAT, ALISFA, disciplinaire.`,
  'brique.gouvernance': `[BRIQUE ACTIVE : GOUVERNANCE LOI 1901] Couverture : statuts, AG, CA, bureau, délégations de pouvoirs, responsabilité des dirigeants.`,
  'brique.finance': `[BRIQUE ACTIVE : FINANCE & SUBVENTIONS] Couverture : plan comptable associatif ANC 2018-06, fonds dédiés, CPOM, FSE, FONJEP, trésorerie.`,
  'brique.conformite': `[BRIQUE ACTIVE : CONFORMITÉ] Couverture : DUERP, affichages obligatoires, RGPD associatif, contrôles URSSAF.`
};

/**
 * Assemble le prompt système dans l'ordre strict imposé par le §3.4 :
 * 1. Socle
 * 2. Briques actives
 * 3. Profil association
 * 4. Contexte récupéré (RAG)
 */
export function buildPrompt(params: {
  activeBricks: string[];
  profile: AssociationProfileContext;
  retrievedContext: RetrievedChunk[];
}): { systemPrompt: string; promptVersion: string } {
  const activeBrickSections = params.activeBricks
    .map((key) => BRIQUE_PROMPTS[key])
    .filter(Boolean)
    .join('\n');

  const bricksBlock = activeBrickSections
    ? `[BRIQUES SOUSCRITES]\n${activeBrickSections}`
    : `[BRIQUES SOUSCRITES]\nAucune brique spécialisée active — répondre uniquement au niveau socle général et proposer l'upgrade.`;

  const profileBlock = `[PROFIL ASSOCIATION]
- Nom : ${params.profile.name}
- Secteur : ${params.profile.sector}
- Effectif : ${params.profile.employeesCount} salarié(s) (${params.profile.establishmentsCount} établissement(s))
- Convention collective (CCN) : ${params.profile.ccn}
- Budget annuel : ${params.profile.annualBudget} € (clôture : ${params.profile.fiscalYearEnd}, AG : ${params.profile.usualAgMonth})
- Gouvernance : ${params.profile.governanceSummary}
- Financeurs principaux : ${params.profile.mainFunders.join(', ') || 'Non renseigné'}`;

  const ragBlock =
    params.retrievedContext.length > 0
      ? `[CONTEXTE RÉCUPÉRÉ]\n${params.retrievedContext.map((c) => `- [${c.source}] ${c.excerpt}`).join('\n')}`
      : `[CONTEXTE RÉCUPÉRÉ]\nAucun document RAG externe injecté (MVP).`;

  const systemPrompt = [SOCLE_PROMPT, bricksBlock, profileBlock, ragBlock].join('\n\n');

  return {
    systemPrompt,
    promptVersion: PROMPT_VERSION
  };
}

/**
 * Normalise l'identifiant du modèle conformément au §4 :
 * - Modèles autorisés par défaut : `claude-haiku-4-5-20251001` et `claude-sonnet-5`.
 * - Interdiction formelle d'utiliser `claude-sonnet-4-6`.
 */
export function sanitizeConfiguredModel(rawModel?: string | null): string {
  if (!rawModel) return 'claude-sonnet-5';
  const clean = rawModel.trim().toLowerCase();
  if (clean.includes('sonnet-4-6')) return 'claude-sonnet-5';
  if (clean.includes('haiku')) return 'claude-haiku-4-5-20251001';
  if (clean.includes('sonnet')) return 'claude-sonnet-5';
  return rawModel.trim();
}

let anthropicClient: { apiKey: string; client: Anthropic } | null = null;

/** Client unique réutilisé entre les requêtes (recréé seulement si la clé change). */
function getAnthropicClient(apiKey: string): Anthropic {
  if (!anthropicClient || anthropicClient.apiKey !== apiKey) {
    anthropicClient = { apiKey, client: new Anthropic({ apiKey }) };
  }
  return anthropicClient.client;
}

export interface CallAnthropicResult {
  structuredAnswer: StructuredAnswer;
  inputTokens: number;
  outputTokens: number;
  modelUsed: string;
}

/**
 * Appelle le SDK officiel Anthropic (`@anthropic-ai/sdk`) côté serveur
 * lorsque `ANTHROPIC_API_KEY` est définie dans l'environnement.
 */
export async function callAnthropicClaude(params: {
  systemPrompt: string;
  question: string;
  domain: Domain;
  configuredModel: string;
  maxTokens: number;
  brickUnlocked: boolean;
  profileName: string;
  profileCcn: string;
}): Promise<CallAnthropicResult | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey || process.env.NODE_ENV === 'test') {
    return null;
  }

  const anthropic = getAnthropicClient(apiKey);
  const targetModel = sanitizeConfiguredModel(params.configuredModel);

  // Ordre d'essai API Anthropic : identifiant configuré (§4), puis endpoints Anthropic actifs
  const candidateModels =
    targetModel === 'claude-haiku-4-5-20251001'
      ? ['claude-haiku-4-5-20251001', 'claude-3-5-haiku-latest']
      : ['claude-sonnet-5', 'claude-sonnet-4-20250514', 'claude-3-7-sonnet-latest', 'claude-3-5-sonnet-latest'];

  const jsonInstruction = `
IMPORTANT — FORMAT DE SORTIE OBLIGATOIRE :
Répondez EXCLUSIVEMENT avec un objet JSON valide (sans texte avant ni après) respectant exactement cette structure :
{
  "shortSummary": "Réponse directe et synthétique en 2 à 3 phrases claires.",
  "detailedAnalysis": "1. Principe légal et conventionnel\\n...\\n\\n2. Application à votre association (${params.profileName} — ${params.profileCcn})\\n...\\n\\n3. Plan d'action recommandé\\n...",
  "references": ["Référence légale ou article du Code du travail / Loi 1901", "Disposition de la convention collective (${params.profileCcn})"],
  "verificationNote": "À vérifier (connaissance arrêtée à ${targetModel.includes('haiku') ? 'février 2025' : 'janvier 2026'}) : Précisez ici les seuils, dates ou accords d'entreprise à vérifier et pourquoi solliciter Laetitia Badji sous 48h.",
  "suggestedTicketDomain": "${params.domain}",
  "suggestedTicketQuestion": "Question préremplie synthétique pour l'escalade vers l'experte Laetitia Badji"
}
${
  !params.brickUnlocked
    ? `ATTENTION : La brique "${params.domain}" n'est PAS incluse dans la formule actuelle de l'association. Répondez uniquement au niveau socle général (principes généraux Loi 1901) et invitez explicitement l'utilisateur à passer à la formule supérieure pour débloquer l'analyse conventionnelle détaillée.`
    : ''
}`;

  for (const apiModel of candidateModels) {
    let rawText = '';
    let inputTokens = 0;
    let outputTokens = 0;

    try {
      const response = await anthropic.messages.create({
        model: apiModel,
        max_tokens: Math.min(Math.max(params.maxTokens || 2048, 512), 8192),
        system: `${params.systemPrompt}

${jsonInstruction}`,
        messages: [
          {
            role: 'user',
            content: `[Domaine : ${params.domain.toUpperCase()}]
Question de l'association : ${params.question}`
          }
        ]
      });

      const textBlock = response.content.find((b) => b.type === 'text');
      rawText = textBlock && 'text' in textBlock ? textBlock.text.trim() : '';
      inputTokens = response.usage?.input_tokens || Math.ceil(params.question.length / 4);
      outputTokens = response.usage?.output_tokens || Math.ceil(rawText.length / 4);
    } catch (err) {
      // Seul un identifiant de modèle inconnu justifie d'essayer le candidat suivant.
      // Toute autre erreur (clé, quota, surcharge…) arrête la boucle : pas d'appel facturé en double.
      // Journalisation SANS contenu de question ni de réponse (§3.7).
      const status = err instanceof Anthropic.APIError ? err.status : undefined;
      console.error(`[AI] Échec de l'appel Anthropic (modèle ${apiModel}, statut ${status ?? 'inconnu'}).`);
      if (err instanceof Anthropic.NotFoundError) continue;
      return null;
    }

    if (!rawText) return null;

    // Extraction robuste du JSON (avec ou sans balises ```json). Si le JSON est invalide,
    // la réponse texte déjà facturée est conservée telle quelle (aucun nouvel appel).
    let parsed: Partial<StructuredAnswer> = {};
    try {
      parsed = JSON.parse(
        rawText
          .replace(/^```json\s*/i, '')
          .replace(/^```\s*/i, '')
          .replace(/\s*```$/, '')
          .trim()
      ) as Partial<StructuredAnswer>;
    } catch {
      parsed = {};
    }

    return {
      structuredAnswer: {
        shortSummary: parsed.shortSummary || 'Analyse juridique et conventionnelle générée.',
        detailedAnalysis: parsed.detailedAnalysis || rawText,
        references:
          Array.isArray(parsed.references) && parsed.references.length > 0
            ? parsed.references
            : [`Convention collective : ${params.profileCcn}`, `Profil : ${params.profileName}`],
        verificationNote:
          parsed.verificationNote ||
          `À vérifier (connaissance arrêtée à ${targetModel.includes('haiku') ? 'février 2025' : 'janvier 2026'}) : Vérifiez vos accords internes ou sollicitez Laetitia Badji sous 48h.`,
        suggestedTicketDomain: (parsed.suggestedTicketDomain as Domain) || params.domain,
        suggestedTicketQuestion: parsed.suggestedTicketQuestion || params.question
      },
      inputTokens,
      outputTokens,
      // Modèle ayant réellement répondu (et non le modèle demandé) pour un coût exact
      modelUsed: apiModel
    };
  }

  return null;
}
