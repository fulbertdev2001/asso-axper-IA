import { describe, it, expect, beforeEach } from 'vitest';
import {
  createScopedRepository,
  CrossTenantAccessError
} from '../src/lib/db/scoped';
import {
  scrubSensitiveData,
  captureExceptionScrubbed
} from '../src/lib/monitoring/glitchtip';
import { track, captureUtmFromUrl } from '../src/lib/analytics/track';
import {
  hasFeature,
  getLimit,
  OrganizationEntitlementContext
} from '../src/lib/entitlements';
import { buildPrompt, retrieveContext, PROMPT_VERSION } from '../src/lib/ai';
import { checkRateLimit, resetRateLimitBuckets } from '../src/lib/rate-limit';
import robots from '../src/app/robots';
import sitemap from '../src/app/sitemap';

describe('Lot 1 — Socle technique & Principes non négociables (§3, §4, §7)', () => {
  describe('§3.1 — Isolation multi-tenant stricte (lib/db/scoped.ts)', () => {
    it('empêche une organisation A de lire ou supprimer les données d’une organisation B', () => {
      const sharedStore = [
        { id: 'doc-1', organizationId: 'org-A', title: 'PV AG Association A' },
        { id: 'doc-2', organizationId: 'org-B', title: 'PV AG Association B' }
      ];

      const repoOrgA = createScopedRepository('org-A', sharedStore);

      expect(repoOrgA.findAll()).toHaveLength(1);
      expect(repoOrgA.findById('doc-1')?.title).toBe('PV AG Association A');
      // Org A tente d'accéder à doc-2 (appartenant à Org B) -> null
      expect(repoOrgA.findById('doc-2')).toBeNull();
      // Org A tente de supprimer doc-2 -> false
      expect(repoOrgA.deleteById('doc-2')).toBe(false);
      expect(sharedStore).toHaveLength(2);
    });

    it('rejette tout appel sans organizationId valide', () => {
      expect(() => createScopedRepository('', [])).toThrow(CrossTenantAccessError);
    });
  });

  describe('§3.7 & Lot 1 CA — GlitchTip avec scrubbing obligatoire du contenu des messages', () => {
    it('masque systématiquement content, question, answer, prompt et clés API', () => {
      const report = captureExceptionScrubbed(
        new Error('Erreur appel sk-ant-api03-secretKey1234567890'),
        {
          organizationId: 'org-1',
          model: 'claude-sonnet-5',
          inputTokens: 420,
          outputTokens: 680,
          question: 'Question confidentielle sur un licenciement CCN66',
          content: 'Réponse détaillée confidentielle',
          messages: [{ role: 'user', content: 'Texte privé' }]
        }
      );

      expect(report.errorMessage).toContain('[REDACTED_ANTHROPIC_KEY]');
      expect(report.errorMessage).not.toContain('sk-ant-api03');
      expect(report.metadata.question).toBe('[REDACTED_CONFIDENTIAL_CONTENT]');
      expect(report.metadata.content).toBe('[REDACTED_CONFIDENTIAL_CONTENT]');
      expect(report.metadata.messages).toBe('[REDACTED_CONFIDENTIAL_CONTENT]');
      // Les métadonnées techniques restent intactes (§3.7)
      expect(report.metadata.inputTokens).toBe(420);
      expect(report.metadata.outputTokens).toBe(680);
      expect(report.metadata.model).toBe('claude-sonnet-5');
    });
  });

  describe('§7 Transverse — Helper unique track() & paramètres UTM', () => {
    it('expurge tout contenu de message et conserve les paramètres UTM', () => {
      const utm = captureUtmFromUrl('?utm_source=linkedin&utm_campaign=lancement_2026');
      expect(utm.utm_source).toBe('linkedin');
      expect(utm.utm_campaign).toBe('lancement_2026');

      const eventPayload = track('question_sent', {
        domain: 'rh',
        tokens: 512,
        question: 'Ne doit jamais apparaître dans Umami'
      });

      expect(eventPayload.event).toBe('question_sent');
      expect(eventPayload.properties.domain).toBe('rh');
      expect(eventPayload.properties.question).toBe('[REDACTED_CONFIDENTIAL_CONTENT]');
    });
  });

  describe('§3.2 — Droits par fonctionnalités (hasFeature / getLimit) & période de grâce', () => {
    const sampleContext: OrganizationEntitlementContext = {
      organizationId: 'org-1',
      subscriptionStatus: 'past_due',
      graceUntil: new Date(Date.now() + 2 * 24 * 3600 * 1000), // +2 jours de grâce
      grants: [
        { featureKey: 'brique.rh', enabled: true },
        { featureKey: 'brique.conformite', enabled: false },
        { featureKey: 'expert_questions_month', enabled: true, limitValue: 3 }
      ]
    };

    it('autorise les fonctionnalités actives pendant la période de grâce de 3 jours', () => {
      expect(hasFeature(sampleContext, 'brique.rh')).toBe(true);
      expect(hasFeature(sampleContext, 'brique.conformite')).toBe(false);
      expect(getLimit(sampleContext, 'expert_questions_month')).toBe(3);
    });

    it('suspend les droits après expiration de la période de grâce', () => {
      const afterGrace = new Date(Date.now() + 5 * 24 * 3600 * 1000);
      expect(hasFeature(sampleContext, 'brique.rh', afterGrace)).toBe(false);
      expect(getLimit(sampleContext, 'expert_questions_month', 0, afterGrace)).toBe(0);
    });
  });

  describe('§3.4 — Couche IA isolée (buildPrompt & retrieveContext)', () => {
    it('retourne [] pour retrieveContext() au MVP et assemble le prompt dans l’ordre strict', async () => {
      const rag = await retrieveContext('congés trimestriels CCN66', 'rh');
      expect(rag).toEqual([]);

      const { systemPrompt, promptVersion } = buildPrompt({
        activeBricks: ['brique.rh'],
        profile: {
          name: 'Association Tremplin',
          sector: 'Médico-social',
          employeesCount: 24,
          annualBudget: 950000,
          ccn: 'CCN 66',
          fiscalYearEnd: '31 décembre',
          usualAgMonth: 'Juin',
          governanceSummary: 'CA de 9 membres',
          mainFunders: ['ARS', 'Conseil Départemental'],
          establishmentsCount: 2
        },
        retrievedContext: rag
      });

      expect(promptVersion).toBe(PROMPT_VERSION);
      const idxSocle = systemPrompt.indexOf('[SOCLE ASSOEXPERT IA');
      const idxBriques = systemPrompt.indexOf('[BRIQUES SOUSCRITES]');
      const idxProfil = systemPrompt.indexOf('[PROFIL ASSOCIATION]');
      const idxRag = systemPrompt.indexOf('[CONTEXTE RÉCUPÉRÉ]');

      expect(idxSocle).toBeGreaterThanOrEqual(0);
      expect(idxBriques).toBeGreaterThan(idxSocle);
      expect(idxProfil).toBeGreaterThan(idxBriques);
      expect(idxRag).toBeGreaterThan(idxProfil);
    });
  });

  describe('§4 — Rate limit (10 requêtes/min/utilisateur)', () => {
    beforeEach(() => {
      resetRateLimitBuckets();
    });

    it('bloque la 11ème requête dans la même minute', () => {
      for (let i = 1; i <= 10; i++) {
        const res = checkRateLimit('user-42', 10, 60_000, 1_000_000);
        expect(res.allowed).toBe(true);
      }
      const eleventh = checkRateLimit('user-42', 10, 60_000, 1_000_000);
      expect(eleventh.allowed).toBe(false);
      expect(eleventh.remaining).toBe(0);
    });
  });

  describe('§3.8 & Lot 1/6 — Exclusion de /app/** du sitemap et robots.txt', () => {
    it('exclut toute route /app/** et /admin/** du sitemap et les interdit dans robots.txt', () => {
      const sitemapEntries = sitemap();
      const urls = sitemapEntries.map((entry) => entry.url);

      expect(urls.some((u) => u.includes('/app'))).toBe(false);
      expect(urls.some((u) => u.includes('/admin'))).toBe(false);

      const robotsConfig = robots();
      const rules = Array.isArray(robotsConfig.rules)
        ? robotsConfig.rules[0]
        : robotsConfig.rules;
      expect(rules.disallow).toContain('/app/');
      expect(rules.disallow).toContain('/admin/');
    });
  });
});

