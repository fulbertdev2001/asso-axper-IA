/**
 * Interfaces des Repositories (Design Pattern Repository / Ports).
 * Les services métier interagissent UNIQUEMENT avec ces interfaces,
 * garantissant le découplage total de la persistance (Neon Drizzle vs Mémoire).
 */

import {
  User,
  Session,
  Membership,
  Organization,
  OrganizationProfile,
  OrganizationProfileInput,
  Plan,
  Subscription,
  ExpertTicket,
  Conversation,
  Message,
  AiUsage,
  CmsPage,
  CmsPageInput
} from '../domain/models';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(user: User): Promise<User>;
  update(id: string, patch: Partial<User>): Promise<User>;
  list(): Promise<User[]>;
}

export interface ISessionRepository {
  create(session: Session): Promise<Session>;
  findById(tokenHash: string): Promise<Session | null>;
  delete(tokenHash: string): Promise<void>;
  deleteExpired(now?: Date): Promise<void>;
}

export interface IMembershipRepository {
  create(membership: Membership): Promise<Membership>;
  findByUser(userId: string): Promise<Membership[]>;
  findByUserAndOrg(userId: string, orgId: string): Promise<Membership | null>;
  listByOrg(orgId: string): Promise<Membership[]>;
}

export interface IOrgRepository {
  findById(id: string): Promise<Organization | null>;
  findByName(name: string): Promise<Organization | null>;
  create(org: Organization, profile: OrganizationProfileInput): Promise<Organization>;
  list(): Promise<Organization[]>;
  getProfile(orgId: string): Promise<OrganizationProfile | null>;
  updateProfile(orgId: string, patch: Partial<OrganizationProfileInput>): Promise<OrganizationProfile>;
  deleteProfile(orgId: string): Promise<void>;
}

export interface IPlanRepository {
  listActive(): Promise<Plan[]>;
  listAll(): Promise<Plan[]>;
  findByCode(code: string): Promise<Plan | null>;
  findByStripePriceId(priceId: string): Promise<Plan | null>;
  update(code: string, patch: Partial<Omit<Plan, 'code'>>): Promise<Plan>;
}

export interface ISubscriptionRepository {
  findByOrgId(orgId: string): Promise<Subscription | null>;
  upsert(sub: Subscription): Promise<Subscription>;
  hasStripeEvent(eventId: string): Promise<boolean>;
  recordStripeEvent(eventId: string, type: string): Promise<void>;
}

export interface ITicketRepository {
  create(ticket: ExpertTicket): Promise<ExpertTicket>;
  findById(id: string): Promise<ExpertTicket | null>;
  findByRef(ref: string): Promise<ExpertTicket | null>;
  listByOrg(orgId: string): Promise<ExpertTicket[]>;
  listAll(): Promise<ExpertTicket[]>;
  countThisMonthByOrg(orgId: string, now?: Date): Promise<number>;
  update(id: string, patch: Partial<ExpertTicket>): Promise<ExpertTicket>;
}

export interface IAiRepository {
  createConversation(conv: Conversation): Promise<Conversation>;
  findConversationById(id: string, orgId: string): Promise<Conversation | null>;
  listConversationsByOrg(orgId: string): Promise<Conversation[]>;
  deleteConversation(orgId: string, convId: string): Promise<boolean>;

  addMessage(msg: Message): Promise<Message>;
  listMessages(convId: string, orgId: string): Promise<Message[]>;

  recordUsage(usage: AiUsage): Promise<void>;
  getUsageSummary(): Promise<{
    records: AiUsage[];
    totalCostByOrg: Record<string, number>;
    totalTokens: number;
    totalCost: number;
  }>;
}

export interface ICmsRepository {
  findBySlug(slug: string): Promise<CmsPage | null>;
  listPublished(): Promise<CmsPage[]>;
  listAll(): Promise<CmsPage[]>;
  create(page: CmsPageInput): Promise<CmsPage>;
  update(id: string, patch: Partial<CmsPageInput>): Promise<CmsPage>;
  getRedirect(oldSlug: string): Promise<string | null>;
  recordRedirect(oldSlug: string, newSlug: string): Promise<void>;
}

