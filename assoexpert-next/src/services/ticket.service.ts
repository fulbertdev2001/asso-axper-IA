/**
 * Service de gestion des questions expertes 48h (Couche Métier).
 * Design Pattern : Dependency Injection, Port/Adapter & Quota Enforcement.
 * - Contrôle de quota bloquant côté serveur (§7 Lot 5 CA #1).
 * - Référence unique lisible (ex. AE-2026-00042).
 * - Notifications SMTP via IMailProvider sans dépendance directe à nodemailer.
 */

import { AuthContext, Domain, ExpertTicket, TicketStatus, TicketUrgency } from '../domain/models';
import { ForbiddenError, NotFoundError, QuotaExceededError } from '../domain/errors';
import { ITicketRepository, IOrgRepository } from '../repositories/interfaces';
import { BillingService } from './billing.service';
import { MailProvider } from '../lib/mail';

export interface CreateTicketServiceInput {
  domain: Domain;
  urgency?: TicketUrgency;
  subject: string;
  question: string;
}

export class TicketService {
  private ticketSequence = 100;

  constructor(
    private readonly ticketRepo: ITicketRepository,
    private readonly orgRepo: IOrgRepository,
    private readonly billingService: BillingService,
    private readonly mailProvider: MailProvider
  ) {}

  generateReference(year = 2026): string {
    const seq = String(++this.ticketSequence).padStart(5, '0');
    return `AE-${year}-${seq}`;
  }

  async createTicket(
    authContext: AuthContext,
    input: CreateTicketServiceInput
  ): Promise<{
    ticket: ExpertTicket;
    quotaUsed: number;
    quotaLimit: number;
    expertEmailMessageId: string;
    ackEmailMessageId: string;
  }> {
    if (!authContext.organizationId) {
      throw new ForbiddenError('Aucune organisation rattachée à cette session.');
    }
    const orgId = authContext.organizationId;

    // 1. Contrôle bloquant du quota mensuel (§7 Lot 5 CA #1)
    const quotaLimit = await this.billingService.getLimit(orgId, 'expert_questions_month', 0);
    const usedBefore = await this.ticketRepo.countThisMonthByOrg(orgId);

    if (usedBefore >= quotaLimit) {
      throw new QuotaExceededError(
        `Quota mensuel atteint (${usedBefore}/${quotaLimit} question(s) experte(s)). Passez à la formule supérieure pour poser une nouvelle question.`
      );
    }

    // 2. Génération de référence et insertion
    const ref = this.generateReference();
    const ticketId = `ticket-${Date.now()}`;

    const newTicket: ExpertTicket = {
      id: ticketId,
      ref,
      organizationId: orgId,
      userId: authContext.userId,
      domain: input.domain,
      urgency: input.urgency || 'normal_48h',
      subject: input.subject,
      question: input.question,
      answer: null,
      internalNote: null,
      status: 'pending',
      answeredAt: null,
      createdAt: new Date()
    };

    const created = await this.ticketRepo.create(newTicket);

    // 3. Notification email à l'experte et accusé de réception à l'utilisateur
    const orgProfile = await this.orgRepo.getProfile(orgId);
    const orgName = orgProfile?.sector ? `${orgProfile.sector} (${orgId})` : orgId;

    const expertEmail = await this.mailProvider.sendMail({
      to: 'contact@cabinet-mae.fr',
      subject: `[${ref}] Nouvelle question experte — ${input.domain.toUpperCase()} (${input.urgency || 'normal_48h'})`,
      text: `Une nouvelle question a été posée par ${authContext.email} pour l'organisation ${orgName}.\n\nObjet : ${input.subject}\n\nQuestion :\n${input.question}`,
      html: `<h3>Nouvelle question experte AssoExpert</h3><p><strong>Réf :</strong> ${ref}</p><p><strong>Organisation :</strong> ${orgName}</p><p><strong>Auteur :</strong> ${authContext.email}</p><p><strong>Domaine :</strong> ${input.domain}</p><p><strong>Urgence :</strong> ${input.urgency || 'normal_48h'}</p><p><strong>Objet :</strong> ${input.subject}</p><hr/><p>${input.question.replace(/\n/g, '<br/>')}</p>`
    });

    const ackEmail = await this.mailProvider.sendMail({
      to: authContext.email,
      subject: `[${ref}] Confirmation de votre question à l'experte — AssoExpert IA`,
      text: `Bonjour,\n\nVotre question a bien été transmise à Laetitia Badji (Cabinet Maé). Référence : ${ref}.\nUne réponse écrite et vérifiée vous sera apportée sous 48h ouvrées.\n\nCabinet Maé — AssoExpert IA`,
      html: `<p>Bonjour,</p><p>Votre question a bien été transmise à <strong>Laetitia Badji (Cabinet Maé)</strong>.</p><p><strong>Référence :</strong> ${ref}</p><p>Une réponse écrite vous sera apportée sous 48h ouvrées.</p>`
    });

    return {
      ticket: created,
      quotaUsed: usedBefore + 1,
      quotaLimit,
      expertEmailMessageId: expertEmail.messageId,
      ackEmailMessageId: ackEmail.messageId
    };
  }

  async listOrgTickets(authContext: AuthContext): Promise<ExpertTicket[]> {
    if (!authContext.organizationId) {
      throw new ForbiddenError('Aucune organisation rattachée à cette session.');
    }
    return await this.ticketRepo.listByOrg(authContext.organizationId);
  }

  async getTicket(authContext: AuthContext, idOrRef: string): Promise<ExpertTicket> {
    let ticket = await this.ticketRepo.findById(idOrRef);
    if (!ticket) {
      ticket = await this.ticketRepo.findByRef(idOrRef);
    }

    if (!ticket) {
      throw new NotFoundError(`Ticket introuvable : ${idOrRef}`);
    }

    if (!authContext.isPlatformAdmin && ticket.organizationId !== authContext.organizationId) {
      throw new ForbiddenError('Accès interdit aux données de cette question experte.');
    }

    return ticket;
  }

  async listAllForAdmin(authContext: AuthContext): Promise<ExpertTicket[]> {
    if (!authContext.isPlatformAdmin) {
      throw new ForbiddenError('Accès réservé aux administrateurs de la plateforme.');
    }
    return await this.ticketRepo.listAll();
  }

  async updateTicketAdmin(
    authContext: AuthContext,
    idOrRef: string,
    patch: {
      status: TicketStatus;
      answer?: string;
      internalNotes?: string;
      orgId?: string;
      domain?: Domain;
      question?: string;
      subject?: string;
    }
  ): Promise<ExpertTicket> {
    if (!authContext.isPlatformAdmin) {
      throw new ForbiddenError('Accès réservé aux administrateurs de la plateforme.');
    }

    let ticket = await this.ticketRepo.findById(idOrRef);
    if (!ticket) {
      ticket = await this.ticketRepo.findByRef(idOrRef);
    }
    if (!ticket && patch.question) {
      // Si le ticket initial n'existait que côté client, on le persiste en base Neon avant mise à jour
      ticket = await this.ticketRepo.create({
        id: idOrRef.startsWith('AE-') ? `ticket-${Date.now()}` : idOrRef,
        ref: idOrRef.startsWith('AE-') ? idOrRef : this.generateReference(),
        organizationId: patch.orgId || 'org-1',
        userId: authContext.userId,
        domain: patch.domain || 'rh',
        urgency: 'normal_48h',
        subject: patch.subject || 'Question experte',
        question: patch.question,
        answer: null,
        internalNote: null,
        status: 'pending',
        answeredAt: null,
        createdAt: new Date()
      });
    }
    if (!ticket) {
      throw new NotFoundError(`Ticket introuvable : ${idOrRef}`);
    }
    const updates: Partial<ExpertTicket> = {
      status: patch.status,
      internalNote: patch.internalNotes ?? ticket.internalNote
    };

    if (patch.answer !== undefined) {
      updates.answer = patch.answer;
      if (patch.status === 'answered') {
        updates.answeredAt = new Date();
      }
    }

    const updated = await this.ticketRepo.update(ticket.id, updates);

    // Notification de réponse au client si une réponse finale est fournie
    if (patch.status === 'answered' && patch.answer) {
      // Trouver l'email du propriétaire ou du créateur
      await this.mailProvider.sendMail({
        to: authContext.email,
        subject: `[${ticket.ref}] Réponse de l'experte à votre question — AssoExpert IA`,
        text: `Bonjour,\n\nLaetitia Badji a apporté une réponse à votre question (${ticket.ref}) :\n\n${patch.answer}\n\nCabinet Maé — AssoExpert IA`,
        html: `<p>Bonjour,</p><p>Laetitia Badji a répondu à votre question (<strong>${ticket.ref}</strong>) :</p><div style="background:#f4f4f5;padding:12px;border-radius:6px;"><p>${patch.answer.replace(/\n/g, '<br/>')}</p></div>`
      });
    }

    return updated;
  }
}
