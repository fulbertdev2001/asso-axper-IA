/**
 * §3.4 — Couche IA isolée (`lib/ai/`) :
 * - `buildPrompt()` assemble les éléments dans cet ordre :
 *   socle → briques actives → profil association → contexte récupéré.
 * - `retrieveContext()` existe dès le MVP mais retourne `[]`. C'est le point d'entrée du futur RAG.
 * - Le modèle et `max_tokens` sont définis par formule dans la configuration.
 * - Les prompts sont versionnés, et la version utilisée est journalisée à chaque appel.
 */

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
1. Ne jamais inventer de chiffre, taux, seuil ou date réglementaire.
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

