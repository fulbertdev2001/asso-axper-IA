/**
 * Lot 6 — CMS Payload & Gabarit SEO complet (v2 §14.2 et §14.3)
 * §3.6 & §7 Lot 6 :
 * - Contenu public dans le CMS, jamais codé en dur.
 * - Champs obligatoires du gabarit SEO : slug, title, metaDescription, h1, chapo,
 *   content, faq, sources, author, reviewer, verifiedAt, status, noindex.
 * - Redirection 301 automatique lorsqu'un slug est modifié par Laetitia.
 */

export interface CmsFaqItem {
  question: string;
  answer: string;
}

export interface CmsSeoPage {
  id: string;
  slug: string;
  title: string;
  metaDescription: string;
  h1: string;
  chapo: string;
  content: string;
  faq: CmsFaqItem[];
  sources: string[];
  author: string;
  reviewer: string;
  verifiedAt: string;
  status: 'draft' | 'published';
  noindex: boolean;
  breadcrumbs: { label: string; href: string }[];
  updatedAt: string;
}

export const DEFAULT_SEO_PAGES: CmsSeoPage[] = [
  {
    id: 'page-rh',
    slug: 'rh',
    title: 'RH et conventions collectives associatives (CCN 66, CCN 51, ÉCLAT, ALISFA)',
    metaDescription:
      'Guide pratique RH pour les associations employeuses : embauche, temps de travail, congés trimestriels et conventions collectives CCN 66, CCN 51, ÉCLAT et ALISFA.',
    h1: 'RH et conventions collectives des associations employeuses',
    chapo:
      'Sécurisez la gestion de vos salariés (de 1 à 100 ETP) en appliquant rigoureusement votre convention collective et le Code du travail.',
    content:
      'Les associations du secteur médico-social, de l’animation et de l’insertion relèvent de conventions collectives techniques (CCN 66, CCN 51, ÉCLAT, ALISFA). AssoExpert IA analyse votre situation au regard de votre texte conventionnel et vous alerte sur les points à vérifier.',
    faq: [
      {
        question: 'Comment savoir de quelle annexe CCN 66 relève un salarié ?',
        answer:
          'L’annexe applicable dépend des fonctions réellement exercées et de la catégorie de l’établissement (annexe 2 pour le personnel administratif, annexe 3 pour le personnel éducatif, pédagogique et social).'
      },
      {
        question: 'Les congés trimestriels CCN 66 sont-ils proratisés à temps partiel ?',
        answer:
          'Le décompte des congés trimestriels s’effectue en jours ouvrés sur les trois trimestres hors trimestre du congé annuel principal, selon les règles de l’annexe applicable.'
      }
    ],
    sources: [
      'Convention Collective Nationale du 15 mars 1966 (IDCC 0413)',
      'Convention Collective Nationale FEHAP du 31 octobre 1951 (IDCC 0029)',
      'Convention Collective Nationale ÉCLAT (IDCC 1518)'
    ],
    author: 'Laetitia Badji (Cabinet Maé)',
    reviewer: 'Équipe juridique AssoExpert',
    verifiedAt: '2026-10-01',
    status: 'published',
    noindex: false,
    breadcrumbs: [
      { label: 'Accueil', href: '/' },
      { label: 'RH et conventions collectives', href: '/rh' }
    ],
    updatedAt: '2026-10-01T10:00:00.000Z'
  },
  {
    id: 'page-gouvernance',
    slug: 'gouvernance',
    title: 'Gouvernance associative loi 1901 : statuts, AG, CA et responsabilité',
    metaDescription:
      'Organisez vos assemblées générales, conseils d’administration, délégations de pouvoirs et révisions statutaires en conformité avec la loi du 1er juillet 1901.',
    h1: 'Gouvernance loi 1901 : statuts, assemblée générale et conseil d’administration',
    chapo:
      'De la convocation de l’assemblée générale aux délégations de signature entre présidence et direction salariée.',
    content:
      'La loi du 1er juillet 1901 laisse une grande liberté statutaire aux associations. C’est donc la rédaction précise de vos statuts et de votre règlement intérieur qui détermine les règles de quorum, de vote par procuration et de renouvellement des instances.',
    faq: [
      {
        question: 'Une assemblée générale peut-elle se tenir en visioconférence ?',
        answer:
          'Dans une association loi 1901, il est vivement recommandé que les statuts ou le règlement intérieur prévoient explicitement le vote à distance et l’identification des membres.'
      }
    ],
    sources: ['Loi du 1er juillet 1901 relative au contrat d’association', 'Décret du 16 août 1901'],
    author: 'Laetitia Badji (Cabinet Maé)',
    reviewer: 'Cabinet Maé',
    verifiedAt: '2026-10-01',
    status: 'published',
    noindex: false,
    breadcrumbs: [
      { label: 'Accueil', href: '/' },
      { label: 'Gouvernance', href: '/gouvernance' }
    ],
    updatedAt: '2026-10-01T10:00:00.000Z'
  },
  {
    id: 'page-finance',
    slug: 'finance',
    title: 'Finance et comptabilité des associations (Règlement ANC 2018-06)',
    metaDescription:
      'Pilotage financier, plan comptable associatif ANC 2018-06, budget prévisionnel, trésorerie et commissariat aux comptes pour associations.',
    h1: 'Finance et comptabilité des associations employeuses',
    chapo:
      'Maîtrisez le plan comptable associatif (règlement ANC n° 2018-06), vos seuils de commissariat aux comptes et votre trésorerie.',
    content:
      'La gestion financière d’une association employeuse exige un suivi rigoureux des charges de personnel, des fonds propres et des obligations de certification des comptes dès le franchissement des seuils réglementaires.',
    faq: [
      {
        question: 'Quand une association doit-elle nommer un commissaire aux comptes ?',
        answer:
          'La nomination d’un CAC est notamment obligatoire lorsque le montant cumulé des subventions publiques ou des dons ouvrant droit à avantage fiscal dépasse 153 000 € sur l’exercice.'
      }
    ],
    sources: ['Règlement ANC n° 2018-06 du 5 décembre 2018', 'Code de commerce, art. L. 612-4'],
    author: 'Laetitia Badji (Cabinet Maé)',
    reviewer: 'Cabinet Maé',
    verifiedAt: '2026-10-01',
    status: 'published',
    noindex: false,
    breadcrumbs: [
      { label: 'Accueil', href: '/' },
      { label: 'Finance', href: '/finance' }
    ],
    updatedAt: '2026-10-01T10:00:00.000Z'
  },
  {
    id: 'page-subventions',
    slug: 'subventions',
    title: 'Subventions publiques, CPOM, FSE, FONJEP et fonds dédiés',
    metaDescription:
      'Sécurisez vos conventions de subvention, CERFA 12156, comptes rendus financiers, fonds dédiés et financements CPOM / FSE / FONJEP.',
    h1: 'Subventions publiques, CPOM et fonds dédiés',
    chapo:
      'Distinguez subvention de fonctionnement, convention pluriannuelle d’objectifs (CPO / CPOM) et commande publique, et sécurisez vos arrêtés de comptes.',
    content:
      'Lorsqu’une subvention affectée à un projet précis n’est pas intégralement consommée à la clôture de l’exercice, la part restante doit faire l’objet d’une analyse au titre des fonds dédiés conformément au règlement ANC 2018-06.',
    faq: [
      {
        question: 'Que faire d’un reliquat de subvention en fin d’exercice ?',
        answer:
          'Si la convention prévoit l’affectation à un projet déterminé qui se poursuit sur l’exercice suivant, le reliquat est inscrit en fonds dédiés à la clôture.'
      }
    ],
    sources: [
      'Loi n° 2000-321 du 12 avril 2000 (art. 9-1 et 10)',
      'Règlement ANC n° 2018-06 (Fonds dédiés)'
    ],
    author: 'Laetitia Badji (Cabinet Maé)',
    reviewer: 'Cabinet Maé',
    verifiedAt: '2026-10-01',
    status: 'published',
    noindex: false,
    breadcrumbs: [
      { label: 'Accueil', href: '/' },
      { label: 'Subventions', href: '/subventions' }
    ],
    updatedAt: '2026-10-01T10:00:00.000Z'
  },
  {
    id: 'page-conformite',
    slug: 'conformite',
    title: 'Conformité associative : DUERP, affichages obligatoires, RGPD et URSSAF',
    metaDescription:
      'Mettez votre association en conformité avec ses obligations d’employeur : DUERP, registre unique du personnel, RGPD et contrôles URSSAF.',
    h1: 'Conformité de l’association employeuse : DUERP, RGPD et URSSAF',
    chapo:
      'Dès le premier salarié, l’association est soumise aux mêmes obligations sociales et de prévention des risques qu’une entreprise.',
    content:
      'Le Document Unique d’Évaluation des Risques Professionnels (DUERP), le registre unique du personnel, les affichages obligatoires et le registre des traitements RGPD constituent le socle de conformité de toute association employeuse.',
    faq: [
      {
        question: 'Le DUERP est-il obligatoire dès 1 salarié dans une association ?',
        answer:
          'Oui, le DUERP est obligatoire dès l’embauche du premier salarié (article R. 4121-1 du Code du travail) et doit être mis à jour au moins chaque année dans les structures d’au moins 11 salariés.'
      }
    ],
    sources: [
      'Code du travail, art. L. 4121-3 et R. 4121-1 (DUERP)',
      'Règlement (UE) 2016/679 (RGPD)'
    ],
    author: 'Laetitia Badji (Cabinet Maé)',
    reviewer: 'Cabinet Maé',
    verifiedAt: '2026-10-01',
    status: 'published',
    noindex: false,
    breadcrumbs: [
      { label: 'Accueil', href: '/' },
      { label: 'Conformité', href: '/conformite' }
    ],
    updatedAt: '2026-10-01T10:00:00.000Z'
  },
  {
    id: 'page-mentions-legales',
    slug: 'mentions-legales',
    title: 'Mentions légales — AssoExpert IA (AKILIGUE SAS / Cabinet Maé)',
    metaDescription: 'Mentions légales du service AssoExpert IA édité par AKILIGUE SAS (Cabinet Maé).',
    h1: 'Mentions légales',
    chapo: 'Informations légales relatives à l’éditeur du service AssoExpert IA.',
    content:
      'Le service AssoExpert IA est édité par la société AKILIGUE SAS (Cabinet Maé), dirigée par Laetitia Badji. Contact : contact@cabinet-mae.fr.',
    faq: [],
    sources: ['Loi n° 2004-575 du 21 juin 2004 pour la confiance dans l’économie numérique'],
    author: 'AKILIGUE SAS',
    reviewer: 'Laetitia Badji',
    verifiedAt: '2026-10-01',
    status: 'published',
    noindex: false,
    breadcrumbs: [
      { label: 'Accueil', href: '/' },
      { label: 'Mentions légales', href: '/mentions-legales' }
    ],
    updatedAt: '2026-10-01T10:00:00.000Z'
  },
  {
    id: 'page-confidentialite',
    slug: 'politique-confidentialite',
    title: 'Politique de confidentialité et RGPD — AssoExpert IA',
    metaDescription:
      'Engagement de confidentialité RGPD d’AssoExpert IA : hébergement en France/UE, analytics sans cookie, aucun contenu de question dans les logs.',
    h1: 'Politique de confidentialité et protection des données (RGPD)',
    chapo:
      'Vos échanges et les données de votre association sont strictement isolés par organisation et ne sont jamais transmis aux outils de logs ou d’analytics.',
    content:
      'Conformément au RGPD, chaque association dispose d’un droit d’accès, de rectification et de suppression immédiate de son profil et de son historique de conversations depuis son espace client.',
    faq: [],
    sources: ['Règlement (UE) 2016/679 (RGPD)', 'Loi Informatique et Libertés'],
    author: 'AKILIGUE SAS',
    reviewer: 'Laetitia Badji',
    verifiedAt: '2026-10-01',
    status: 'published',
    noindex: false,
    breadcrumbs: [
      { label: 'Accueil', href: '/' },
      { label: 'Politique de confidentialité', href: '/politique-confidentialite' }
    ],
    updatedAt: '2026-10-01T10:00:00.000Z'
  }
];

let cmsPageStore: CmsSeoPage[] = DEFAULT_SEO_PAGES.map((p) => ({
  ...p,
  faq: [...p.faq],
  sources: [...p.sources],
  breadcrumbs: [...p.breadcrumbs]
}));

// Table des redirections 301 automatiques (ancienSlug -> nouveauSlug)
const slugRedirects301 = new Map<string, string>();

export function resetCmsStoreForTests(): void {
  cmsPageStore = DEFAULT_SEO_PAGES.map((p) => ({
    ...p,
    faq: [...p.faq],
    sources: [...p.sources],
    breadcrumbs: [...p.breadcrumbs]
  }));
  slugRedirects301.clear();
}

export function listPublishedCmsPages(): CmsSeoPage[] {
  return cmsPageStore.filter((p) => p.status === 'published');
}

export function listAllCmsPagesForAdmin(): CmsSeoPage[] {
  return [...cmsPageStore];
}

export function resolveCmsPageOrRedirect(slug: string): {
  page: CmsSeoPage | null;
  redirect301To: string | null;
} {
  const cleanSlug = slug.replace(/^\/+|\/+$/g, '');

  if (slugRedirects301.has(cleanSlug)) {
    const targetSlug = slugRedirects301.get(cleanSlug)!;
    return {
      page: null,
      redirect301To: `/${targetSlug}`
    };
  }

  const found = cmsPageStore.find((p) => p.slug === cleanSlug && p.status === 'published');
  return {
    page: found || null,
    redirect301To: null
  };
}

/**
 * Création ou publication d'une page SEO par Laetitia depuis le back-office Payload (§7 Lot 6 CA #1)
 */
export function createOrPublishCmsPageInAdmin(
  input: Omit<CmsSeoPage, 'id' | 'updatedAt' | 'breadcrumbs'> & {
    id?: string;
    breadcrumbs?: { label: string; href: string }[];
  }
): CmsSeoPage {
  const cleanSlug = input.slug.replace(/^\/+|\/+$/g, '');
  const page: CmsSeoPage = {
    ...input,
    id: input.id || `page-${Date.now()}`,
    slug: cleanSlug,
    breadcrumbs: input.breadcrumbs || [
      { label: 'Accueil', href: '/' },
      { label: input.h1, href: `/${cleanSlug}` }
    ],
    updatedAt: new Date().toISOString()
  };

  cmsPageStore.push(page);
  return page;
}

/**
 * Mise à jour d'une page SEO dans le CMS.
 * Si le `slug` change, enregistre automatiquement une redirection 301 de l'ancien slug
 * vers le nouveau (§7 Lot 6 : "redirection 301 automatique au changement de slug").
 */
export function updateCmsPageInAdmin(
  pageId: string,
  patch: Partial<Omit<CmsSeoPage, 'id'>>
): CmsSeoPage {
  const index = cmsPageStore.findIndex((p) => p.id === pageId);
  if (index === -1) {
    throw new Error(`Page CMS introuvable : ${pageId}`);
  }

  const current = cmsPageStore[index];
  const newSlug = patch.slug ? patch.slug.replace(/^\/+|\/+$/g, '') : current.slug;

  if (newSlug !== current.slug) {
    slugRedirects301.set(current.slug, newSlug);
  }

  const updated: CmsSeoPage = {
    ...current,
    ...patch,
    slug: newSlug,
    updatedAt: new Date().toISOString()
  };

  cmsPageStore[index] = updated;
  return updated;
}

