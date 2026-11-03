#!/usr/bin/env node
/**
 * Script de seed initial sur Neon PostgreSQL (`@neondatabase/serverless`)
 * Insère :
 * - Les 3 formules (`plans`) et leurs droits (`plan_features`)
 * - Les 3 organisations de démonstration (`organizations`, `organization_profiles`, `memberships`, `subscriptions`)
 * - Les utilisateurs démo & admin Cabinet Maé (`users`)
 * - Les pages piliers CMS SEO (`cms_pages`)
 * - Les tickets experts initiaux (`expert_tickets`)
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { neon } from '@neondatabase/serverless';

function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

loadEnvLocal();

function getDatabaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  throw new Error('DATABASE_URL introuvable dans .env.local');
}

/**
 * Même format que `src/lib/auth/password.ts` (scrypt, sel aléatoire par mot de passe).
 * Les mots de passe ne sont JAMAIS écrits dans le repo : ils viennent de l'environnement.
 *   SEED_ADMIN_PASSWORD : compte administrateur Cabinet Maé (obligatoire)
 *   SEED_DEMO_PASSWORD  : comptes de démonstration des associations (obligatoire)
 */
function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const key = crypto.scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
  return ['scrypt', 16384, 8, 1, salt.toString('base64'), key.toString('base64')].join('$');
}

function requiredSecret(name) {
  const value = process.env[name];
  if (!value || value.length < 12) {
    throw new Error(`${name} doit être défini (12 caractères minimum) pour lancer le seed.`);
  }
  return value;
}

const ADMIN_PASSWORD = requiredSecret('SEED_ADMIN_PASSWORD');
const DEMO_PASSWORD = requiredSecret('SEED_DEMO_PASSWORD');

async function main() {
  const sql = neon(getDatabaseUrl());

  console.log('[0/5] Mise à jour du schéma Neon (verification_tokens & expert_tickets.subject)...');
  await sql`
    CREATE TABLE IF NOT EXISTS verification_tokens (
      id text PRIMARY KEY,
      purpose text NOT NULL,
      user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
      expires_at timestamptz NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS verification_tokens_user_idx ON verification_tokens(user_id)
  `;
  await sql`
    ALTER TABLE expert_tickets ADD COLUMN IF NOT EXISTS subject text NOT NULL DEFAULT ''
  `;

  console.log('[1/5] Insertion des formules (plans) et droits (plan_features)...');
  const plans = [
    {
      code: 'initiale',
      label: 'Initiale',
      description: '1 domaine au choix + réponses sourcées illimitées.',
      price: 29,
      stripePriceId: 'price_initiale_monthly',
      highlighted: false,
      sort: 1,
      features: [
        ['brique.rh', true, null],
        ['brique.gouvernance', false, null],
        ['brique.finance', false, null],
        ['brique.conformite', false, null],
        ['ai.model', true, 'claude-haiku-4-5-20251001'],
        ['ai.max_tokens', true, '1024'],
        ['ai.max_input_chars', true, '1500'],
        ['expert_questions_month', false, '0']
      ]
    },
    {
      code: 'pro',
      label: 'Pro (Recommandée)',
      description: 'Les 4 domaines complets + 1 question experte / mois.',
      price: 67,
      stripePriceId: 'price_pro_monthly',
      highlighted: true,
      sort: 2,
      features: [
        ['brique.rh', true, null],
        ['brique.gouvernance', true, null],
        ['brique.finance', true, null],
        ['brique.conformite', true, null],
        ['ai.model', true, 'claude-sonnet-5'],
        ['ai.max_tokens', true, '2048'],
        ['ai.max_input_chars', true, '4000'],
        ['expert_questions_month', true, '1']
      ]
    },
    {
      code: 'expert',
      label: 'Expert +',
      description: 'Les 4 domaines + 3 questions expertes / mois traitées sous 48h.',
      price: 127,
      stripePriceId: 'price_expert_monthly',
      highlighted: false,
      sort: 3,
      features: [
        ['brique.rh', true, null],
        ['brique.gouvernance', true, null],
        ['brique.finance', true, null],
        ['brique.conformite', true, null],
        ['ai.model', true, 'claude-sonnet-5'],
        ['ai.max_tokens', true, '4096'],
        ['ai.max_input_chars', true, '8000'],
        ['expert_questions_month', true, '3']
      ]
    }
  ];

  for (const p of plans) {
    await sql`
      INSERT INTO plans (code, label, description, price_monthly_eur, stripe_price_id, highlighted, active, sort)
      VALUES (${p.code}, ${p.label}, ${p.description}, ${p.price}, ${p.stripePriceId}, ${p.highlighted}, true, ${p.sort})
      ON CONFLICT (code) DO NOTHING
    `;

    for (const [featureKey, enabled, limitValue] of p.features) {
      await sql`
        INSERT INTO plan_features (plan_code, feature_key, enabled, limit_value)
        VALUES (${p.code}, ${featureKey}, ${enabled}, ${limitValue})
        ON CONFLICT (plan_code, feature_key) DO NOTHING
      `;
    }
  }

  console.log('[2/5] Insertion des utilisateurs (démo & admin Cabinet Maé)...');
  const demoUsers = [
    {
      id: 'usr_admin_laetitia',
      email: 'laetitia.badji@cabinet-mae.fr',
      name: 'Laetitia Badji (Cabinet Maé)',
      passwordHash: hashPassword(ADMIN_PASSWORD),
      isPlatformAdmin: true,
      orgId: null
    },
    {
      id: 'usr_espoir_dir',
      email: 'contact@espoir-solidarite.org',
      name: 'Claire Delorme (Espoir & Solidarité)',
      passwordHash: hashPassword(DEMO_PASSWORD),
      isPlatformAdmin: false,
      orgId: '11111111-1111-4111-8111-111111111111'
    },
    {
      id: 'usr_mpt_lilas_dir',
      email: 'direction@mpt-lilas.fr',
      name: 'Julien Mercier (MPT des Lilas)',
      passwordHash: hashPassword(DEMO_PASSWORD),
      isPlatformAdmin: false,
      orgId: '22222222-2222-4222-8222-222222222222'
    },
    {
      id: 'usr_passerelle_avenir_dir',
      email: 'direction@passerelle-avenir.org',
      name: 'Alexandre Dupont (Passerelle Avenir)',
      passwordHash: hashPassword(DEMO_PASSWORD),
      isPlatformAdmin: false,
      orgId: '33333333-3333-4333-8333-333333333333'
    },
    {
      id: 'usr_tremplin_dir',
      email: 'direction@tremplin-solidarites.org',
      name: 'Claire Delorme (Tremplin)',
      passwordHash: hashPassword(DEMO_PASSWORD),
      isPlatformAdmin: false,
      orgId: '11111111-1111-4111-8111-111111111111'
    },
    {
      id: 'usr_mpt_dir',
      email: 'contact@mpt-lilas.fr',
      name: 'Marc Lefebvre (MPT Lilas)',
      passwordHash: hashPassword(DEMO_PASSWORD),
      isPlatformAdmin: false,
      orgId: '22222222-2222-4222-8222-222222222222'
    },
    {
      id: 'usr_passerelle_dir',
      email: 'direction@passerelle-lyon.org',
      name: 'Sophie Bertrand (Passerelle)',
      passwordHash: hashPassword(DEMO_PASSWORD),
      isPlatformAdmin: false,
      orgId: '33333333-3333-4333-8333-333333333333'
    }
  ];

  for (const u of demoUsers) {
    await sql`
      INSERT INTO users (id, email, name, password_hash, is_platform_admin)
      VALUES (${u.id}, ${u.email}, ${u.name}, ${u.passwordHash}, ${u.isPlatformAdmin})
      ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        name = EXCLUDED.name,
        password_hash = EXCLUDED.password_hash,
        is_platform_admin = EXCLUDED.is_platform_admin
    `;
  }

  console.log('[3/5] Insertion des organisations, profils types & memberships...');
  const demoOrgs = [
    {
      id: '11111111-1111-4111-8111-111111111111',
      name: 'Association Tremplin Solidarités (MECS)',
      siren: '412893045',
      rna: 'W751142890',
      sector: 'Médico-social & Protection de l’enfance',
      employeesCount: 34,
      annualBudget: 1450000,
      ccn: 'CCN 66 (Convention Collective Nationale de 1966)',
      fiscalYearEnd: '31 décembre',
      usualAgMonth: 'Juin',
      governanceSummary: 'Conseil d’administration de 9 membres, Bureau de 3 membres, Directrice générale salariée avec délégation.',
      mainFunders: ['Conseil Départemental 75', 'ARS Île-de-France', 'CAF'],
      members: [
        { id: 'mem-1', firstName: 'Claire', lastName: 'Delorme', role: 'Directrice générale', email: 'direction@tremplin-solidarites.org', joinedDate: '01/01/2026' }
      ],
      establishmentsCount: 2,
      planCode: 'pro',
      stripeCustomerId: 'cus_AkiligueEspoir75',
      ownerUserId: 'usr_tremplin_dir'
    },
    {
      id: '22222222-2222-4222-8222-222222222222',
      name: 'Maison Pour Tous Les Lilas (Centre Social)',
      siren: '523901124',
      rna: 'W931008412',
      sector: 'Animation socioculturelle & Famille',
      employeesCount: 14,
      annualBudget: 580000,
      ccn: 'Convention collective ÉCLAT (ex-Animation)',
      fiscalYearEnd: '31 décembre',
      usualAgMonth: 'Mai',
      governanceSummary: 'CA de 12 membres élus en AG, Bureau collégial.',
      mainFunders: ['CAF 93', 'Mairie des Lilas', 'FONJEP'],
      members: [
        { id: 'mem-2', firstName: 'Marc', lastName: 'Lefebvre', role: 'Directeur', email: 'contact@mpt-lilas.fr', joinedDate: '01/01/2026' }
      ],
      establishmentsCount: 1,
      planCode: 'initiale',
      stripeCustomerId: 'cus_MptLilas93',
      ownerUserId: 'usr_mpt_dir'
    },
    {
      id: '33333333-3333-4333-8333-333333333333',
      name: 'Passerelle Insertion Lyon (ACI)',
      siren: '789456123',
      rna: 'W691045120',
      sector: 'Insertion par l’Activité Économique (IAE)',
      employeesCount: 62,
      annualBudget: 2350000,
      ccn: 'CCN 51 (FEHAP)',
      fiscalYearEnd: '31 décembre',
      usualAgMonth: 'Juin',
      governanceSummary: 'CA de 15 membres, Président, Trésorier expert-comptable, DAF et DRH salariés.',
      mainFunders: ['DDETS / État (Aide au poste)', 'FSE+', 'Métropole de Lyon'],
      members: [
        { id: 'mem-3', firstName: 'Sophie', lastName: 'Bertrand', role: 'Directrice', email: 'direction@passerelle-lyon.org', joinedDate: '01/01/2026' }
      ],
      establishmentsCount: 3,
      planCode: 'expert',
      stripeCustomerId: 'cus_PasserelleLyon69',
      ownerUserId: 'usr_passerelle_dir'
    }
  ];

  for (const org of demoOrgs) {
    await sql`
      INSERT INTO organizations (id, name, siren, rna)
      VALUES (${org.id}, ${org.name}, ${org.siren}, ${org.rna})
      ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name
    `;

    await sql`
      INSERT INTO organization_profiles (
        org_id, sector, employees_count, annual_budget, ccn,
        fiscal_year_end, usual_ag_month, governance_summary, main_funders, members, establishments_count
      )
      VALUES (
        ${org.id}, ${org.sector}, ${org.employeesCount}, ${org.annualBudget}, ${org.ccn},
        ${org.fiscalYearEnd}, ${org.usualAgMonth}, ${org.governanceSummary},
        ${JSON.stringify(org.mainFunders)}::jsonb, ${JSON.stringify(org.members)}::jsonb, ${org.establishmentsCount}
      )
      ON CONFLICT (org_id) DO UPDATE SET
        employees_count = EXCLUDED.employees_count,
        annual_budget = EXCLUDED.annual_budget,
        ccn = EXCLUDED.ccn,
        members = EXCLUDED.members
    `;

    await sql`
      INSERT INTO subscriptions (
        org_id, stripe_customer_id, stripe_subscription_id, plan_code, status, current_period_end
      )
      VALUES (
        ${org.id}, ${org.stripeCustomerId}, ${'sub_' + org.stripeCustomerId}, ${org.planCode},
        'active', NOW() + INTERVAL '30 days'
      )
      ON CONFLICT (org_id) DO UPDATE SET plan_code = EXCLUDED.plan_code
    `;

    // Membership owner
    await sql`
      INSERT INTO memberships (user_id, org_id, role_in_org, app_role)
      VALUES (${org.ownerUserId}, ${org.id}, 'Direction', 'owner')
      ON CONFLICT DO NOTHING
    `;
  }

  for (const u of demoUsers) {
    if (u.orgId) {
      await sql`
        INSERT INTO memberships (user_id, org_id, role_in_org, app_role)
        VALUES (${u.id}, ${u.orgId}, 'Direction', 'owner')
        ON CONFLICT DO NOTHING
      `;
    }
  }

  console.log('[4/5] Insertion des pages piliers CMS SEO...');
  const seoPages = [
    {
      slug: 'rh',
      title: 'RH et conventions collectives associatives (CCN 66, CCN 51, ÉCLAT, ALISFA)',
      metaDescription: 'Guide pratique RH pour les associations employeuses : embauche, temps de travail, congés trimestriels et conventions collectives CCN 66, CCN 51, ÉCLAT et ALISFA.',
      h1: 'RH et conventions collectives des associations employeuses',
      chapo: 'Sécurisez la gestion de vos salariés (de 1 à 100 ETP) en appliquant rigoureusement votre convention collective et le Code du travail.',
      content: 'Les associations du secteur médico-social, de l’animation et de l’insertion relèvent de conventions collectives techniques (CCN 66, CCN 51, ÉCLAT, ALISFA). AssoExpert IA analyse votre situation au regard de votre texte conventionnel et vous alerte sur les points à vérifier.',
      faq: [
        { question: 'Comment savoir de quelle annexe CCN 66 relève un salarié ?', answer: 'L’annexe applicable dépend des fonctions réellement exercées et de la catégorie de l’établissement.' }
      ],
      sources: ['Convention Collective Nationale du 15 mars 1966 (IDCC 0413)', 'Code du travail'],
      author: 'Laetitia Badji (Cabinet Maé)',
      reviewer: 'Équipe juridique AssoExpert',
      verifiedAt: '2026-10-01',
      status: 'published',
      noindex: false,
      breadcrumbs: [{ label: 'Accueil', href: '/' }, { label: 'RH et conventions collectives', href: '/rh' }]
    },
    {
      slug: 'gouvernance',
      title: 'Gouvernance associative loi 1901 : statuts, AG, CA et responsabilité',
      metaDescription: 'Organisez vos assemblées générales, conseils d’administration, délégations de pouvoirs et révisions statutaires en conformité avec la loi du 1er juillet 1901.',
      h1: 'Gouvernance loi 1901 : statuts, assemblée générale et conseil d’administration',
      chapo: 'De la convocation de l’assemblée générale aux délégations de signature entre présidence et direction salariée.',
      content: 'La loi du 1er juillet 1901 laisse une grande liberté statutaire aux associations. C’est la rédaction précise de vos statuts qui détermine les règles de quorum et de vote.',
      faq: [
        { question: 'Une assemblée générale peut-elle se tenir en visioconférence ?', answer: 'Oui, si les statuts ou le règlement intérieur le prévoient explicitement.' }
      ],
      sources: ['Loi du 1er juillet 1901 relative au contrat d’association'],
      author: 'Laetitia Badji (Cabinet Maé)',
      reviewer: 'Cabinet Maé',
      verifiedAt: '2026-10-01',
      status: 'published',
      noindex: false,
      breadcrumbs: [{ label: 'Accueil', href: '/' }, { label: 'Gouvernance', href: '/gouvernance' }]
    },
    {
      slug: 'finance',
      title: 'Finance et comptabilité des associations (Règlement ANC 2018-06)',
      metaDescription: 'Pilotage financier, plan comptable associatif ANC 2018-06, budget prévisionnel, trésorerie et commissariat aux comptes pour associations.',
      h1: 'Finance et comptabilité des associations employeuses',
      chapo: 'Maîtrisez le plan comptable associatif (règlement ANC n° 2018-06), vos seuils de commissariat aux comptes et votre trésorerie.',
      content: 'La gestion financière d’une association employeuse exige un suivi rigoureux des charges de personnel, des fonds propres et des obligations de certification des comptes.',
      faq: [
        { question: 'Quand une association doit-elle nommer un commissaire aux comptes ?', answer: 'Dès que le montant cumulé des subventions publiques ou des dons dépasse 153 000 €.' }
      ],
      sources: ['Règlement ANC n° 2018-06 du 5 décembre 2018'],
      author: 'Laetitia Badji (Cabinet Maé)',
      reviewer: 'Cabinet Maé',
      verifiedAt: '2026-10-01',
      status: 'published',
      noindex: false,
      breadcrumbs: [{ label: 'Accueil', href: '/' }, { label: 'Finance', href: '/finance' }]
    },
    {
      slug: 'subventions',
      title: 'Subventions publiques, CPOM, FSE, FONJEP et fonds dédiés',
      metaDescription: 'Sécurisez vos conventions de subvention, CERFA 12156, comptes rendus financiers, fonds dédiés et financements CPOM / FSE / FONJEP.',
      h1: 'Subventions publiques, CPOM et fonds dédiés',
      chapo: 'Distinguez subvention de fonctionnement, convention pluriannuelle d’objectifs (CPOM) et commande publique.',
      content: 'Lorsqu’une subvention affectée n’est pas intégralement consommée à la clôture, le reliquat est inscrit en fonds dédiés selon le règlement ANC 2018-06.',
      faq: [
        { question: 'Que faire d’un reliquat de subvention en fin d’exercice ?', answer: 'Si le projet se poursuit, il est inscrit en fonds dédiés à la clôture.' }
      ],
      sources: ['Loi n° 2000-321 du 12 avril 2000 (art. 9-1 et 10)'],
      author: 'Laetitia Badji (Cabinet Maé)',
      reviewer: 'Cabinet Maé',
      verifiedAt: '2026-10-01',
      status: 'published',
      noindex: false,
      breadcrumbs: [{ label: 'Accueil', href: '/' }, { label: 'Subventions', href: '/subventions' }]
    },
    {
      slug: 'conformite',
      title: 'Conformité associative : DUERP, affichages obligatoires, RGPD et URSSAF',
      metaDescription: 'Mettez votre association en conformité avec ses obligations d’employeur : DUERP, registre unique du personnel, RGPD et contrôles URSSAF.',
      h1: 'Conformité de l’association employeuse : DUERP, RGPD et URSSAF',
      chapo: 'Dès le premier salarié, l’association est soumise aux mêmes obligations sociales et de prévention des risques qu’une entreprise.',
      content: 'Le Document Unique d’Évaluation des Risques Professionnels (DUERP), le registre unique du personnel et le RGPD constituent le socle de conformité.',
      faq: [
        { question: 'Le DUERP est-il obligatoire dès 1 salarié ?', answer: 'Oui, le DUERP est obligatoire dès le premier salarié.' }
      ],
      sources: ['Code du travail, art. L. 4121-3 (DUERP)', 'Règlement (UE) 2016/679 (RGPD)'],
      author: 'Laetitia Badji (Cabinet Maé)',
      reviewer: 'Cabinet Maé',
      verifiedAt: '2026-10-01',
      status: 'published',
      noindex: false,
      breadcrumbs: [{ label: 'Accueil', href: '/' }, { label: 'Conformité', href: '/conformite' }]
    }
  ];

  for (const page of seoPages) {
    await sql`
      INSERT INTO cms_pages (
        slug, title, meta_description, h1, chapo, content,
        faq, sources, author, reviewer, verified_at, status, noindex, breadcrumbs
      )
      VALUES (
        ${page.slug}, ${page.title}, ${page.metaDescription}, ${page.h1}, ${page.chapo}, ${page.content},
        ${JSON.stringify(page.faq)}::jsonb, ${JSON.stringify(page.sources)}::jsonb,
        ${page.author}, ${page.reviewer}, ${page.verifiedAt}, ${page.status}, ${page.noindex},
        ${JSON.stringify(page.breadcrumbs)}::jsonb
      )
      ON CONFLICT (slug) DO UPDATE SET
        title = EXCLUDED.title,
        meta_description = EXCLUDED.meta_description,
        h1 = EXCLUDED.h1,
        content = EXCLUDED.content
    `;
  }

  console.log('[5/5] Insertion d’un ticket expert de démonstration...');
  await sql`
    INSERT INTO expert_tickets (ref, org_id, user_id, domain, urgency, question, status)
    VALUES (
      'AE-2026-00042',
      '11111111-1111-4111-8111-111111111111',
      'usr_tremplin_dir',
      'rh',
      'normal_48h',
      'Nos éducateurs spécialisés en internat CCN 66 cumulent-ils les congés trimestriels en cas d’arrêt maladie ?',
      'pending'
    )
    ON CONFLICT (ref) DO NOTHING
  `;

  console.log('✅ Seed Neon PostgreSQL complet et réussi !');
}

main().catch((err) => {
  console.error('❌ Erreur seed Neon :', err);
  process.exit(1);
});
