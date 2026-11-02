/**
 * Implémentations Drizzle ORM des Repositories (Persistance réelle Neon PostgreSQL).
 * Toutes les requêtes appliquent le filtrage strict ou le typage du domaine.
 */

import crypto from 'crypto';
import { eq, and, desc, gte, lt, sql } from 'drizzle-orm';
import { db } from '../../lib/db';
import * as schema from '../../lib/db/schema';

const ORG_ALIAS_MAP: Record<string, string> = {
  'org-1': '11111111-1111-4111-8111-111111111111',
  'org-2': '22222222-2222-4222-8222-222222222222',
  'org-3': '33333333-3333-4333-8333-333333333333'
};

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function toUuid(id: string): string {
  if (!id) return crypto.randomUUID();
  if (ORG_ALIAS_MAP[id]) return ORG_ALIAS_MAP[id];
  if (UUID_REGEX.test(id)) return id;
  const hash = crypto.createHash('sha256').update(id).digest('hex');
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-8${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}
import {
  IUserRepository,
  ISessionRepository,
  IMembershipRepository,
  IOrgRepository,
  IPlanRepository,
  ISubscriptionRepository,
  ITicketRepository,
  IAiRepository,
  ICmsRepository
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
  FeatureKey
} from '../../domain/models';

function getDb() {
  if (!db) {
    throw new Error('Base de données Neon non connectée (DATABASE_URL manquante).');
  }
  return db;
}

// --- 1. Utilisateurs --------------------------------------------------------

export class DrizzleUserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    const rows = await getDb().select().from(schema.users).where(eq(schema.users.id, id)).limit(1);
    if (!rows[0]) return null;
    return {
      id: rows[0].id,
      email: rows[0].email,
      name: rows[0].name,
      passwordHash: rows[0].passwordHash,
      isPlatformAdmin: rows[0].isPlatformAdmin,
      createdAt: rows[0].createdAt
    };
  }

  async findByEmail(email: string): Promise<User | null> {
    const rows = await getDb()
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email.toLowerCase().trim()))
      .limit(1);
    if (!rows[0]) return null;
    return {
      id: rows[0].id,
      email: rows[0].email,
      name: rows[0].name,
      passwordHash: rows[0].passwordHash,
      isPlatformAdmin: rows[0].isPlatformAdmin,
      createdAt: rows[0].createdAt
    };
  }

  async create(user: User): Promise<User> {
    await getDb()
      .insert(schema.users)
      .values({
        id: user.id,
        email: user.email.toLowerCase().trim(),
        name: user.name,
        passwordHash: user.passwordHash ?? null,
        isPlatformAdmin: user.isPlatformAdmin,
        createdAt: user.createdAt
      })
      .onConflictDoUpdate({
        target: schema.users.id,
        set: { name: user.name, email: user.email, passwordHash: user.passwordHash ?? null }
      });
    return user;
  }

  async update(id: string, patch: Partial<User>): Promise<User> {
    const values: Record<string, unknown> = {};
    if (patch.name !== undefined) values.name = patch.name;
    if (patch.email !== undefined) values.email = patch.email.toLowerCase().trim();
    if (patch.passwordHash !== undefined) values.passwordHash = patch.passwordHash;
    if (patch.isPlatformAdmin !== undefined) values.isPlatformAdmin = patch.isPlatformAdmin;

    await getDb().update(schema.users).set(values).where(eq(schema.users.id, id));
    const updated = await this.findById(id);
    if (!updated) throw new Error(`Utilisateur introuvable : ${id}`);
    return updated;
  }

  async list(): Promise<User[]> {
    const rows = await getDb().select().from(schema.users);
    return rows.map((r) => ({
      id: r.id,
      email: r.email,
      name: r.name,
      passwordHash: r.passwordHash,
      isPlatformAdmin: r.isPlatformAdmin,
      createdAt: r.createdAt
    }));
  }
}

// --- 2. Sessions (Stockées en base par hash SHA-256) -----------------------

export class DrizzleSessionRepository implements ISessionRepository {
  async create(session: Session): Promise<Session> {
    const resolvedOrgId = session.organizationId ? toUuid(session.organizationId) : null;
    await getDb()
      .insert(schema.sessions)
      .values({
        id: session.id,
        userId: session.userId,
        organizationId: resolvedOrgId,
        expiresAt: session.expiresAt,
        createdAt: session.createdAt
      });
    return { ...session, organizationId: resolvedOrgId };
  }

  async findById(tokenHash: string): Promise<Session | null> {
    const rows = await getDb()
      .select()
      .from(schema.sessions)
      .where(eq(schema.sessions.id, tokenHash))
      .limit(1);
    if (!rows[0]) return null;
    if (new Date() > rows[0].expiresAt) {
      await this.delete(tokenHash);
      return null;
    }
    return {
      id: rows[0].id,
      userId: rows[0].userId,
      organizationId: rows[0].organizationId,
      expiresAt: rows[0].expiresAt,
      createdAt: rows[0].createdAt
    };
  }

  async delete(tokenHash: string): Promise<void> {
    await getDb().delete(schema.sessions).where(eq(schema.sessions.id, tokenHash));
  }

  async deleteExpired(now = new Date()): Promise<void> {
    await getDb().delete(schema.sessions).where(lt(schema.sessions.expiresAt, now));
  }
}

// --- 3. Memberships ---------------------------------------------------------

export class DrizzleMembershipRepository implements IMembershipRepository {
  async create(membership: Membership): Promise<Membership> {
    const orgId = toUuid(membership.organizationId);
    await getDb()
      .insert(schema.memberships)
      .values({
        userId: membership.userId,
        organizationId: orgId,
        roleInOrg: membership.roleInOrg,
        appRole: membership.appRole
      });
    return { ...membership, organizationId: orgId };
  }

  async findByUser(userId: string): Promise<Membership[]> {
    const rows = await getDb()
      .select()
      .from(schema.memberships)
      .where(eq(schema.memberships.userId, userId));
    return rows.map((r) => ({
      userId: r.userId,
      organizationId: r.organizationId,
      roleInOrg: r.roleInOrg,
      appRole: r.appRole as Membership['appRole']
    }));
  }

  async findByUserAndOrg(userId: string, orgId: string): Promise<Membership | null> {
    const resolvedOrgId = toUuid(orgId);
    const rows = await getDb()
      .select()
      .from(schema.memberships)
      .where(
        and(
          eq(schema.memberships.userId, userId),
          eq(schema.memberships.organizationId, resolvedOrgId)
        )
      )
      .limit(1);
    if (!rows[0]) return null;
    return {
      userId: rows[0].userId,
      organizationId: rows[0].organizationId,
      roleInOrg: rows[0].roleInOrg,
      appRole: rows[0].appRole as Membership['appRole']
    };
  }

  async listByOrg(orgId: string): Promise<Membership[]> {
    const resolvedOrgId = toUuid(orgId);
    const rows = await getDb()
      .select()
      .from(schema.memberships)
      .where(eq(schema.memberships.organizationId, resolvedOrgId));
    return rows.map((r) => ({
      userId: r.userId,
      organizationId: r.organizationId,
      roleInOrg: r.roleInOrg,
      appRole: r.appRole as Membership['appRole']
    }));
  }
}

// --- 4. Organisations & Profils ---------------------------------------------

export class DrizzleOrgRepository implements IOrgRepository {
  async findById(id: string): Promise<Organization | null> {
    const resolvedId = toUuid(id);
    const rows = await getDb()
      .select()
      .from(schema.organizations)
      .where(eq(schema.organizations.id, resolvedId))
      .limit(1);
    if (!rows[0]) return null;
    return {
      id: rows[0].id,
      name: rows[0].name,
      siren: rows[0].siren,
      rna: rows[0].rna,
      createdAt: rows[0].createdAt
    };
  }

  async findByName(name: string): Promise<Organization | null> {
    const rows = await getDb()
      .select()
      .from(schema.organizations)
      .where(eq(schema.organizations.name, name))
      .limit(1);
    if (!rows[0]) return null;
    return {
      id: rows[0].id,
      name: rows[0].name,
      siren: rows[0].siren,
      rna: rows[0].rna,
      createdAt: rows[0].createdAt
    };
  }

  async create(org: Organization, profile: OrganizationProfileInput): Promise<Organization> {
    const resolvedId = toUuid(org.id);
    await getDb()
      .insert(schema.organizations)
      .values({
        id: resolvedId,
        name: org.name,
        siren: org.siren,
        rna: org.rna,
        createdAt: org.createdAt
      })
      .onConflictDoUpdate({
        target: schema.organizations.id,
        set: { name: org.name, siren: org.siren, rna: org.rna }
      });

    await getDb()
      .insert(schema.organizationProfiles)
      .values({
        organizationId: resolvedId,
        sector: profile.sector,
        employeesCount: profile.employeesCount,
        annualBudget: profile.annualBudget,
        ccn: profile.ccn,
        fiscalYearEnd: profile.fiscalYearEnd,
        usualAgMonth: profile.usualAgMonth,
        governanceSummary: profile.governanceSummary,
        mainFunders: profile.mainFunders,
        members: profile.members,
        establishmentsCount: profile.establishmentsCount
      })
      .onConflictDoUpdate({
        target: schema.organizationProfiles.organizationId,
        set: {
          sector: profile.sector,
          employeesCount: profile.employeesCount,
          annualBudget: profile.annualBudget,
          ccn: profile.ccn,
          mainFunders: profile.mainFunders,
          members: profile.members
        }
      });

    return { ...org, id: resolvedId };
  }

  async list(): Promise<Organization[]> {
    const rows = await getDb().select().from(schema.organizations);
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      siren: r.siren,
      rna: r.rna,
      createdAt: r.createdAt
    }));
  }

  async getProfile(orgId: string): Promise<OrganizationProfile | null> {
    const resolvedOrgId = toUuid(orgId);
    const rows = await getDb()
      .select()
      .from(schema.organizationProfiles)
      .where(eq(schema.organizationProfiles.organizationId, resolvedOrgId))
      .limit(1);
    if (!rows[0]) return null;
    return {
      organizationId: rows[0].organizationId,
      sector: rows[0].sector,
      employeesCount: rows[0].employeesCount,
      annualBudget: rows[0].annualBudget,
      ccn: rows[0].ccn,
      fiscalYearEnd: rows[0].fiscalYearEnd,
      usualAgMonth: rows[0].usualAgMonth,
      governanceSummary: rows[0].governanceSummary,
      mainFunders: rows[0].mainFunders || [],
      establishmentsCount: rows[0].establishmentsCount,
      members: rows[0].members || []
    };
  }

  async updateProfile(
    orgId: string,
    patch: Partial<OrganizationProfileInput>
  ): Promise<OrganizationProfile> {
    const resolvedOrgId = toUuid(orgId);
    const values: Record<string, unknown> = { updatedAt: new Date() };
    if (patch.sector !== undefined) values.sector = patch.sector;
    if (patch.employeesCount !== undefined) values.employeesCount = patch.employeesCount;
    if (patch.annualBudget !== undefined) values.annualBudget = patch.annualBudget;
    if (patch.ccn !== undefined) values.ccn = patch.ccn;
    if (patch.fiscalYearEnd !== undefined) values.fiscalYearEnd = patch.fiscalYearEnd;
    if (patch.usualAgMonth !== undefined) values.usualAgMonth = patch.usualAgMonth;
    if (patch.governanceSummary !== undefined) values.governanceSummary = patch.governanceSummary;
    if (patch.mainFunders !== undefined) values.mainFunders = patch.mainFunders;
    if (patch.members !== undefined) values.members = patch.members;
    if (patch.establishmentsCount !== undefined) values.establishmentsCount = patch.establishmentsCount;

    await getDb()
      .update(schema.organizationProfiles)
      .set(values)
      .where(eq(schema.organizationProfiles.organizationId, resolvedOrgId));

    const updated = await this.getProfile(resolvedOrgId);
    if (!updated) throw new Error(`Profil introuvable pour l'org ${orgId}`);
    return updated;
  }

  async deleteProfile(orgId: string): Promise<void> {
    const resolvedOrgId = toUuid(orgId);
    await this.updateProfile(resolvedOrgId, {
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

// --- 5. Formules (Plans & PlanFeatures) --------------------------------------

export class DrizzlePlanRepository implements IPlanRepository {
  async listActive(): Promise<Plan[]> {
    const planRows = await getDb()
      .select()
      .from(schema.plans)
      .where(eq(schema.plans.active, true))
      .orderBy(schema.plans.sort);

    const featureRows = await getDb().select().from(schema.planFeatures);

    return planRows.map((p) => ({
      code: p.code,
      label: p.label,
      description: p.description,
      priceMonthlyEur: p.priceMonthlyEur,
      stripePriceId: p.stripePriceId,
      highlighted: p.highlighted,
      active: p.active,
      sort: p.sort,
      features: featureRows
        .filter((f) => f.planCode === p.code)
        .map((f) => ({
          featureKey: f.featureKey as FeatureKey,
          enabled: f.enabled,
          limitValue: f.limitValue
        }))
    }));
  }

  async listAll(): Promise<Plan[]> {
    const planRows = await getDb().select().from(schema.plans).orderBy(schema.plans.sort);
    const featureRows = await getDb().select().from(schema.planFeatures);

    return planRows.map((p) => ({
      code: p.code,
      label: p.label,
      description: p.description,
      priceMonthlyEur: p.priceMonthlyEur,
      stripePriceId: p.stripePriceId,
      highlighted: p.highlighted,
      active: p.active,
      sort: p.sort,
      features: featureRows
        .filter((f) => f.planCode === p.code)
        .map((f) => ({
          featureKey: f.featureKey as FeatureKey,
          enabled: f.enabled,
          limitValue: f.limitValue
        }))
    }));
  }

  async findByCode(code: string): Promise<Plan | null> {
    const plans = await this.listAll();
    return plans.find((p) => p.code === code) || null;
  }

  async findByStripePriceId(priceId: string): Promise<Plan | null> {
    const plans = await this.listAll();
    return plans.find((p) => p.stripePriceId === priceId) || null;
  }

  async update(code: string, patch: Partial<Omit<Plan, 'code'>>): Promise<Plan> {
    const values: Record<string, unknown> = {};
    if (patch.label !== undefined) values.label = patch.label;
    if (patch.description !== undefined) values.description = patch.description;
    if (patch.priceMonthlyEur !== undefined) values.priceMonthlyEur = patch.priceMonthlyEur;
    if (patch.highlighted !== undefined) values.highlighted = patch.highlighted;
    if (patch.active !== undefined) values.active = patch.active;
    if (patch.sort !== undefined) values.sort = patch.sort;

    if (Object.keys(values).length > 0) {
      await getDb().update(schema.plans).set(values).where(eq(schema.plans.code, code));
    }

    if (patch.features) {
      for (const feat of patch.features) {
        await getDb()
          .insert(schema.planFeatures)
          .values({
            planCode: code,
            featureKey: feat.featureKey,
            enabled: feat.enabled,
            limitValue: feat.limitValue
          })
          .onConflictDoUpdate({
            target: [schema.planFeatures.planCode, schema.planFeatures.featureKey],
            set: { enabled: feat.enabled, limitValue: feat.limitValue }
          });
      }
    }

    const updated = await this.findByCode(code);
    if (!updated) throw new Error(`Plan introuvable : ${code}`);
    return updated;
  }
}

// --- 6. Abonnements ---------------------------------------------------------

export class DrizzleSubscriptionRepository implements ISubscriptionRepository {
  async findByOrgId(orgId: string): Promise<Subscription | null> {
    const resolvedOrgId = toUuid(orgId);
    const rows = await getDb()
      .select()
      .from(schema.subscriptions)
      .where(eq(schema.subscriptions.organizationId, resolvedOrgId))
      .limit(1);
    if (!rows[0]) return null;
    return {
      organizationId: rows[0].organizationId,
      stripeCustomerId: rows[0].stripeCustomerId,
      stripeSubscriptionId: rows[0].stripeSubscriptionId,
      planCode: rows[0].planCode,
      status: rows[0].status,
      currentPeriodEnd: rows[0].currentPeriodEnd,
      graceUntil: rows[0].graceUntil
    };
  }

  async upsert(sub: Subscription): Promise<Subscription> {
    const resolvedOrgId = toUuid(sub.organizationId);
    await getDb()
      .insert(schema.subscriptions)
      .values({
        organizationId: resolvedOrgId,
        stripeCustomerId: sub.stripeCustomerId,
        stripeSubscriptionId: sub.stripeSubscriptionId,
        planCode: sub.planCode,
        status: sub.status,
        currentPeriodEnd: sub.currentPeriodEnd,
        graceUntil: sub.graceUntil,
        updatedAt: new Date()
      })
      .onConflictDoUpdate({
        target: schema.subscriptions.organizationId,
        set: {
          stripeCustomerId: sub.stripeCustomerId,
          stripeSubscriptionId: sub.stripeSubscriptionId,
          planCode: sub.planCode,
          status: sub.status,
          currentPeriodEnd: sub.currentPeriodEnd,
          graceUntil: sub.graceUntil,
          updatedAt: new Date()
        }
      });
    return { ...sub, organizationId: resolvedOrgId };
  }

  async hasStripeEvent(eventId: string): Promise<boolean> {
    const rows = await getDb()
      .select()
      .from(schema.stripeEvents)
      .where(eq(schema.stripeEvents.eventId, eventId))
      .limit(1);
    return Boolean(rows[0]);
  }

  async recordStripeEvent(eventId: string, type: string): Promise<void> {
    await getDb()
      .insert(schema.stripeEvents)
      .values({ eventId, type, processedAt: new Date() })
      .onConflictDoNothing();
  }
}

// --- 7. Questions Expertes --------------------------------------------------

export class DrizzleTicketRepository implements ITicketRepository {
  async create(ticket: ExpertTicket): Promise<ExpertTicket> {
    const resolvedId = toUuid(ticket.id);
    const resolvedOrgId = toUuid(ticket.organizationId);
    await getDb()
      .insert(schema.expertTickets)
      .values({
        id: resolvedId,
        ref: ticket.ref,
        organizationId: resolvedOrgId,
        userId: ticket.userId,
        domain: ticket.domain,
        urgency: ticket.urgency,
        question: ticket.question,
        answer: ticket.answer,
        internalNote: ticket.internalNote,
        status: ticket.status,
        answeredAt: ticket.answeredAt,
        createdAt: ticket.createdAt
      });
    return { ...ticket, id: resolvedId, organizationId: resolvedOrgId };
  }

  async findById(id: string): Promise<ExpertTicket | null> {
    const resolvedId = toUuid(id);
    const rows = await getDb()
      .select()
      .from(schema.expertTickets)
      .where(eq(schema.expertTickets.id, resolvedId))
      .limit(1);
    if (!rows[0]) return null;
    return this.mapTicket(rows[0]);
  }

  async findByRef(ref: string): Promise<ExpertTicket | null> {
    const rows = await getDb()
      .select()
      .from(schema.expertTickets)
      .where(eq(schema.expertTickets.ref, ref))
      .limit(1);
    if (!rows[0]) return null;
    return this.mapTicket(rows[0]);
  }

  async listByOrg(orgId: string): Promise<ExpertTicket[]> {
    const resolvedOrgId = toUuid(orgId);
    const rows = await getDb()
      .select()
      .from(schema.expertTickets)
      .where(eq(schema.expertTickets.organizationId, resolvedOrgId))
      .orderBy(desc(schema.expertTickets.createdAt));
    return rows.map(this.mapTicket);
  }

  async listAll(): Promise<ExpertTicket[]> {
    const rows = await getDb()
      .select()
      .from(schema.expertTickets)
      .orderBy(desc(schema.expertTickets.createdAt));
    return rows.map(this.mapTicket);
  }

  async countThisMonthByOrg(orgId: string, now = new Date()): Promise<number> {
    const resolvedOrgId = toUuid(orgId);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const rows = await getDb()
      .select({ count: sql<number>`count(*)` })
      .from(schema.expertTickets)
      .where(
        and(
          eq(schema.expertTickets.organizationId, resolvedOrgId),
          gte(schema.expertTickets.createdAt, startOfMonth)
        )
      );
    return Number(rows[0]?.count || 0);
  }

  async update(id: string, patch: Partial<ExpertTicket>): Promise<ExpertTicket> {
    const resolvedId = toUuid(id);
    const values: Record<string, unknown> = {};
    if (patch.status !== undefined) values.status = patch.status;
    if (patch.answer !== undefined) values.answer = patch.answer;
    if (patch.internalNote !== undefined) values.internalNote = patch.internalNote;
    if (patch.answeredAt !== undefined) values.answeredAt = patch.answeredAt;

    await getDb()
      .update(schema.expertTickets)
      .set(values)
      .where(eq(schema.expertTickets.id, resolvedId));

    const updated = await this.findById(resolvedId);
    if (!updated) throw new Error(`Ticket introuvable : ${id}`);
    return updated;
  }

  private mapTicket(r: typeof schema.expertTickets.$inferSelect): ExpertTicket {
    return {
      id: r.id,
      ref: r.ref,
      organizationId: r.organizationId,
      userId: r.userId,
      domain: r.domain,
      urgency: r.urgency as ExpertTicket['urgency'],
      subject: r.question.slice(0, 60),
      question: r.question,
      answer: r.answer,
      internalNote: r.internalNote,
      status: r.status as ExpertTicket['status'],
      answeredAt: r.answeredAt,
      createdAt: r.createdAt
    };
  }
}

// --- 8. Assistant IA & Usage ------------------------------------------------

export class DrizzleAiRepository implements IAiRepository {
  async createConversation(conv: Conversation): Promise<Conversation> {
    const resolvedId = toUuid(conv.id);
    const resolvedOrgId = toUuid(conv.organizationId);
    await getDb()
      .insert(schema.conversations)
      .values({
        id: resolvedId,
        organizationId: resolvedOrgId,
        userId: conv.userId,
        domain: conv.domain,
        title: conv.title,
        createdAt: conv.createdAt
      });
    return { ...conv, id: resolvedId, organizationId: resolvedOrgId };
  }

  async findConversationById(id: string, orgId: string): Promise<Conversation | null> {
    const resolvedId = toUuid(id);
    const resolvedOrgId = toUuid(orgId);
    const rows = await getDb()
      .select()
      .from(schema.conversations)
      .where(
        and(
          eq(schema.conversations.id, resolvedId),
          eq(schema.conversations.organizationId, resolvedOrgId)
        )
      )
      .limit(1);
    if (!rows[0]) return null;
    return {
      id: rows[0].id,
      organizationId: rows[0].organizationId,
      userId: rows[0].userId,
      domain: rows[0].domain,
      title: rows[0].title,
      createdAt: rows[0].createdAt
    };
  }

  async listConversationsByOrg(orgId: string): Promise<Conversation[]> {
    const resolvedOrgId = toUuid(orgId);
    const rows = await getDb()
      .select()
      .from(schema.conversations)
      .where(eq(schema.conversations.organizationId, resolvedOrgId))
      .orderBy(desc(schema.conversations.createdAt));
    return rows.map((r) => ({
      id: r.id,
      organizationId: r.organizationId,
      userId: r.userId,
      domain: r.domain,
      title: r.title,
      createdAt: r.createdAt
    }));
  }

  async deleteConversation(orgId: string, convId: string): Promise<boolean> {
    const resolvedOrgId = toUuid(orgId);
    const resolvedConvId = toUuid(convId);
    await getDb()
      .delete(schema.conversations)
      .where(
        and(
          eq(schema.conversations.id, resolvedConvId),
          eq(schema.conversations.organizationId, resolvedOrgId)
        )
      );
    return true;
  }

  async addMessage(msg: Message): Promise<Message> {
    const resolvedId = toUuid(msg.id);
    const resolvedConvId = toUuid(msg.conversationId);
    const resolvedOrgId = toUuid(msg.organizationId);
    await getDb()
      .insert(schema.messages)
      .values({
        id: resolvedId,
        conversationId: resolvedConvId,
        organizationId: resolvedOrgId,
        userId: msg.userId,
        role: msg.role,
        content: msg.content,
        createdAt: msg.createdAt
      });
    return { ...msg, id: resolvedId, conversationId: resolvedConvId, organizationId: resolvedOrgId };
  }

  async listMessages(convId: string, orgId: string): Promise<Message[]> {
    const resolvedConvId = toUuid(convId);
    const resolvedOrgId = toUuid(orgId);
    const rows = await getDb()
      .select()
      .from(schema.messages)
      .where(
        and(
          eq(schema.messages.conversationId, resolvedConvId),
          eq(schema.messages.organizationId, resolvedOrgId)
        )
      )
      .orderBy(schema.messages.createdAt);
    return rows.map((r) => ({
      id: r.id,
      conversationId: r.conversationId,
      organizationId: r.organizationId,
      userId: r.userId,
      role: r.role as Message['role'],
      content: r.content,
      createdAt: r.createdAt
    }));
  }

  async recordUsage(usage: AiUsage): Promise<void> {
    const resolvedId = toUuid(usage.id);
    const resolvedOrgId = toUuid(usage.organizationId);
    await getDb()
      .insert(schema.aiUsage)
      .values({
        id: resolvedId,
        organizationId: resolvedOrgId,
        userId: usage.userId,
        model: usage.model,
        promptVersion: usage.promptVersion,
        inputTokens: usage.inputTokens,
        outputTokens: usage.outputTokens,
        costEstimate: String(usage.costEstimate),
        createdAt: usage.createdAt
      });
  }

  async getUsageSummary(): Promise<{
    records: AiUsage[];
    totalCostByOrg: Record<string, number>;
    totalTokens: number;
    totalCost: number;
  }> {
    const rows = await getDb().select().from(schema.aiUsage).orderBy(desc(schema.aiUsage.createdAt));
    const totalCostByOrg: Record<string, number> = {};
    let totalTokens = 0;
    let totalCost = 0;

    const records: AiUsage[] = rows.map((r) => {
      const cost = Number(r.costEstimate);
      totalCostByOrg[r.organizationId] = Number(
        ((totalCostByOrg[r.organizationId] || 0) + cost).toFixed(6)
      );
      totalTokens += r.inputTokens + r.outputTokens;
      totalCost += cost;
      return {
        id: r.id,
        organizationId: r.organizationId,
        userId: r.userId,
        model: r.model,
        promptVersion: r.promptVersion,
        inputTokens: r.inputTokens,
        outputTokens: r.outputTokens,
        costEstimate: cost,
        createdAt: r.createdAt
      };
    });

    return {
      records,
      totalCostByOrg,
      totalTokens,
      totalCost: Number(totalCost.toFixed(6))
    };
  }
}

// --- 9. Pages CMS SEO & Redirections ----------------------------------------

export class DrizzleCmsRepository implements ICmsRepository {
  async findBySlug(slug: string): Promise<CmsPage | null> {
    const cleanSlug = slug.replace(/^\/+|\/+$/g, '');
    const rows = await getDb()
      .select()
      .from(schema.cmsPages)
      .where(eq(schema.cmsPages.slug, cleanSlug))
      .limit(1);
    if (!rows[0]) return null;
    return this.mapPage(rows[0]);
  }

  async listPublished(): Promise<CmsPage[]> {
    const rows = await getDb()
      .select()
      .from(schema.cmsPages)
      .where(eq(schema.cmsPages.status, 'published'));
    return rows.map(this.mapPage);
  }

  async listAll(): Promise<CmsPage[]> {
    const rows = await getDb().select().from(schema.cmsPages);
    return rows.map(this.mapPage);
  }

  async create(input: CmsPageInput): Promise<CmsPage> {
    const id = crypto.randomUUID();
    const cleanSlug = input.slug.replace(/^\/+|\/+$/g, '');
    const now = new Date();

    await getDb()
      .insert(schema.cmsPages)
      .values({
        id,
        slug: cleanSlug,
        title: input.title,
        metaDescription: input.metaDescription,
        h1: input.h1,
        chapo: input.chapo,
        content: input.content,
        faq: input.faq,
        sources: input.sources,
        author: input.author,
        reviewer: input.reviewer,
        verifiedAt: input.verifiedAt,
        status: input.status,
        noindex: input.noindex,
        breadcrumbs: input.breadcrumbs,
        updatedAt: now
      });

    return {
      ...input,
      id,
      slug: cleanSlug,
      updatedAt: now
    };
  }

  async update(id: string, patch: Partial<CmsPageInput>): Promise<CmsPage> {
    const existing = await getDb()
      .select()
      .from(schema.cmsPages)
      .where(eq(schema.cmsPages.id, id))
      .limit(1);

    if (!existing[0]) throw new Error(`Page CMS introuvable : ${id}`);

    const newSlug = patch.slug ? patch.slug.replace(/^\/+|\/+$/g, '') : existing[0].slug;
    if (newSlug !== existing[0].slug) {
      await this.recordRedirect(existing[0].slug, newSlug);
    }

    const values: Record<string, unknown> = { updatedAt: new Date() };
    if (patch.slug !== undefined) values.slug = newSlug;
    if (patch.title !== undefined) values.title = patch.title;
    if (patch.metaDescription !== undefined) values.metaDescription = patch.metaDescription;
    if (patch.h1 !== undefined) values.h1 = patch.h1;
    if (patch.chapo !== undefined) values.chapo = patch.chapo;
    if (patch.content !== undefined) values.content = patch.content;
    if (patch.faq !== undefined) values.faq = patch.faq;
    if (patch.sources !== undefined) values.sources = patch.sources;
    if (patch.author !== undefined) values.author = patch.author;
    if (patch.reviewer !== undefined) values.reviewer = patch.reviewer;
    if (patch.verifiedAt !== undefined) values.verifiedAt = patch.verifiedAt;
    if (patch.status !== undefined) values.status = patch.status;
    if (patch.noindex !== undefined) values.noindex = patch.noindex;
    if (patch.breadcrumbs !== undefined) values.breadcrumbs = patch.breadcrumbs;

    await getDb().update(schema.cmsPages).set(values).where(eq(schema.cmsPages.id, id));

    const updated = await this.findBySlug(newSlug);
    if (!updated) throw new Error(`Page introuvable après mise à jour : ${newSlug}`);
    return updated;
  }

  async getRedirect(oldSlug: string): Promise<string | null> {
    const cleanOld = oldSlug.replace(/^\/+|\/+$/g, '');
    const rows = await getDb()
      .select()
      .from(schema.cmsRedirects)
      .where(eq(schema.cmsRedirects.oldSlug, cleanOld))
      .limit(1);
    return rows[0]?.newSlug ? `/${rows[0].newSlug}` : null;
  }

  async recordRedirect(oldSlug: string, newSlug: string): Promise<void> {
    const cleanOld = oldSlug.replace(/^\/+|\/+$/g, '');
    const cleanNew = newSlug.replace(/^\/+|\/+$/g, '');
    await getDb()
      .insert(schema.cmsRedirects)
      .values({ oldSlug: cleanOld, newSlug: cleanNew })
      .onConflictDoUpdate({
        target: schema.cmsRedirects.oldSlug,
        set: { newSlug: cleanNew }
      });
  }

  private mapPage(r: typeof schema.cmsPages.$inferSelect): CmsPage {
    return {
      id: r.id,
      slug: r.slug,
      title: r.title,
      metaDescription: r.metaDescription,
      h1: r.h1,
      chapo: r.chapo,
      content: r.content,
      faq: r.faq || [],
      sources: r.sources || [],
      author: r.author,
      reviewer: r.reviewer,
      verifiedAt: r.verifiedAt,
      status: r.status as CmsPage['status'],
      noindex: r.noindex,
      breadcrumbs: r.breadcrumbs || [],
      updatedAt: r.updatedAt
    };
  }
}
