import React, { useState, useEffect } from 'react';
import { Plan, Organization } from '../types';
import { 
  ShieldCheck, 
  Users, 
  FileText, 
  Scale, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Lock, 
  Compass, 
  Award, 
  Clock, 
  ChevronRight, 
  ChevronDown, 
  LogIn, 
  Menu, 
  X, 
  Check, 
  Send, 
  Quote, 
  AlertCircle, 
  Zap, 
  Wallet, 
  Landmark, 
  Bot,
  AlertTriangle,
  Gavel,
  BadgeCheck,
  Building2,
  FileCheck2,
  HelpCircle,
  FolderOpen,
  FileSpreadsheet,
  Layers,
  PieChart,
  TrendingUp,
  Play,
  Pause
} from 'lucide-react';

interface PublicLandingViewProps {
  plans: Plan[];
  onOpenLogin: () => void;
  onStartOnboarding: (preferredPlanCode?: 'initiale' | 'pro' | 'expert') => void;
  currentOrg: Organization;
}

export const PublicLandingView: React.FC<PublicLandingViewProps> = ({
  plans,
  onOpenLogin,
  onStartOnboarding,
  currentOrg
}) => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [activeSolutionTab, setActiveSolutionTab] = useState<string>('rh');
  const [isPillarScanning, setIsPillarScanning] = useState<boolean>(false);
  const [pillarCcn, setPillarCcn] = useState<string>('CCN 66');
  const [isQueryScanning, setIsQueryScanning] = useState<boolean>(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  // Interactive Live Dilemma Switcher in the Hero
  const [heroDilemmaIndex, setHeroDilemmaIndex] = useState<number>(0);

  // Innovative Hero Headline Word Rotator
  const rotatingWords = [
    { text: 'conventions collectives (CCN)', color: '#bef264' },
    { text: 'subventions & bilans CER', color: '#38bdf8' },
    { text: 'salariés & contrats de travail', color: '#fde047' },
    { text: 'quorums & statuts 1901', color: '#34d399' }
  ];
  const [rotatingWordIndex, setRotatingWordIndex] = useState<number>(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setRotatingWordIndex((prev) => (prev + 1) % rotatingWords.length);
    }, 2800);
    return () => clearInterval(timer);
  }, [rotatingWords.length]);

  // Innovative Live Legal Activity Ticker
  const liveEvents = [
    { tag: 'CCN 66 • RH', text: 'Congés trimestriels régularisés — Risque prud’homal neutralisé', stat: '+4 800 € protégés' },
    { tag: 'Subvention CER', text: 'Reliquat de 14 500 € cadré en Fonds Dédiés — Ordre de reversement évité', stat: '0 € reversé' },
    { tag: 'Gouvernance 1901', text: 'Quorum et validité des procurations vérifiés avant Assemblée Générale', stat: '100% conforme' },
    { tag: 'CCN 51 • Cadres', text: 'Protocole de rupture conventionnelle validé par le Cabinet Maé', stat: 'Signé sous 48h' }
  ];
  const [liveEventIndex, setLiveEventIndex] = useState<number>(0);

  useEffect(() => {
    const tickerTimer = setInterval(() => {
      setLiveEventIndex((prev) => (prev + 1) % liveEvents.length);
    }, 3600);
    return () => clearInterval(tickerTimer);
  }, [liveEvents.length]);

  // Interactive Accordion Deck for Cas Concrets (Hover-reveal with Auto-rolling)
  const [activeAccordionStep, setActiveAccordionStep] = useState<number>(0);
  const [isAccordionAutoPlaying, setIsAccordionAutoPlaying] = useState<boolean>(true);

  // Interactive Marquee Scrolling Deck for Cas Concrets (Continuous glide with hover freeze)
  const [hoveredMarqueeStep, setHoveredMarqueeStep] = useState<number | null>(null);
  const [isMarqueePausedManual, setIsMarqueePausedManual] = useState<boolean>(false);
  const [caseViewMode, setCaseViewMode] = useState<'marquee' | 'accordion'>('marquee');

  useEffect(() => {
    if (!isAccordionAutoPlaying) return;
    const stepTimer = setInterval(() => {
      setActiveAccordionStep((prev) => (prev + 1) % 5);
    }, 4200);
    return () => clearInterval(stepTimer);
  }, [isAccordionAutoPlaying]);

  // Dynamic ROI Simulator State
  const [employeeCount, setEmployeeCount] = useState<number>(24);
  const [selectedCcn, setSelectedCcn] = useState<string>('CCN 66');

  // Interactive Live AI Query Demonstration
  const [activeQueryIndex, setActiveQueryIndex] = useState<number>(0);

  // Interactive Demo Modal State
  const [isDemoModalOpen, setIsDemoModalOpen] = useState<boolean>(false);
  const [demoSubmitted, setDemoSubmitted] = useState<boolean>(false);
  const [demoForm, setDemoForm] = useState({
    name: '',
    email: '',
    assoName: currentOrg.name || 'Association Solidarité & Avenir',
    ccn: 'CCN 66 (Médico-social)',
    salaries: '15-49 salariés',
    message: ''
  });

  // Newsletter feedback state
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  // Dynamic ROI calculations
  const hoursSaved = Math.round(6 + employeeCount * 0.45);
  const moneySaved = Math.round(150 + employeeCount * 14);
  const recommendedPlanName = employeeCount < 10 
    ? 'Formule Initiale (49 € / mois)' 
    : employeeCount <= 40 
      ? 'Formule Pro (149 € / mois) — Recommandé' 
      : 'Formule Expert (299 € / mois)';

  // Distinct Hero Interactive Case Studies
  const heroDilemmas = [
    {
      id: 0,
      badge: 'RH & Paie • CCN 66',
      title: 'Congés trimestriels & primes d\'ancienneté',
      question: 'Notre chef de service refuse 6 jours de congés trimestriels à un éducateur spécialisé. Est-ce légal ?',
      verdict: 'Non conforme. L’Annexe 3 de la CCN 66 impose impérativement 6 jours consécutifs par trimestre hors congés annuels.',
      risk: 'Risque de rappel de salaire et indemnisation prud\'homale de 4 800 € évitée.',
      officialRef: 'CCN 66 Art. 22 & Annexe 3 • Cass. Soc. 2018',
      cabinetMaeAction: 'Attestation de droit signée par le Cabinet Maé'
    },
    {
      id: 1,
      badge: 'Subvention & Financement CER',
      title: 'Reliquat de subvention de 14 500 € en fin d’action',
      question: 'La mairie nous verse une subvention non consommée au 31 décembre. Risquons-nous un ordre de reversement ?',
      verdict: 'Report possible en compte 194 (Fonds Dédiés) sous réserve de notification expresse au financeur dans le compte-rendu CER.',
      risk: 'Risque de blocage de subvention N+1 et de redressement de 14 500 € neutralisé.',
      officialRef: 'Règlement ANC n° 2018-06 • Décret CER 2001-495',
      cabinetMaeAction: 'Courrier type de cadrage des fonds dédiés rédigé'
    },
    {
      id: 2,
      badge: 'Gouvernance & Statuts 1901',
      title: 'Quorum d’AG non atteint & contestation des votes',
      question: 'Seulement 28 membres présents sur 84. Peut-on voter avec 12 procurations informelles reçues par email ?',
      verdict: 'Nullité absolue des votes si les statuts n’autorisent pas explicitement le pouvoir numérique et le vote par procuration.',
      risk: 'Annulation judiciaire de l\'élection du Conseil d’Administration évitée.',
      officialRef: 'Loi 1901 Art. 5 • Cass. 1ère Civ. 2008',
      cabinetMaeAction: 'Modèle de PV de carence et convocation d’urgence sécurisés'
    },
    {
      id: 3,
      badge: 'Rupture & Risque Social • CCN 51',
      title: 'Rupture conventionnelle d\'un cadre coordinateur',
      question: 'Quelle indemnité spécifique verser à un cadre FEHAP ayant 7 ans d\'ancienneté sans risquer de requalification ?',
      verdict: 'L’indemnité conventionnelle CCN 51 est supérieure d’environ 45% au barème légal du Code du travail. Le calcul conventionnel s\'impose.',
      risk: 'Contentieux prud\'homal évité et homologation TéléRC garantie sous 15 jours.',
      officialRef: 'CCN 51 FEHAP Art. 15.02.2 • Art. L. 1237-13 C. Trav.',
      cabinetMaeAction: 'Revue complète du protocole de rupture sous 48h ouvrées'
    }
  ];

  const currentDilemma = heroDilemmas[heroDilemmaIndex];

  // 4 Core Pillars of AssoExpert IA
  const solutions = [
    {
      id: 'rh',
      title: 'RH & Conventions Collectives',
      subtitle: 'Sécurisez l’application de votre convention (CCN 66, 51, ÉCLAT, ALISFA).',
      badge: 'Pilier 1 • Droit Social',
      description: 'Congés trimestriels, coefficients, primes d’ancienneté et ruptures conventionnelles : ne laissez plus planer le doute juridique sur vos bulletins de paie et plannings.',
      bullets: [
        'Calcul automatisé des congés d’ancienneté et congés trimestriels obligatoires',
        'Veille continue des avenants de branche et revalorisations du point',
        'Vérification des classifications cadres et non-cadres',
        'Escalade juridique garantie sous 48h ouvrées vers le Cabinet Maé'
      ],
      previewData: {
        headline: 'Copilote Conventionnel Spécialisé',
        stat1: 'CCN 66 & Avenants 2026',
        stat2: '0 litige prud’homal',
        mockCard: '14 éducateurs sous Annexe 3 : 18 jours de congés trimestriels calculés et intégrés au planning annuel.'
      }
    },
    {
      id: 'finance',
      title: 'Finances & Justification CER',
      subtitle: 'Du budget prévisionnel à la clôture, anticipez les écarts.',
      badge: 'Pilier 2 • Budgets & CER',
      description: 'Passez du contrôle passif au pilotage actif : budget, réalisé, trésorerie glissante et Compte d’Emploi des Ressources (CER) réunis dans un cockpit clair.',
      bullets: [
        'Comparaison budget / réalisé en temps réel avec seuils d’alerte',
        'Traitement rigoureux des fonds dédiés et reliquats de subvention',
        'Justification conforme du Compte d’Emploi des Ressources (CER)',
        'Projection de trésorerie sur 12 mois pour sécuriser la masse salariale'
      ],
      previewData: {
        headline: 'Cockpit Budgétaire & CER',
        stat1: 'Budget : 420 000 €',
        stat2: 'Écart : +2.4% (Sous contrôle)',
        mockCard: 'Fonds dédiés de 14 500 € reportés en conformité avec le règlement ANC 2018-06.'
      }
    },
    {
      id: 'subventions',
      title: 'Financements & Appels à Projets',
      subtitle: 'Identifiez et sécurisez vos financements publics et privés.',
      badge: 'Pilier 3 • Financements',
      description: 'Ne manquez plus une échéance de dépôt ni un appel à projets : un calendrier centralisé de tous vos financeurs (Régions, Départements, CAF, Fondations).',
      bullets: [
        'Détection précoce des appels à projets locaux et nationaux éligibles',
        'Alertes automatiques avant la date limite de justification des fonds',
        'Suivi multi-financeurs unifié (taux de cofinancement, reliquats)',
        'Génération assistée des bilans financiers d’action'
      ],
      previewData: {
        headline: 'Calendrier Multi-Financeurs',
        stat1: '5 financeurs actifs',
        stat2: 'Échéance CAF : J-14',
        mockCard: 'Dossier Région Jeunesse validé. Bilan financier d’action CER généré avec succès.'
      }
    },
    {
      id: 'gouvernance',
      title: 'Gouvernance & Conformité 1901',
      subtitle: 'Sécurisez vos instances et la responsabilité des dirigeants.',
      badge: 'Pilier 4 • Loi 1901',
      description: 'Calcul précis des quorums statutaires, gestion des procurations, procès-verbaux d’AG conformes et Document Unique (DUERP) : protégez votre bureau bénévole.',
      bullets: [
        'Calcul des quorums et validité des pouvoirs selon vos statuts',
        'Modèles de résolutions et procès-verbaux de CA et d’AG',
        'Suivi du Document Unique d’Évaluation des Risques (DUERP)',
        'Protection juridique de la responsabilité civile et pénale des dirigeants'
      ],
      previewData: {
        headline: 'Sécurité Juridique du Bureau',
        stat1: 'CA & AG conformes',
        stat2: 'DUERP actualisé',
        mockCard: 'Assemblée Générale Ordinaire : quorum atteint (54%). PV de délibération conforme loi 1901.'
      }
    }
  ];

  const currentSolution = solutions.find(s => s.id === activeSolutionTab) || solutions[0];

  // Interactive Live Queries with Rich Metadata & Outcome Badges
  const sampleQueries = [
    {
      id: 0,
      title: 'CCN 66 — Congés trimestriels & ancienneté',
      tag: 'RH & CCN 66',
      outcomeBadge: '+4 800 € protégés',
      question: 'Quels sont les congés conventionnels d’ancienneté et trimestriels pour nos éducateurs spécialisés sous CCN 66 ?',
      response: {
        synthese: 'En sus des 2,5 jours ouvrables légaux de congés payés par mois, l’article 22 de la CCN 66 accorde 2 jours ouvrables supplémentaires par tranche de 5 ans d’ancienneté (plafonnés à 6 jours). Pour vos éducateurs spécialisés (Annexe 3), s’y ajoutent impérativement 6 jours de congés trimestriels consécutifs au cours de chacun des 3 trimestres ne comprenant pas les congés annuels.',
        refChips: ['CCN 66 Art. 22', 'Annexe 3 (Éducateurs)', 'Code du travail Art. L. 3141-10'],
        calcul: 'Pour un salarié ayant 12 ans d’ancienneté : 25 jours légaux + 4 jours d’ancienneté + 18 jours trimestriels = 47 jours de repos annuels garantis.',
        calculFormula: [
          { label: 'Congés légaux', val: '25 jours' },
          { label: 'Ancienneté 12 ans', val: '+4 jours' },
          { label: 'Congés trimestriels', val: '+18 jours' },
          { label: 'Total annuel garanti', val: '= 47 jours', highlight: true }
        ],
        vigilance: 'Les congés trimestriels doivent impérativement être pris dans le trimestre civil considéré. Ils ne peuvent être ni reportés ni indemnisés sauf impossibilité démontrée imputable à l’employeur.',
        experte: 'Analyse d’impact sur votre planning et vos fiches de paie validée par Laetitia Badji (Cabinet Maé) sous 48h ouvrées.'
      }
    },
    {
      id: 1,
      title: 'Finance — Reliquat de subvention CER',
      tag: 'Finance & Subventions',
      outcomeBadge: '0 € reversé',
      question: 'Comment traiter un reliquat de subvention municipale non consommé en fin d’exercice dans notre Compte d’Emploi des Ressources (CER) ?',
      response: {
        synthese: 'Le reliquat doit être inscrit au passif du bilan en « Fonds dédiés » (compte 194) si la convention de subvention prévoit expressément le report sur l’exercice suivant pour la poursuite de l’action. Sans clause de report ou accord écrit du financeur, la somme doit impérativement être inscrite en dette (compte 467) en vue d’un reversement.',
        refChips: ['Règlement ANC n° 2018-06', 'Décret n° 2001-495 (CER)', 'Compte 194 Fonds Dédiés'],
        calcul: 'Montant non engagé : 14 500 € ➔ Inscription au tableau de variation des fonds dédiés et mention obligatoire dans l’annexe comptable.',
        calculFormula: [
          { label: 'Subvention totale', val: '50 000 €' },
          { label: 'Dépenses engagées', val: '- 35 500 €' },
          { label: 'Reliquat sécurisé', val: '14 500 €' },
          { label: 'Ordre de reversement', val: '0 € (Neutralisé)', highlight: true }
        ],
        vigilance: 'Attention au risque d’ordre de reversement ou de requalification lors d’un contrôle par la Chambre Régionale des Comptes.',
        experte: 'Revue de votre convention de financement et de votre bilan CER par Laetitia Badji sous 48h ouvrées.'
      }
    },
    {
      id: 2,
      title: 'Gouvernance — Quorum AG & Procurations',
      tag: 'Gouvernance Loi 1901',
      outcomeBadge: '100% Inattaquable',
      question: 'Le quorum statutaire n’est pas atteint pour notre Assemblée Générale Ordinaire. Pouvons-nous voter avec les procurations reçues ?',
      response: {
        synthese: 'Les procurations comptent dans le calcul du quorum uniquement si les statuts de votre association le prévoient expressément et dans la limite des plafonds statutaires (ex. maximum 2 ou 3 pouvoirs par membre). Si le quorum demeure insuffisant, l’AG ne peut valablement délibérer : les votes seraient frappés de nullité absolue.',
        refChips: ['Loi 1er juillet 1901 Art. 5', 'Cass. 1ère Civ., n° 07-17.842', 'Statuts associatifs'],
        calcul: 'Membres à jour : 84. Quorum requis (statuts 50%) : 42. Présents (28) + Pouvoirs valides (8) = 36. Quorum non atteint de 6 voix.',
        calculFormula: [
          { label: 'Membres inscrits', val: '84 adhérents' },
          { label: 'Quorum requis 50%', val: '42 voix' },
          { label: 'Présents + Pouvoirs', val: '36 voix' },
          { label: 'Statut du vote', val: 'Carence (Report d’urgence)', highlight: true }
        ],
        vigilance: 'Consigner impérativement le défaut de quorum au procès-verbal et convoquer une seconde AG selon les délais statutaires d’urgence.',
        experte: 'Rédaction sécurisée du PV de carence et de la convocation de la 2nde AG par Laetitia Badji sous 48h ouvrées.'
      }
    },
    {
      id: 3,
      title: 'CCN 51 — Rupture conventionnelle & Préavis',
      tag: 'RH & CCN 51',
      outcomeBadge: 'Signé sous 48h',
      question: 'Quelles sont les spécificités d’une rupture conventionnelle et de calcul d’indemnité pour un cadre sous convention collective CCN 51 ?',
      response: {
        synthese: 'Sous CCN 51 (FEHAP), l’indemnité spécifique de rupture conventionnelle ne peut être inférieure à l’indemnité conventionnelle de licenciement si celle-ci est plus favorable que l’indemnité légale, ce qui est le cas après quelques années d’ancienneté.',
        refChips: ['CCN 51 FEHAP Art. 15.02.2', 'Code du travail L. 1237-13', 'TéléRC DREETS'],
        calcul: 'Pour un cadre avec 6 ans d’ancienneté : montant conventionnel supérieur d’environ 45% au barème légal du Code du travail.',
        calculFormula: [
          { label: 'Barème légal', val: 'Base Code du Travail' },
          { label: 'Majoration FEHAP', val: '+45% conventionnel' },
          { label: 'Délai rétractation', val: '15 jours calendaires' },
          { label: 'Sécurité prud’homale', val: '100% Opposable', highlight: true }
        ],
        vigilance: 'Respecter scrupuleusement le délai légal de rétractation de 15 jours calendaires avant télétransmission TéléRC à la DREETS.',
        experte: 'Audit préalable du protocole de rupture et sécurisation juridique par Laetitia Badji sous 48h ouvrées.'
      }
    }
  ];

  const currentQuery = sampleQueries[activeQueryIndex];

  const faqs = [
    {
      q: 'En quoi AssoExpert IA est-il différent d’un outil généraliste ou d’un logiciel classique ?',
      a: 'AssoExpert IA est spécialement conçu pour le monde associatif employeur régi par la loi 1901. Il intègre directement les textes officiels des conventions collectives associatives (CCN 66, CCN 51, ÉCLAT, ALISFA), les règles du Compte d’Emploi des Ressources (CER), et les spécificités de gouvernance. Surtout, vous bénéficiez d’une garantie contractuelle unique : l’escalade humaine sous 48h ouvrées vers Laetitia Badji (Cabinet Maé), juriste experte reconnue du secteur.'
    },
    {
      q: 'Comment se déroule la démonstration personnalisée de 30 minutes ?',
      a: 'Pas de discours commercial générique : un tour d’horizon de 30 minutes adapté aux priorités immédiates de votre structure (votre convention collective, votre budget, votre gestion des instances). Nous répondons concrètement à vos questions sur vos obligations immédiates, sans aucun engagement.'
    },
    {
      q: 'Comment fonctionne concrètement l’escalade vers Laetitia Badji (Cabinet Maé) ?',
      a: 'Dès qu’une situation RH ou juridique est sensible (rupture conventionnelle délicate, litige, contestation de prime, contrôle de subvention), un bouton préremplit votre demande dans la plateforme. Laetitia Badji examine personnellement votre dossier et vous délivre une note juridique argumentée et signée sous 48h ouvrées.'
    },
    {
      q: 'Devons-nous abandonner nos logiciels de paie ou comptables existants ?',
      a: 'Non ! Vos logiciels habituels restent en place. AssoExpert IA ne remplace pas votre expert-comptable ou votre éditeur de paie : il devient votre tour de contrôle juridique et consultative pour vérifier les règles avant d’agir, éviter les litiges et sécuriser vos décisions.'
    },
    {
      q: 'Nos données associatives sont-elles strictement confidentielles et conformes au RGPD ?',
      a: 'Absolument. Vos questions, budgets et documents restent cantonnés à votre espace associatif sécurisé hébergé sur des serveurs souverains en France. Aucune donnée n’est transmise à des tiers publicitaires, et vos contenus ne servent jamais à entraîner des modèles d’IA publics.'
    },
    {
      q: 'Puis-je changer de formule ou résilier sans engagement ?',
      a: 'Oui. Tous nos abonnements sont sans engagement de durée. Vous pouvez basculer d’une formule à l’autre ou suspendre votre abonnement en un clic depuis votre espace sécurisé.'
    }
  ];

  const testimonials = [
    {
      quote: "Avec nos 32 salariés sous CCN 66, la gestion des congés trimestriels et des grilles indiciaires nous prenait des jours entiers chaque trimestre. AssoExpert IA nous fait gagner un temps précieux et nous sécurise totalement face aux risques de contentieux.",
      author: "Sophie M.",
      role: "Directrice Générale",
      asso: "Maison Pour Tous des Lilas",
      tag: "CCN 66 &bull; 32 salariés",
      initials: "SM"
    },
    {
      quote: "La double approche assistance IA + validation humaine par Laetitia Badji est un soulagement immense pour notre bureau bénévole. On a les réponses immédiates au quotidien, et un vrai cabinet juridique d'appui en cas de doute.",
      author: "Karim T.",
      role: "Président d'association",
      asso: "Passerelle Insertion Lyon",
      tag: "ALISFA &bull; 18 salariés",
      initials: "KT"
    },
    {
      quote: "Enfin une plateforme qui comprend le Compte d’Emploi des Ressources (CER), les fonds dédiés et les particularités de la loi 1901 ! Nos échanges avec le Conseil d'Administration sont devenus limpides et sereins.",
      author: "Élisabeth D.",
      role: "Trésorière",
      asso: "Réseau Éveil Santé & Solidarité",
      tag: "CCN 51 &bull; 45 salariés",
      initials: "ED"
    }
  ];

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDemoSubmitted(true);
  };

  return (
    <div style={{ backgroundColor: '#070f1e', color: '#ffffff', minHeight: '100vh', overflowX: 'hidden' }}>
      
      {/* =========================================================================
          DISTINCTIVE TOP NAVBAR (AssoExpert IA & Cabinet Maé)
          ========================================================================= */}
      <header className="pilot-navbar" style={{ background: 'rgba(7, 15, 30, 0.88)' }}>
        <div style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '0 24px',
          height: 70,
          display: 'grid',
          gridTemplateColumns: 'auto 1fr auto',
          alignItems: 'center',
          gap: 24
        }}>
          {/* Logo Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #004AAD 0%, #002868 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 0 20px rgba(0, 74, 173, 0.6)'
            }}>
              <Scale size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  fontSize: 19,
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  color: '#ffffff'
                }}>
                  AssoExpert<span style={{ color: '#004AAD' }}>.IA</span>
                </span>
                <span style={{
                  fontSize: 10,
                  fontWeight: 700,
                  backgroundColor: 'rgba(190, 242, 100, 0.18)',
                  color: '#bef264',
                  padding: '2px 8px',
                  borderRadius: 9999,
                  border: '1px solid rgba(190, 242, 100, 0.35)'
                }}>
                  Cabinet Maé
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hide-on-mobile" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6
          }}>
            <a href="#cockpit" className="pilot-nav-link">L'Arbitrage en direct</a>
            <a href="#constat" className="pilot-nav-link">Le constat</a>
            <a href="#solutions" className="pilot-nav-link">4 Piliers</a>
            <a href="#simulateur" className="pilot-nav-link">Simulateur</a>
            <a href="#experte" className="pilot-nav-link">Garantie 48h</a>
            <a href="#tarifs" className="pilot-nav-link">Tarifs</a>
            <a href="#faq" className="pilot-nav-link">FAQ</a>
          </nav>

          {/* Action CTAs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={onOpenLogin}
              className="hide-on-mobile"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                padding: '8px 14px',
                borderRadius: 9999,
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)')}
            >
              Connexion
            </button>

            <button
              onClick={() => setIsDemoModalOpen(true)}
              className="pilot-glow-btn"
              style={{ fontSize: 13, padding: '9px 18px' }}
            >
              <span>Demander une démo</span>
              <ArrowRight size={14} />
            </button>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="show-on-mobile"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                width: 38,
                height: 38,
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              aria-label="Menu"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div style={{
            backgroundColor: '#0a162b',
            borderTop: '1px solid rgba(255, 255, 255, 0.12)',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12
          }}>
            <a href="#cockpit" onClick={() => setIsMobileMenuOpen(false)} style={{ color: '#ffffff', padding: '8px 0', fontSize: 15, fontWeight: 500 }}>L'Espace d'arbitrage</a>
            <a href="#constat" onClick={() => setIsMobileMenuOpen(false)} style={{ color: '#ffffff', padding: '8px 0', fontSize: 15, fontWeight: 500 }}>Le vertige de l'employeur</a>
            <a href="#solutions" onClick={() => setIsMobileMenuOpen(false)} style={{ color: '#ffffff', padding: '8px 0', fontSize: 15, fontWeight: 500 }}>Les 4 piliers d'expertise</a>
            <a href="#simulateur" onClick={() => setIsMobileMenuOpen(false)} style={{ color: '#bef264', padding: '8px 0', fontSize: 15, fontWeight: 600 }}>Simulateur de gains & ROI</a>
            <a href="#experte" onClick={() => setIsMobileMenuOpen(false)} style={{ color: '#ffffff', padding: '8px 0', fontSize: 15, fontWeight: 500 }}>Laetitia Badji & Cabinet Maé</a>
            <a href="#tarifs" onClick={() => setIsMobileMenuOpen(false)} style={{ color: '#ffffff', padding: '8px 0', fontSize: 15, fontWeight: 500 }}>Tarifs sans engagement</a>
            <a href="#faq" onClick={() => setIsMobileMenuOpen(false)} style={{ color: '#ffffff', padding: '8px 0', fontSize: 15, fontWeight: 500 }}>FAQ</a>
            <div style={{ paddingTop: 14, borderTop: '1px solid rgba(255, 255, 255, 0.12)', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                onClick={() => { setIsMobileMenuOpen(false); setIsDemoModalOpen(true); }}
                className="pilot-glow-btn"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Réserver ma démo gratuite (30 min)
              </button>
              <button
                onClick={() => { setIsMobileMenuOpen(false); onOpenLogin(); }}
                className="pilot-primary-btn"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Se connecter
              </button>
            </div>
          </div>
        )}
      </header>

      {/* =========================================================================
          HERO SECTION (BESPOKE FOR ASSOEXPERT IA - L'ARBITRAGE JURIDIQUE EN DIRECT)
          ========================================================================= */}
      <section id="cockpit" style={{
        position: 'relative',
        paddingTop: 140,
        paddingBottom: 90,
        paddingLeft: 20,
        paddingRight: 20,
        overflow: 'hidden',
        background: '#070f1e'
      }}>
        {/* Soft Ambient Aurora Glows */}
        <div
          className="animate-aurora-1"
          style={{
            position: 'absolute',
            top: '-5%',
            left: '20%',
            width: 580,
            height: 580,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0, 74, 173, 0.3) 0%, rgba(0, 74, 173, 0) 70%)',
            pointerEvents: 'none',
            filter: 'blur(75px)'
          }}
        />

        <div
          className="animate-aurora-2"
          style={{
            position: 'absolute',
            top: '25%',
            right: '15%',
            width: 520,
            height: 520,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(190, 242, 100, 0.14) 0%, rgba(190, 242, 100, 0) 70%)',
            pointerEvents: 'none',
            filter: 'blur(70px)'
          }}
        />

        <div style={{ maxWidth: 1280, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 10 }}>
          
          {/* Top Pill: Authority Tag */}
          <div style={{ marginBottom: 26 }}>
            <div
              onClick={() => setIsDemoModalOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                borderRadius: 9999,
                border: '1px solid rgba(255, 255, 255, 0.2)',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                padding: '6px 18px 6px 10px',
                backdropFilter: 'blur(14px)',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              className="group"
            >
              <span className="radar-beacon" />
              <span style={{ fontSize: 13, color: 'rgba(255, 255, 255, 0.95)', fontWeight: 600 }}>
                18 fédérations & associations construisent la plateforme d'appui juridique
              </span>
              <ArrowRight size={13} style={{ color: '#bef264' }} />
            </div>
          </div>

          {/* Ambient Radial Energy Beam behind Title */}
          <div className="energy-beam-bg" />

          {/* Slogan AssoExpert IA: Protéger le dirigeant associatif employeur avec Mot Rotatif Animé */}
          <h1 style={{
            fontSize: 'clamp(34px, 5.5vw, 62px)',
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-0.035em',
            color: '#ffffff',
            maxWidth: 1060,
            margin: '0 auto 24px',
            position: 'relative',
            zIndex: 2
          }}>
            Dirigez en toute confiance.<br />
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '6px 12px' }}>
              <span>Vos</span>
              <span
                key={rotatingWordIndex}
                className="font-serif-italic animate-word-rotate"
                style={{
                  color: rotatingWords[rotatingWordIndex].color,
                  textShadow: `0 0 35px ${rotatingWords[rotatingWordIndex].color}77`,
                  padding: '2px 12px',
                  borderRadius: 12,
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: `1.5px solid ${rotatingWords[rotatingWordIndex].color}44`,
                  backdropFilter: 'blur(10px)'
                }}
              >
                {rotatingWords[rotatingWordIndex].text}
              </span>
              <span>100% sécurisés.</span>
            </span>
          </h1>

          {/* Subtitle explaining the dual strength (IA + Cabinet Maé) */}
          <p style={{
            fontSize: 'clamp(16px, 1.8vw, 19px)',
            lineHeight: 1.65,
            color: 'rgba(255, 255, 255, 0.82)',
            maxWidth: 840,
            margin: '0 auto 28px',
            letterSpacing: '-0.011em',
            position: 'relative',
            zIndex: 2
          }}>
            L’alliance inédite d'une <strong>intelligence artificielle spécialisée</strong> dans vos conventions collectives (CCN 66, 51, ÉCLAT, ALISFA) et de la <strong>garantie juridique signée du Cabinet Maé</strong> (Laetitia Badji), avec avis opposable délivré sous 48h ouvrées.
          </p>

          {/* Innovative Live Legal Activity Ticker Capsule */}
          <div style={{ marginBottom: 36, position: 'relative', zIndex: 2 }}>
            <div className="live-ticker-capsule" key={liveEventIndex}>
              <span className="radar-beacon" />
              <span style={{
                backgroundColor: 'rgba(190, 242, 100, 0.2)',
                color: '#bef264',
                padding: '3px 10px',
                borderRadius: 9999,
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: '0.02em',
                boxShadow: '0 0 12px rgba(190, 242, 100, 0.2)'
              }}>
                {liveEvents[liveEventIndex].tag}
              </span>
              <span style={{ color: 'rgba(255, 255, 255, 0.95)', fontWeight: 500, fontSize: 13 }}>
                {liveEvents[liveEventIndex].text}
              </span>
              <span style={{
                color: '#bef264',
                fontWeight: 800,
                fontSize: 12,
                borderLeft: '1px solid rgba(255, 255, 255, 0.2)',
                paddingLeft: 12
              }}>
                {liveEvents[liveEventIndex].stat}
              </span>
            </div>
          </div>

          {/* Three Interactive Reassurance Badges */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            flexWrap: 'wrap',
            marginBottom: 44,
            fontSize: 13,
            position: 'relative',
            zIndex: 2
          }}>
            <div className="reassurance-chip">
              <BadgeCheck size={16} style={{ color: '#bef264' }} />
              <span>100% Dédié au secteur associatif employeur</span>
            </div>
            <div className="reassurance-chip">
              <Clock size={16} style={{ color: '#bef264' }} />
              <span>Avis juridique écrit sous 48h ouvrées</span>
            </div>
            <div className="reassurance-chip">
              <ShieldCheck size={16} style={{ color: '#bef264' }} />
              <span>Hébergement souverain France & 100% RGPD</span>
            </div>
          </div>

          {/* Action CTAs with Luminous Shimmer Sweep */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 14,
            flexWrap: 'wrap',
            marginBottom: 64,
            position: 'relative',
            zIndex: 2
          }}>
            <button
              onClick={() => setIsDemoModalOpen(true)}
              className="pilot-glow-btn btn-shimmer-wrap"
              style={{ fontSize: 15, padding: '14px 32px' }}
            >
              <div className="btn-shimmer-beam" />
              <span style={{ position: 'relative', zIndex: 2 }}>Réserver ma démo de 30 minutes</span>
              <ChevronRight size={16} style={{ position: 'relative', zIndex: 2 }} />
            </button>

            <a
              href="#constat"
              className="pilot-primary-btn"
              style={{ fontSize: 15, padding: '14px 28px' }}
            >
              <span>Comprendre les enjeux</span>
            </a>
          </div>

          {/* =========================================================================
              LE COCKPIT D'ARBITRAGE JURIDIQUE & SOCIAL EN DIRECT (ORIGINAL DNA)
              ========================================================================= */}
          <div style={{ position: 'relative', maxWidth: 1220, margin: '0 auto' }}>
            
            {/* Main Interactive Glass Console */}
            <div className="pilot-hero-card animate-border-glow" style={{ textAlign: 'left' }}>
              
              {/* Header Bar */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '12px 20px',
                fontSize: 12,
                color: 'rgba(255, 255, 255, 0.65)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#ef4444' }} />
                  <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#f59e0b' }} />
                  <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#10b981' }} />
                  <span style={{ marginLeft: 6, color: 'rgba(255, 255, 255, 0.4)' }}>|</span>
                  <span style={{ fontWeight: 700, color: '#ffffff' }}>Espace d’Arbitrage Conventionnel & Financements</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '3px 10px',
                    borderRadius: 9999,
                    border: '1px solid rgba(190, 242, 100, 0.3)',
                    backgroundColor: 'rgba(190, 242, 100, 0.1)',
                    color: '#bef264',
                    fontSize: 11,
                    fontWeight: 700
                  }}>
                    <Zap size={12} />
                    Double Contrôle IA + Avocat
                  </span>
                </div>
              </div>

              {/* 4 Clickable Case Study Scenarios */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '14px 20px 0',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                overflowX: 'auto'
              }}>
                {heroDilemmas.map((d, idx) => (
                  <button
                    key={d.id}
                    onClick={() => setHeroDilemmaIndex(idx)}
                    style={{
                      padding: '8px 16px',
                      border: 'none',
                      background: 'transparent',
                      borderBottom: heroDilemmaIndex === idx ? '2px solid #bef264' : '2px solid transparent',
                      color: heroDilemmaIndex === idx ? '#bef264' : 'rgba(255, 255, 255, 0.65)',
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {d.badge}
                  </button>
                ))}
              </div>

              {/* Console Body: Dual View (Instant AI + Sceau Cabinet Maé) */}
              <div style={{ padding: '24px' }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
                  gap: 20
                }}>
                  
                  {/* Left Column: L'Analyse Immédiate IA */}
                  <div style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    borderRadius: 16,
                    padding: '20px',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                      <Bot size={18} style={{ color: '#bef264' }} />
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#bef264', textTransform: 'uppercase' }}>
                        Situation posée par l'employeur
                      </span>
                    </div>

                    <div style={{ fontSize: 14, fontWeight: 700, color: '#ffffff', lineHeight: 1.45, marginBottom: 16 }}>
                      « {currentDilemma.question} »
                    </div>

                    <div style={{
                      backgroundColor: 'rgba(0, 74, 173, 0.15)',
                      borderLeft: '3px solid #004AAD',
                      padding: '12px 14px',
                      borderRadius: '0 8px 8px 0',
                      marginBottom: 14
                    }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#7dd3fc', marginBottom: 2 }}>
                        Diagnostic juridique immédiat :
                      </div>
                      <div style={{ fontSize: 13, color: '#ffffff', lineHeight: 1.5 }}>
                        {currentDilemma.verdict}
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: 'rgba(255, 255, 255, 0.6)' }}>
                      <span>Réf : {currentDilemma.officialRef}</span>
                      <span style={{ color: '#6ee7b7', fontWeight: 700 }}>✓ {currentDilemma.risk}</span>
                    </div>
                  </div>

                  {/* Right Column: Le Sceau & Engagement Humain Cabinet Maé */}
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(10, 37, 64, 0.8) 0%, rgba(13, 22, 38, 0.95) 100%)',
                    borderRadius: 16,
                    padding: '20px',
                    border: '1.5px solid rgba(190, 242, 100, 0.35)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Award size={18} style={{ color: '#bef264' }} />
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#bef264', textTransform: 'uppercase' }}>
                            Garantie Contractuelle
                          </span>
                        </div>
                        <span style={{
                          backgroundColor: 'rgba(190, 242, 100, 0.2)',
                          color: '#bef264',
                          padding: '2px 8px',
                          borderRadius: 9999,
                          fontSize: 10,
                          fontWeight: 800
                        }}>
                          DÉLAI 48H
                        </span>
                      </div>

                      <div style={{ fontSize: 15, fontWeight: 700, color: '#ffffff', marginBottom: 6 }}>
                        Laetitia Badji &bull; Cabinet Maé
                      </div>
                      <div style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.65)', lineHeight: 1.5, marginBottom: 16 }}>
                        {currentDilemma.cabinetMaeAction}. Note d'analyse argumentée et opposable délivrée sous 48h ouvrées.
                      </div>
                    </div>

                    <div style={{
                      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                      paddingTop: 14,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 30, height: 30, borderRadius: '50%', overflow: 'hidden', border: '1.5px solid #bef264' }}>
                          <img src="/images/laetitia-badji.jpg" alt="Laetitia Badji" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div style={{ fontSize: 11, color: '#ffffff', fontWeight: 600 }}>
                          Avis juridique certifié
                        </div>
                      </div>

                      <button
                        onClick={() => setIsDemoModalOpen(true)}
                        className="pilot-glow-btn"
                        style={{ fontSize: 11, padding: '6px 14px' }}
                      >
                        Tester cette escalade &rarr;
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* =========================================================================
                THREE FLOATING ORBITING BADGES (Clearly Visible Fluid Motion)
                ========================================================================= */}
            {/* Orbiting Badge 1: Top Left */}
            <div
              className="animate-float hide-on-mobile"
              style={{
                position: 'absolute',
                top: '20%',
                left: -90,
                width: 270,
                zIndex: 25
              }}
            >
              <div className="pilot-glass-badge card-interactive-tilt" style={{ textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: '#6ee7b7' }}>
                  <Gavel size={14} />
                  <span>Contentieux prud'homal évité</span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#ffffff', marginTop: 6, lineHeight: 1.3 }}>
                  CCN 66 : Rappel congés trimestriels
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, fontSize: 11 }}>
                  <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Économie directe</span>
                  <span style={{ backgroundColor: 'rgba(52, 211, 153, 0.25)', color: '#6ee7b7', padding: '1px 8px', borderRadius: 4, fontWeight: 700 }}>
                    +12 400 €
                  </span>
                </div>
              </div>
            </div>

            {/* Orbiting Badge 2: Bottom Right */}
            <div
              className="animate-float-slow hide-on-mobile"
              style={{
                position: 'absolute',
                bottom: -30,
                right: -80,
                width: 260,
                zIndex: 25
              }}
            >
              <div className="pilot-glass-badge card-interactive-tilt" style={{ textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: '#38bdf8' }}>
                  <FileCheck2 size={14} />
                  <span>Contrôle CER sécurisé</span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#ffffff', marginTop: 4 }}>
                  Subvention Région &bull; Fonds Dédiés
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: '#bef264' }}>0 € de reversement</span>
                  <span style={{ fontSize: 11, color: '#a7f3d0' }}>Conforme ANC</span>
                </div>
              </div>
            </div>

            {/* Orbiting Badge 3: Bottom Left Pill */}
            <div
              className="animate-float-reverse hide-on-mobile"
              style={{
                position: 'absolute',
                bottom: -24,
                left: '12%',
                zIndex: 25
              }}
            >
              <div style={{
                borderRadius: 9999,
                border: '1px solid rgba(255, 255, 255, 0.25)',
                backgroundColor: 'rgba(10, 25, 47, 0.95)',
                padding: '10px 20px',
                backdropFilter: 'blur(16px)',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                fontSize: 12,
                color: '#ffffff',
                boxShadow: '0 12px 30px rgba(0, 0, 0, 0.6)'
              }}>
                <Award size={16} style={{ color: '#bef264' }} />
                <span><strong>Garantie Cabinet Maé :</strong> Note juridique argumentée sous 48h ouvrées</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Laser Light Divider */}
      <div className="laser-divider" />

      {/* =========================================================================
          TRANSITION TO LIGHT PAPER CONTAINER (Airy & Contrast-Rich)
          ========================================================================= */}
      <div style={{
        backgroundColor: '#ffffff',
        color: '#0A2540',
        borderTopLeftRadius: 'clamp(2rem, 5vw, 3rem)',
        borderTopRightRadius: 'clamp(2rem, 5vw, 3rem)',
        boxShadow: '0 -40px 80px -20px rgba(0, 0, 0, 0.7)',
        position: 'relative',
        zIndex: 20,
        backgroundImage: 'radial-gradient(rgba(11, 27, 51, 0.05) 1px, transparent 1px)',
        backgroundSize: '22px 22px'
      }}>

        {/* =========================================================================
            SECTION "LE CONSTAT" (LE VERTIGE DU DIRIGEANT ASSOCIATIF EMPLOYEUR)
            Completely original to AssoExpert IA - No PilotAsso verbatim copy!
            ========================================================================= */}
        <section id="constat" style={{
          padding: 'clamp(60px, 8vw, 110px) 24px',
          maxWidth: 1280,
          margin: '0 auto'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))',
            alignItems: 'center',
            gap: 'clamp(40px, 6vw, 80px)'
          }}>
            {/* Left Column: Constat Text */}
            <div>
              <span style={{
                fontFamily: 'monospace',
                fontSize: 12,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                color: '#004AAD',
                display: 'block',
                marginBottom: 16
              }}>
                La Réalité du Secteur
              </span>

              <h2 style={{
                fontSize: 'clamp(28px, 4vw, 44px)',
                fontWeight: 800,
                lineHeight: 1.15,
                letterSpacing: '-0.025em',
                color: '#0A2540',
                marginBottom: 20
              }}>
                Être employeur associatif ne devrait pas être une source permanente d’angoisse.
              </h2>

              <p style={{
                fontSize: 'clamp(15px, 1.6vw, 17px)',
                lineHeight: 1.65,
                color: 'rgba(10, 37, 64, 0.7)',
                letterSpacing: '-0.011em',
                marginBottom: 24
              }}>
                De 1 à 100 salariés, présidents bénévoles et directions salariées portent les mêmes responsabilités pénales et sociales qu'une entreprise commerciale, souvent sans directeur juridique ni DRH dédié.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 600, color: '#0A2540' }}>
                  <CheckCircle2 size={18} style={{ color: '#004AAD' }} />
                  <span>Déchiffrage immédiat de votre convention (CCN 66, 51, ÉCLAT, ALISFA)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 600, color: '#0A2540' }}>
                  <CheckCircle2 size={18} style={{ color: '#004AAD' }} />
                  <span>Sécurisation de la responsabilité civile et pénale du bureau bénévole</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 600, color: '#0A2540' }}>
                  <CheckCircle2 size={18} style={{ color: '#004AAD' }} />
                  <span>La signature d'un cabinet juridique reconnu (Cabinet Maé) sous 48h ouvrées</span>
                </div>
              </div>
            </div>

            {/* Right Column: Visualisation inspirée de l'Image 1 (Fichiers flottants sur grille & Tableau de bord unique) */}
            <div>
              <div className="dot-matrix-container">
                {/* Floating disorder badge */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 20
                }}>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: 'rgba(10, 37, 64, 0.55)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#ef4444' }} />
                    Fichiers dispersés & versions obsolètes
                  </span>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#dc2626',
                    backgroundColor: '#fee2e2',
                    padding: '2px 8px',
                    borderRadius: 9999
                  }}>
                    Risque juridique permanent
                  </span>
                </div>

                {/* Stack of Tilted Floating Document Cards (Inspired by Image 1) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, position: 'relative' }}>
                  <div
                    className="tilted-file-card"
                    style={{
                      animation: 'fileFloat1 4s ease-in-out infinite',
                      zIndex: 4,
                      marginLeft: '2%'
                    }}
                  >
                    <FileSpreadsheet size={18} style={{ color: '#16a34a', flexShrink: 0 }} />
                    <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      Budget_2026_v3_FINAL.xlsx
                    </span>
                    <span style={{ fontSize: 11, color: '#dc2626', fontWeight: 700, backgroundColor: '#fef2f2', padding: '2px 6px', borderRadius: 4 }}>
                      Non opposable
                    </span>
                  </div>

                  <div
                    className="tilted-file-card"
                    style={{
                      animation: 'fileFloat2 4.5s ease-in-out infinite',
                      zIndex: 3,
                      marginLeft: '8%'
                    }}
                  >
                    <FileSpreadsheet size={18} style={{ color: '#0284c7', flexShrink: 0 }} />
                    <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      Trésorerie_mensuelle.xlsx
                    </span>
                    <span style={{ fontSize: 11, color: '#f59e0b', fontWeight: 700, backgroundColor: '#fffbeb', padding: '2px 6px', borderRadius: 4 }}>
                      Écarts non justifiés
                    </span>
                  </div>

                  <div
                    className="tilted-file-card"
                    style={{
                      animation: 'fileFloat3 3.8s ease-in-out infinite',
                      zIndex: 2,
                      marginLeft: '1%'
                    }}
                  >
                    <FolderOpen size={18} style={{ color: '#f59e0b', flexShrink: 0 }} />
                    <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      Subventions (dossier partagé Drive)
                    </span>
                    <span style={{ fontSize: 11, color: '#dc2626', fontWeight: 700, backgroundColor: '#fef2f2', padding: '2px 6px', borderRadius: 4 }}>
                      Pièces manquantes
                    </span>
                  </div>

                  <div
                    className="tilted-file-card"
                    style={{
                      animation: 'fileFloat4 4.2s ease-in-out infinite',
                      zIndex: 1,
                      marginLeft: '6%'
                    }}
                  >
                    <FileText size={18} style={{ color: '#64748b', flexShrink: 0 }} />
                    <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      CR_Conseil_administration.docx
                    </span>
                    <span style={{ fontSize: 11, color: '#dc2626', fontWeight: 700, backgroundColor: '#fef2f2', padding: '2px 6px', borderRadius: 4 }}>
                      Quorum incertain
                    </span>
                  </div>
                </div>

                {/* Dark Floating Anchor Pill (Identique à l'Image 1) */}
                <div className="cockpit-anchor-pill">
                  <div style={{
                    width: 38,
                    height: 38,
                    borderRadius: 12,
                    backgroundColor: '#bef264',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: '0 0 15px rgba(190, 242, 100, 0.45)'
                  }}>
                    <ShieldCheck size={22} style={{ color: '#081a2f' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.01em' }}>
                      Un seul tableau de bord sécurisé
                    </div>
                    <div style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.72)', marginTop: 2 }}>
                      Toujours à jour, pour toute l'équipe & opposable avec le Cabinet Maé
                    </div>
                  </div>
                  <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#bef264', boxShadow: '0 0 8px #bef264' }} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#bef264' }}>Actif</span>
                  </div>
                </div>
              </div>

              {/* Bottom Reassurance micro-chips */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 10,
                marginTop: 14
              }}>
                <div style={{
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fee2e2',
                  borderRadius: 12,
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 12,
                  color: '#991b1b',
                  fontWeight: 600
                }}>
                  <AlertTriangle size={15} style={{ color: '#dc2626', flexShrink: 0 }} />
                  <span>Fini le risque prud’homal et les fichiers perdus</span>
                </div>
                <div style={{
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: 12,
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 12,
                  color: '#166534',
                  fontWeight: 600
                }}>
                  <CheckCircle2 size={15} style={{ color: '#16a34a', flexShrink: 0 }} />
                  <span>1 espace conforme + avis Cabinet Maé sous 48h</span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* =========================================================================
            SECTION LES 4 PILIERS D'EXPERTISE (Airy & High Contrast)
            ========================================================================= */}
        <section id="solutions" style={{
          padding: 'clamp(50px, 7vw, 100px) 24px',
          maxWidth: 1280,
          margin: '0 auto',
          borderTop: '1px solid rgba(10, 37, 64, 0.08)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <span style={{
              fontFamily: 'monospace',
              fontSize: 12,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              color: '#004AAD',
              display: 'block',
              marginBottom: 10
            }}>
              La Suite AssoExpert
            </span>

            <h2 style={{
              fontSize: 'clamp(28px, 4vw, 42px)',
              fontWeight: 800,
              lineHeight: 1.15,
              color: '#0A2540',
              letterSpacing: '-0.025em',
              marginBottom: 14
            }}>
              4 piliers d’expertise pour couvrir l’intégralité de vos obligations
            </h2>

            <p style={{
              fontSize: 'clamp(15px, 1.6vw, 17px)',
              color: 'rgba(10, 37, 64, 0.7)',
              maxWidth: 720,
              margin: '0 auto 30px',
              lineHeight: 1.6
            }}>
              Sélectionnez un pilier pour découvrir comment la plateforme automatise votre gestion et sécurise vos décisions au quotidien.
            </p>

            {/* Solution Pill Tabs with Icons */}
            <div className="pilot-tabs-nav" style={{ justifyContent: 'center' }}>
              {solutions.map((s) => {
                const getIcon = () => {
                  switch (s.id) {
                    case 'rh': return <Users size={16} />;
                    case 'finance': return <PieChart size={16} />;
                    case 'subventions': return <TrendingUp size={16} />;
                    case 'gouvernance': return <Scale size={16} />;
                    default: return <Sparkles size={16} />;
                  }
                };
                return (
                  <button
                    key={s.id}
                    onClick={() => {
                      if (activeSolutionTab !== s.id) {
                        setIsPillarScanning(true);
                        setActiveSolutionTab(s.id);
                        setTimeout(() => setIsPillarScanning(false), 450);
                      }
                    }}
                    className={`pilot-tab-pill ${activeSolutionTab === s.id ? 'active' : ''}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      fontWeight: 700
                    }}
                  >
                    {getIcon()}
                    <span>{s.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Solution Showcase Card */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: 24,
            border: '1.5px solid rgba(10, 37, 64, 0.08)',
            padding: 'clamp(24px, 5vw, 44px)',
            boxShadow: '0 20px 50px -15px rgba(10, 37, 64, 0.08)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Animated Laser Scanning Beam on Tab Change */}
            {isPillarScanning && <div className="scan-laser-active" />}

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
              gap: 'clamp(24px, 5vw, 48px)',
              alignItems: 'center'
            }}>
              {/* Left Column: Description & Bullets */}
              <div>
                <span style={{
                  display: 'inline-block',
                  backgroundColor: 'rgba(190, 242, 100, 0.25)',
                  color: '#1b5400',
                  fontWeight: 700,
                  fontSize: 11,
                  padding: '3px 10px',
                  borderRadius: 9999,
                  marginBottom: 12
                }}>
                  {currentSolution.badge}
                </span>

                <h3 style={{
                  fontSize: 'clamp(22px, 3vw, 28px)',
                  fontWeight: 800,
                  color: '#0A2540',
                  lineHeight: 1.25,
                  letterSpacing: '-0.02em',
                  marginBottom: 12
                }}>
                  {currentSolution.subtitle}
                </h3>

                <p style={{
                  fontSize: 15,
                  lineHeight: 1.6,
                  color: 'rgba(10, 37, 64, 0.7)',
                  marginBottom: 24
                }}>
                  {currentSolution.description}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
                  {currentSolution.bullets.map((b, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: '#0A2540' }}>
                      <CheckCircle2 size={18} style={{ color: '#004AAD', flexShrink: 0, marginTop: 2 }} />
                      <span style={{ fontWeight: 500 }}>{b}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setIsDemoModalOpen(true)}
                  className="pilot-primary-btn"
                  style={{ fontSize: 14, padding: '10px 22px' }}
                >
                  <span>Demander une démo de ce pilier</span>
                  <ArrowRight size={15} />
                </button>
              </div>

              {/* Right Column: Live High-Tech Interactive Simulator Cockpit */}
              <div style={{
                borderRadius: 20,
                backgroundColor: '#f8fafc',
                border: '1.5px solid rgba(10, 37, 64, 0.1)',
                padding: 'clamp(20px, 3vw, 28px)',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                boxShadow: '0 15px 35px -10px rgba(10, 37, 64, 0.06)',
                position: 'relative'
              }}>
                {/* Header Status Bar */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px solid rgba(10, 37, 64, 0.08)',
                  paddingBottom: 12
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="live-dot" />
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#0A2540', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Sécurisation en direct
                    </span>
                  </div>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#004AAD',
                    backgroundColor: 'rgba(0, 74, 173, 0.08)',
                    padding: '2px 8px',
                    borderRadius: 9999
                  }}>
                    Temps de réponse IA : &lt; 0.8s
                  </span>
                </div>

                {/* Specific High-Pep Content per Pillar */}
                {activeSolutionTab === 'rh' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: 800, color: '#0A2540' }}>
                        Simulateur de convention en temps réel :
                      </span>
                    </div>

                    {/* Interactive CCN Switcher Pills */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {['CCN 66', 'CCN 51 (FEHAP)', 'ÉCLAT (Animation)', 'ALISFA'].map((ccnName) => (
                        <button
                          key={ccnName}
                          onClick={() => setPillarCcn(ccnName)}
                          style={{
                            padding: '5px 12px',
                            borderRadius: 9999,
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: 'pointer',
                            backgroundColor: pillarCcn === ccnName ? '#004AAD' : '#ffffff',
                            color: pillarCcn === ccnName ? '#ffffff' : '#0A2540',
                            border: pillarCcn === ccnName ? '1px solid #004AAD' : '1px solid rgba(10, 37, 64, 0.15)',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {ccnName}
                        </button>
                      ))}
                    </div>

                    {/* Dynamic Metrics according to selected CCN */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <div className="cockpit-kpi-box">
                        <div style={{ fontSize: 11, color: 'rgba(10, 37, 64, 0.55)', fontWeight: 600 }}>Convention active</div>
                        <div style={{ fontSize: 15, fontWeight: 800, color: '#004AAD', marginTop: 3 }}>
                          {pillarCcn}
                        </div>
                      </div>
                      <div className="cockpit-kpi-box">
                        <div style={{ fontSize: 11, color: 'rgba(10, 37, 64, 0.55)', fontWeight: 600 }}>Risque contentieux</div>
                        <div style={{ fontSize: 15, fontWeight: 800, color: '#16a34a', marginTop: 3, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <CheckCircle2 size={16} /> 0 litige garanti
                        </div>
                      </div>
                    </div>

                    {/* Active Analysis Result Box */}
                    <div style={{
                      backgroundColor: '#ffffff',
                      borderRadius: 14,
                      padding: '16px',
                      border: '1px solid rgba(0, 74, 173, 0.15)',
                      boxShadow: '0 4px 15px rgba(0, 74, 173, 0.04)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: '#004AAD', fontSize: 13, marginBottom: 6 }}>
                        <Sparkles size={15} />
                        <span>Contrôle conventionnel automatique :</span>
                      </div>
                      <p style={{ fontSize: 13, color: '#0A2540', lineHeight: 1.55, margin: 0 }}>
                        {pillarCcn === 'CCN 66' && "14 éducateurs sous Annexe 3 : 18 jours de congés trimestriels automatiquement calculés et intégrés aux plannings annuels. Majorations d'ancienneté Art. 22 appliquées."}
                        {pillarCcn === 'CCN 51 (FEHAP)' && "Prime décentralisée de 5% semestrielle calculée. Protocole de rupture conventionnelle conforme au barème d'indemnisation FEHAP."}
                        {pillarCcn === 'ÉCLAT (Animation)' && "Points d'ancienneté Art. 1.2 calculés automatiquement. Grille indiciaire et modulation du temps de travail des animateurs 100% sécurisées."}
                        {pillarCcn === 'ALISFA' && "Pesée des fonctions selon le référentiel national. Fiches de postes, critères classants et points pesés validés sans risque de requalification."}
                      </p>
                    </div>

                    {/* Certified Seal from Cabinet Maé */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: 'rgba(0, 74, 173, 0.05)',
                      borderRadius: 10,
                      padding: '8px 12px',
                      border: '1px solid rgba(0, 74, 173, 0.12)',
                      fontSize: 12
                    }}>
                      <span style={{ fontWeight: 600, color: '#0A2540' }}>Opposabilité juridique :</span>
                      <span style={{ fontWeight: 700, color: '#004AAD', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <ShieldCheck size={14} style={{ color: '#16a34a' }} /> Avis signé Cabinet Maé (48h)
                      </span>
                    </div>
                  </div>
                )}

                {activeSolutionTab === 'finance' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#0A2540' }}>
                      Arbitrage Budgétaire & Compte d'Emploi des Ressources (CER)
                    </div>

                    {/* Progress Bar of Subvention Consumption */}
                    <div style={{ backgroundColor: '#ffffff', borderRadius: 14, padding: '16px', border: '1px solid rgba(10, 37, 64, 0.08)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
                        <span style={{ color: '#0A2540' }}>Subvention 2026 : 50 000 €</span>
                        <span style={{ color: '#16a34a' }}>Consommé : 71% (35 500 €)</span>
                      </div>
                      <div style={{ width: '100%', height: 10, backgroundColor: '#f1f5f9', borderRadius: 9999, overflow: 'hidden' }}>
                        <div style={{ width: '71%', height: '100%', backgroundColor: '#004AAD', borderRadius: 9999 }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(10, 37, 64, 0.6)', marginTop: 6 }}>
                        <span>Dépenses éligibles justifiées</span>
                        <span style={{ fontWeight: 700, color: '#0284c7' }}>Reliquat sécurisé : 14 500 €</span>
                      </div>
                    </div>

                    {/* Fonds Dédiés Protected Card */}
                    <div style={{
                      backgroundColor: 'rgba(190, 242, 100, 0.18)',
                      border: '1.5px solid rgba(190, 242, 100, 0.45)',
                      borderRadius: 14,
                      padding: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12
                    }}>
                      <div style={{
                        width: 34,
                        height: 34,
                        borderRadius: 10,
                        backgroundColor: '#1b5400',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <Check size={18} />
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: '#1b5400' }}>
                          Fonds Dédiés (compte 194) approuvés
                        </div>
                        <div style={{ fontSize: 12, color: '#14532d', marginTop: 2 }}>
                          Reliquat reporté sans ordre de reversement • Conforme Règlement ANC 2018-06
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <div className="cockpit-kpi-box">
                        <div style={{ fontSize: 11, color: 'rgba(10, 37, 64, 0.55)' }}>Reversement exigible</div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: '#16a34a', marginTop: 3 }}>0 €</div>
                      </div>
                      <div className="cockpit-kpi-box">
                        <div style={{ fontSize: 11, color: 'rgba(10, 37, 64, 0.55)' }}>Contrôle CER</div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: '#004AAD', marginTop: 3 }}>100% Conforme</div>
                      </div>
                    </div>
                  </div>
                )}

                {activeSolutionTab === 'subventions' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#0A2540' }}>
                      Radar de Détection des Financements 2026
                    </div>

                    {/* Match 1 */}
                    <div style={{
                      backgroundColor: '#ffffff',
                      borderRadius: 14,
                      padding: '14px 16px',
                      border: '1px solid rgba(10, 37, 64, 0.08)',
                      boxShadow: '0 4px 12px rgba(10, 37, 64, 0.03)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#0A2540' }}>
                          FDVA 2026 (Fonctionnement & Innovation)
                        </span>
                        <span style={{ fontSize: 12, fontWeight: 800, color: '#16a34a', backgroundColor: '#f0fdf4', padding: '2px 8px', borderRadius: 6 }}>
                          96% match
                        </span>
                      </div>
                      <div style={{ width: '100%', height: 6, backgroundColor: '#f1f5f9', borderRadius: 9999, overflow: 'hidden' }}>
                        <div style={{ width: '96%', height: '100%', backgroundColor: '#16a34a', borderRadius: 9999 }} />
                      </div>
                      <div style={{ fontSize: 11, color: 'rgba(10, 37, 64, 0.6)', marginTop: 6 }}>
                        Critères d'éligibilité RH & gouvernance validés • Dépôt recommandé avant J-21
                      </div>
                    </div>

                    {/* Match 2 */}
                    <div style={{
                      backgroundColor: '#ffffff',
                      borderRadius: 14,
                      padding: '14px 16px',
                      border: '1px solid rgba(10, 37, 64, 0.08)',
                      boxShadow: '0 4px 12px rgba(10, 37, 64, 0.03)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#0A2540' }}>
                          Conseil Régional (Soutien à l'emploi associatif)
                        </span>
                        <span style={{ fontSize: 12, fontWeight: 800, color: '#004AAD', backgroundColor: '#eff6ff', padding: '2px 8px', borderRadius: 6 }}>
                          89% match
                        </span>
                      </div>
                      <div style={{ width: '100%', height: 6, backgroundColor: '#f1f5f9', borderRadius: 9999, overflow: 'hidden' }}>
                        <div style={{ width: '89%', height: '100%', backgroundColor: '#004AAD', borderRadius: 9999 }} />
                      </div>
                      <div style={{ fontSize: 11, color: 'rgba(10, 37, 64, 0.6)', marginTop: 6 }}>
                        Subvention pluriannuelle d'objectifs (3 ans) • Bilan financier CER pré-rempli
                      </div>
                    </div>

                    <div style={{
                      backgroundColor: 'rgba(0, 74, 173, 0.05)',
                      borderRadius: 12,
                      padding: '10px 14px',
                      fontSize: 12,
                      color: '#0A2540',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8
                    }}>
                      <Sparkles size={16} style={{ color: '#004AAD', flexShrink: 0 }} />
                      <span>Argumentaire & bilan d'action générés automatiquement au format Cerfa officiel.</span>
                    </div>
                  </div>
                )}

                {activeSolutionTab === 'gouvernance' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#0A2540' }}>
                      Contrôle des Instances & Responsabilité Loi 1901
                    </div>

                    {/* Quorum Progress Bar */}
                    <div style={{ backgroundColor: '#ffffff', borderRadius: 14, padding: '16px', border: '1px solid rgba(10, 37, 64, 0.08)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
                        <span style={{ color: '#0A2540' }}>Quorum Assemblée Générale</span>
                        <span style={{ color: '#16a34a' }}>68% atteint (Seuil : 50%)</span>
                      </div>
                      <div style={{ width: '100%', height: 10, backgroundColor: '#f1f5f9', borderRadius: 9999, overflow: 'hidden' }}>
                        <div style={{ width: '68%', height: '100%', backgroundColor: '#16a34a', borderRadius: 9999 }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(10, 37, 64, 0.6)', marginTop: 6 }}>
                        <span>Présents physiques : 42 adhérents</span>
                        <span>14 procurations conformes</span>
                      </div>
                    </div>

                    {/* Mandats Verified Card */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <div className="cockpit-kpi-box">
                        <div style={{ fontSize: 11, color: 'rgba(10, 37, 64, 0.55)' }}>Audit des pouvoirs</div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: '#004AAD', marginTop: 3 }}>
                          Max 2 mandats / adh.
                        </div>
                        <div style={{ fontSize: 10, color: '#16a34a', fontWeight: 700, marginTop: 2 }}>✓ Respecté</div>
                      </div>
                      <div className="cockpit-kpi-box">
                        <div style={{ fontSize: 11, color: 'rgba(10, 37, 64, 0.55)' }}>Validité du vote</div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: '#16a34a', marginTop: 3 }}>
                          100% Inattaquable
                        </div>
                        <div style={{ fontSize: 10, color: 'rgba(10, 37, 64, 0.6)', marginTop: 2 }}>PV conforme Loi 1901</div>
                      </div>
                    </div>

                    <div style={{
                      backgroundColor: '#f0fdf4',
                      border: '1px solid #bbf7d0',
                      borderRadius: 12,
                      padding: '10px 14px',
                      fontSize: 12,
                      color: '#166534',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8
                    }}>
                      <ShieldCheck size={18} style={{ color: '#16a34a', flexShrink: 0 }} />
                      <span>Responsabilité civile & pénale du Président et du Trésorier sécurisée.</span>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION SIMULATEUR DE GAINS & ROI EN DIRECT
            ========================================================================= */}
        <section id="simulateur" style={{
          padding: 'clamp(50px, 7vw, 100px) 24px',
          maxWidth: 1280,
          margin: '0 auto',
          borderTop: '1px solid rgba(10, 37, 64, 0.08)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <span style={{
              display: 'inline-block',
              backgroundColor: 'rgba(190, 242, 100, 0.25)',
              color: '#1b5400',
              fontWeight: 700,
              fontSize: 11,
              padding: '3px 12px',
              borderRadius: 9999,
              marginBottom: 10
            }}>
              Simulateur interactif
            </span>

            <h2 style={{
              fontSize: 'clamp(28px, 4vw, 40px)',
              fontWeight: 800,
              color: '#0A2540',
              letterSpacing: '-0.025em',
              marginBottom: 14
            }}>
              Estimez le gain de temps pour votre équipe
            </h2>

            <p style={{
              fontSize: 'clamp(15px, 1.6vw, 17px)',
              color: 'rgba(10, 37, 64, 0.7)',
              maxWidth: 640,
              margin: '0 auto'
            }}>
              Ajustez l’effectif de votre structure et visualisez immédiatement les heures administratives récupérées chaque mois.
            </p>
          </div>

          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: 24,
            border: '1.5px solid rgba(0, 74, 173, 0.15)',
            padding: 'clamp(24px, 5vw, 40px)',
            boxShadow: '0 20px 50px -15px rgba(10, 37, 64, 0.08)'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
              gap: 'clamp(24px, 5vw, 44px)',
              alignItems: 'center'
            }}>
              {/* Slider Controls */}
              <div>
                <div style={{ marginBottom: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <label style={{ fontSize: 14, fontWeight: 700, color: '#0A2540' }}>
                      Taille de l'équipe salariée :
                    </label>
                    <span style={{
                      backgroundColor: '#004AAD',
                      color: '#ffffff',
                      padding: '4px 14px',
                      borderRadius: 9999,
                      fontWeight: 700,
                      fontSize: 14
                    }}>
                      {employeeCount} salariés
                    </span>
                  </div>

                  <input
                    type="range"
                    min="1"
                    max="80"
                    value={employeeCount}
                    onChange={(e) => setEmployeeCount(parseInt(e.target.value, 10))}
                    style={{
                      width: '100%',
                      accentColor: '#004AAD',
                      cursor: 'pointer',
                      height: 8
                    }}
                  />

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(10, 37, 64, 0.5)', marginTop: 6 }}>
                    <span>1 salarié</span>
                    <span>40 salariés</span>
                    <span>80 salariés</span>
                  </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 13, fontWeight: 700, color: '#0A2540', display: 'block', marginBottom: 8 }}>
                    Convention collective applicable :
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {['CCN 66', 'CCN 51 (FEHAP)', 'ÉCLAT (Animation)', 'ALISFA'].map(ccn => (
                      <button
                        key={ccn}
                        onClick={() => setSelectedCcn(ccn)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: 9999,
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                          backgroundColor: selectedCcn === ccn ? '#0A2540' : '#ffffff',
                          color: selectedCcn === ccn ? '#ffffff' : '#0A2540',
                          border: '1px solid rgba(10, 37, 64, 0.15)',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {ccn}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ fontSize: 12, color: 'rgba(10, 37, 64, 0.55)', lineHeight: 1.5 }}>
                  Calculs basés sur le temps moyen de veille conventionnelle, de vérification des bulletins et de montage des dossiers CER observé sur notre panel d'associations employeuses.
                </div>
              </div>

              {/* Dynamic Results Card */}
              <div style={{
                borderRadius: 18,
                backgroundColor: '#f8fafc',
                border: '1px solid rgba(10, 37, 64, 0.08)',
                padding: '28px',
                textAlign: 'left'
              }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#004AAD', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 14 }}>
                  Résultat estimé pour votre association :
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
                  <div style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: 14, border: '1px solid rgba(10, 37, 64, 0.08)' }}>
                    <div style={{ fontSize: 32, fontWeight: 700, color: '#004AAD', letterSpacing: '-0.02em' }}>
                      +{hoursSaved}h
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#0A2540', marginTop: 2 }}>
                      gagnées / mois
                    </div>
                    <div style={{ fontSize: 11, color: 'rgba(10, 37, 64, 0.55)', marginTop: 2 }}>
                      Moins de recherches et calculs
                    </div>
                  </div>

                  <div style={{ backgroundColor: 'rgba(190, 242, 100, 0.2)', padding: '16px', borderRadius: 14, border: '1px solid rgba(190, 242, 100, 0.4)' }}>
                    <div style={{ fontSize: 32, fontWeight: 700, color: '#1b5400', letterSpacing: '-0.02em' }}>
                      {moneySaved} €
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#0A2540', marginTop: 2 }}>
                      économisés / mois
                    </div>
                    <div style={{ fontSize: 11, color: 'rgba(10, 37, 64, 0.55)', marginTop: 2 }}>
                      Temps administratif libéré
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid rgba(10, 37, 64, 0.08)', paddingTop: 14, marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: 'rgba(10, 37, 64, 0.55)' }}>Formule conseillée :</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0A2540', marginTop: 2 }}>
                    {recommendedPlanName}
                  </div>
                </div>

                <button
                  onClick={() => setIsDemoModalOpen(true)}
                  className="pilot-primary-btn"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <span>Valider cette simulation en démo (30 min)</span>
                  <ArrowRight size={15} />
                </button>
              </div>

            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION CAS PRATIQUES & DÉMONSTRATION EN DIRECT
            ========================================================================= */}
        <section id="cas-pratiques" style={{
          padding: 'clamp(50px, 7vw, 100px) 24px',
          maxWidth: 1280,
          margin: '0 auto',
          borderTop: '1px solid rgba(10, 37, 64, 0.08)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <span style={{
              display: 'inline-block',
              backgroundColor: 'rgba(0, 74, 173, 0.08)',
              color: '#004AAD',
              fontWeight: 700,
              fontSize: 11,
              padding: '3px 12px',
              borderRadius: 9999,
              marginBottom: 10
            }}>
              Cas concrets de terrain
            </span>

            <h2 style={{
              fontSize: 'clamp(28px, 4vw, 40px)',
              fontWeight: 800,
              color: '#0A2540',
              letterSpacing: '-0.025em',
              marginBottom: 12
            }}>
              Testez l’analyse sur une situation réelle
            </h2>

            <p style={{
              fontSize: 'clamp(15px, 1.6vw, 17px)',
              color: 'rgba(10, 37, 64, 0.7)',
              maxWidth: 640,
              margin: '0 auto 28px'
            }}>
              Sélectionnez l’un des 4 cas ci-dessous pour voir la structuration de réponse et l'appui juridique garanti par le Cabinet Maé.
            </p>

            {/* Dynamic Clickable Scenario Pills with Outcome Badges */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
              {sampleQueries.map((q) => {
                const isActive = activeQueryIndex === q.id;
                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      if (activeQueryIndex !== q.id) {
                        setIsQueryScanning(true);
                        setActiveQueryIndex(q.id);
                        setTimeout(() => setIsQueryScanning(false), 450);
                      }
                    }}
                    className={`scenario-nav-btn ${isActive ? 'active' : ''}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 10
                    }}
                  >
                    <span>{q.title}</span>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: 9999,
                      backgroundColor: isActive ? 'rgba(255, 255, 255, 0.22)' : 'rgba(0, 74, 173, 0.08)',
                      color: isActive ? '#ffffff' : '#004AAD'
                    }}>
                      {q.outcomeBadge}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* AI Response Card - High-Pep Interactive Console */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: 24,
            border: '1.5px solid rgba(0, 74, 173, 0.15)',
            padding: 'clamp(24px, 4vw, 36px)',
            boxShadow: '0 20px 50px -15px rgba(10, 37, 64, 0.1)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Animated Laser Scanning Beam on Query Change */}
            {isQueryScanning && <div className="scan-laser-active" />}

            {/* Console Header Bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 14,
              borderBottom: '1.5px solid rgba(10, 37, 64, 0.08)',
              paddingBottom: 18,
              marginBottom: 22
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <span style={{
                  backgroundColor: '#0A2540',
                  color: '#ffffff',
                  padding: '4px 10px',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}>
                  <Gavel size={14} style={{ color: '#bef264' }} />
                  {currentQuery.tag}
                </span>
                <span style={{ fontSize: 'clamp(15px, 2vw, 17px)', fontWeight: 800, color: '#0A2540' }}>
                  « {currentQuery.question} »
                </span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#16a34a',
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  padding: '4px 10px',
                  borderRadius: 9999,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#16a34a' }} />
                  Arbitrage IA validé (&lt; 0.8s)
                </span>
              </div>
            </div>

            {/* Control Bar: Status indicator & Manual Pause / View Toggle */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
              flexWrap: 'wrap',
              gap: 12
            }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 14px',
                borderRadius: 9999,
                fontSize: 13,
                fontWeight: 700,
                backgroundColor: hoveredMarqueeStep !== null || isMarqueePausedManual ? '#f0fdf4' : '#eff6ff',
                border: hoveredMarqueeStep !== null || isMarqueePausedManual ? '1px solid #bbf7d0' : '1px solid #bfdbfe',
                color: hoveredMarqueeStep !== null || isMarqueePausedManual ? '#166534' : '#004AAD',
                transition: 'all 0.25s ease'
              }}>
                <span style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: hoveredMarqueeStep !== null || isMarqueePausedManual ? '#16a34a' : '#004AAD',
                  boxShadow: hoveredMarqueeStep !== null || isMarqueePausedManual ? '0 0 8px #16a34a' : '0 0 8px #004AAD'
                }} />
                <span>
                  {hoveredMarqueeStep !== null
                    ? `⏸ Défilement stoppé net sur l'étape 0${hoveredMarqueeStep + 1} — Retirez la souris pour reprendre`
                    : isMarqueePausedManual
                    ? '⏸ Défilement en pause manuelle'
                    : '● Défilement continu actif — Placez la souris sur une étape pour la stopper net et lire son contenu'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  onClick={() => setIsMarqueePausedManual(!isMarqueePausedManual)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 12px',
                    borderRadius: 9999,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    backgroundColor: isMarqueePausedManual ? '#0A2540' : '#ffffff',
                    color: isMarqueePausedManual ? '#ffffff' : '#0A2540',
                    border: '1px solid rgba(10, 37, 64, 0.15)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {isMarqueePausedManual ? <Play size={13} /> : <Pause size={13} />}
                  <span>{isMarqueePausedManual ? 'Relancer' : 'Pause'}</span>
                </button>

                <button
                  onClick={() => setCaseViewMode(caseViewMode === 'marquee' ? 'accordion' : 'marquee')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 12px',
                    borderRadius: 9999,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    backgroundColor: '#ffffff',
                    color: '#004AAD',
                    border: '1px solid rgba(0, 74, 173, 0.2)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span>{caseViewMode === 'marquee' ? 'Vue Accordéon' : 'Vue Défilante'}</span>
                </button>
              </div>
            </div>

            {/* MODE 1: CONTINUOUS SCROLLING MARQUEE (Default - Hover to Stop & Pop Out) */}
            {caseViewMode === 'marquee' ? (
              <div className="case-marquee-container">
                <div className={`case-marquee-track ${isMarqueePausedManual ? 'paused' : ''}`}>
                  {[0, 1, 2, 3, 4, 0, 1, 2, 3, 4].map((stepIdx, trackIndex) => {
                    if (stepIdx === 0) {
                      return (
                        <div
                          key={`marquee-step-0-${trackIndex}`}
                          className="case-marquee-card"
                          onMouseEnter={() => setHoveredMarqueeStep(0)}
                          onMouseLeave={() => setHoveredMarqueeStep(null)}
                        >
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span className="step-num-badge">01</span>
                                <Sparkles size={18} style={{ color: '#004AAD' }} />
                              </div>
                              <span style={{ fontSize: 11, fontWeight: 700, color: '#004AAD', backgroundColor: 'rgba(0, 74, 173, 0.08)', padding: '2px 8px', borderRadius: 9999 }}>
                                Synthèse Directe
                              </span>
                            </div>

                            <h4 style={{ fontSize: 18, fontWeight: 800, color: '#0A2540', marginBottom: 12, lineHeight: 1.25 }}>
                              Synthèse Directe & Arbitrage Immédiat
                            </h4>

                            <div style={{
                              backgroundColor: '#f8fafc',
                              padding: '14px',
                              borderRadius: 12,
                              borderLeft: '4px solid #004AAD',
                              fontSize: 13,
                              lineHeight: 1.55,
                              color: '#0A2540',
                              fontWeight: 500
                            }}>
                              {currentQuery.response.synthese}
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 14, borderTop: '1px solid rgba(10, 37, 64, 0.08)', marginTop: 14 }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: '#16a34a', display: 'flex', alignItems: 'center', gap: 4 }}>
                              <CheckCircle2 size={13} /> Arbitrage opposable
                            </span>
                            <span style={{ fontSize: 11, color: 'rgba(10, 37, 64, 0.5)' }}>100% conforme</span>
                          </div>
                        </div>
                      );
                    }

                    if (stepIdx === 1) {
                      return (
                        <div
                          key={`marquee-step-1-${trackIndex}`}
                          className="case-marquee-card"
                          onMouseEnter={() => setHoveredMarqueeStep(1)}
                          onMouseLeave={() => setHoveredMarqueeStep(null)}
                        >
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span className="step-num-badge">02</span>
                                <Scale size={18} style={{ color: '#004AAD' }} />
                              </div>
                              <span style={{ fontSize: 11, fontWeight: 700, color: '#004AAD', backgroundColor: 'rgba(0, 74, 173, 0.08)', padding: '2px 8px', borderRadius: 9999 }}>
                                Sources Officielles
                              </span>
                            </div>

                            <h4 style={{ fontSize: 18, fontWeight: 800, color: '#0A2540', marginBottom: 12, lineHeight: 1.25 }}>
                              Fondements Juridiques & Lois
                            </h4>

                            <div style={{ fontSize: 12, color: 'rgba(10, 37, 64, 0.65)', marginBottom: 10, fontWeight: 600 }}>
                              Articles du Code du travail & CCN consolidés :
                            </div>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                              {currentQuery.response.refChips.map((chip, i) => (
                                <span key={i} className="case-ref-chip" style={{ fontSize: 12, padding: '4px 10px', backgroundColor: '#f1f5f9' }}>
                                  <BadgeCheck size={14} style={{ color: '#16a34a' }} />
                                  <span>{chip}</span>
                                </span>
                              ))}
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 14, borderTop: '1px solid rgba(10, 37, 64, 0.08)', marginTop: 14 }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: '#004AAD' }}>Veille conventionnelle active</span>
                            <span style={{ fontSize: 11, color: 'rgba(10, 37, 64, 0.5)' }}>Jurisprudence à jour</span>
                          </div>
                        </div>
                      );
                    }

                    if (stepIdx === 2) {
                      return (
                        <div
                          key={`marquee-step-2-${trackIndex}`}
                          className="case-marquee-card"
                          onMouseEnter={() => setHoveredMarqueeStep(2)}
                          onMouseLeave={() => setHoveredMarqueeStep(null)}
                        >
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span className="step-num-badge">03</span>
                                <TrendingUp size={18} style={{ color: '#16a34a' }} />
                              </div>
                              <span style={{ fontSize: 11, fontWeight: 700, color: '#16a34a', backgroundColor: '#f0fdf4', padding: '2px 8px', borderRadius: 9999 }}>
                                Chiffrage Opposable
                              </span>
                            </div>

                            <h4 style={{ fontSize: 18, fontWeight: 800, color: '#0A2540', marginBottom: 12, lineHeight: 1.25 }}>
                              Calcul & Chiffrage Financier / RH
                            </h4>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginBottom: 10 }}>
                              {currentQuery.response.calculFormula?.map((f, i) => (
                                <div
                                  key={i}
                                  style={{
                                    padding: '6px 10px',
                                    borderRadius: 8,
                                    backgroundColor: f.highlight ? '#f0fdf4' : '#f8fafc',
                                    border: f.highlight ? '1.5px solid #86efac' : '1px solid #e2e8f0',
                                    display: 'flex',
                                    flexDirection: 'column'
                                  }}
                                >
                                  <span style={{ fontSize: 10, color: 'rgba(10, 37, 64, 0.6)', fontWeight: 600 }}>{f.label}</span>
                                  <span style={{ fontSize: 13, fontWeight: 800, color: f.highlight ? '#15803d' : '#0A2540' }}>{f.val}</span>
                                </div>
                              ))}
                            </div>

                            <div style={{ fontSize: 12, color: 'rgba(10, 37, 64, 0.7)', lineHeight: 1.45 }}>
                              {currentQuery.response.calcul}
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 14, borderTop: '1px solid rgba(10, 37, 64, 0.08)', marginTop: 14 }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: '#16a34a' }}>0 € d'erreur de paie</span>
                            <span style={{ fontSize: 11, color: 'rgba(10, 37, 64, 0.5)' }}>Calcul audité</span>
                          </div>
                        </div>
                      );
                    }

                    if (stepIdx === 3) {
                      return (
                        <div
                          key={`marquee-step-3-${trackIndex}`}
                          className="case-marquee-card"
                          onMouseEnter={() => setHoveredMarqueeStep(3)}
                          onMouseLeave={() => setHoveredMarqueeStep(null)}
                        >
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span className="step-num-badge">04</span>
                                <AlertTriangle size={18} style={{ color: '#d97706' }} />
                              </div>
                              <span style={{ fontSize: 11, fontWeight: 700, color: '#b45309', backgroundColor: '#fffbeb', padding: '2px 8px', borderRadius: 9999 }}>
                                Alerte Employeur
                              </span>
                            </div>

                            <h4 style={{ fontSize: 18, fontWeight: 800, color: '#0A2540', marginBottom: 12, lineHeight: 1.25 }}>
                              Point de Vigilance & Risque Neutralisé
                            </h4>

                            <div style={{
                              backgroundColor: '#fffbeb',
                              padding: '14px',
                              borderRadius: 12,
                              borderLeft: '4px solid #f59e0b',
                              color: '#92400e',
                              fontSize: 13,
                              lineHeight: 1.55,
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: 10
                            }}>
                              <div className="pulsing-alert-icon" style={{ flexShrink: 0, marginTop: 1 }}>
                                <AlertTriangle size={16} style={{ color: '#d97706' }} />
                              </div>
                              <div>
                                <strong style={{ display: 'block', marginBottom: 2 }}>Obligation stricte :</strong>
                                {currentQuery.response.vigilance}
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 14, borderTop: '1px solid rgba(10, 37, 64, 0.08)', marginTop: 14 }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: '#d97706' }}>Risque prud'homal évité</span>
                            <span style={{ fontSize: 11, color: 'rgba(10, 37, 64, 0.5)' }}>Responsabilité bénévole</span>
                          </div>
                        </div>
                      );
                    }

                    // Step 4: Cabinet Maé
                    return (
                      <div
                        key={`marquee-step-4-${trackIndex}`}
                        className="case-marquee-card special-mae"
                        onMouseEnter={() => setHoveredMarqueeStep(4)}
                        onMouseLeave={() => setHoveredMarqueeStep(null)}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span className="step-num-badge" style={{ backgroundColor: 'rgba(190, 242, 100, 0.2)', color: '#bef264' }}>05</span>
                              <Award size={20} style={{ color: '#bef264' }} />
                            </div>
                            <span style={{ fontSize: 11, fontWeight: 700, color: '#bef264', backgroundColor: 'rgba(190, 242, 100, 0.18)', padding: '2px 8px', borderRadius: 9999 }}>
                              Garantie 48h
                            </span>
                          </div>

                          <h4 style={{ fontSize: 18, fontWeight: 800, color: '#ffffff', marginBottom: 8, lineHeight: 1.25 }}>
                            Garantie Opposable Cabinet Maé
                          </h4>

                          <div style={{ fontSize: 12, fontWeight: 700, color: '#bef264', marginBottom: 6 }}>
                            Me Laetitia Badji • Avocate au Barreau
                          </div>

                          <p style={{ fontSize: 13, color: 'rgba(255, 255, 255, 0.88)', lineHeight: 1.45, margin: 0, marginBottom: 12 }}>
                            {currentQuery.response.experte}
                          </p>

                          <div className="btn-shimmer-wrap">
                            <button
                              onClick={() => setIsDemoModalOpen(true)}
                              className="pilot-primary-btn"
                              style={{ fontSize: 12, padding: '7px 14px', backgroundColor: '#bef264', color: '#0A2540', width: '100%', justifyContent: 'center' }}
                            >
                              <span>Tester en démo</span>
                              <ArrowRight size={13} />
                            </button>
                            <div className="btn-shimmer-beam" />
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid rgba(255, 255, 255, 0.12)', marginTop: 12 }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: '#bef264' }}>Signature d'avocat 48h</span>
                          <span style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.6)' }}>Secret pro.</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* MODE 2: ACCORDION ALTERNATIVE */
              <div
                onMouseEnter={() => setIsAccordionAutoPlaying(false)}
                onMouseLeave={() => setIsAccordionAutoPlaying(true)}
                style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
              >
                {/* CARD 01 */}
                <div
                  className={`expand-step-card ${activeAccordionStep === 0 ? 'active' : ''}`}
                  onMouseEnter={() => { setActiveAccordionStep(0); }}
                  onClick={() => setActiveAccordionStep(0)}
                >
                  <div className="expand-step-header">
                    <div className="expand-step-title" style={{ color: activeAccordionStep === 0 ? '#004AAD' : '#0A2540' }}>
                      <span className="step-num-badge">01</span>
                      <Sparkles size={20} style={{ color: activeAccordionStep === 0 ? '#004AAD' : 'rgba(10, 37, 64, 0.45)' }} />
                      <span>Synthèse Directe & Arbitrage Immédiat</span>
                    </div>
                    <ChevronDown size={20} style={{ color: activeAccordionStep === 0 ? '#004AAD' : 'rgba(10, 37, 64, 0.4)', transform: activeAccordionStep === 0 ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }} />
                  </div>
                  <div className="expand-step-body" style={{ maxHeight: activeAccordionStep === 0 ? 320 : 0, opacity: activeAccordionStep === 0 ? 1 : 0, padding: activeAccordionStep === 0 ? '0 24px 22px 24px' : '0 24px' }}>
                    <div className="expand-step-inner-content">
                      <div style={{ backgroundColor: '#f8fafc', padding: '18px 22px', borderRadius: 14, borderLeft: '5px solid #004AAD' }}>
                        <p style={{ fontSize: 15, color: '#0A2540', lineHeight: 1.65, margin: 0, fontWeight: 500 }}>{currentQuery.response.synthese}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CARD 02 */}
                <div
                  className={`expand-step-card ${activeAccordionStep === 1 ? 'active' : ''}`}
                  onMouseEnter={() => { setActiveAccordionStep(1); }}
                  onClick={() => setActiveAccordionStep(1)}
                >
                  <div className="expand-step-header">
                    <div className="expand-step-title" style={{ color: activeAccordionStep === 1 ? '#004AAD' : '#0A2540' }}>
                      <span className="step-num-badge">02</span>
                      <Scale size={20} style={{ color: activeAccordionStep === 1 ? '#004AAD' : 'rgba(10, 37, 64, 0.45)' }} />
                      <span>Fondements Juridiques & Sources Officielles</span>
                    </div>
                    <ChevronDown size={20} style={{ color: activeAccordionStep === 1 ? '#004AAD' : 'rgba(10, 37, 64, 0.4)', transform: activeAccordionStep === 1 ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }} />
                  </div>
                  <div className="expand-step-body" style={{ maxHeight: activeAccordionStep === 1 ? 320 : 0, opacity: activeAccordionStep === 1 ? 1 : 0, padding: activeAccordionStep === 1 ? '0 24px 22px 24px' : '0 24px' }}>
                    <div className="expand-step-inner-content">
                      <div style={{ padding: '18px 22px', borderRadius: 14, backgroundColor: '#f8fafc', border: '1px solid rgba(10, 37, 64, 0.08)' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                          {currentQuery.response.refChips.map((chip, i) => (
                            <span key={i} className="case-ref-chip"><BadgeCheck size={16} style={{ color: '#16a34a' }} /><span>{chip}</span></span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CARD 03 */}
                <div
                  className={`expand-step-card ${activeAccordionStep === 2 ? 'active' : ''}`}
                  onMouseEnter={() => { setActiveAccordionStep(2); }}
                  onClick={() => setActiveAccordionStep(2)}
                >
                  <div className="expand-step-header">
                    <div className="expand-step-title" style={{ color: activeAccordionStep === 2 ? '#16a34a' : '#0A2540' }}>
                      <span className="step-num-badge">03</span>
                      <TrendingUp size={20} style={{ color: activeAccordionStep === 2 ? '#16a34a' : 'rgba(10, 37, 64, 0.45)' }} />
                      <span>Calcul & Chiffrage Financier / RH Opposable</span>
                    </div>
                    <ChevronDown size={20} style={{ color: activeAccordionStep === 2 ? '#16a34a' : 'rgba(10, 37, 64, 0.4)', transform: activeAccordionStep === 2 ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }} />
                  </div>
                  <div className="expand-step-body" style={{ maxHeight: activeAccordionStep === 2 ? 320 : 0, opacity: activeAccordionStep === 2 ? 1 : 0, padding: activeAccordionStep === 2 ? '0 24px 22px 24px' : '0 24px' }}>
                    <div className="expand-step-inner-content">
                      <div style={{ padding: '18px 22px', borderRadius: 14, backgroundColor: '#f8fafc', border: '1px solid rgba(10, 37, 64, 0.08)' }}>
                        <div style={{ fontSize: 14, color: '#0A2540', fontWeight: 600 }}>{currentQuery.response.calcul}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CARD 04 */}
                <div
                  className={`expand-step-card ${activeAccordionStep === 3 ? 'active' : ''}`}
                  onMouseEnter={() => { setActiveAccordionStep(3); }}
                  onClick={() => setActiveAccordionStep(3)}
                >
                  <div className="expand-step-header">
                    <div className="expand-step-title" style={{ color: activeAccordionStep === 3 ? '#d97706' : '#0A2540' }}>
                      <span className="step-num-badge">04</span>
                      <AlertTriangle size={20} style={{ color: activeAccordionStep === 3 ? '#d97706' : 'rgba(10, 37, 64, 0.45)' }} />
                      <span>Point de Vigilance & Risque Neutralisé</span>
                    </div>
                    <ChevronDown size={20} style={{ color: activeAccordionStep === 3 ? '#d97706' : 'rgba(10, 37, 64, 0.4)', transform: activeAccordionStep === 3 ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }} />
                  </div>
                  <div className="expand-step-body" style={{ maxHeight: activeAccordionStep === 3 ? 320 : 0, opacity: activeAccordionStep === 3 ? 1 : 0, padding: activeAccordionStep === 3 ? '0 24px 22px 24px' : '0 24px' }}>
                    <div className="expand-step-inner-content">
                      <div style={{ backgroundColor: '#fffbeb', padding: '18px 22px', borderRadius: 14, borderLeft: '5px solid #f59e0b', color: '#92400e', fontSize: 14 }}>
                        {currentQuery.response.vigilance}
                      </div>
                    </div>
                  </div>
                </div>

                {/* CARD 05 */}
                <div
                  className={`expand-step-card active-special`}
                  onMouseEnter={() => { setActiveAccordionStep(4); }}
                  onClick={() => setActiveAccordionStep(4)}
                >
                  <div className="expand-step-header" style={{ color: '#ffffff' }}>
                    <div className="expand-step-title" style={{ color: '#ffffff' }}>
                      <span className="step-num-badge">05</span>
                      <Award size={22} style={{ color: '#bef264' }} />
                      <span>Garantie Opposable Signée Cabinet Maé</span>
                    </div>
                    <ChevronDown size={20} style={{ color: '#bef264', transform: activeAccordionStep === 4 ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }} />
                  </div>
                  <div className="expand-step-body" style={{ maxHeight: activeAccordionStep === 4 ? 340 : 0, opacity: activeAccordionStep === 4 ? 1 : 0, padding: activeAccordionStep === 4 ? '0 24px 24px 24px' : '0 24px' }}>
                    <div className="expand-step-inner-content">
                      <div style={{ padding: '20px', borderRadius: 16, backgroundColor: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(190, 242, 100, 0.3)' }}>
                        <p style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.9)', margin: 0, marginBottom: 12 }}>{currentQuery.response.experte}</p>
                        <button onClick={() => setIsDemoModalOpen(true)} className="pilot-primary-btn" style={{ backgroundColor: '#bef264', color: '#0A2540', fontWeight: 800 }}>
                          Tester en démo
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* =========================================================================
            SECTION CABINET MAÉ & LAETITIA BADJI (Human Reassurance)
            ========================================================================= */}
        <section id="experte" style={{
          padding: 'clamp(40px, 6vw, 80px) 24px',
          maxWidth: 1280,
          margin: '0 auto'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #07192b 0%, #0A2540 60%, #153759 100%)',
            color: '#ffffff',
            borderRadius: 24,
            padding: 'clamp(28px, 5vw, 50px)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 36,
            alignItems: 'center',
            boxShadow: '0 25px 60px -15px rgba(10, 37, 64, 0.5)'
          }}>
            <div>
              <span style={{
                display: 'inline-block',
                backgroundColor: '#bef264',
                color: '#0a0a0a',
                padding: '3px 12px',
                borderRadius: 9999,
                fontSize: 11,
                fontWeight: 700,
                marginBottom: 16
              }}>
                L'EXPERTISE DU CABINET MAÉ
              </span>

              <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 34px)', fontWeight: 800, color: '#ffffff', lineHeight: 1.2, marginBottom: 16 }}>
                Une juriste reconnue du secteur associatif à vos côtés
              </h2>

              <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 15, lineHeight: 1.6, marginBottom: 14 }}>
                Derrière l'intelligence artificielle, vous bénéficiez de l'appui direct de <strong>Laetitia Badji</strong> (Cabinet Maé / AKILIGUE SAS), juriste spécialisée depuis plus de 15 ans dans le médico-social, l'animation et l'insertion.
              </p>

              <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 15, lineHeight: 1.6, fontStyle: 'italic', marginBottom: 22 }}>
                « L’assistance apporte la rapidité et la synthèse ; notre cabinet apporte la rigueur, l’analyse des cas délicats et la signature juridique qui rassure votre Conseil d’Administration. »
              </p>

              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: 13, fontWeight: 600 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Clock size={16} style={{ color: '#bef264' }} />
                  <span>Délai garanti : 48h ouvrées</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Award size={16} style={{ color: '#bef264' }} />
                  <span>+15 ans d'expérience associative</span>
                </div>
              </div>
            </div>

            {/* Portrait Photo of Laetitia Badji */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 160,
                height: 160,
                borderRadius: '50%',
                overflow: 'hidden',
                border: '3px solid #bef264',
                margin: '0 auto 16px',
                boxShadow: '0 0 30px rgba(190, 242, 100, 0.4)'
              }}>
                <img
                  src="/images/laetitia-badji.jpg"
                  alt="Laetitia Badji juriste experte droit associatif"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#ffffff' }}>
                Laetitia Badji
              </div>
              <div style={{ color: '#bef264', fontSize: 13, fontWeight: 600, marginTop: 2 }}>
                Cabinet Maé &bull; AKILIGUE SAS
              </div>
              <div style={{ color: 'rgba(255, 255, 255, 0.55)', fontSize: 12, marginTop: 4 }}>
                contact@cabinet-mae.fr &bull; Paris, France
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION TARIFS SANS ENGAGEMENT
            ========================================================================= */}
        <section id="tarifs" style={{
          padding: 'clamp(50px, 7vw, 100px) 24px',
          maxWidth: 1280,
          margin: '0 auto',
          borderTop: '1px solid rgba(10, 37, 64, 0.08)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <span style={{
              display: 'inline-block',
              backgroundColor: 'rgba(190, 242, 100, 0.25)',
              color: '#1b5400',
              fontWeight: 700,
              fontSize: 11,
              padding: '3px 12px',
              borderRadius: 9999,
              marginBottom: 10
            }}>
              Tarification transparente
            </span>

            <h2 style={{
              fontSize: 'clamp(28px, 4vw, 42px)',
              fontWeight: 800,
              color: '#0A2540',
              letterSpacing: '-0.025em',
              marginBottom: 12
            }}>
              Des forfaits clairs pour les associations de 1 à 100 salariés
            </h2>

            <p style={{
              fontSize: 16,
              color: 'rgba(10, 37, 64, 0.7)',
              maxWidth: 640,
              margin: '0 auto 24px'
            }}>
              Abonnement mensuel sans engagement de durée, modifiable ou résiliable en un clic.
            </p>

            {/* Monthly / Yearly Toggle */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              backgroundColor: '#f1f5f9',
              padding: '4px 6px',
              borderRadius: 9999
            }}>
              <button
                onClick={() => setBillingCycle('monthly')}
                style={{
                  padding: '6px 16px',
                  borderRadius: 9999,
                  border: 'none',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  backgroundColor: billingCycle === 'monthly' ? '#ffffff' : 'transparent',
                  color: billingCycle === 'monthly' ? '#0A2540' : 'rgba(10, 37, 64, 0.6)',
                  boxShadow: billingCycle === 'monthly' ? '0 2px 6px rgba(10, 37, 64, 0.08)' : 'none'
                }}
              >
                Mensuel
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                style={{
                  padding: '6px 16px',
                  borderRadius: 9999,
                  border: 'none',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  backgroundColor: billingCycle === 'yearly' ? '#ffffff' : 'transparent',
                  color: billingCycle === 'yearly' ? '#0A2540' : 'rgba(10, 37, 64, 0.6)',
                  boxShadow: billingCycle === 'yearly' ? '0 2px 6px rgba(10, 37, 64, 0.08)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <span>Annuel</span>
                <span style={{ backgroundColor: '#bef264', color: '#1b5400', fontSize: 10, padding: '1px 6px', borderRadius: 9999, fontWeight: 700 }}>
                  2 mois offerts
                </span>
              </button>
            </div>
          </div>

          {/* 3 Pricing Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 24,
            alignItems: 'stretch'
          }}>
            {plans.map((p) => {
              const displayPrice = billingCycle === 'yearly' 
                ? Math.round(p.priceMonthly * 0.83) 
                : p.priceMonthly;

              return (
                <div
                  key={p.code}
                  className="card-interactive-tilt"
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: 22,
                    padding: '32px',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    border: p.highlighted ? '2px solid #004AAD' : '1px solid rgba(10, 37, 64, 0.1)',
                    boxShadow: p.highlighted ? '0 16px 40px -10px rgba(0, 74, 173, 0.2)' : '0 8px 24px -10px rgba(10, 37, 64, 0.06)'
                  }}
                >
                  {p.highlighted && (
                    <div style={{
                      position: 'absolute',
                      top: -12,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      backgroundColor: '#004AAD',
                      color: '#ffffff',
                      padding: '3px 14px',
                      borderRadius: 9999,
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: '0.04em'
                    }}>
                      RECOMMANDÉ POUR LES ASSOCIATIONS
                    </div>
                  )}

                  <div style={{ marginBottom: 18 }}>
                    <h3 style={{ fontSize: 22, fontWeight: 800, color: '#0A2540', marginBottom: 4 }}>
                      {p.label}
                    </h3>
                    <p style={{ fontSize: 13, color: 'rgba(10, 37, 64, 0.6)', lineHeight: 1.5 }}>
                      {p.description}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 24, paddingBottom: 18, borderBottom: '1px solid rgba(10, 37, 64, 0.08)' }}>
                    <span style={{ fontSize: 44, fontWeight: 800, color: '#0A2540', letterSpacing: '-0.03em' }}>
                      {displayPrice} €
                    </span>
                    <span style={{ fontSize: 13, color: 'rgba(10, 37, 64, 0.55)', fontWeight: 500 }}>
                      / mois HT
                    </span>
                  </div>

                  <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#0A2540' }}>
                      <CheckCircle2 size={16} style={{ color: '#004AAD', flexShrink: 0 }} />
                      <span>Moteur spécialisé : <strong>{p.features.aiModel}</strong></span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#0A2540' }}>
                      <CheckCircle2 size={16} style={{ color: '#004AAD', flexShrink: 0 }} />
                      <span>Briques : <strong>RH & Gouvernance 1901</strong></span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: p.features.briqueFinance ? '#0A2540' : '#94a3b8' }}>
                      {p.features.briqueFinance ? (
                        <CheckCircle2 size={16} style={{ color: '#004AAD', flexShrink: 0 }} />
                      ) : (
                        <Lock size={16} style={{ color: '#94a3b8', flexShrink: 0 }} />
                      )}
                      <span>Brique <strong>Finance, Budget & CER</strong></span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: p.features.briqueConformite ? '#0A2540' : '#94a3b8' }}>
                      {p.features.briqueConformite ? (
                        <CheckCircle2 size={16} style={{ color: '#004AAD', flexShrink: 0 }} />
                      ) : (
                        <Lock size={16} style={{ color: '#94a3b8', flexShrink: 0 }} />
                      )}
                      <span>Brique <strong>Conformité & DUERP</strong></span>
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: 13,
                      backgroundColor: p.features.expertQuestionsMonth > 0 ? 'rgba(190, 242, 100, 0.25)' : 'transparent',
                      padding: p.features.expertQuestionsMonth > 0 ? '8px 10px' : '0',
                      borderRadius: 8
                    }}>
                      <Award size={16} style={{ color: p.features.expertQuestionsMonth > 0 ? '#1b5400' : '#94a3b8', flexShrink: 0 }} />
                      <span>
                        {p.features.expertQuestionsMonth > 0 ? (
                          <strong style={{ color: '#1b5400' }}>{p.features.expertQuestionsMonth} note experte Cabinet Maé / mois</strong>
                        ) : (
                          <span style={{ color: '#94a3b8' }}>Sans note experte incluse</span>
                        )}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onStartOnboarding(p.code)}
                    className={p.highlighted ? 'pilot-primary-btn' : 'pilot-glow-btn'}
                    style={{
                      width: '100%',
                      justifyContent: 'center',
                      backgroundColor: p.highlighted ? '#004AAD' : '#f8fafc',
                      color: p.highlighted ? '#ffffff' : '#0A2540',
                      borderColor: p.highlighted ? 'transparent' : 'rgba(10, 37, 64, 0.15)',
                      boxShadow: 'none'
                    }}
                  >
                    <span>Choisir {p.label}</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* =========================================================================
            SECTION FAQ (Airy Accordion)
            ========================================================================= */}
        <section id="faq" style={{
          padding: 'clamp(40px, 6vw, 80px) 24px',
          maxWidth: 980,
          margin: '0 auto',
          borderTop: '1px solid rgba(10, 37, 64, 0.08)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <span style={{
              display: 'inline-block',
              backgroundColor: 'rgba(0, 74, 173, 0.08)',
              color: '#004AAD',
              fontWeight: 700,
              fontSize: 11,
              padding: '3px 12px',
              borderRadius: 9999,
              marginBottom: 10
            }}>
              Questions fréquentes
            </span>

            <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 36px)', fontWeight: 800, color: '#0A2540' }}>
              Tout ce que vous devez savoir
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {faqs.map((f, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: 14,
                  border: '1px solid rgba(10, 37, 64, 0.08)',
                  padding: '16px 20px',
                  cursor: 'pointer',
                  transition: 'box-shadow 0.2s ease'
                }}
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
                  <span style={{ fontWeight: 700, fontSize: 15, color: '#0A2540' }}>
                    {f.q}
                  </span>
                  <ChevronDown
                    size={18}
                    style={{
                      color: '#004AAD',
                      transform: activeFaq === idx ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.2s ease',
                      flexShrink: 0
                    }}
                  />
                </div>
                {activeFaq === idx && (
                  <div style={{ marginTop: 12, fontSize: 14, color: 'rgba(10, 37, 64, 0.7)', lineHeight: 1.6, borderTop: '1px solid rgba(10, 37, 64, 0.08)', paddingTop: 12 }}>
                    {f.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* =========================================================================
            SECTION CTA BANNER FINAL
            ========================================================================= */}
        <section style={{
          padding: 'clamp(50px, 7vw, 90px) 24px',
          maxWidth: 960,
          margin: '0 auto',
          textAlign: 'center'
        }}>
          <div style={{
            backgroundColor: '#0A2540',
            color: '#ffffff',
            borderRadius: 24,
            padding: 'clamp(32px, 6vw, 56px) 32px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 30px 60px -15px rgba(10, 37, 64, 0.5)'
          }}>
            <span style={{
              display: 'inline-block',
              backgroundColor: '#bef264',
              color: '#0A2540',
              fontWeight: 800,
              fontSize: 11,
              padding: '3px 12px',
              borderRadius: 9999,
              marginBottom: 16
            }}>
              30 MINUTES SANS ENGAGEMENT
            </span>

            <h2 style={{
              fontSize: 'clamp(26px, 3.8vw, 38px)',
              fontWeight: 800,
              color: '#ffffff',
              lineHeight: 1.2,
              marginBottom: 14
            }}>
              Sécurisez votre structure dès aujourd’hui
            </h2>

            <p style={{
              fontSize: 16,
              color: 'rgba(255, 255, 255, 0.8)',
              maxWidth: 620,
              margin: '0 auto 28px',
              lineHeight: 1.6
            }}>
              Un tour personnalisé de 30 minutes, construit autour de vos priorités (CCN 66/51/ÉCLAT/ALISFA, budgets, bilans CER).
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
              <button
                onClick={() => setIsDemoModalOpen(true)}
                className="pilot-glow-btn"
                style={{ fontSize: 15, padding: '14px 32px' }}
              >
                <span>Réserver ma démo gratuite</span>
                <ChevronRight size={16} />
              </button>

              <button
                onClick={() => onStartOnboarding('pro')}
                className="pilot-primary-btn"
                style={{ fontSize: 15, padding: '14px 28px' }}
              >
                <span>S'abonner en ligne</span>
              </button>
            </div>
          </div>
        </section>

        {/* =========================================================================
            FOOTER
            ========================================================================= */}
        <footer style={{
          borderTop: '1px solid rgba(10, 37, 64, 0.08)',
          backgroundColor: '#ffffff',
          padding: '60px 24px 32px'
        }}>
          <div style={{ maxWidth: 1280, margin: '0 auto' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 36,
              marginBottom: 48
            }}>
              {/* Brand Column */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: 'linear-gradient(135deg, #004AAD 0%, #002868 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff'
                  }}>
                    <Scale size={16} />
                  </div>
                  <span style={{ fontWeight: 800, fontSize: 17, color: '#0A2540' }}>
                    AssoExpert<span style={{ color: '#004AAD' }}>.IA</span>
                  </span>
                </div>
                <p style={{ fontSize: 13, color: 'rgba(10, 37, 64, 0.6)', lineHeight: 1.6, marginBottom: 12 }}>
                  L'assistance experte pour associations employeuses. Éditée en partenariat avec le Cabinet Maé / AKILIGUE SAS.
                </p>
                <div style={{ fontSize: 12, color: 'rgba(10, 37, 64, 0.55)' }}>
                  Paris, France &bull; Hébergement souverain certifié
                </div>
              </div>

              {/* Piliers */}
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#0A2540', marginBottom: 14 }}>
                  Piliers d'expertise
                </div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
                  <li><a href="#cockpit" style={{ color: 'rgba(10, 37, 64, 0.65)' }}>RH & Conventions collectives</a></li>
                  <li><a href="#cockpit" style={{ color: 'rgba(10, 37, 64, 0.65)' }}>Finances & Suivi CER</a></li>
                  <li><a href="#cockpit" style={{ color: 'rgba(10, 37, 64, 0.65)' }}>Financements & Subventions</a></li>
                  <li><a href="#cockpit" style={{ color: 'rgba(10, 37, 64, 0.65)' }}>Gouvernance Loi 1901</a></li>
                </ul>
              </div>

              {/* Entreprise & Démo */}
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#0A2540', marginBottom: 14 }}>
                  Plateforme
                </div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
                  <li><a href="#tarifs" style={{ color: 'rgba(10, 37, 64, 0.65)' }}>Tarifs sans engagement</a></li>
                  <li><button onClick={() => setIsDemoModalOpen(true)} style={{ background: 'none', border: 'none', padding: 0, color: 'rgba(10, 37, 64, 0.65)', cursor: 'pointer', fontSize: 13, textAlign: 'left' }}>Demander une démo (30 min)</button></li>
                  <li><a href="#faq" style={{ color: 'rgba(10, 37, 64, 0.65)' }}>Foire aux questions</a></li>
                  <li><a href="#experte" style={{ color: 'rgba(10, 37, 64, 0.65)' }}>L'Experte Laetitia Badji</a></li>
                  <li><a href="mailto:contact@cabinet-mae.fr" style={{ color: 'rgba(10, 37, 64, 0.65)' }}>Contact Cabinet Maé</a></li>
                </ul>
              </div>

              {/* Newsletter */}
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#0A2540', marginBottom: 14 }}>
                  Veille réglementaire
                </div>
                <p style={{ fontSize: 13, color: 'rgba(10, 37, 64, 0.6)', lineHeight: 1.5, marginBottom: 12 }}>
                  Recevez l'actualité réglementaire et les évolutions conventionnelles avant tout le monde.
                </p>
                {newsletterSubscribed ? (
                  <div style={{ backgroundColor: 'rgba(0, 74, 173, 0.08)', color: '#004AAD', padding: '10px', borderRadius: 8, fontSize: 12, fontWeight: 600 }}>
                    &check; Bien inscrit(e) à la veille associative !
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (newsletterEmail) setNewsletterSubscribed(true);
                    }}
                    style={{ display: 'flex', gap: 6 }}
                  >
                    <input
                      type="email"
                      required
                      placeholder="direction@votre-asso.org"
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      style={{
                        flex: 1,
                        height: 38,
                        padding: '0 12px',
                        borderRadius: 8,
                        border: '1px solid rgba(10, 37, 64, 0.15)',
                        fontSize: 13
                      }}
                    />
                    <button
                      type="submit"
                      className="pilot-primary-btn"
                      style={{ height: 38, padding: '0 14px' }}
                    >
                      <Send size={14} />
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Bottom Bar */}
            <div style={{
              borderTop: '1px solid rgba(10, 37, 64, 0.08)',
              paddingTop: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12,
              fontSize: 12,
              color: 'rgba(10, 37, 64, 0.55)'
            }}>
              <div>
                &copy; 2026 AssoExpert IA &bull; Cabinet Maé / AKILIGUE SAS. Tous droits réservés.
              </div>
              <div style={{ display: 'flex', gap: 16 }}>
                <span>Hébergé en France</span>
                <span>100% RGPD</span>
                <a href="#faq" style={{ color: 'rgba(10, 37, 64, 0.55)' }}>Mentions Légales</a>
                <a href="#faq" style={{ color: 'rgba(10, 37, 64, 0.55)' }}>Confidentialité</a>
              </div>
            </div>
          </div>
        </footer>

      </div>

      {/* =========================================================================
          INTERACTIVE DEMO BOOKING MODAL
          ========================================================================= */}
      {isDemoModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(10, 10, 10, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: 16
        }}>
          <div style={{
            maxWidth: 500,
            width: '100%',
            backgroundColor: '#ffffff',
            color: '#0A2540',
            borderRadius: 24,
            padding: '32px',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.4)',
            position: 'relative'
          }}>
            <button
              onClick={() => { setIsDemoModalOpen(false); setDemoSubmitted(false); }}
              style={{
                position: 'absolute',
                top: 18,
                right: 18,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'rgba(10, 37, 64, 0.4)'
              }}
              aria-label="Fermer"
            >
              <X size={20} />
            </button>

            {demoSubmitted ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(190, 242, 100, 0.35)',
                  color: '#1b5400',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}>
                  <CheckCircle2 size={32} />
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: '#0A2540', marginBottom: 8 }}>
                  Demande de démo enregistrée !
                </h3>
                <p style={{ fontSize: 14, color: 'rgba(10, 37, 64, 0.7)', lineHeight: 1.55, marginBottom: 20 }}>
                  L'équipe du Cabinet Maé vous contactera sous 24h ouvrées pour organiser la présentation de 30 minutes adaptée à <strong>{demoForm.assoName}</strong>.
                </p>
                <button
                  onClick={() => { setIsDemoModalOpen(false); setDemoSubmitted(false); }}
                  className="pilot-primary-btn"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Fermer
                </button>
              </div>
            ) : (
              <div>
                <div style={{ marginBottom: 18 }}>
                  <span style={{
                    backgroundColor: 'rgba(190, 242, 100, 0.3)',
                    color: '#1b5400',
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 9999,
                    display: 'inline-block',
                    marginBottom: 6
                  }}>
                    30 minutes sans engagement
                  </span>
                  <h3 style={{ fontSize: 20, fontWeight: 800, color: '#0A2540', marginBottom: 4 }}>
                    Réserver une démo d'AssoExpert IA
                  </h3>
                  <p style={{ fontSize: 13, color: 'rgba(10, 37, 64, 0.6)' }}>
                    Construite selon vos priorités (conventions, budgets, subventions).
                  </p>
                </div>

                <form onSubmit={handleDemoSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#0A2540', display: 'block', marginBottom: 4 }}>
                      Votre nom & fonction
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Céline Lambert (Directrice Générale)"
                      className="input"
                      value={demoForm.name}
                      onChange={(e) => setDemoForm({ ...demoForm, name: e.target.value })}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#0A2540', display: 'block', marginBottom: 4 }}>
                      Email professionnel
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="direction@votre-asso.org"
                      className="input"
                      value={demoForm.email}
                      onChange={(e) => setDemoForm({ ...demoForm, email: e.target.value })}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: '#0A2540', display: 'block', marginBottom: 4 }}>
                        Association
                      </label>
                      <input
                        type="text"
                        required
                        className="input"
                        value={demoForm.assoName}
                        onChange={(e) => setDemoForm({ ...demoForm, assoName: e.target.value })}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: '#0A2540', display: 'block', marginBottom: 4 }}>
                        Effectif
                      </label>
                      <select
                        className="select"
                        value={demoForm.salaries}
                        onChange={(e) => setDemoForm({ ...demoForm, salaries: e.target.value })}
                      >
                        <option value="1-9 salariés">1 à 9 salariés</option>
                        <option value="10-19 salariés">10 à 19 salariés</option>
                        <option value="20-49 salariés">20 à 49 salariés</option>
                        <option value="50+ salariés">50 à 100 salariés</option>
                        <option value="Bénévoles uniquement">Bénévoles</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#0A2540', display: 'block', marginBottom: 4 }}>
                      Convention collective
                    </label>
                    <select
                      className="select"
                      value={demoForm.ccn}
                      onChange={(e) => setDemoForm({ ...demoForm, ccn: e.target.value })}
                    >
                      <option value="CCN 66 (Médico-social)">CCN 66 (Médico-social)</option>
                      <option value="CCN 51 (FEHAP)">CCN 51 (FEHAP)</option>
                      <option value="ÉCLAT (Animation)">ÉCLAT (Animation)</option>
                      <option value="ALISFA (Centres sociaux)">ALISFA (Lien social & familial)</option>
                      <option value="Autre">Autre convention</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="pilot-primary-btn"
                    style={{ width: '100%', justifyContent: 'center', marginTop: 6 }}
                  >
                    <span>Confirmer ma demande de démo</span>
                    <ArrowRight size={15} />
                  </button>

                  <div style={{ fontSize: 11, color: 'rgba(10, 37, 64, 0.5)', textAlign: 'center' }}>
                    Gratuit &bull; Sans engagement &bull; Données confidentielles
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
