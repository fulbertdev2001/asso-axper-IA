/**
 * Implémentations En-Mémoire des Repositories (Pour tests unitaires & développement déconnecté).
 * Respecte à 100% les contrats `src/repositories/interfaces.ts`.
 */

import crypto from 'crypto';
import { ConflictError } from '../../domain/errors';
import {
  IUserRepository,
  ISessionRepository,
  IMembershipRepository,
  IOrgRepository,
  IPlanRepository,
  ISubscriptionRepository,
  ITicketRepository,
  IAiRepository,
  ICmsRepository,
  IVerificationTokenRepository
} from '../interfaces';
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
  CmsPageInput,
  VerificationToken,
  VerificationTokenPurpose
} from '../../domain/models';

export class MemoryUserRepository implements IUserRepository {
  private users: User[] = [];

  constructor(initialUsers: User[] = []) {
    this.users = [...initialUsers];
  }

  async findById(id: string): Promise<User | null> {
    return this.users.find((u) => u.id === id) || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const clean = email.toLowerCase().trim();
    return this.users.find((u) => u.email.toLowerCase().trim() === clean) || null;
  }

  async create(user: User): Promise<User> {
    const existing = await this.findById(user.id);
    if (existing) {
      Object.assign(existing, user);
      return existing;
    }
    this.users.push({ ...user });
    return user;
  }

  async update(id: string, patch: Partial<User>): Promise<User> {
    const user = await this.findById(id);
    if (!user) throw new Error(`Utilisateur introuvable : ${id}`);
    Object.assign(user, patch);
    return { ...user };
  }

  async list(): Promise<User[]> {
    return this.users.map((u) => ({ ...u }));
  }
}

export class MemorySessionRepository implements ISessionRepository {
  private sessions: Session[] = [];

  constructor(initialSessions: Session[] = []) {
    this.sessions = [...initialSessions];
  }

  async create(session: Session): Promise<Session> {
    this.sessions.push({ ...session });
    return session;
  }

  async findById(tokenHash: string): Promise<Session | null> {
    const session = this.sessions.find(
      (s) =>
        s.id === tokenHash ||
        crypto.createHash('sha256').update(s.id).digest('hex') === tokenHash
    );
    if (!session) return null;
    if (new Date() > session.expiresAt) {
      await this.delete(session.id);
      return null;
    }
    return { ...session };
  }

  async delete(tokenHash: string): Promise<void> {
    this.sessions = this.sessions.filter((s) => s.id !== tokenHash);
  }

  async deleteByUser(userId: string): Promise<void> {
    this.sessions = this.sessions.filter((s) => s.userId !== userId);
  }

  async deleteExpired(now = new Date()): Promise<void> {
    this.sessions = this.sessions.filter((s) => s.expiresAt > now);
  }
}

export class MemoryVerificationTokenRepository implements IVerificationTokenRepository {
  private tokens: VerificationToken[] = [];

  async create(token: VerificationToken): Promise<VerificationToken> {
    this.tokens.push({ ...token });
    return token;
  }

  async consume(tokenHash: string, purpose: VerificationTokenPurpose): Promise<VerificationToken | null> {
    const index = this.tokens.findIndex((t) => t.id === tokenHash && t.purpose === purpose);
    if (index === -1) return null;
    const [token] = this.tokens.splice(index, 1);
    return { ...token };
  }

  async deleteExpired(now = new Date()): Promise<void> {
    this.tokens = this.tokens.filter((t) => t.expiresAt > now);
  }
}

export class MemoryMembershipRepository implements IMembershipRepository {
  private memberships: Membership[] = [];

  constructor(initialMemberships: Membership[] = []) {
    this.memberships = [...initialMemberships];
  }

  async create(membership: Membership): Promise<Membership> {
    this.memberships.push({ ...membership });
    return membership;
  }

  async findByUser(userId: string): Promise<Membership[]> {
    return this.memberships
      .filter((m) => m.userId === userId)
      .map((m) => ({ ...m }));
  }

  async findByUserAndOrg(userId: string, orgId: string): Promise<Membership | null> {
    const found = this.memberships.find(
      (m) => m.userId === userId && m.organizationId === orgId
    );
    return found ? { ...found } : null;
  }

  async listByOrg(orgId: string): Promise<Membership[]> {
    return this.memberships
      .filter((m) => m.organizationId === orgId)
      .map((m) => ({ ...m }));
  }
}

export class MemoryOrgRepository implements IOrgRepository {
  private orgs: Organization[] = [];
  private profiles = new Map<string, OrganizationProfile>();

  constructor(
    initialOrgs: Organization[] = [],
    initialProfiles: OrganizationProfile[] = []
  ) {
    this.orgs = [...initialOrgs];
    for (const p of initialProfiles) {
      this.profiles.set(p.organizationId, { ...p });
    }
  }

  async findById(id: string): Promise<Organization | null> {
    const found = this.orgs.find((o) => o.id === id);
    return found ? { ...found } : null;
  }

  async findByName(name: string): Promise<Organization | null> {
    const found = this.orgs.find((o) => o.name === name);
    return found ? { ...found } : null;
  }

  async create(org: Organization, profile: OrganizationProfileInput): Promise<Organization> {
    this.orgs.push({ ...org });
    this.profiles.set(org.id, {
      ...profile,
      organizationId: org.id
    });
    return org;
  }

  async list(): Promise<Organization[]> {
    return this.orgs.map((o) => ({ ...o }));
  }

  async getProfile(orgId: string): Promise<OrganizationProfile | null> {
    const p = this.profiles.get(orgId);
    return p ? { ...p } : null;
  }

  async updateProfile(
    orgId: string,
    patch: Partial<OrganizationProfileInput>
  ): Promise<OrganizationProfile> {
    const current = this.profiles.get(orgId);
    if (!current) throw new Error(`Profil introuvable pour l'org ${orgId}`);
    const updated = { ...current, ...patch };
    this.profiles.set(orgId, updated);
    return { ...updated };
  }

  async deleteProfile(orgId: string): Promise<void> {
    await this.updateProfile(orgId, {
      sector: 'Non renseigné',
      employeesCount: 0,
      annualBudget: 0,
      ccn: 'Aucune / Code du travail',
      fiscalYearEnd: '',
      usualAgMonth: '',
      governanceSummary: '',
      mainFunders: [],
      members: []
    });
  }
}

export class MemoryPlanRepository implements IPlanRepository {
  private plans: Plan[] = [];

  constructor(initialPlans: Plan[] = []) {
    this.plans = initialPlans.map((p) => ({
      ...p,
      features: p.features.map((f) => ({ ...f }))
    }));
  }

  async listActive(): Promise<Plan[]> {
    return this.plans
      .filter((p) => p.active)
      .sort((a, b) => a.sort - b.sort)
      .map((p) => ({ ...p, features: p.features.map((f) => ({ ...f })) }));
  }

  async listAll(): Promise<Plan[]> {
    return this.plans.map((p) => ({
      ...p,
      features: p.features.map((f) => ({ ...f }))
    }));
  }

  async findByCode(code: string): Promise<Plan | null> {
    const p = this.plans.find((x) => x.code === code);
    return p ? { ...p, features: p.features.map((f) => ({ ...f })) } : null;
  }

  async findByStripePriceId(priceId: string): Promise<Plan | null> {
    const p = this.plans.find((x) => x.stripePriceId === priceId);
    return p ? { ...p, features: p.features.map((f) => ({ ...f })) } : null;
  }

  async update(code: string, patch: any): Promise<Plan> {
    const p = this.plans.find((x) => x.code === code);
    if (!p) throw new Error(`Plan introuvable : ${code}`);

    if (patch.features) {
      if (Array.isArray(patch.features)) {
        p.features = patch.features.map((f: any) => ({ ...f }));
      } else {
        for (const [key, val] of Object.entries(patch.features)) {
          if (key === 'expertQuestionsMonth') {
            const f = p.features.find((feat) => feat.featureKey === 'expert_questions_month');
            if (f) f.limitValue = String(val);
          } else if (key === 'briqueRh') {
            const f = p.features.find((feat) => feat.featureKey === 'brique.rh');
            if (f) f.enabled = Boolean(val);
          } else if (key === 'briqueGouvernance') {
            const f = p.features.find((feat) => feat.featureKey === 'brique.gouvernance');
            if (f) f.enabled = Boolean(val);
          } else if (key === 'briqueFinance') {
            const f = p.features.find((feat) => feat.featureKey === 'brique.finance');
            if (f) f.enabled = Boolean(val);
          } else if (key === 'briqueConformite') {
            const f = p.features.find((feat) => feat.featureKey === 'brique.conformite');
            if (f) f.enabled = Boolean(val);
          }
        }
      }
    }

    if (patch.priceMonthly !== undefined) p.priceMonthlyEur = patch.priceMonthly;
    if (patch.priceMonthlyEur !== undefined) p.priceMonthlyEur = patch.priceMonthlyEur;
    if (patch.label !== undefined) p.label = patch.label;
    if (patch.description !== undefined) p.description = patch.description;

    return { ...p, features: p.features.map((f) => ({ ...f })) };
  }
}

export class MemorySubscriptionRepository implements ISubscriptionRepository {
  private subscriptions = new Map<string, Subscription>();
  private stripeEvents = new Set<string>();

  constructor(initialSubs: Subscription[] = []) {
    for (const s of initialSubs) {
      this.subscriptions.set(s.organizationId, { ...s });
    }
  }

  async findByOrgId(orgId: string): Promise<Subscription | null> {
    const s = this.subscriptions.get(orgId);
    return s ? { ...s } : null;
  }

  async findByStripeSubscriptionId(stripeSubscriptionId: string): Promise<Subscription | null> {
    for (const s of this.subscriptions.values()) {
      if (s.stripeSubscriptionId === stripeSubscriptionId) return { ...s };
    }
    return null;
  }

  async upsert(sub: Subscription): Promise<Subscription> {
    this.subscriptions.set(sub.organizationId, { ...sub });
    return sub;
  }

  async hasStripeEvent(eventId: string): Promise<boolean> {
    return this.stripeEvents.has(eventId);
  }

  async recordStripeEvent(eventId: string, _type: string): Promise<void> {
    this.stripeEvents.add(eventId);
  }
}

export class MemoryTicketRepository implements ITicketRepository {
  private tickets: ExpertTicket[] = [];

  constructor(initialTickets: ExpertTicket[] = []) {
    this.tickets = [...initialTickets];
  }

  async create(ticket: ExpertTicket): Promise<ExpertTicket> {
    if (this.tickets.some((t) => t.ref === ticket.ref)) {
      throw new ConflictError(`Référence de ticket déjà utilisée : ${ticket.ref}`);
    }
    this.tickets.unshift({ ...ticket });
    return ticket;
  }

  async getMaxRefSequence(year: number): Promise<number> {
    const prefix = `AE-${year}-`;
    return this.tickets
      .filter((t) => t.ref.startsWith(prefix))
      .reduce((max, t) => Math.max(max, Number(t.ref.slice(prefix.length)) || 0), 0);
  }

  async findById(id: string): Promise<ExpertTicket | null> {
    const t = this.tickets.find((x) => x.id === id);
    return t ? { ...t } : null;
  }

  async findByRef(ref: string): Promise<ExpertTicket | null> {
    const t = this.tickets.find((x) => x.ref === ref);
    return t ? { ...t } : null;
  }

  async listByOrg(orgId: string): Promise<ExpertTicket[]> {
    return this.tickets.filter((x) => x.organizationId === orgId).map((t) => ({ ...t }));
  }

  async listAll(): Promise<ExpertTicket[]> {
    return this.tickets.map((t) => ({ ...t }));
  }

  async countThisMonthByOrg(orgId: string, now = new Date()): Promise<number> {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return this.tickets.filter(
      (t) => t.organizationId === orgId && new Date(t.createdAt) >= startOfMonth
    ).length;
  }

  async update(id: string, patch: Partial<ExpertTicket>): Promise<ExpertTicket> {
    const t = this.tickets.find((x) => x.id === id);
    if (!t) throw new Error(`Ticket introuvable : ${id}`);
    Object.assign(t, patch);
    return { ...t };
  }
}

export class MemoryAiRepository implements IAiRepository {
  private conversations: Conversation[] = [];
  private messages: Message[] = [];
  private usages: AiUsage[] = [];

  async createConversation(conv: Conversation): Promise<Conversation> {
    this.conversations.unshift({ ...conv });
    return conv;
  }

  async findConversationById(id: string, orgId: string): Promise<Conversation | null> {
    const c = this.conversations.find((x) => x.id === id && x.organizationId === orgId);
    return c ? { ...c } : null;
  }

  async listConversationsByOrg(orgId: string): Promise<Conversation[]> {
    return this.conversations
      .filter((x) => x.organizationId === orgId)
      .map((c) => ({ ...c }));
  }

  async deleteConversation(orgId: string, convId: string): Promise<boolean> {
    const before = this.conversations.length;
    this.conversations = this.conversations.filter(
      (x) => !(x.id === convId && x.organizationId === orgId)
    );
    if (this.conversations.length === before) return false;
    this.messages = this.messages.filter(
      (m) => !(m.conversationId === convId && m.organizationId === orgId)
    );
    return true;
  }

  async addMessage(msg: Message): Promise<Message> {
    this.messages.push({ ...msg });
    return msg;
  }

  async listMessages(convId: string, orgId: string): Promise<Message[]> {
    return this.messages
      .filter((m) => m.conversationId === convId && m.organizationId === orgId)
      .map((m) => ({ ...m }));
  }

  async recordUsage(usage: AiUsage): Promise<void> {
    this.usages.unshift({ ...usage });
  }

  async getUsageSummary(): Promise<{
    records: AiUsage[];
    totalCostByOrg: Record<string, number>;
    totalTokens: number;
    totalCost: number;
  }> {
    const totalCostByOrg: Record<string, number> = {};
    let totalTokens = 0;
    let totalCost = 0;

    for (const u of this.usages) {
      totalCostByOrg[u.organizationId] = Number(
        ((totalCostByOrg[u.organizationId] || 0) + u.costEstimate).toFixed(6)
      );
      totalTokens += u.inputTokens + u.outputTokens;
      totalCost += u.costEstimate;
    }

    return {
      records: [...this.usages],
      totalCostByOrg,
      totalTokens,
      totalCost: Number(totalCost.toFixed(6))
    };
  }
}

export class MemoryCmsRepository implements ICmsRepository {
  private pages: CmsPage[] = [];
  private redirects = new Map<string, string>();

  constructor(initialPages: CmsPage[] = []) {
    this.pages = [...initialPages];
  }

  async findBySlug(slug: string): Promise<CmsPage | null> {
    const clean = slug.replace(/^\/+|\/+$/g, '');
    const found = this.pages.find((p) => p.slug === clean);
    return found ? { ...found } : null;
  }

  async listPublished(): Promise<CmsPage[]> {
    return this.pages.filter((p) => p.status === 'published').map((p) => ({ ...p }));
  }

  async listAll(): Promise<CmsPage[]> {
    return this.pages.map((p) => ({ ...p }));
  }

  async create(input: CmsPageInput): Promise<CmsPage> {
    const clean = input.slug.replace(/^\/+|\/+$/g, '');
    const page: CmsPage = {
      ...input,
      id: `page-${Date.now()}`,
      slug: clean,
      updatedAt: new Date()
    };
    this.pages.push(page);
    return page;
  }

  async update(id: string, patch: Partial<CmsPageInput>): Promise<CmsPage> {
    const p = this.pages.find((x) => x.id === id);
    if (!p) throw new Error(`Page introuvable : ${id}`);

    const newSlug = patch.slug ? patch.slug.replace(/^\/+|\/+$/g, '') : p.slug;
    if (newSlug !== p.slug) {
      this.redirects.set(p.slug, newSlug);
    }

    Object.assign(p, patch, { slug: newSlug, updatedAt: new Date() });
    return { ...p };
  }

  async getRedirect(oldSlug: string): Promise<string | null> {
    const clean = oldSlug.replace(/^\/+|\/+$/g, '');
    const to = this.redirects.get(clean);
    return to ? `/${to}` : null;
  }

  async recordRedirect(oldSlug: string, newSlug: string): Promise<void> {
    this.redirects.set(
      oldSlug.replace(/^\/+|\/+$/g, ''),
      newSlug.replace(/^\/+|\/+$/g, '')
    );
  }
}
