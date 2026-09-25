import { Domain, Organization, PlanFeatures } from '../types';

export interface StructuredAiResponse {
  shortSummary: string;
  detailedAnalysis: string;
  references: string[];
  verificationNote: string;
  suggestedTicketDomain: Domain;
  suggestedTicketQuestion: string;
  isFallbackForUnsubscribedBrick?: boolean;
}

export function generateAiResponse(
  query: string,
  domain: Domain,
  org: Organization,
  features: PlanFeatures
): StructuredAiResponse {
  // Check if brick is unlocked
  const isUnlocked =
    (domain === 'rh' && features.briqueRh) ||
    (domain === 'gouvernance' && features.briqueGouvernance) ||
    (domain === 'finance' && features.briqueFinance) ||
    (domain === 'conformite' && features.briqueConformite);

  if (!isUnlocked) {
    return {
      shortSummary: `Cette thématique relève de la brique ${getDomainLabel(domain)}, actuellement non incluse dans votre formule Initiale.`,
      detailedAnalysis: `Votre association (${org.name}) souscrit actuellement à la formule Initiale, qui couvre le socle RH & Gouvernance. Pour obtenir l'analyse juridique approfondie de vos obligations en ${getDomainLabel(domain)}, débloquer les calculateurs et bénéficier de l'escalade experte avec Laetitia Badji, vous pouvez faire évoluer votre abonnement vers la formule Pro.`,
      references: [
        'Code du travail / Décret associations employeuses',
        'Formule Pro : 67 € / mois sans engagement'
      ],
      verificationNote: 'Analyse préliminaire socle. Pour une conformité opposable, débloquez la brique dédiée.',
      suggestedTicketDomain: domain,
      suggestedTicketQuestion: query,
      isFallbackForUnsubscribedBrick: true
    };
  }

  const q = query.toLowerCase();

  // RH / Conventions collectives
  if (domain === 'rh') {
    if (q.includes('congé') || q.includes('ancienneté') || q.includes('trimestre')) {
      return {
        shortSummary: `Selon la convention ${org.ccn}, les salariés bénéficient de congés payés conventionnels d'ancienneté qui s'ajoutent aux 2,5 jours ouvrables légaux par mois.`,
        detailedAnalysis: `Dans le secteur de votre structure (${org.sector}) sous convention ${org.ccn} :
1. Congés d'ancienneté : Des jours de congés supplémentaires sont attribués par tranche d'ancienneté continue au sein de l'association (ex: 2 jours ouvrés après 5 ans, 4 jours après 10 ans, 6 jours après 15 ans selon la classification de l'emploi).
2. Congés trimestriels (si applicable aux personnels éducatifs et soignants en annexe 3/4) : 6 jours consécutifs de repos par trimestre (hors trimestre d'été), non cumulables avec d'autres récupérations contractuelles.
3. Règle d'ordre des départs : Fixée par la direction en concertation avec les représentants du personnel (CSE) en tenant compte de la situation de famille et de l'ancienneté.`,
        references: [
          `${org.ccn} — Titre IV (Congés et autorisations d'absence)`,
          'Article L. 3141-10 du Code du travail (primauté de l accord de branche)',
          'Annexe de classification applicable aux ' + org.employeesCount + ' salariés'
        ],
        verificationNote: 'Vérifié au regard des barèmes conventionnels en vigueur au 1er janvier 2026. Sous réserve d accord d entreprise plus favorable.',
        suggestedTicketDomain: 'rh',
        suggestedTicketQuestion: `Question sur l application des congés d ancienneté pour notre effectif de ${org.employeesCount} salariés sous ${org.ccn}.`
      };
    }

    if (q.includes('rupture') || q.includes('démission') || q.includes('préavis') || q.includes('licenciement')) {
      return {
        shortSummary: `Le préavis et les indemnités applicables dépendent strictement du statut (non-cadre / cadre) et de l'ancienneté définis par la convention ${org.ccn}.`,
        detailedAnalysis: `Pour votre association (${org.name}, effectif : ${org.employeesCount} salariés) :
1. Durée du préavis :
   - Salariés non-cadres : 1 mois pour une ancienneté comprise entre 6 mois et 2 ans ; 2 mois au-delà de 2 ans.
   - Personnel cadre : 3 mois conventionnels obligatoires dès la fin de la période d'essai.
2. Heures pour recherche d'emploi : La convention prévoit généralement 2 heures par jour de travail payées durant le préavis de rupture à l'initiative de l'employeur.
3. Procédure impérative : Convocation à entretien préalable avec mention de l'assistance possible par un membre du CSE ou un conseiller du salarié si absence de CSE.`,
        references: [
          `${org.ccn} — Chapitre Rupture du contrat de travail`,
          'Articles L. 1234-1 et suivants du Code du travail',
          'Cour de Cassation, Chambre sociale (jurisprudence constante sur le maintien de salaire)'
        ],
        verificationNote: 'Réglementation applicable en 2026. L assistance d un expert est fortement recommandée pour sécuriser la rédaction de la lettre de rupture.',
        suggestedTicketDomain: 'rh',
        suggestedTicketQuestion: `Validation de la procédure et du préavis de départ sous convention ${org.ccn}.`
      };
    }

    // Default RH response
    return {
      shortSummary: `Analyse personnalisée pour votre association sous convention collective ${org.ccn} (${org.employeesCount} salariés déclarés).`,
      detailedAnalysis: `Au regard de votre convention collective (${org.ccn}) et des obligations légales d'une association employant ${org.employeesCount} salariés dans le secteur ${org.sector} :
1. Application conventionnelle : Toute décision RH (grille salariale, temps de travail, astreintes) doit être confrontée en premier lieu à la convention ${org.ccn}, puis aux dispositions supplétives du Code du travail.
2. Prévoyance et mutuelle : L'adhésion au régime de prévoyance et de complémentaire santé recommandé par la branche est obligatoire pour tous les salariés dès l'embauche.
3. Suivi médical et registre : Le suivi en médecine du travail et la tenue du registre unique du personnel sont impératifs.`,
      references: [
        `${org.ccn} — Dispositions générales et annexes catégorielles`,
        'Code du travail — Livre II : Les conventions et accords collectifs',
        `Profil déclaré : SIREN ${org.siren} (${org.sector})`
      ],
      verificationNote: 'Synthèse indicative basée sur la réglementation active. Soumettez votre cas particulier à Laetitia Badji pour validation sous 48h.',
      suggestedTicketDomain: 'rh',
      suggestedTicketQuestion: query
    };
  }

  // Gouvernance 1901
  if (domain === 'gouvernance') {
    return {
      shortSummary: `Les règles applicables découlent de la loi du 1er juillet 1901 et des statuts déposés de votre association (${org.name}).`,
      detailedAnalysis: `Dans le cadre de votre gouvernance (${org.governanceSummary || 'CA et Bureau bénévoles'}) :
1. Assemblée Générale (${org.usualAgMonth}) : Les statuts fixent librement les conditions de convocation (délai usuel de 15 jours) et le quorum. Si le quorum n'est pas atteint à la première convocation, une seconde AG doit être réunie dans les délais fixés par les statuts, pouvant généralement délibérer valablement quel que soit le nombre de présents.
2. Responsabilité des dirigeants bénévoles : Le Président engage l'association dans la limite de l'objet statutaire. Pour les actes engageant un budget important (votre budget annuel étant de ${org.annualBudget.toLocaleString('fr-FR')} €), une délibération préalable du Conseil d'Administration est requise.
3. Remplacement et suppléance : En cas de démission ou d'empêchement du Trésorier ou du Président, le CA peut coopter un remplaçant temporaire si les statuts le prévoient expressément, jusqu'à la prochaine AG.`,
      references: [
        'Loi du 1er juillet 1901 relative au contrat d association (articles 1 à 6)',
        'Circulaire ministérielle sur la gouvernance associative désintéressée',
        'Statuts et règlement intérieur enregistrés sous le RNA ' + org.rna
      ],
      verificationNote: 'Vérifiez la clause exacte de vos statuts sur les majorités requises (simple ou qualifiée).',
      suggestedTicketDomain: 'gouvernance',
      suggestedTicketQuestion: query
    };
  }

  // Finance & Subventions
  if (domain === 'finance') {
    return {
      shortSummary: `Justification financière et transparence budgétaire pour un budget de ${org.annualBudget.toLocaleString('fr-FR')} € avec ${org.mainFunders.length} financeurs publics.`,
      detailedAnalysis: `Pour les subventions perçues auprès de vos partenaires (${org.mainFunders.join(', ')}) :
1. Compte rendu financier (CERFA 15059*02) : Obligatoire dans les 6 mois suivant la clôture de l'exercice (${org.fiscalYearEnd}). Il doit justifier la conformité des dépenses engagées à l'objet de la subvention octroyée.
2. Traitement des reliquats non consommés : Les fonds non dépensés doivent soit faire l'objet d'une demande de report écrit auprès du financeur, soit être inscrits en « fonds dédiés » (compte 194 du plan comptable associatif). Sans accord, le financeur est en droit d'exiger le reversement.
3. Commissaire aux comptes : Si votre association perçoit plus de 153 000 € de subventions publiques ou de dons sur l'exercice, la désignation d'un CAC titulaire et d'un suppléant est une obligation légale stricte.`,
      references: [
        'Règlement ANC n° 2018-06 relatif aux comptes annuels des personnes morales de droit privé à but non lucratif',
        'Article L. 612-4 du Code de commerce (seuil de désignation du Commissaire aux comptes)',
        'Décret n° 2001-495 relatif à la transparence financière des associations'
      ],
      verificationNote: 'Règles comptables conformes au plan comptable associatif en vigueur.',
      suggestedTicketDomain: 'finance',
      suggestedTicketQuestion: query
    };
  }

  // Conformité & DUERP / RGPD
  return {
    shortSummary: `Obligations réglementaires et de sécurité pour une association de ${org.employeesCount} salariés dans le secteur ${org.sector}.`,
    detailedAnalysis: `Synthèse de conformité pour votre structure (SIREN ${org.siren}) :
1. Document Unique d'Évaluation des Risques Professionnels (DUERP) :
   - Obligatoire dès le premier salarié. Doit être mis à jour au minimum une fois par an dans les entreprises de plus de 11 salariés, et lors de toute décision d'aménagement important.
   - Doit comporter le plan annuel de prévention des risques et d'amélioration des conditions de travail (PAPRIPACT) si l'effectif atteint 50 salariés.
2. Affichages obligatoires : Coordonnées de l'inspection du travail, médecine du travail, services d'urgence, consigne de sécurité incendie, interdiction de fumer/vapoter, égalité professionnelle.
3. Registre RGPD : Tenue d'un registre des activités de traitement pour les données des salariés, des bénéficiaires et des adhérents.`,
    references: [
      'Articles L. 4121-3 et R. 4121-1 et suivants du Code du travail (DUERP)',
      'Loi n° 2021-1018 du 2 août 2021 pour renforcer la prévention en santé au travail',
      'Règlement Général sur la Protection des Données (RGPD) — Articles 30 et 32'
    ],
    verificationNote: 'Le non-respect du DUERP engage la responsabilité civile et pénale du Président de l association.',
    suggestedTicketDomain: 'conformite',
    suggestedTicketQuestion: query
  };
}

export function getDomainLabel(domain: Domain): string {
  switch (domain) {
    case 'rh': return 'RH & Conventions Collectives';
    case 'gouvernance': return 'Gouvernance Loi 1901';
    case 'finance': return 'Finance & Subventions';
    case 'conformite': return 'Conformité & DUERP';
  }
}
