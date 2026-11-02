/**
 * Lot 5 — Service Escalade Question Experte 48h (`expert_tickets`)
 * §6 & §7 Lot 5 :
 * - Référence unique lisible (ex. `AE-2026-00042`).
 * - Contrôle du quota mensuel (`expert_questions_month`) bloquant côté serveur.
 * - Email formaté vers `contact@cabinet-mae.fr` + accusé de réception à l'utilisateur via `lib/mail`.
 * - Mise à jour du statut (`pending` -> `in_progress` -> `answered`) et note interne par l'admin.
 */

import { Domain, ExpertTicket } from '../../types';
import { INITIAL_TICKETS } from '../../data/mockData';
import { createScopedRepository } from '../db/scoped';
import { AuthenticatedSession, assertSessionCanAccessOrg } from '../auth';
import { orgGetLimit } from '../billing/service';
import { getScopedOrganizationProfile } from '../org/service';
import { mail } from '../mail';

export interface ScopedTicketRecord extends ExpertTicket {
  organizationId: string;
}

export class ExpertQuotaExceededError extends Error {
  constructor(message = 'Quota mensuel de questions à l’experte atteint pour votre formule.') {
    super(message);
    this.name = 'ExpertQuotaExceededError';
  }
}

let ticketSequence = 43;
const ticketStore: ScopedTicketRecord[] = INITIAL_TICKETS.map((t) => ({
  ...t,
  organizationId: t.orgId
}));

export function resetTicketStoreForTests(): void {
  ticketSequence = 43;
  ticketStore.length = 0;
  for (const t of INITIAL_TICKETS) {
    ticketStore.push({
      ...t,
      organizationId: t.orgId
    });
  }
}

export function generateTicketReference(year = 2026): string {
  const seq = String(ticketSequence++).padStart(5, '0');
  return `AE-${year}-${seq}`;
}

export function countOrgTicketsThisMonth(organizationId: string): number {
  const repo = createScopedRepository<ScopedTicketRecord>(organizationId, ticketStore);
  return repo.findAll().length;
}

/**
 * Crée un ticket expert pour l'organisation de l'utilisateur authentifié.
 * Contrôle bloquant du quota côté serveur (§7 Lot 5 CA #1).
 */
export async function createScopedExpertTicket(params: {
  session: AuthenticatedSession | null;
  organizationId: string;
  domain: Domain;
  urgency?: 'normal_48h' | 'urgent';
  object: string;
  question: string;
}): Promise<{
  ticket: ExpertTicket;
  quotaLimit: number;
  quotaUsedAfter: number;
  expertEmailMessageId: string;
  ackEmailMessageId: string;
}> {
  const validSession = assertSessionCanAccessOrg(params.session, params.organizationId);
  const orgId = validSession.organizationId;

  const quotaLimit = orgGetLimit(orgId, 'expert_questions_month', 0);
  const usedBefore = countOrgTicketsThisMonth(orgId);

  if (usedBefore >= quotaLimit) {
    throw new ExpertQuotaExceededError(
      `Quota mensuel atteint (${usedBefore}/${quotaLimit} question(s) experte(s)). Passez à la formule supérieure pour poser une nouvelle question.`
    );
  }

  const profile = getScopedOrganizationProfile(validSession, orgId);
  const ref = generateTicketReference(2026);
  const repo = createScopedRepository<ScopedTicketRecord>(orgId, ticketStore);

  const inserted = repo.insert({
    id: `t-${Date.now()}`,
    ref,
    orgId,
    orgName: profile.name,
    domain: params.domain,
    urgency: params.urgency || 'normal_48h',
    object: params.object,
    question: params.question,
    status: 'pending',
    createdAt: new Date().toLocaleDateString('fr-FR')
  });

  // 1. Email formaté vers l'experte `contact@cabinet-mae.fr` avec contexte complet de l'association
  const expertEmail = process.env.EXPERT_NOTIFICATION_EMAIL || 'contact@cabinet-mae.fr';
  const expertMailResult = await mail.sendMail({
    to: expertEmail,
    replyTo: validSession.email,
    subject: `[AssoExpert ${ref}] Nouvelle question (${params.domain.toUpperCase()}) — ${profile.name}`,
    text: `Référence : ${ref}\nAssociation : ${profile.name} (SIREN: ${profile.siren}, Effectif: ${profile.employeesCount}, CCN: ${profile.ccn})\nDomaine : ${params.domain}\nUrgence : ${inserted.urgency}\nObjet : ${params.object}\n\nQuestion :\n${params.question}`,
    html: `<h2>Nouvelle question experte — ${ref}</h2><p><strong>Association :</strong> ${profile.name} (${profile.employeesCount} salariés · ${profile.ccn})</p><p><strong>Objet :</strong> ${params.object}</p><p>${params.question}</p>`
  });

  // 2. Accusé de réception envoyé à l'utilisateur
  const ackMailResult = await mail.sendMail({
    to: validSession.email,
    subject: `Accusé de réception de votre question ${ref} — AssoExpert IA`,
    text: `Bonjour,\n\nVotre question « ${params.object} » a bien été enregistrée sous la référence ${ref}.\nLaetitia Badji (Cabinet Maé) vous répondra sous 48h ouvrées.\n\nL'équipe AssoExpert IA`,
    html: `<p>Bonjour,</p><p>Votre question <strong>${params.object}</strong> a bien été enregistrée sous la référence <strong>${ref}</strong>.</p><p>Laetitia Badji (Cabinet Maé) vous répondra sous 48h ouvrées.</p>`
  });

  // Masque `internalNotes` côté client
  const clientSafeTicket: ExpertTicket = { ...inserted };
  delete clientSafeTicket.internalNotes;

  return {
    ticket: clientSafeTicket,
    quotaLimit,
    quotaUsedAfter: usedBefore + 1,
    expertEmailMessageId: expertMailResult.messageId,
    ackEmailMessageId: ackMailResult.messageId
  };
}

/**
 * Liste « Mes questions » pour l'organisation connectée (sans exposer `internalNotes`).
 */
export function listScopedOrganizationTickets(
  session: AuthenticatedSession | null,
  targetOrgId: string
): ExpertTicket[] {
  const validSession = assertSessionCanAccessOrg(session, targetOrgId);
  const repo = createScopedRepository<ScopedTicketRecord>(
    validSession.organizationId,
    ticketStore
  );
  return repo.findAll().map((t) => {
    const copy: ExpertTicket = { ...t };
    delete copy.internalNotes;
    return copy;
  });
}

/**
 * Mise à jour d'un ticket par l'experte dans le back-office Payload (`/admin`) :
 * statut (`pending` | `in_progress` | `answered`), réponse officielle et note interne (§7 Lot 5 CA #2).
 */
export function updateTicketInAdmin(params: {
  ticketIdOrRef: string;
  status: ExpertTicket['status'];
  answer?: string;
  internalNotes?: string;
}): ExpertTicket {
  const index = ticketStore.findIndex(
    (t) => t.id === params.ticketIdOrRef || t.ref === params.ticketIdOrRef
  );
  if (index === -1) {
    throw new Error(`Ticket introuvable : ${params.ticketIdOrRef}`);
  }

  const current = ticketStore[index];
  const updated: ScopedTicketRecord = {
    ...current,
    status: params.status,
    ...(params.answer !== undefined ? { answer: params.answer } : {}),
    ...(params.internalNotes !== undefined ? { internalNotes: params.internalNotes } : {}),
    ...(params.status === 'answered'
      ? { answeredAt: new Date().toLocaleDateString('fr-FR') }
      : {})
  };

  ticketStore[index] = updated;
  return { ...updated };
}

export function listAllTicketsForAdmin(): ExpertTicket[] {
  return ticketStore.map((t) => ({ ...t }));
}

