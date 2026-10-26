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

// Les réponses suivent la structure de la vision produit (§ 6.2) :
// réponse directe (shortSummary), explication, application, actions (detailedAnalysis),
// sources (references) et limites (verificationNote).
// Les références citées sont des textes existants ; les durées ou seuils qui dépendent
// d'une convention collective ne sont pas inventés (§ 6.3).

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
      shortSummary: `Le domaine « ${getDomainLabel(domain)} » n'est pas inclus dans votre formule actuelle : l'assistant ne peut pas analyser votre situation sur ce sujet.`,
      detailedAnalysis: `Ce que cela signifie
Votre question relève du domaine « ${getDomainLabel(domain)} », qui n'est pas compris dans la formule souscrite par ${org.name}. Aucune analyse adaptée à votre situation n'a donc été produite.

Ce que vous pouvez faire
1. Consulter, depuis la page Abonnement, les formules qui incluent ce domaine.
2. Reformuler votre question dans un domaine inclus si elle le permet.`,
      references: [],
      verificationNote: 'Cette réponse n’analyse pas votre situation : ne vous appuyez pas dessus pour prendre une décision.',
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
        shortSummary: `Oui, des congés conventionnels peuvent s'ajouter aux congés payés légaux. Leur nombre dépend de la convention ${org.ccn}, de l'emploi occupé et de l'ancienneté du salarié.`,
        detailedAnalysis: `Explication
Le Code du travail fixe un socle de 2,5 jours ouvrables de congés payés par mois de travail effectif. Une convention collective peut prévoir des jours supplémentaires, par exemple liés à l'ancienneté ou, pour certains emplois, des congés trimestriels.

Application à votre association
Votre profil indique la convention ${org.ccn} et ${org.employeesCount} salariés (${org.sector}). Les droits dépendent de l'annexe ou de la catégorie dont relève chaque salarié : une même règle ne s'applique pas forcément à tout l'effectif.

Actions recommandées
1. Identifier l'annexe ou la classification de chaque salarié concerné.
2. Vérifier les articles relatifs aux congés dans la version en vigueur de la convention, ainsi que vos éventuels accords d'entreprise.
3. Reporter les droits retenus dans le planning et sur les bulletins de paie.`,
        references: [
          'Code du travail, art. L. 3141-3 (durée des congés payés)',
          `${org.ccn} — articles relatifs aux congés (version en vigueur à vérifier)`
        ],
        verificationNote: 'Les durées exactes ne sont pas reprises ici : elles dépendent de la version de la convention et de la catégorie du salarié. En cas de désaccord avec un salarié, faites valider votre lecture par l’experte.',
        suggestedTicketDomain: 'rh',
        suggestedTicketQuestion: `Question sur l application des congés d ancienneté pour notre effectif de ${org.employeesCount} salariés sous ${org.ccn}.`
      };
    }

    if (q.includes('rupture') || q.includes('démission') || q.includes('préavis') || q.includes('licenciement')) {
      return {
        shortSummary: `La durée du préavis dépend du motif de la rupture, de l'ancienneté et de la catégorie du salarié. La convention ${org.ccn} peut prévoir des durées plus favorables que la loi.`,
        detailedAnalysis: `Explication
En cas de licenciement (hors faute grave), le Code du travail prévoit un préavis minimal d'un mois pour une ancienneté de 6 mois à 2 ans, et de deux mois au-delà. La convention collective ou le contrat peut prévoir des durées plus longues, notamment pour les cadres. En cas de démission, la durée relève de la convention, du contrat ou des usages.

Application à votre association
Pour ${org.name} (${org.employeesCount} salariés), vérifiez les règles prévues par la convention ${org.ccn} pour la catégorie du salarié concerné.

Actions recommandées
1. Qualifier la rupture : démission, licenciement, rupture conventionnelle ou fin de CDD.
2. Calculer l'ancienneté à la date de notification.
3. Pour un licenciement, respecter la procédure : convocation à un entretien préalable, entretien, puis notification écrite.`,
        references: [
          'Code du travail, art. L. 1234-1 (préavis de licenciement)',
          'Code du travail, art. L. 1232-2 et suivants (entretien préalable)',
          `${org.ccn} — dispositions relatives à la rupture du contrat (à vérifier)`
        ],
        verificationNote: 'Une rupture du contrat est une décision à fort enjeu. Faites valider la procédure et les courriers avant envoi.',
        suggestedTicketDomain: 'rh',
        suggestedTicketQuestion: `Validation de la procédure et du préavis de départ sous convention ${org.ccn}.`
      };
    }

    // Default RH response
    return {
      shortSummary: `La règle applicable combine le Code du travail, votre convention collective (${org.ccn}) et vos accords internes. Précisez la situation pour obtenir une réponse ciblée.`,
      detailedAnalysis: `Explication
La convention collective complète le Code du travail et peut prévoir des règles plus favorables aux salariés. Les accords d'entreprise et le contrat de travail peuvent aussi s'appliquer.

Application à votre association
Votre profil indique ${org.employeesCount} salariés dans le secteur ${org.sector}. Certaines obligations dépendent de l'effectif, par exemple la mise en place d'un comité social et économique à partir de 11 salariés.

Pour une réponse plus précise
Indiquez le poste concerné, l'ancienneté du salarié et la date des faits : ces éléments peuvent changer la réponse.`,
      references: [
        'Code du travail, partie législative, livre II (conventions et accords collectifs)',
        `${org.ccn}`
      ],
      verificationNote: 'Réponse générale : elle ne tient pas compte d’une situation individuelle. Pour un cas précis, transmettez-le à l’experte.',
      suggestedTicketDomain: 'rh',
      suggestedTicketQuestion: query
    };
  }

  // Gouvernance 1901
  if (domain === 'gouvernance') {
    return {
      shortSummary: `La loi de 1901 laisse une grande liberté d'organisation : sur ce sujet, ce sont d'abord les statuts et le règlement intérieur de ${org.name} qui s'appliquent.`,
      detailedAnalysis: `Explication
La loi du 1er juillet 1901 ne fixe ni les organes de l'association, ni les règles de convocation, de quorum ou de majorité. Ces règles sont définies par les statuts et peuvent être précisées par un règlement intérieur.

Application à votre association
Votre profil indique : ${org.governanceSummary || 'gouvernance non renseignée'} Assemblée générale habituelle : ${org.usualAgMonth}. Les pouvoirs du président, du bureau et du conseil d'administration sont ceux que prévoient vos statuts.

Actions recommandées
1. Relire les articles des statuts sur la convocation, le quorum, les majorités et les pouvoirs.
2. Vérifier que la décision envisagée relève bien de l'instance qui va la prendre.
3. Consigner la décision dans un procès-verbal.`,
      references: [
        'Loi du 1er juillet 1901 relative au contrat d’association',
        'Statuts et règlement intérieur de l’association (RNA ' + org.rna + ')'
      ],
      verificationNote: 'Si vos statuts sont silencieux ou ambigus sur ce point, ou si une décision risque d’être contestée, faites valider votre lecture avant d’agir.',
      suggestedTicketDomain: 'gouvernance',
      suggestedTicketQuestion: query
    };
  }

  // Finance & Subventions
  if (domain === 'finance') {
    return {
      shortSummary: `Une subvention doit pouvoir être justifiée auprès du financeur. Selon les montants reçus, d'autres obligations peuvent s'appliquer, comme la nomination d'un commissaire aux comptes.`,
      detailedAnalysis: `Explication
Une association qui reçoit une subvention doit pouvoir justifier son utilisation conforme à l'objet prévu. Pour une subvention publique affectée, un compte rendu financier est à produire dans les six mois suivant la fin de l'exercice concerné (formulaire Cerfa n° 15059). Les sommes non utilisées à la clôture peuvent être inscrites en fonds dédiés lorsque l'engagement pris envers le financeur le justifie.

Application à votre association
Votre profil indique ${org.mainFunders.length} financeur(s) principal(aux) (${org.mainFunders.join(', ')}) et une clôture au ${org.fiscalYearEnd}. Une association qui reçoit plus de 153 000 € de subventions publiques ou de dons sur un exercice doit nommer un commissaire aux comptes.

Actions recommandées
1. Rassembler les conventions de financement et leurs clauses de justification et de report.
2. Préparer le compte rendu financier de chaque action subventionnée.
3. Vérifier le montant total des subventions et dons reçus sur l'exercice.`,
      references: [
        'Loi n° 2000-321 du 12 avril 2000, art. 10 (compte rendu financier)',
        'Code de commerce, art. L. 612-4 (commissaire aux comptes)',
        'Règlement ANC n° 2018-06 (comptes annuels des personnes morales de droit privé à but non lucratif)'
      ],
      verificationNote: 'Les clauses de votre convention de financement priment sur cette réponse générale. En cas de contrôle ou de demande de reversement, faites appel à l’experte.',
      suggestedTicketDomain: 'finance',
      suggestedTicketQuestion: query
    };
  }

  // Conformité & DUERP / RGPD
  return {
    shortSummary: `Dès le premier salarié, votre association a des obligations d'employeur, dont le document unique d'évaluation des risques (DUERP). D'autres dépendent ensuite de l'effectif.`,
    detailedAnalysis: `Explication
Le DUERP recense les risques professionnels et les mesures de prévention. Il est obligatoire dès le premier salarié et doit être mis à jour au moins une fois par an à partir de 11 salariés, ainsi qu'en cas de changement important des conditions de travail. D'autres obligations s'ajoutent : affichages et informations obligatoires, registre unique du personnel et, pour les données personnelles, registre des traitements.

Application à votre association
Votre profil indique ${org.employeesCount} salariés (${org.sector}) et ${org.establishmentsCount} établissement(s). ${org.employeesCount >= 11 ? 'La mise à jour annuelle du DUERP vous concerne.' : 'Sous 11 salariés, le DUERP reste obligatoire et doit être mis à jour en cas de changement important.'}

Actions recommandées
1. Vérifier la date de la dernière mise à jour de votre DUERP.
2. Contrôler les affichages obligatoires dans chaque établissement.
3. Recenser les traitements de données concernant salariés, bénévoles, adhérents et bénéficiaires.`,
    references: [
      'Code du travail, art. L. 4121-3 et R. 4121-1 et suivants (DUERP)',
      'Loi n° 2021-1018 du 2 août 2021 pour renforcer la prévention en santé au travail',
      'RGPD, art. 30 (registre des activités de traitement)'
    ],
    verificationNote: 'Cette liste n’est pas exhaustive et ne vaut pas audit de conformité. En cas de contrôle de l’inspection du travail ou de l’URSSAF, faites appel à l’experte.',
    suggestedTicketDomain: 'conformite',
    suggestedTicketQuestion: query
  };
}

export function getDomainLabel(domain: Domain): string {
  switch (domain) {
    case 'rh': return 'RH et conventions collectives';
    case 'gouvernance': return 'Gouvernance';
    case 'finance': return 'Finance et subventions';
    case 'conformite': return 'Conformité employeur';
  }
}
