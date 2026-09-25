import { Organization, Plan, ExpertTicket, AiUsageRecord } from '../types';

export const INITIAL_ORGANIZATIONS: Organization[] = [
  {
    id: 'org-1',
    name: 'Association Espoir & Solidarité (Médico-Social)',
    siren: '482 910 234',
    rna: 'W751204918',
    sector: 'Médico-social & Handicap',
    employeesCount: 22,
    annualBudget: 940000,
    ccn: 'CCN 66 (Convention Collective Nationale de 1966)',
    fiscalYearEnd: '31 décembre',
    usualAgMonth: 'Juin',
    governanceSummary: 'Conseil d administration de 9 membres bénévoles, bureau exécutif avec Présidente et Trésorier.',
    mainFunders: ['Conseil Départemental 75', 'ARS Île-de-France', 'Fonds Social Européen'],
    establishmentsCount: 2
  },
  {
    id: 'org-2',
    name: 'Maison Pour Tous des Lilas (Animation)',
    siren: '391 402 119',
    rna: 'W931002341',
    sector: 'Animation socioculturelle',
    employeesCount: 9,
    annualBudget: 340000,
    ccn: 'Convention collective ÉCLAT (ex-Animation)',
    fiscalYearEnd: '31 août',
    usualAgMonth: 'Novembre',
    governanceSummary: 'Gouvernance collégiale, 12 administrateurs élus par les adhérents.',
    mainFunders: ['CAF Seine-Saint-Denis', 'Ville des Lilas', 'Subventions DRAC'],
    establishmentsCount: 1
  },
  {
    id: 'org-3',
    name: 'Passerelle Avenir (Insertion & Emploi)',
    siren: '519 883 402',
    rna: 'W691039482',
    sector: 'Insertion par l activité économique (IAE)',
    employeesCount: 38,
    annualBudget: 1450000,
    ccn: 'ALISFA (Acteurs du lien social et familial)',
    fiscalYearEnd: '31 décembre',
    usualAgMonth: 'Mai',
    governanceSummary: 'CA de 7 membres, direction générale salariée avec délégation de pouvoir.',
    mainFunders: ['DREETS', 'Région Auvergne-Rhône-Alpes', 'Métropole de Lyon'],
    establishmentsCount: 3
  }
];

export const INITIAL_PLANS: Plan[] = [
  {
    code: 'initiale',
    label: 'Initiale',
    priceMonthly: 29,
    description: 'Pour les petites associations souhaitant sécuriser leur gestion quotidienne.',
    highlighted: false,
    features: {
      briqueRh: true,
      briqueGouvernance: true,
      briqueFinance: false,
      briqueConformite: false,
      aiModel: 'Claude Haiku 4.5',
      maxTokens: 15000,
      maxInputChars: 4000,
      expertQuestionsMonth: 0
    }
  },
  {
    code: 'pro',
    label: 'Pro (Conseillée)',
    priceMonthly: 67,
    description: 'La solution complète pour associations employeuses de 5 à 40 salariés.',
    highlighted: true,
    features: {
      briqueRh: true,
      briqueGouvernance: true,
      briqueFinance: true,
      briqueConformite: true,
      aiModel: 'Claude Sonnet 5',
      maxTokens: 30000,
      maxInputChars: 10000,
      expertQuestionsMonth: 1
    }
  },
  {
    code: 'expert',
    label: 'Expert',
    priceMonthly: 127,
    description: 'Pour les structures complexes ou multi-établissements avec soutien juridique prioritaire.',
    highlighted: false,
    features: {
      briqueRh: true,
      briqueGouvernance: true,
      briqueFinance: true,
      briqueConformite: true,
      aiModel: 'Claude Sonnet 5 (Haute Capacité)',
      maxTokens: 50000,
      maxInputChars: 20000,
      expertQuestionsMonth: 3
    }
  }
];

export const INITIAL_TICKETS: ExpertTicket[] = [
  {
    id: 'ticket-1',
    ref: 'AE-2026-00042',
    orgId: 'org-1',
    orgName: 'Association Espoir & Solidarité (Médico-Social)',
    domain: 'rh',
    urgency: 'normal_48h',
    object: 'Calcul indemnité de départ à la retraite selon CCN 66',
    question: 'Nous avons un chef de service éducatif présent depuis 14 ans qui fait valoir ses droits à la retraite au 31 octobre. Comment devons-nous calculer son indemnité conventionnelle selon l annexe 6 de la CCN 66 ? Est-elle soumise à cotisations ?',
    status: 'answered',
    answer: `Bonjour,

En application de l'article 17 de l'annexe 6 de la CCN 66 (cadres), le salarié bénéficie d'une indemnité conventionnelle de départ à la retraite calculée ainsi :
1. Assiette de calcul : 1/12 de la rémunération brute des 12 derniers mois précédant la notification, ou 1/3 des 3 derniers mois (la formule la plus avantageuse au salarié).
2. Taux pour 14 ans d'ancienneté : 1,5 mois de salaire de référence pour les 10 premières années, augmenté de 1/5 de mois par année au-delà de la 10e année (soit 4 x 0,2 = 0,8 mois). Total conventionnel : 2,3 mois de salaire brut.
3. Régime social et fiscal : S'agissant d'un départ volontaire à la retraite, l'indemnité est intégralement assujettie à cotisations sociales et à l'impôt sur le revenu (contrairement à une mise à la retraite par l'employeur).

N'hésitez pas à nous solliciter si vous souhaitez une vérification du bulletin de paie de solde de tout compte.

Bien chaleureusement,
Laetitia Badji — Cabinet Maé / AKILIGUE SAS`,
    internalNotes: 'Dossier vérifié avec le barème CCN 66 révisé 2025. Attention à bien distinguer départ volontaire vs mise à la retraite.',
    createdAt: '2026-09-21T10:15:00Z',
    answeredAt: '2026-09-22T14:30:00Z'
  },
  {
    id: 'ticket-2',
    ref: 'AE-2026-00058',
    orgId: 'org-2',
    orgName: 'Maison Pour Tous des Lilas (Animation)',
    domain: 'gouvernance',
    urgency: 'normal_48h',
    object: 'Quorum non atteint lors de l Assemblée Générale Ordinaire',
    question: 'Lors de notre AG annuelle d approbation des comptes, nous n avions que 14 présents sur 60 adhérents alors que nos statuts prévoient un quorum d un tiers. Pouvons-nous valider le rapport financier ou devons-nous reconvoquer ?',
    status: 'in_progress',
    internalNotes: 'Consulter les statuts types ÉCLAT. La seconde AG peut généralement délibérer sans condition de quorum.',
    createdAt: '2026-09-23T16:40:00Z'
  }
];

export const INITIAL_AI_USAGE: AiUsageRecord[] = [
  {
    id: 'usage-1',
    orgId: 'org-1',
    orgName: 'Espoir & Solidarité',
    model: 'claude-sonnet-5',
    promptVersion: 'v2.4-ccn66',
    inputTokens: 1420,
    outputTokens: 680,
    costEstimateEur: 0.0145,
    createdAt: '2026-09-23T11:20:00Z'
  },
  {
    id: 'usage-2',
    orgId: 'org-2',
    orgName: 'Maison Pour Tous des Lilas',
    model: 'claude-haiku-4-5-20251001',
    promptVersion: 'v2.1-eclat',
    inputTokens: 890,
    outputTokens: 410,
    costEstimateEur: 0.0028,
    createdAt: '2026-09-23T15:05:00Z'
  },
  {
    id: 'usage-3',
    orgId: 'org-3',
    orgName: 'Passerelle Avenir',
    model: 'claude-sonnet-5',
    promptVersion: 'v2.4-alisfa',
    inputTokens: 2150,
    outputTokens: 980,
    costEstimateEur: 0.0215,
    createdAt: '2026-09-24T09:12:00Z'
  }
];
