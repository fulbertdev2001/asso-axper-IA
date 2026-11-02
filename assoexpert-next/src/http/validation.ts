/**
 * Schémas de validation Zod (Design Pattern DTO / Validation).
 * Aucun payload non typé ou non assaini ne franchit la frontière HTTP.
 */

import { z } from 'zod';
import { DOMAINS } from '../domain/models';

export const loginSchema = z.object({
  email: z.string().email('Adresse e-mail invalide'),
  password: z.string().min(6, 'Le mot de passe doit comporter au moins 6 caractères')
});

export const magicLinkRequestSchema = z.object({
  email: z.string().email('Adresse e-mail invalide'),
  organizationId: z.string().min(1, 'ID organisation requis')
});

export const registerOrgSchema = z.object({
  email: z.string().email('Adresse e-mail requise'),
  name: z.string().min(1).optional().default('Direction'),
  roleInOrg: z.string().default('Direction'),
  password: z.string().min(6).optional(),
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
    members: z
      .array(
        z.object({
          id: z.string().default(() => `mem-${Date.now()}`),
          firstName: z.string(),
          lastName: z.string(),
          role: z.string(),
          email: z.string(),
          phone: z.string().optional(),
          idCardNumber: z.string().optional(),
          joinedDate: z.string().default(() => new Date().toLocaleDateString('fr-FR'))
        })
      )
      .default([])
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
  members: z.array(z.any()).optional(),
  establishmentsCount: z.coerce.number().int().min(1).optional()
});

export const aiChatSchema = z.object({
  domain: z.enum(DOMAINS as unknown as [string, ...string[]]),
  question: z.string().min(3, 'La question doit comporter au moins 3 caractères').max(10000),
  conversationId: z.string().optional()
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
  breadcrumbs: z.array(z.object({ label: z.string(), href: z.string() })).default([])
});

export const updateCmsPageSchema = createCmsPageSchema.partial();
