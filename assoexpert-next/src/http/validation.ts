/**
 * Schémas de validation Zod (Design Pattern DTO / Validation).
 * Aucun payload non typé ou non assaini ne franchit la frontière HTTP.
 */

import { z } from 'zod';
import { DOMAINS } from '../domain/models';

export const MIN_PASSWORD_LENGTH = 8;

const newPasswordField = z
  .string()
  .min(MIN_PASSWORD_LENGTH, `Le mot de passe doit comporter au moins ${MIN_PASSWORD_LENGTH} caractères`)
  .max(200);

export const loginSchema = z.object({
  email: z.string().email('Adresse e-mail invalide'),
  // Pas de règle de longueur à la connexion : les comptes existants doivent pouvoir se connecter
  password: z.string().min(1, 'Mot de passe requis').max(200)
});

/** Le magic link ne cible qu'un compte existant : l'organisation est déduite côté serveur. */
export const magicLinkRequestSchema = z.object({
  email: z.string().email('Adresse e-mail invalide')
});

export const passwordResetRequestSchema = z.object({
  email: z.string().email('Adresse e-mail invalide')
});

export const passwordResetConfirmSchema = z.object({
  token: z.string().min(10, 'Jeton de réinitialisation invalide'),
  newPassword: newPasswordField
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Mot de passe actuel requis').max(200),
  newPassword: newPasswordField
});

const memberSchema = z.object({
  id: z.string().default(() => `mem-${Date.now()}`),
  firstName: z.string().max(200),
  lastName: z.string().max(200),
  role: z.string().max(200),
  email: z.string().max(320),
  phone: z.string().max(50).optional(),
  idCardNumber: z.string().max(50).optional(),
  joinedDate: z.string().default(() => new Date().toLocaleDateString('fr-FR'))
});

export const registerOrgSchema = z.object({
  email: z.string().email('Adresse e-mail requise'),
  name: z.string().min(1).optional().default('Direction'),
  roleInOrg: z.string().default('Direction'),
  password: newPasswordField.optional(),
  organization: z.object({
    name: z.string().min(2, 'Le nom de l’association est requis'),
    siren: z.string().default(''),
    rna: z.string().default(''),
    sector: z.string().default(''),
    employeesCount: z.coerce.number().int().min(1).max(100).default(1),
    annualBudget: z.coerce.number().min(0).default(0),
    ccn: z.string().default('CCN 66 (Convention Collective Nationale de 1966)'),
    fiscalYearEnd: z.string().default('31 décembre'),
    usualAgMonth: z.string().default('Juin'),
    governanceSummary: z.string().default(''),
    mainFunders: z.array(z.string()).default([]),
    establishmentsCount: z.coerce.number().int().min(1).default(1),
    members: z.array(memberSchema).max(200).default([])
  })
});

export const updateOrgProfileSchema = z.object({
  sector: z.string().optional(),
  employeesCount: z.coerce.number().int().min(0).max(100).optional(),
  annualBudget: z.coerce.number().min(0).optional(),
  ccn: z.string().optional(),
  fiscalYearEnd: z.string().optional(),
  usualAgMonth: z.string().optional(),
  governanceSummary: z.string().optional(),
  mainFunders: z.array(z.string()).optional(),
  members: z.array(memberSchema).max(200).optional(),
  establishmentsCount: z.coerce.number().int().min(1).optional()
});

/**
 * Corps de PUT /api/org/profile : `{ orgId?, patch }` ou patch « à plat ».
 * Les champs inconnus (nom, mot de passe, etc.) sont ignorés par Zod.
 */
export const updateOrgProfileRequestSchema = z.preprocess(
  (raw) => {
    const body = (raw ?? {}) as Record<string, unknown>;
    return body.patch && typeof body.patch === 'object'
      ? { orgId: body.orgId, patch: body.patch }
      : { orgId: body.orgId, patch: body };
  },
  z.object({
    orgId: z.string().optional(),
    patch: updateOrgProfileSchema
  })
);

export const aiChatSchema = z
  .object({
    domain: z.enum(DOMAINS as unknown as [string, ...string[]]),
    question: z.string().min(2).max(10000).optional(),
    query: z.string().min(2).max(10000).optional(),
    conversationId: z.string().optional()
  })
  .transform((val) => ({
    domain: val.domain,
    question: (val.question || val.query || '').trim(),
    conversationId: val.conversationId
  }))
  .refine((val) => val.question.length >= 2, {
    message: 'La question doit comporter au moins 2 caractères',
    path: ['question']
  });

export const createTicketSchema = z.object({
  domain: z.enum(DOMAINS as unknown as [string, ...string[]]),
  urgency: z.enum(['normal_48h', 'urgent']).default('normal_48h'),
  subject: z.string().min(2).max(200).optional(),
  object: z.string().min(2).max(200).optional(),
  question: z.string().min(10, 'La question doit comporter au moins 10 caractères').max(10000)
});

export const adminUpdateTicketSchema = z.object({
  ticketIdOrRef: z.string().min(1),
  status: z.enum(['pending', 'in_progress', 'answered']),
  answer: z.string().optional(),
  internalNotes: z.string().optional(),
  orgId: z.string().optional(),
  domain: z.enum(DOMAINS as unknown as [string, ...string[]]).optional(),
  question: z.string().optional(),
  subject: z.string().optional()
});

export const updatePlanSchema = z.object({
  planCode: z.string().min(1),
  patch: z.object({
    label: z.string().optional(),
    description: z.string().optional(),
    priceMonthly: z.coerce.number().min(0).optional(),
    priceMonthlyEur: z.coerce.number().min(0).optional(),
    highlighted: z.boolean().optional(),
    active: z.boolean().optional(),
    features: z
      .union([
        z.array(
          z.object({
            featureKey: z.string(),
            enabled: z.boolean(),
            limitValue: z.string().nullable().optional()
          })
        ),
        z.record(z.any())
      ])
      .optional()
  })
});

export const createCmsPageSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(2),
  metaDescription: z.string().min(10),
  h1: z.string().min(2),
  chapo: z.string().default(''),
  content: z.string().default(''),
  faq: z.array(z.object({ question: z.string(), answer: z.string() })).default([]),
  sources: z.array(z.string()).default([]),
  author: z.string().default('Laetitia Badji'),
  reviewer: z.string().default('Cabinet Maé'),
  verifiedAt: z.string().default(''),
  status: z.enum(['draft', 'published']).default('published'),
  noindex: z.boolean().default(false),
  breadcrumbs: z
    .array(
      z.object({
        label: z.string(),
        // Liens internes ou http(s) uniquement (pas de `javascript:` dans le fil d'Ariane)
        href: z.string().regex(/^(\/(?!\/)|https?:\/\/)/, 'Lien de fil d’Ariane invalide')
      })
    )
    .default([])
});

export const updateCmsPageSchema = createCmsPageSchema.partial();

export const adminUpdateCmsPageSchema = z.object({
  pageId: z.string().min(1, 'pageId obligatoire'),
  patch: updateCmsPageSchema
});
