/**
 * Service Assistant IA (Couche Métier).
 * Design Pattern : Dependency Injection, Port/Adapter & Privacy-by-Design.
 * - Assemble le prompt système (socle -> briques -> profil -> RAG) (§3.4).
 * - Contrôle de fréquence (Rate Limit 10 req/min/user).
 * - Contrôle de longueur de question selon les droits de la formule.
 * - Journalise l'usage SANS aucun contenu de question ou de réponse (§3.7).
 */

import { AuthContext, Conversation, DOMAIN_FEATURE, Domain, Message, StructuredAnswer } from '../domain/models';
import { ForbiddenError, NotFoundError, RateLimitedError, ValidationError } from '../domain/errors';
import { IAiRepository, IOrgRepository } from '../repositories/interfaces';
import { BillingService } from './billing.service';
import { checkRateLimit } from '../lib/rate-limit';
import { buildPrompt, retrieveContext, PROMPT_VERSION } from '../lib/ai';
import { generateAiResponse } from './aiSimulator';
import { recordAiUsageForTests } from '../lib/ai/chat-service';

export interface HandleAiChatInput {
  domain: Domain;
  question: string;
  conversationId?: string;
}

export interface HandleAiChatOutput {
  conversationId: string;
  assistantMessage: {
    id: string;
    role: 'assistant';
    answer: StructuredAnswer;
    structuredAnswer?: StructuredAnswer;
    createdAt: Date;
  };
  promptVersion: string;
  brickUnlocked: boolean;
  upgradeSuggested: boolean;
  systemPromptPreview: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    costEstimate: number;
  };
}

export class AiService {
  constructor(
    private readonly aiRepo: IAiRepository,
    private readonly orgRepo: IOrgRepository,
    private readonly billingService: BillingService
  ) {}

  async handleChat(
    authContext: AuthContext,
    input: HandleAiChatInput
  ): Promise<HandleAiChatOutput> {
    if (!authContext.organizationId) {
      throw new ForbiddenError('Aucune organisation rattachée à cette session.');
    }
    const orgId = authContext.organizationId;

    // 1. Contrôle de fréquence (Rate Limit)
    const rl = checkRateLimit(authContext.userId);
    if (!rl.allowed) {
      throw new RateLimitedError('Limite de fréquence atteinte (10 requêtes/minute). Veuillez patienter.');
    }

    // 2. Contrôle de la taille de question autorisée selon la formule
    const maxChars = await this.billingService.getLimit(orgId, 'ai.max_input_chars', 2000);
    if (input.question.length > maxChars) {
      throw new ValidationError(
        `Votre question dépasse la limite de caractères autorisée par votre formule (${maxChars} caractères max).`
      );
    }

    // 3. Vérification des briques souscrites
    const requiredFeature = DOMAIN_FEATURE[input.domain];
    const brickUnlocked = await this.billingService.hasFeature(orgId, requiredFeature);

    const briqueRh = await this.billingService.hasFeature(orgId, 'brique.rh');
    const briqueGouvernance = await this.billingService.hasFeature(orgId, 'brique.gouvernance');
    const briqueFinance = await this.billingService.hasFeature(orgId, 'brique.finance');
    const briqueConformite = await this.billingService.hasFeature(orgId, 'brique.conformite');

    const activeBricks: string[] = [];
    if (briqueRh) activeBricks.push('brique.rh');
    if (briqueGouvernance) activeBricks.push('brique.gouvernance');
    if (briqueFinance) activeBricks.push('brique.finance');
    if (briqueConformite) activeBricks.push('brique.conformite');

    // 4. Récupération du profil de l'organisation
    const profile = await this.orgRepo.getProfile(orgId);
    const orgEntity = (await this.orgRepo.findById(orgId)) || {
      id: orgId,
      name: profile?.sector ? `Association ${profile.sector}` : orgId,
      siren: '',
      rna: '',
      createdAt: new Date()
    };

    // 5. Assemblage du prompt (Socle -> Briques -> Profil -> RAG)
    const retrievedContext = await retrieveContext(input.question, input.domain);
    const { systemPrompt, promptVersion } = buildPrompt({
      activeBricks,
      profile: {
        name: orgEntity.name,
        sector: profile?.sector || 'Non renseigné',
        employeesCount: profile?.employeesCount || 1,
        annualBudget: profile?.annualBudget || 0,
        ccn: profile?.ccn || 'CCN 66',
        fiscalYearEnd: profile?.fiscalYearEnd || '31 décembre',
        usualAgMonth: profile?.usualAgMonth || 'Juin',
        governanceSummary: profile?.governanceSummary || '',
        mainFunders: profile?.mainFunders || [],
        establishmentsCount: profile?.establishmentsCount || 1
      },
      retrievedContext
    });

    // 6. Gestion de la conversation
    let conversationId = input.conversationId;
    if (conversationId) {
      const conv = await this.aiRepo.findConversationById(conversationId, orgId);
      if (!conv) {
        conversationId = undefined;
      }
    }

    if (!conversationId) {
      const newConv = await this.aiRepo.createConversation({
        id: `conv-${Date.now()}`,
        organizationId: orgId,
        userId: authContext.userId,
        domain: input.domain,
        title: input.question.slice(0, 40) + '...',
        createdAt: new Date()
      });
      conversationId = newConv.id;
    }

    // 7. Enregistrement de la question utilisateur
    const userMsg: Message = {
      id: `msg-${Date.now()}-u`,
      conversationId,
      organizationId: orgId,
      userId: authContext.userId,
      role: 'user',
      content: input.question,
      createdAt: new Date()
    };
    await this.aiRepo.addMessage(userMsg);

    // 8. Génération de la réponse structurée (simulateur déterministe certifié)
    let structuredAnswer: StructuredAnswer;

    if (!brickUnlocked) {
      structuredAnswer = {
        shortSummary: `[Niveau Socle Général] La brique « ${input.domain.toUpperCase()} » n'est pas incluse dans votre formule actuelle. Voici les principes généraux applicables à toute association loi 1901 (${profile?.sector || orgEntity.name}).`,
        detailedAnalysis: `Votre question porte sur le domaine « ${input.domain} ». Au niveau socle, nous vous rappelons les obligations générales du Code du travail et de la loi du 1er juillet 1901. Pour débloquer l'analyse approfondie intégrant votre convention collective (${profile?.ccn || 'CCN 66'}) et vos spécificités sectorielles (${profile?.sector || 'Non renseigné'}), passez à la formule supérieure.`,
        references: [
          'Loi du 1er juillet 1901 relative au contrat d’association',
          `Profil association : ${orgEntity.name} (${profile?.employeesCount || 1} salariés)`
        ],
        verificationNote:
          'À vérifier : Débloquez la brique dédiée ou sollicitez l’experte Laetitia Badji sous 48h pour une analyse conventionnelle complète.',
        suggestedTicketDomain: input.domain,
        suggestedTicketQuestion: input.question
      };
    } else {
      const rawAnswer = generateAiResponse(
        input.question,
        input.domain,
        {
          id: orgEntity.id,
          name: orgEntity.name,
          siren: orgEntity.siren,
          rna: orgEntity.rna,
          sector: profile?.sector || '',
          employeesCount: profile?.employeesCount || 1,
          annualBudget: profile?.annualBudget || 0,
          ccn: profile?.ccn || 'CCN 66',
          fiscalYearEnd: profile?.fiscalYearEnd || '31 décembre',
          usualAgMonth: profile?.usualAgMonth || 'Juin',
          governanceSummary: profile?.governanceSummary || '',
          mainFunders: profile?.mainFunders || [],
          establishmentsCount: profile?.establishmentsCount || 1,
          members: profile?.members || [],
          accountEmail: authContext.email
        },
        {
          briqueRh,
          briqueGouvernance,
          briqueFinance,
          briqueConformite,
          aiModel: 'claude-3-5-sonnet',
          maxTokens: 4096,
          maxInputChars: maxChars,
          expertQuestionsMonth: 2
        }
      );

      structuredAnswer = {
        shortSummary: rawAnswer.shortSummary,
        detailedAnalysis: rawAnswer.detailedAnalysis,
        references: rawAnswer.references,
        verificationNote: rawAnswer.verificationNote,
        suggestedTicketDomain: rawAnswer.suggestedTicketDomain,
        suggestedTicketQuestion: rawAnswer.suggestedTicketQuestion
      };
    }

    // 9. Enregistrement de la réponse assistant
    const assistantMsg: Message = {
      id: `msg-${Date.now()}-a`,
      conversationId,
      organizationId: orgId,
      userId: authContext.userId,
      role: 'assistant',
      content: JSON.stringify(structuredAnswer),
      createdAt: new Date()
    };
    await this.aiRepo.addMessage(assistantMsg);

    // 10. Enregistrement métrique d'usage (SANS aucun contenu textuel de la question / réponse §3.7)
    const inputTokens = Math.ceil(input.question.length / 4);
    const outputTokens = Math.ceil(structuredAnswer.detailedAnalysis.length / 4);
    const costEstimate = Math.round((inputTokens * 0.000003 + outputTokens * 0.000015) * 1000000) / 1000000;

    await this.aiRepo.recordUsage({
      id: `usage-${Date.now()}`,
      organizationId: orgId,
      userId: authContext.userId,
      model: 'claude-3-5-sonnet-20241022',
      promptVersion,
      inputTokens,
      outputTokens,
      costEstimate,
      createdAt: new Date()
    });

    recordAiUsageForTests({
      id: `usage-${Date.now()}`,
      orgId,
      orgName: orgEntity.name,
      organizationId: orgId,
      model: 'claude-3-5-sonnet-20241022',
      promptVersion,
      inputTokens,
      outputTokens,
      costEstimateEur: costEstimate,
      createdAt: new Date().toISOString()
    });

    return {
      conversationId,
      assistantMessage: {
        id: assistantMsg.id,
        role: 'assistant',
        answer: structuredAnswer,
        structuredAnswer,
        createdAt: assistantMsg.createdAt
      },
      promptVersion,
      brickUnlocked,
      upgradeSuggested: !brickUnlocked,
      systemPromptPreview: systemPrompt.slice(0, 300) + '...',
      usage: {
        inputTokens,
        outputTokens,
        costEstimate
      }
    };
  }

  async listConversations(authContext: AuthContext): Promise<Conversation[]> {
    if (!authContext.organizationId) {
      throw new ForbiddenError('Aucune organisation rattachée à cette session.');
    }
    return await this.aiRepo.listConversationsByOrg(authContext.organizationId);
  }

  async getMessages(authContext: AuthContext, convId: string): Promise<Message[]> {
    if (!authContext.organizationId) {
      throw new ForbiddenError('Aucune organisation rattachée à cette session.');
    }
    return await this.aiRepo.listMessages(convId, authContext.organizationId);
  }

  async deleteConversation(authContext: AuthContext, convId: string): Promise<boolean> {
    if (!authContext.organizationId) {
      throw new ForbiddenError('Aucune organisation rattachée à cette session.');
    }
    return await this.aiRepo.deleteConversation(authContext.organizationId, convId);
  }

  async getAdminUsageSummary(authContext: AuthContext): Promise<{
    records: unknown[];
    totalCostByOrg: Record<string, number>;
    totalTokens: number;
    totalCost: number;
  }> {
    if (!authContext.isPlatformAdmin) {
      throw new ForbiddenError('Accès réservé aux administrateurs de la plateforme.');
    }
    return await this.aiRepo.getUsageSummary();
  }
}
