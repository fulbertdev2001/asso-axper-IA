/**
 * Service de gestion des questions expertes 48h (Couche Métier).
 * Design Pattern : Dependency Injection, Port/Adapter & Quota Enforcement.
 * - Contrôle de quota bloquant côté serveur (§7 Lot 5 CA #1).
 * - Référence unique lisible (ex. AE-2026-00042).
 * - Notifications SMTP via IMailProvider sans dépendance directe à nodemailer.
 */

import crypto from 'crypto';
import { AuthContext, Domain, ExpertTicket, TicketStatus, TicketUrgency } from '../domain/models';
import { ConflictError, ForbiddenError, NotFoundError, QuotaExceededError } from '../domain/errors';
import { ITicketRepository, IOrgRepository, IUserRepository } from '../repositories/interfaces';
import { BillingService } from './billing.service';
import { MailProvider } from '../lib/mail';
import {
  expertTicketAckEmail,
  expertTicketAnsweredEmail,
  expertTicketNotificationEmail
} from '../lib/mail/templates';

const DEFAULT_EXPERT_EMAIL = 'contact@cabinet-mae.fr';
const MAX_REF_ATTEMPTS = 5;

export interface CreateTicketServiceInput {
  domain: Domain;
  urgency?: TicketUrgency;
  subject: string;
  question: string;
}

export class TicketService {
  constructor(
    private readonly ticketRepo: ITicketRepository,
    private readonly orgRepo: IOrgRepository,
    private readonly userRepo: IUserRepository,
    private readonly billingService: BillingService,
    private readonly mailProvider: MailProvider,
    private readonly expertEmail: string = DEFAULT_EXPERT_EMAIL
  ) {}

  /**
   * Référence unique lisible `AE-<année>-NNNNN`, calculée depuis la base
   * (et non depuis un compteur en mémoire remis à zéro à chaque redémarrage).
   */
  async generateReference(now = new Date()): Promise<string> {
    const year = now.getFullYear();
    const next = (await this.ticketRepo.getMaxRefSequence(year)) + 1;
    return `AE-${year}-${String(next).padStart(5, '0')}`;
  }

  /** Insère le ticket en réessayant si une requête concurrente a pris la même référence. */
  private async insertWithUniqueRef(build: (ref: string) => ExpertTicket): Promise<ExpertTicket> {
    for (let attempt = 1; ; attempt++) {
      const ref = await this.generateReference();
      try {
        return await this.ticketRepo.create(build(ref));
      } catch (err) {
        if (!(err instanceof ConflictError) || attempt >= MAX_REF_ATTEMPTS) throw err;
      }
    }
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
    const created = await this.insertWithUniqueRef((ref) => ({
      id: crypto.randomUUID(),
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
    }));
    const ref = created.ref;

    // 3. Notification email à l'experte et accusé de réception à l'utilisateur
    const org = await this.orgRepo.findById(orgId);
    const orgName = org?.name || orgId;

    const expertEmail = await this.mailProvider.sendMail(
      expertTicketNotificationEmail({
        to: this.expertEmail,
        ref,
        orgName,
        authorEmail: authContext.email,
        domain: input.domain,
        urgency: input.urgency || 'normal_48h',
        subject: input.subject,
        question: input.question
      })
    );

    const ackEmail = await this.mailProvider.sendMail(expertTicketAckEmail(authContext.email, ref));

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
    if (!ticket && patch.question && patch.orgId) {
      // Si le ticket initial n'existait que côté client, on le persiste en base Neon avant mise à jour
      const orgExists = await this.orgRepo.findById(patch.orgId);
      if (!orgExists) {
        throw new NotFoundError(`Organisation introuvable : ${patch.orgId}`);
      }
      ticket = await this.ticketRepo.create({
        id: crypto.randomUUID(),
        ref: idOrRef.startsWith('AE-') ? idOrRef : await this.generateReference(),
        organizationId: patch.orgId,
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

    // Notification de la réponse à l'auteur du ticket (et non à l'administratrice connectée)
    if (patch.status === 'answered' && patch.answer) {
      const author = await this.userRepo.findById(ticket.userId);
      if (author?.email) {
        await this.mailProvider.sendMail(expertTicketAnsweredEmail(author.email, ticket.ref, patch.answer));
      }
    }

    return updated;
  }
}
