import React, { useState } from 'react';
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
  Code2, 
  FileSearch, 
  LogIn, 
  Menu, 
  X,
  Calendar,
  DollarSign,
  TrendingUp,
  Layers,
  Check,
  ExternalLink,
  Briefcase,
  HelpCircle,
  Send,
  Quote,
  AlertCircle,
  FolderCheck,
  Database,
  Building
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
  const [showJsonLdModal, setShowJsonLdModal] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [activeSolutionTab, setActiveSolutionTab] = useState<string>('centralisation');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

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

  // Solutions data inspired by PilotAsso
  const solutions = [
    {
      id: 'centralisation',
      title: 'Centralisation',
      subtitle: 'Vos outils peuvent rester. Votre pilotage se centralise.',
      badge: 'Solution 1',
      description: 'Vos informations sont réparties dans plusieurs fichiers et outils. AssoExpert IA devient le point central où vous les retrouvez sans abandonner ce qui fonctionne déjà pour vous.',
      bullets: [
        'Moins de ressaisies fastidieuses entre vos outils et tableurs',
        'Une information juridique et financière toujours à jour et fiable',
        'Une meilleure collaboration entre dirigeants bénévoles et directions salariées',
        'Connexion progressive à vos documents statutaires et budgets'
      ],
      previewData: {
        headline: 'Point central de pilotage consolidé',
        stat1: '4 briques connectées',
        stat2: '0 ressaisie manuelle',
        mockCard: 'Statuts loi 1901 + Convention CCN 66 + Budget prévisionnel 2026 synchronisés.'
      }
    },
    {
      id: 'finances',
      title: 'Finances & Trésorerie',
      subtitle: 'Du budget à la trésorerie, anticipez plutôt que subir.',
      badge: 'Solution 2',
      description: 'Passez du suivi financier passif au pilotage réel : budget, réalisé, écarts et trésorerie au même endroit, avec des alertes avant que les écarts ne bloquent vos actions.',
      bullets: [
        'Budget et réalisé comparés en continu avec calcul automatique des écarts',
        'Projections de trésorerie glissantes sur 12 mois pour anticiper les tensions',
        'Justification rigoureuse du Compte d’Emploi des Ressources (CER)',
        'Gestion des fonds dédiés et reliquats non consommés de subventions'
      ],
      previewData: {
        headline: 'Suivi budgétaire & CER',
        stat1: 'Budget : 420 000 €',
        stat2: 'Écart : +2.4% (Conforme)',
        mockCard: 'Solde de trésorerie sécurisé à M+3. Traitement automatisé des fonds dédiés.'
      }
    },
    {
      id: 'financements',
      title: 'Financements & Subventions',
      subtitle: 'Ne passez plus à côté d’une opportunité de financement.',
      badge: 'Solution 3',
      description: 'AssoExpert IA vous aide à identifier plus rapidement les opportunités pertinentes pour votre association, et centralise le calendrier de toutes vos échéances de financement.',
      bullets: [
        'Opportunités de subventions publiques et mécénat identifiées plus tôt',
        'Calendrier des échéances de dépôt et de bilans financiers centralisé',
        'Suivi unifié de tous vos financeurs (Région, Ville, CAF, État, Fondations)',
        'Alertes automatiques avant la date limite de justification des fonds'
      ],
      previewData: {
        headline: 'Calendrier des financeurs & CER',
        stat1: '4 financeurs actifs',
        stat2: 'Prochaine échéance : J-14',
        mockCard: 'Dossier subvention CAF validé. Justificatifs CER préremplis.'
      }
    },
    {
      id: 'rh',
      title: 'RH & Conventions Collectives',
      subtitle: 'Sécurisez vos équipes et éliminez le doute juridique.',
      badge: 'Solution 4',
      description: 'L’expertise pointue sur vos conventions collectives : CCN 66, CCN 51 (FEHAP), ÉCLAT (Animation), ALISFA. L’IA est instruite de vos textes officiels et calcule vos droits au millimètre.',
      bullets: [
        'Congés conventionnels d’ancienneté & congés trimestriels calculés sans erreur',
        'Grilles de classification, coefficients et salaires conventionnels à jour',
        'Sécurisation des ruptures conventionnelles, préavis et temps partiels',
        'Escalade humaine sous 48h ouvrées vers Laetitia Badji (Cabinet Maé)'
      ],
      previewData: {
        headline: 'Conventions : CCN 66 / CCN 51 / Éclat / Alisfa',
        stat1: '32 salariés couverts',
        stat2: '0 risque prud’homal',
        mockCard: 'Calcul des congés trimestriels T1 effectué. Note juridique d’appui disponible.'
      }
    },
    {
      id: 'gouvernance',
      title: 'Gouvernance Loi 1901',
      subtitle: 'Simplifiez votre gouvernance et protégez vos dirigeants.',
      badge: 'Solution 5',
      description: 'Les informations utiles à vos instances réunies au même endroit pour préparer vos réunions plus vite et protéger juridiquement les administrateurs et bénévoles.',
      bullets: [
        'Calcul des quorums d’Assemblée Générale & gestion des procurations',
        'Sécurisation de la responsabilité civile et pénale des administrateurs',
        'Délégations de pouvoirs, refonte statutaire et règlements intérieurs',
        'Modèles de procès-verbaux d’AG et de délibérations de Conseil d’Administration'
      ],
      previewData: {
        headline: 'Gouvernance & Conformité Loi 1901',
        stat1: 'AG 2026 prête',
        stat2: 'Quorum vérifié à 100%',
        mockCard: 'Délégation de signature directeur validée. Registre des délibérations à jour.'
      }
    },
    {
      id: 'conformite',
      title: 'Conformité & DUERP',
      subtitle: 'Protégez vos salariés et respectez le cadre associatif.',
      badge: 'Solution 6',
      description: 'Document Unique d’Évaluation des Risques Professionnels (DUERP), affichages obligatoires et respect rigoureux du RGPD sans alourdir le quotidien.',
      bullets: [
        'Génération et mise à jour annuelle guidée de votre DUERP',
        'Affichages obligatoires du travail associatif et registre du personnel',
        'Mise en conformité RGPD stricte (données adhérents et salariés)',
        'Zéro transmission de vos données à des tiers publicitaires ou de tracking'
      ],
      previewData: {
        headline: 'Sécurité au travail & DUERP',
        stat1: 'DUERP actualisé',
        stat2: '100% conforme RGPD',
        mockCard: 'Plan d’action de prévention des risques formalisé pour les ateliers et l’accueil.'
      }
    }
  ];

  const currentSolution = solutions.find(s => s.id === activeSolutionTab) || solutions[0];

  const faqs = [
    {
      q: 'En quoi AssoExpert IA est-il différent d’un outil généraliste comme ChatGPT ?',
      a: 'AssoExpert IA est spécialement paramétré pour le monde associatif employeur régie par la loi 1901. Il intègre directement les textes officiels des conventions collectives associatives (CCN 66, CCN 51, ÉCLAT, ALISFA), les règles du Compte d’Emploi des Ressources (CER), et les spécificités de gouvernance. Chaque réponse est contextualisée avec la convention et la taille de votre structure. Surtout, vous bénéficiez d’une garantie unique : l’escalade humaine sous 48h ouvrées vers Laetitia Badji (Cabinet Maé), juriste experte reconnue du secteur.'
    },
    {
      q: 'Comment se passe une démonstration de 30 minutes ?',
      a: 'Pas de discours commercial générique : un tour d’horizon de 30 minutes adapté aux priorités immédiates de votre structure (votre convention collective, votre budget, votre gestion des instances). Nous répondons concrètement à vos questions sur la prise en main et la transition depuis vos tableurs actuels, sans aucun engagement.'
    },
    {
      q: 'Comment fonctionne l’escalade vers Laetitia Badji (Cabinet Maé) ?',
      a: 'Dès qu’une situation RH ou juridique est sensible (rupture conventionnelle délicate, litige, contestation de prime, contrôle de subvention), un bouton préremplit votre demande dans la plateforme. Laetitia Badji examine personnellement votre dossier et vous délivre une note juridique argumentée et signée sous 48h ouvrées.'
    },
    {
      q: 'Devons-nous abandonner nos outils existants (Excel, logiciels de paie) ?',
      a: 'Non ! Tout comme PilotAsso, notre philosophie est : « Vos outils peuvent rester. Votre pilotage se centralise. » AssoExpert IA n’exige pas de tout remplacer. Il devient votre copilote central où retrouver les règles, automatiser vos veilles, valider vos calculs et sécuriser vos décisions.'
    },
    {
      q: 'Nos données associatives sont-elles strictement confidentielles ?',
      a: 'Absolument. Vos questions, budgets et documents restent cantonnés à votre espace associatif sécurisé. Nous appliquons une politique de confidentialité absolue : aucune donnée n’est transmise à des tiers de tracking publicitaire, et vos contenus ne servent jamais à entraîner des modèles d’IA publics.'
    },
    {
      q: 'Puis-je changer de formule ou résilier sans engagement ?',
      a: 'Oui. Tous nos abonnements sont sans engagement de durée. Vous pouvez basculer d’une formule à l’autre ou suspendre votre abonnement en un clic depuis votre espace sécurisé.'
    }
  ];

  const testimonials = [
    {
      quote: "Avec nos 32 salariés sous CCN 66, la gestion des congés trimestriels et des grilles indiciaires nous prenait des jours entiers chaque trimestre. AssoExpert IA nous fait gagner un temps précieux et nous sécurise totalement.",
      author: "Sophie M.",
      role: "Directrice Générale",
      asso: "Maison Pour Tous des Lilas",
      tag: "CCN 66 • 32 salariés",
      initials: "SM"
    },
    {
      quote: "La double approche IA + validation humaine par Laetitia Badji est un soulagement immense pour notre bureau bénévole. On a les réponses immédiates au quotidien, et un vrai cabinet juridique d'appui en cas de doute.",
      author: "Karim T.",
      role: "Président d'association",
      asso: "Passerelle Insertion Lyon",
      tag: "ALISFA • 18 salariés",
      initials: "KT"
    },
    {
      quote: "Enfin une plateforme qui comprend le Compte d’Emploi des Ressources (CER), les fonds dédiés et les particularités de la loi 1901 ! Nos échanges avec le Conseil d'Administration sont devenus fluides et sereins.",
      author: "Élisabeth D.",
      role: "Trésorière",
      asso: "Réseau Éveil Santé & Solidarité",
      tag: "CCN 51 • 45 salariés",
      initials: "ED"
    }
  ];

  const jsonLdData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://assoexpert.fr/#organization",
        "name": "AssoExpert IA — Cabinet Maé / AKILIGUE SAS",
        "url": "https://assoexpert.fr",
        "logo": "https://assoexpert.fr/logo.svg",
        "founder": {
          "@type": "Person",
          "name": "Laetitia Badji",
          "jobTitle": "Experte conseil en droit associatif et gestion RH"
        }
      },
      {
        "@type": "SoftwareApplication",
        "name": "AssoExpert IA",
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "Web",
        "offers": plans.map(p => ({
          "@type": "Offer",
          "name": `Formule ${p.label}`,
          "price": p.priceMonthly.toString(),
          "priceCurrency": "EUR",
          "description": p.description
        }))
      }
    ]
  };

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDemoSubmitted(true);
    setTimeout(() => {
      // Auto close after 3 seconds or allow user to click
    }, 3000);
  };

  return (
    <div className="animate-fade-in" style={{ backgroundColor: '#ffffff', minHeight: '100vh', color: 'var(--color-navy)' }}>
      
      {/* PilotAsso-Inspired Top Announcement Bar */}
      <div style={{
        backgroundColor: '#07192b',
        color: '#ffffff',
        padding: '9px 24px',
        fontSize: '13px',
        textAlign: 'center',
        fontWeight: 500,
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '14px',
        flexWrap: 'nowrap',
        whiteSpace: 'nowrap'
      }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}>
          <span className="pilot-live-indicator" />
          <span style={{ color: '#cbd5e1' }}>
            <strong>18 associations & fédérations</strong> participent actuellement à la co-construction d’AssoExpert IA.
          </span>
        </div>
        <button
          onClick={() => setIsDemoModalOpen(true)}
          style={{
            background: 'rgba(255, 255, 255, 0.12)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            color: '#ffffff',
            padding: '2px 10px',
            borderRadius: 'var(--radius-pill)',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          Rejoindre le programme bêta &rarr;
        </button>
      </div>

      {/* Main Sticky Navbar */}
      <nav style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid var(--color-border)',
        padding: '12px 28px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 2px 10px rgba(10, 37, 64, 0.03)'
      }}>
        <div style={{
          maxWidth: 1440,
          width: '100%',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px'
        }}>
          {/* Logo Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: '10px',
              background: 'linear-gradient(135deg, var(--color-blue) 0%, #003680 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 12px rgba(0, 74, 173, 0.25)'
            }}>
              <Compass size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
                <span style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800,
                  fontSize: '20px',
                  color: 'var(--color-navy)',
                  letterSpacing: '-0.02em'
                }}>
                  AssoExpert<span style={{ color: 'var(--color-blue)' }}>.IA</span>
                </span>
                <span className="badge badge-lime" style={{ fontSize: '9px', padding: '1px 7px', fontWeight: 800 }}>
                  Cabinet Maé
                </span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-navy-muted)', fontWeight: 500, lineHeight: 1, whiteSpace: 'nowrap' }}>
                La plateforme de pilotage des associations
              </div>
            </div>
          </div>

          {/* Desktop Navigation Links (Always on 1 single line with clean spacing) */}
          <div className="hide-on-mobile" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexShrink: 0,
            whiteSpace: 'nowrap'
          }}>
            <a href="#centralisation" className="pilot-nav-link">Centralisation</a>
            <a href="#finances" className="pilot-nav-link">Finances</a>
            <a href="#financements" className="pilot-nav-link">Financements</a>
            <a href="#rh" className="pilot-nav-link" style={{ whiteSpace: 'nowrap' }}>RH &amp; CCN</a>
            <a href="#gouvernance" className="pilot-nav-link">Gouvernance</a>
            <a href="#tarifs" className="pilot-nav-link">Tarifs</a>
            <a href="#faq" className="pilot-nav-link">FAQ</a>
          </div>

          {/* Action Buttons & Mobile Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0, whiteSpace: 'nowrap' }}>
            <button
              onClick={onOpenLogin}
              className="btn btn-sm btn-secondary"
              style={{ fontWeight: 600, fontSize: '13px', height: '38px', padding: '0 14px', whiteSpace: 'nowrap' }}
            >
              <LogIn size={14} style={{ color: 'var(--color-blue)' }} />
              <span>Connexion</span>
            </button>

            <button
              onClick={() => setIsDemoModalOpen(true)}
              className="btn btn-sm btn-primary"
              style={{ fontWeight: 700, fontSize: '13px', height: '38px', padding: '0 18px', borderRadius: 'var(--radius-pill)', whiteSpace: 'nowrap' }}
            >
              <span>Demander une démo</span>
              <ArrowRight size={14} />
            </button>

            {/* Mobile Hamburger (Only visible on tablet & mobile) */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="show-on-mobile btn btn-sm btn-secondary"
              style={{ padding: '0 10px', height: '38px', alignItems: 'center', justifyContent: 'center' }}
              aria-label="Menu"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div
            className="animate-fade-in show-flex-on-mobile"
            style={{
              backgroundColor: '#ffffff',
              borderTop: '1px solid var(--color-border)',
              padding: '16px 20px',
              flexDirection: 'column',
              gap: '10px',
              boxShadow: 'var(--shadow-hover)',
              marginTop: '10px'
            }}
          >
            <a href="#centralisation" onClick={() => setIsMobileMenuOpen(false)} style={{ padding: '10px', fontWeight: 600, color: 'var(--color-navy)' }}>Centralisation de votre pilotage</a>
            <a href="#finances" onClick={() => setIsMobileMenuOpen(false)} style={{ padding: '10px', fontWeight: 600, color: 'var(--color-navy)' }}>Pilotez vos finances</a>
            <a href="#financements" onClick={() => setIsMobileMenuOpen(false)} style={{ padding: '10px', fontWeight: 600, color: 'var(--color-navy)' }}>Trouvez et suivez vos financements</a>
            <a href="#rh" onClick={() => setIsMobileMenuOpen(false)} style={{ padding: '10px', fontWeight: 600, color: 'var(--color-navy)' }}>RH & Conventions Collectives</a>
            <a href="#gouvernance" onClick={() => setIsMobileMenuOpen(false)} style={{ padding: '10px', fontWeight: 600, color: 'var(--color-navy)' }}>Gouvernance Loi 1901</a>
            <a href="#tarifs" onClick={() => setIsMobileMenuOpen(false)} style={{ padding: '10px', fontWeight: 600, color: 'var(--color-navy)' }}>Tarifs</a>
            <a href="#faq" onClick={() => setIsMobileMenuOpen(false)} style={{ padding: '10px', fontWeight: 600, color: 'var(--color-navy)' }}>FAQ</a>
            
            <div style={{ paddingTop: '10px', borderTop: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button onClick={() => { setIsMobileMenuOpen(false); setIsDemoModalOpen(true); }} className="btn btn-primary" style={{ width: '100%' }}>
                Réserver ma démo gratuite (30 min)
              </button>
              <button onClick={() => { setIsMobileMenuOpen(false); onOpenLogin(); }} className="btn btn-secondary" style={{ width: '100%' }}>
                Se connecter
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* =========================================================================
          HERO SECTION (PilotAsso Style)
          ========================================================================= */}
      <section style={{
        position: 'relative',
        background: 'radial-gradient(ellipse 90% 70% at 50% -10%, rgba(0, 74, 173, 0.08) 0%, rgba(255, 255, 255, 0) 100%), #ffffff',
        padding: 'var(--space-16) var(--space-6) var(--space-12)',
        borderBottom: '1px solid var(--color-border)',
        overflow: 'hidden'
      }}>
        {/* Subtle decorative glow */}
        <div style={{
          position: 'absolute',
          top: -140,
          right: '20%',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(193, 255, 114, 0.22) 0%, rgba(193, 255, 114, 0) 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          {/* Top Pill Badge */}
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <span className="pilot-pill-badge">
              <span className="pilot-live-indicator" />
              <span>18 associations participent actuellement à la construction d'AssoExpert IA</span>
            </span>
          </div>

          {/* Main Hero Headline */}
          <h1 style={{
            fontSize: 'clamp(36px, 5.5vw, 60px)',
            fontWeight: 800,
            color: 'var(--color-navy)',
            lineHeight: 1.12,
            letterSpacing: '-0.035em',
            maxWidth: 960,
            margin: '0 auto var(--space-6)'
          }}>
            Centralisez vos finances, vos projets et vos règles RH associatives
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: 'var(--text-xl)',
            color: 'var(--color-navy-muted)',
            lineHeight: 1.6,
            maxWidth: 820,
            margin: '0 auto var(--space-8)'
          }}>
            Automatisez la veille conventionnelle (<strong>CCN 66, CCN 51, ÉCLAT, ALISFA</strong>), anticipez votre trésorerie et bénéficiez d'une <strong>validation juridique sous 48h ouvrées</strong> assurée par Laetitia Badji (Cabinet Maé).
          </p>

          {/* Hero CTAs */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '14px',
            flexWrap: 'wrap',
            marginBottom: 'var(--space-4)'
          }}>
            <button
              onClick={() => setIsDemoModalOpen(true)}
              className="btn btn-primary mobile-w-full"
              style={{
                height: 52,
                padding: '0 32px',
                fontSize: '16px',
                fontWeight: 700,
                borderRadius: 'var(--radius-pill)',
                boxShadow: '0 8px 24px rgba(0, 74, 173, 0.28)'
              }}
            >
              <span>Réserver ma démo gratuite</span>
              <ArrowRight size={18} />
            </button>

            <button
              onClick={() => onStartOnboarding('pro')}
              className="btn btn-secondary mobile-w-full"
              style={{
                height: 52,
                padding: '0 26px',
                fontSize: '15px',
                fontWeight: 600,
                borderRadius: 'var(--radius-pill)'
              }}
            >
              <span>S'abonner & Démarrer l'essai</span>
            </button>
          </div>

          <div style={{ fontSize: '13px', color: 'var(--color-navy-muted)', fontWeight: 500, marginBottom: 'var(--space-12)' }}>
            30 minutes, sans engagement. Une plateforme construite avec des associations, pour les associations.
          </div>

          {/* Hero Live Interface Cockpit Preview (PilotAsso Style) */}
          <div style={{
            maxWidth: 980,
            margin: '0 auto',
            backgroundColor: '#ffffff',
            borderRadius: '22px',
            border: '1.5px solid var(--color-border)',
            boxShadow: 'var(--shadow-float)',
            overflow: 'hidden',
            textAlign: 'left'
          }}>
            {/* Window bar */}
            <div style={{
              backgroundColor: '#f8fafc',
              borderBottom: '1px solid var(--color-border)',
              padding: '12px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#ef4444' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#f59e0b' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#10b981' }} />
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-navy)', marginLeft: 8 }}>
                  Tableau de bord : {currentOrg.name}
                </span>
                <span className="badge badge-blue" style={{ fontSize: '10px', padding: '2px 8px' }}>
                  {currentOrg.ccn.split('(')[0]}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: 'var(--color-navy-muted)' }}>
                <span className="live-dot" />
                <span>Synchronisé &bull; Conforme Loi 1901</span>
              </div>
            </div>

            {/* Dashboard Mockup Grid */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '16px'
              }}>
                {/* Tile 1: CCN & RH */}
                <div style={{ padding: '16px', borderRadius: '14px', backgroundColor: '#f8fafc', border: '1px solid var(--color-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-navy-muted)', textTransform: 'uppercase' }}>RH & CCN 66</span>
                    <span className="badge badge-lime" style={{ fontSize: '9px', padding: '1px 6px' }}>À jour</span>
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-navy)' }}>Congés trimestriels</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-navy-muted)', marginTop: '4px' }}>T1 calculé pour 18 salariés de l'équipe</div>
                </div>

                {/* Tile 2: Finances */}
                <div style={{ padding: '16px', borderRadius: '14px', backgroundColor: '#f8fafc', border: '1px solid var(--color-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-navy-muted)', textTransform: 'uppercase' }}>Trésorerie & Budget</span>
                    <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 700 }}>+4.2%</span>
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-navy)' }}>420 000 € / an</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-navy-muted)', marginTop: '4px' }}>Projections de trésorerie glissantes sur 12 mois</div>
                </div>

                {/* Tile 3: Financements */}
                <div style={{ padding: '16px', borderRadius: '14px', backgroundColor: '#f8fafc', border: '1px solid var(--color-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-navy-muted)', textTransform: 'uppercase' }}>Échéance CER</span>
                    <span className="badge badge-orange" style={{ fontSize: '9px', padding: '1px 6px' }}>J-14</span>
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-navy)' }}>Dépôt Subvention CAF</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-navy-muted)', marginTop: '4px' }}>Dossier financier prérempli sans oubli</div>
                </div>

                {/* Tile 4: Escalade Experte */}
                <div style={{ padding: '16px', borderRadius: '14px', backgroundColor: '#ebf3fd', border: '1px solid rgba(0, 74, 173, 0.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-blue)', textTransform: 'uppercase' }}>Cabinet Maé</span>
                    <span className="badge badge-blue" style={{ fontSize: '9px', padding: '1px 6px' }}>48h ouvrées</span>
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-navy)' }}>Validation Juriste</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-navy-muted)', marginTop: '4px' }}>Dernière note signée par Laetitia Badji</div>
                </div>
              </div>

              {/* Sample AI Answer inside Interface */}
              <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid var(--color-border)',
                borderRadius: '14px',
                padding: '16px 20px',
                boxShadow: '0 2px 8px rgba(10, 37, 64, 0.04)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <Sparkles size={16} style={{ color: 'var(--color-blue)' }} />
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-navy)' }}>
                    Exemple de question résolue : « Comment appliquer les congés conventionnels d’ancienneté CCN 66 ? »
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--color-navy-muted)', lineHeight: 1.55, margin: 0 }}>
                  <strong>Synthèse immédiate :</strong> Selon l'article 22 de la CCN 66, vos salariés bénéficient de 2 jours de congés supplémentaires par tranche de 5 ans d'ancienneté (plafonnés à 6 jours). Ils se cumulent avec les 2,5 jours ouvrables légaux. Pour vos éducateurs spécialisés, les congés trimestriels s'y ajoutent conformément aux dispositions de l'annexe 3.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SIGNATURE PILOTASSO SECTION:
          "Combien de fichiers devez-vous ouvrir pour savoir où en est votre association ?"
          ========================================================================= */}
      <section style={{
        backgroundColor: '#f8fafc',
        padding: 'var(--space-16) var(--space-6)',
        borderBottom: '1px solid var(--color-border)'
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
            <span style={{
              color: 'var(--color-blue)',
              fontWeight: 700,
              fontSize: '13px',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              display: 'inline-block',
              marginBottom: '10px'
            }}>
              Positionnement & Constat de terrain
            </span>
            <h2 style={{
              fontSize: 'clamp(28px, 4vw, 42px)',
              fontWeight: 800,
              color: 'var(--color-navy)',
              lineHeight: 1.2,
              marginBottom: 'var(--space-4)'
            }}>
              Combien de fichiers devez-vous ouvrir pour savoir où en est votre association ?
            </h2>
            <p style={{
              fontSize: 'var(--text-lg)',
              color: 'var(--color-navy-muted)',
              lineHeight: 1.6,
              maxWidth: 780,
              margin: '0 auto'
            }}>
              Un tableau Excel pour le budget, un autre pour la trésorerie, un espace partagé pour les subventions, des documents dispersés pour les projets et les conventions collectives... Chaque réponse demande d'ouvrir plusieurs outils, et l'information n'est jamais tout à fait à jour.
            </p>
          </div>

          {/* Centralizing Message */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            border: '1.5px solid var(--color-border)',
            padding: '32px',
            marginBottom: 'var(--space-12)',
            textAlign: 'center',
            boxShadow: 'var(--shadow-card)'
          }}>
            <h3 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-navy)', marginBottom: '8px' }}>
              Vos outils peuvent rester. Votre pilotage se centralise.
            </h3>
            <p style={{ fontSize: '15px', color: 'var(--color-navy-muted)', maxWidth: 720, margin: '0 auto', lineHeight: 1.6 }}>
              AssoExpert IA ne vous demande pas de tout remplacer. La plateforme se connecte progressivement à ce que vous utilisez déjà pour vous donner un point central où retrouver l'essentiel en toute sérénité.
            </p>
          </div>

          {/* The Famous 2-Card Comparison: Avant vs Avec (Signature PilotAsso) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 'var(--space-8)',
            alignItems: 'stretch'
          }}>
            {/* Avant AssoExpert IA */}
            <div className="pilot-compare-card pilot-compare-before">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  backgroundColor: '#fee2e2',
                  color: '#dc2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800
                }}>
                  &times;
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#991b1b' }}>
                  Avant AssoExpert IA
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {[
                  'Multiplication des fichiers Excel et versions éparpillées',
                  'Informations juridiques et financières dispersées',
                  'Consolidation manuelle et ressaisies quotidiennes',
                  'Interprétations hasardeuses des conventions (CCN 66, 51, Éclat, Alisfa)',
                  'Angoisse permanente des prud’hommes et redressements',
                  'Manque de visibilité globale pour les administrateurs bénévoles',
                  'Opportunités de subventions et échéances CER manquées'
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '14px', color: '#4b5563' }}>
                    <span style={{ color: '#ef4444', fontWeight: 800, minWidth: 16 }}>&minus;</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Avec AssoExpert IA */}
            <div className="pilot-compare-card pilot-compare-after">
              <div style={{
                position: 'absolute',
                top: -12,
                right: 24,
                backgroundColor: 'var(--color-blue)',
                color: '#ffffff',
                padding: '2px 12px',
                borderRadius: 'var(--radius-pill)',
                fontSize: '11px',
                fontWeight: 800,
                letterSpacing: '0.04em'
              }}>
                PILOTAGE SÉCURISÉ
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(193, 255, 114, 0.4)',
                  color: 'var(--color-navy)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800
                }}>
                  &check;
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-navy)' }}>
                  Avec AssoExpert IA
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {[
                  'Informations centralisées en un point de pilotage unique',
                  'Budgets et trésorerie actualisés en temps réel',
                  'Conventions collectives intégrées et appliquées au millimètre',
                  'Vision globale à 360° partagée avec le Bureau et le CA',
                  'Automatisations des calculs et veilles juridiques',
                  'Escalade humaine sous 48h vers Laetitia Badji (Cabinet Maé)',
                  'Recherche et calendrier centralisé des financements publics'
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '14px', color: 'var(--color-navy)' }}>
                    <CheckCircle2 size={18} style={{ color: 'var(--color-blue)', minWidth: 18, marginTop: 1 }} />
                    <span style={{ fontWeight: 500 }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SOLUTIONS INTERACTIVE SECTION (PilotAsso 360° Vision)
          ========================================================================= */}
      <section id="centralisation" style={{
        padding: 'var(--space-16) var(--space-6)',
        maxWidth: 1200,
        margin: '0 auto'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
          <span className="badge badge-blue" style={{ marginBottom: 'var(--space-3)' }}>
            Vision à 360°
          </span>
          <h2 style={{
            fontSize: 'clamp(28px, 4vw, 42px)',
            fontWeight: 800,
            color: 'var(--color-navy)',
            lineHeight: 1.2,
            marginBottom: 'var(--space-4)'
          }}>
            Une vision à 360° pour décider avec les bonnes informations
          </h2>
          <p style={{
            fontSize: 'var(--text-lg)',
            color: 'var(--color-navy-muted)',
            lineHeight: 1.6,
            maxWidth: 760,
            margin: '0 auto'
          }}>
            Finances, financements, règles RH, conventions collectives et gouvernance : AssoExpert IA rassemble ce qu'il faut connaître pour piloter votre association, sans naviguer entre dix outils différents.
          </p>

          {/* Interactive Solution Tabs Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            flexWrap: 'wrap',
            marginTop: 'var(--space-8)',
            backgroundColor: '#f8fafc',
            padding: '6px',
            borderRadius: 'var(--radius-pill)',
            border: '1px solid var(--color-border)',
            maxWidth: 960,
            margin: 'var(--space-8) auto 0'
          }}>
            {solutions.map((sol) => (
              <button
                key={sol.id}
                onClick={() => setActiveSolutionTab(sol.id)}
                className={`pilot-tab-button ${activeSolutionTab === sol.id ? 'active' : ''}`}
              >
                {sol.title}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Solution Detail Card */}
        <div className="card" style={{
          padding: 'var(--space-8)',
          borderRadius: '24px',
          border: '1.5px solid var(--color-border)',
          boxShadow: 'var(--shadow-hover)'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 'var(--space-8)',
            alignItems: 'center'
          }}>
            {/* Left Content */}
            <div>
              <span className="badge badge-lime" style={{ marginBottom: '12px', fontSize: '11px', fontWeight: 800 }}>
                {currentSolution.badge}
              </span>
              <h3 style={{ fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: 800, color: 'var(--color-navy)', marginBottom: '12px' }}>
                {currentSolution.subtitle}
              </h3>
              <p style={{ fontSize: '15px', color: 'var(--color-navy-muted)', lineHeight: 1.6, marginBottom: '20px' }}>
                {currentSolution.description}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
                {currentSolution.bullets.map((bullet, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '14px', color: 'var(--color-navy)' }}>
                    <CheckCircle2 size={18} style={{ color: 'var(--color-blue)', minWidth: 18, marginTop: 2 }} />
                    <span style={{ fontWeight: 500 }}>{bullet}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setIsDemoModalOpen(true)}
                  className="btn btn-primary"
                  style={{ borderRadius: 'var(--radius-pill)', height: 46 }}
                >
                  <span>Demander une démo de cette solution</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>

            {/* Right Preview Card */}
            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid var(--color-border)',
              borderRadius: '18px',
              padding: '24px',
              boxShadow: 'inset 0 1px 3px rgba(10, 37, 64, 0.04)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-navy-muted)', textTransform: 'uppercase' }}>
                  Aperçu de la fonctionnalité
                </span>
                <span className="live-dot" />
              </div>

              <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-navy)', marginBottom: '16px' }}>
                {currentSolution.previewData.headline}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div style={{ backgroundColor: '#ffffff', padding: '12px', borderRadius: '10px', border: '1px solid var(--color-border)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--color-navy-muted)', fontWeight: 600 }}>Indicateur 1</div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--color-blue)', marginTop: 4 }}>
                    {currentSolution.previewData.stat1}
                  </div>
                </div>
                <div style={{ backgroundColor: '#ffffff', padding: '12px', borderRadius: '10px', border: '1px solid var(--color-border)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--color-navy-muted)', fontWeight: 600 }}>Indicateur 2</div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#16a34a', marginTop: 4 }}>
                    {currentSolution.previewData.stat2}
                  </div>
                </div>
              </div>

              <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid var(--color-border)',
                borderRadius: '12px',
                padding: '14px',
                fontSize: '13px',
                color: 'var(--color-navy)',
                lineHeight: 1.5
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, marginBottom: 4 }}>
                  <Sparkles size={14} style={{ color: 'var(--color-blue)' }} />
                  <span>Automatisation active :</span>
                </div>
                {currentSolution.previewData.mockCard}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          PILOTASSO VALUES / BENEFIT SECTION:
          "Moins de tâches répétitives, plus de temps pour piloter"
          ========================================================================= */}
      <section style={{
        backgroundColor: '#f8fafc',
        padding: 'var(--space-16) var(--space-6)',
        borderTop: '1px solid var(--color-border)',
        borderBottom: '1px solid var(--color-border)'
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
            <span style={{ color: 'var(--color-blue)', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Gain d'efficacité
            </span>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, color: 'var(--color-navy)', marginTop: 8 }}>
              Moins de tâches répétitives, plus de temps pour votre mission
            </h2>
            <p style={{ fontSize: '16px', color: 'var(--color-navy-muted)', maxWidth: 660, margin: '8px auto 0' }}>
              L'automatisation et l'assistance intelligente libèrent vos équipes salariées et vos administrateurs bénévoles pour se concentrer sur l'essentiel.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
            gap: 'var(--space-6)'
          }}>
            {/* Card 1 */}
            <div className="card card-hover" style={{ padding: '32px', backgroundColor: '#ffffff', borderRadius: '18px' }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: '12px',
                backgroundColor: 'var(--color-blue-light)',
                color: 'var(--color-blue)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px'
              }}>
                <Clock size={24} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-navy)', marginBottom: '10px' }}>
                Moins de saisie manuelle
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--color-navy-muted)', lineHeight: 1.6 }}>
                L'intelligence artificielle et les règles conventionnelles intégrées prennent en charge les calculs d'ancienneté, les délais de préavis et les vérifications fastidieuses du quotidien.
              </p>
            </div>

            {/* Card 2 */}
            <div className="card card-hover" style={{ padding: '32px', backgroundColor: '#ffffff', borderRadius: '18px' }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: '12px',
                backgroundColor: 'rgba(193, 255, 114, 0.35)',
                color: 'var(--color-lime-dark)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px'
              }}>
                <Sparkles size={24} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-navy)', marginBottom: '10px' }}>
                Aide à la recherche pointue
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--color-navy-muted)', lineHeight: 1.6 }}>
                Une assistance instruite de vos conventions (CCN 66, CCN 51, Éclat, Alisfa) pour repérer immédiatement l'article exact, la jurisprudence et les seuils applicables à votre situation.
              </p>
            </div>

            {/* Card 3 */}
            <div className="card card-hover" style={{ padding: '32px', backgroundColor: '#ffffff', borderRadius: '18px' }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: '12px',
                backgroundColor: 'var(--color-orange-light)',
                color: 'var(--color-orange-dark)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px'
              }}>
                <Award size={24} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-navy)', marginBottom: '10px' }}>
                Préparation rapide des instances
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--color-navy-muted)', lineHeight: 1.6 }}>
                Moins de temps passé à rassembler l'information financière et juridique, plus de temps pour échanger sereinement lors de vos Assemblées Générales et Conseils d'Administration.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          PILOTASSO METRICS BLOCK:
          "Moins cher qu'une demi-journée de travail administratif évitée chaque mois"
          ========================================================================= */}
      <section style={{
        padding: 'var(--space-16) var(--space-6)',
        maxWidth: 1100,
        margin: '0 auto'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, color: 'var(--color-navy)', marginBottom: '12px' }}>
            Moins cher qu’une demi-journée de travail administratif évitée chaque mois
          </h2>
          <p style={{ fontSize: '16px', color: 'var(--color-navy-muted)', maxWidth: 740, margin: '0 auto', lineHeight: 1.6 }}>
            En centralisant votre pilotage, AssoExpert IA réduit le temps passé à chercher les textes, corriger les calculs de paie et préparer vos dossiers de subvention — un gain de temps qui dépasse largement le coût de l’abonnement.
          </p>
        </div>

        {/* 4 Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 'var(--space-6)',
          marginBottom: 'var(--space-8)'
        }}>
          <div className="card" style={{ padding: '28px', textAlign: 'center', backgroundColor: '#ffffff' }}>
            <div className="pilot-stat-number" style={{ color: 'var(--color-blue)' }}>10h</div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-navy)', marginTop: 8 }}>
              récupérées chaque mois
            </div>
            <div style={{ fontSize: '13px', color: 'var(--color-navy-muted)', marginTop: 4 }}>
              Temps de reporting et de vérification manuelle en moins selon nos associations pilotes.
            </div>
          </div>

          <div className="card" style={{ padding: '28px', textAlign: 'center', backgroundColor: '#ffffff' }}>
            <div className="pilot-stat-number" style={{ color: '#16a34a' }}>250 €</div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-navy)', marginTop: 8 }}>
              économisés chaque mois
            </div>
            <div style={{ fontSize: '13px', color: 'var(--color-navy-muted)', marginTop: 4 }}>
              Valeur estimée du temps administratif et juridique ainsi libéré pour votre mission.
            </div>
          </div>

          <div className="card" style={{ padding: '28px', textAlign: 'center', backgroundColor: '#ffffff' }}>
            <div className="pilot-stat-number" style={{ color: 'var(--color-navy)' }}>48h</div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-navy)', marginTop: 8 }}>
              délai garanti experte
            </div>
            <div style={{ fontSize: '13px', color: 'var(--color-navy-muted)', marginTop: 4 }}>
              Délai maximal pour recevoir une note argumentée et signée par Laetitia Badji (Cabinet Maé).
            </div>
          </div>

          <div className="card" style={{ padding: '28px', textAlign: 'center', backgroundColor: '#ffffff' }}>
            <div className="pilot-stat-number" style={{ color: '#0284c7' }}>100%</div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-navy)', marginTop: 8 }}>
              souverain & RGPD
            </div>
            <div style={{ fontSize: '13px', color: 'var(--color-navy-muted)', marginTop: 4 }}>
              Hébergement en France, aucune donnée réutilisée ni transmise à des tiers de tracking.
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--color-navy-muted)' }}>
          Estimations moyennes indicatives, basées sur les retours des associations après centralisation de leur pilotage.
        </div>
      </section>

      {/* =========================================================================
          TESTIMONIALS & PROGRAMME BÊTA (PilotAsso "Construit avec le terrain")
          ========================================================================= */}
      <section style={{
        backgroundColor: '#f8fafc',
        padding: 'var(--space-16) var(--space-6)',
        borderTop: '1px solid var(--color-border)',
        borderBottom: '1px solid var(--color-border)'
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
            <span className="badge badge-lime" style={{ marginBottom: '8px' }}>
              Construit avec le terrain
            </span>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, color: 'var(--color-navy)' }}>
              18 associations participent actuellement à la construction
            </h2>
            <p style={{ fontSize: '16px', color: 'var(--color-navy-muted)', maxWidth: 680, margin: '8px auto 0' }}>
              Le programme bêta reste ouvert à de nouvelles structures qui souhaitent influencer directement les prochaines évolutions du produit.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
            gap: 'var(--space-6)'
          }}>
            {testimonials.map((t, idx) => (
              <div key={idx} className="card card-hover" style={{
                backgroundColor: '#ffffff',
                padding: '28px',
                borderRadius: '18px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <span className="badge badge-blue" style={{ fontSize: '10px' }}>
                      {t.tag}
                    </span>
                    <Quote size={20} style={{ color: 'var(--color-border)', opacity: 0.8 }} />
                  </div>
                  <p style={{ fontSize: '14px', color: 'var(--color-navy)', lineHeight: 1.6, fontStyle: 'italic', marginBottom: '20px' }}>
                    «&nbsp;{t.quote}&nbsp;»
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-blue)',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {t.initials}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '14px', color: 'var(--color-navy)' }}>
                      {t.author}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--color-navy-muted)' }}>
                      {t.role} &bull; {t.asso}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 'var(--space-8)' }}>
            <button
              onClick={() => setIsDemoModalOpen(true)}
              className="btn btn-outline-blue"
              style={{ borderRadius: 'var(--radius-pill)', fontWeight: 700 }}
            >
              <span>Découvrir le programme bêta & réserver ma démo</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          VOYEZ ASSOEXPERT IA FONCTIONNER (PilotAsso Reassurance Banner)
          ========================================================================= */}
      <section style={{
        padding: 'var(--space-16) var(--space-6)',
        maxWidth: 1000,
        margin: '0 auto',
        textAlign: 'center'
      }}>
        <div style={{
          backgroundColor: '#0A2540',
          color: '#ffffff',
          borderRadius: '24px',
          padding: 'clamp(32px, 6vw, 60px) 32px',
          boxShadow: 'var(--shadow-float)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Subtle glow orb */}
          <div style={{
            position: 'absolute',
            bottom: -80,
            right: -80,
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(193, 255, 114, 0.25) 0%, rgba(193, 255, 114, 0) 70%)',
            pointerEvents: 'none'
          }} />

          <span style={{
            display: 'inline-block',
            backgroundColor: 'var(--color-lime)',
            color: 'var(--color-navy)',
            fontWeight: 800,
            fontSize: '11px',
            padding: '3px 12px',
            borderRadius: 'var(--radius-pill)',
            marginBottom: '16px',
            letterSpacing: '0.04em'
          }}>
            DÉMONSTRATION PERSONNALISÉE
          </span>

          <h2 style={{
            fontSize: 'clamp(28px, 4vw, 42px)',
            fontWeight: 800,
            color: '#ffffff',
            lineHeight: 1.2,
            marginBottom: '16px'
          }}>
            Voyez AssoExpert IA fonctionner avec les données de votre association
          </h2>

          <p style={{
            fontSize: '17px',
            color: '#cbd5e1',
            maxWidth: 680,
            margin: '0 auto 32px',
            lineHeight: 1.6
          }}>
            Pas de discours commercial générique : une démonstration construite autour de vos priorités (CCN 66/51/Éclat/Alisfa, budgets, échéances subventions).
          </p>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            maxWidth: 580,
            margin: '0 auto 36px',
            textAlign: 'left'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#f1f5f9', fontSize: '15px' }}>
              <CheckCircle2 size={20} style={{ color: 'var(--color-lime)', minWidth: 20 }} />
              <span>Un tour du produit adapté à votre association, pas une démo générique</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#f1f5f9', fontSize: '15px' }}>
              <CheckCircle2 size={20} style={{ color: 'var(--color-lime)', minWidth: 20 }} />
              <span>Une réponse concrète à vos questions sur la mise en place et l’import de données</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#f1f5f9', fontSize: '15px' }}>
              <CheckCircle2 size={20} style={{ color: 'var(--color-lime)', minWidth: 20 }} />
              <span>30 minutes, sans engagement, à l'heure qui vous convient le mieux</span>
            </div>
          </div>

          <button
            onClick={() => setIsDemoModalOpen(true)}
            className="btn btn-lime"
            style={{
              height: 52,
              padding: '0 36px',
              fontSize: '16px',
              fontWeight: 800,
              borderRadius: 'var(--radius-pill)',
              color: 'var(--color-navy)'
            }}
          >
            <span>Réserver ma démo gratuite</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* =========================================================================
          PRICING SECTION (PilotAsso Style)
          ========================================================================= */}
      <section id="tarifs" style={{
        backgroundColor: '#ffffff',
        borderTop: '1px solid var(--color-border)',
        borderBottom: '1px solid var(--color-border)',
        padding: 'var(--space-16) var(--space-6)'
      }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
            <span className="badge badge-lime" style={{ marginBottom: '8px' }}>
              Tarification claire & sans engagement
            </span>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, color: 'var(--color-navy)', marginBottom: '12px' }}>
              Votre association a mieux à faire que comparer des grilles opaques
            </h2>
            <p style={{ color: 'var(--color-navy-muted)', maxWidth: 660, margin: '0 auto', fontSize: '16px' }}>
              Des forfaits transparents pensés pour les structures employeuses de 1 à 100 salariés. Modifiez ou résiliez sans préavis.
            </p>

            {/* Billing Cycle Toggle */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              backgroundColor: '#f1f5f9',
              padding: '4px 8px',
              borderRadius: 'var(--radius-pill)',
              marginTop: 'var(--space-6)',
              fontSize: '14px',
              fontWeight: 700
            }}>
              <button
                onClick={() => setBillingCycle('monthly')}
                style={{
                  padding: '6px 16px',
                  borderRadius: 'var(--radius-pill)',
                  backgroundColor: billingCycle === 'monthly' ? '#ffffff' : 'transparent',
                  color: billingCycle === 'monthly' ? 'var(--color-navy)' : 'var(--color-navy-muted)',
                  boxShadow: billingCycle === 'monthly' ? '0 2px 6px rgba(10,37,64,0.06)' : 'none',
                  cursor: 'pointer'
                }}
              >
                Facturation mensuelle
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                style={{
                  padding: '6px 16px',
                  borderRadius: 'var(--radius-pill)',
                  backgroundColor: billingCycle === 'yearly' ? '#ffffff' : 'transparent',
                  color: billingCycle === 'yearly' ? 'var(--color-navy)' : 'var(--color-navy-muted)',
                  boxShadow: billingCycle === 'yearly' ? '0 2px 6px rgba(10,37,64,0.06)' : 'none',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>Annuel</span>
                <span className="badge badge-lime" style={{ fontSize: '9px', padding: '1px 6px' }}>
                  2 mois offerts
                </span>
              </button>
            </div>
          </div>

          {/* 3 Pricing Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 'var(--space-6)',
            alignItems: 'stretch'
          }}>
            {plans.map((p) => {
              const displayPrice = billingCycle === 'yearly' 
                ? Math.round(p.priceMonthly * 0.83) 
                : p.priceMonthly;

              return (
                <div
                  key={p.code}
                  className="card card-hover"
                  style={{
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    borderColor: p.highlighted ? 'var(--color-blue)' : 'var(--color-border)',
                    borderWidth: p.highlighted ? '2px' : '1px',
                    boxShadow: p.highlighted ? '0 12px 36px rgba(0, 74, 173, 0.16)' : 'var(--shadow-card)',
                    padding: '32px',
                    borderRadius: '20px'
                  }}
                >
                  {p.highlighted && (
                    <div style={{
                      position: 'absolute',
                      top: -13,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      backgroundColor: 'var(--color-blue)',
                      color: '#ffffff',
                      padding: '4px 16px',
                      borderRadius: 'var(--radius-pill)',
                      fontSize: '11px',
                      fontWeight: 800,
                      letterSpacing: '0.04em',
                      boxShadow: '0 4px 12px rgba(0, 74, 173, 0.35)'
                    }}>
                      RECOMMANDÉ POUR LES ASSOCIATIONS
                    </div>
                  )}

                  <div style={{ marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-navy)', marginBottom: '6px' }}>
                      {p.label}
                    </h3>
                    <p style={{ fontSize: '14px', color: 'var(--color-navy-muted)', lineHeight: 1.5 }}>
                      {p.description}
                    </p>
                  </div>

                  {/* Price */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '6px',
                    marginBottom: '24px',
                    paddingBottom: '20px',
                    borderBottom: '1px solid var(--color-border)'
                  }}>
                    <span style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '44px',
                      fontWeight: 800,
                      color: 'var(--color-navy)',
                      letterSpacing: '-0.03em'
                    }}>
                      {displayPrice}&nbsp;€
                    </span>
                    <span style={{ color: 'var(--color-navy-muted)', fontSize: '13px', fontWeight: 600 }}>
                      / mois HT
                    </span>
                  </div>

                  {/* Features List */}
                  <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                      <CheckCircle2 size={18} style={{ color: 'var(--color-blue)', minWidth: 18 }} />
                      <span>Moteur IA spécialisé : <strong>{p.features.aiModel}</strong></span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                      <CheckCircle2 size={18} style={{ color: 'var(--color-blue)', minWidth: 18 }} />
                      <span>Briques : <strong>RH & Gouvernance Loi 1901</strong></span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: p.features.briqueFinance ? 'var(--color-navy)' : '#94a3b8' }}>
                      {p.features.briqueFinance ? (
                        <CheckCircle2 size={18} style={{ color: 'var(--color-blue)', minWidth: 18 }} />
                      ) : (
                        <Lock size={18} style={{ color: '#94a3b8', minWidth: 18 }} />
                      )}
                      <span>Brique <strong>Finance, Budget & CER</strong></span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: p.features.briqueConformite ? 'var(--color-navy)' : '#94a3b8' }}>
                      {p.features.briqueConformite ? (
                        <CheckCircle2 size={18} style={{ color: 'var(--color-blue)', minWidth: 18 }} />
                      ) : (
                        <Lock size={18} style={{ color: '#94a3b8', minWidth: 18 }} />
                      )}
                      <span>Brique <strong>Conformité & DUERP</strong></span>
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      fontSize: '14px',
                      backgroundColor: p.features.expertQuestionsMonth > 0 ? 'var(--color-lime-glow)' : 'transparent',
                      padding: p.features.expertQuestionsMonth > 0 ? '10px 12px' : '0',
                      borderRadius: 'var(--radius-sm)'
                    }}>
                      <Award size={18} style={{ color: p.features.expertQuestionsMonth > 0 ? 'var(--color-navy)' : '#94a3b8', minWidth: 18 }} />
                      <span>
                        {p.features.expertQuestionsMonth > 0 ? (
                          <strong>{p.features.expertQuestionsMonth} note experte Cabinet Maé / mois</strong>
                        ) : (
                          <span style={{ color: '#94a3b8' }}>Sans escalade experte incluse</span>
                        )}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onStartOnboarding(p.code)}
                    className={p.highlighted ? 'btn btn-primary' : 'btn btn-secondary'}
                    style={{ width: '100%', height: 48, borderRadius: 'var(--radius-pill)', fontWeight: 700 }}
                  >
                    <span>Choisir l'offre {p.label.split(' ')[0]}</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* PilotAsso-Style Reassurance Callout */}
          <div style={{
            marginTop: 'var(--space-12)',
            padding: '24px',
            backgroundColor: '#f8fafc',
            borderRadius: '16px',
            border: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: 'var(--color-blue-light)', color: 'var(--color-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '15px', color: 'var(--color-navy)' }}>
                  Accompagnement d’onboarding recommandé à la mise en place
                </div>
                <div style={{ fontSize: '13px', color: 'var(--color-navy-muted)' }}>
                  Import de vos conventions, paramétrage de vos effectifs et formation de votre équipe avec nos juristes.
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsDemoModalOpen(true)}
              className="btn btn-sm btn-secondary"
              style={{ fontWeight: 700 }}
            >
              Voir les modalités &rarr;
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          L'EXPERTE / CABINET MAÉ SECTION
          ========================================================================= */}
      <section id="experte" style={{ maxWidth: 1100, margin: 'var(--space-16) auto', padding: '0 var(--space-6)' }}>
        <div className="card" style={{
          background: 'linear-gradient(135deg, #07192b 0%, var(--color-navy) 60%, #153759 100%)',
          color: '#ffffff',
          borderRadius: '24px',
          padding: 'var(--space-12)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 'var(--space-8)',
          alignItems: 'center',
          boxShadow: 'var(--shadow-float)'
        }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'var(--color-lime)',
              color: 'var(--color-navy)',
              padding: '3px 12px',
              borderRadius: 'var(--radius-pill)',
              fontSize: '11px',
              fontWeight: 800,
              marginBottom: 'var(--space-4)'
            }}>
              L'EXPERTISE DU CABINET MAÉ
            </div>
            <h2 style={{ color: '#ffffff', fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-4)' }}>
              Une juriste reconnue du secteur associatif à vos côtés
            </h2>
            <p style={{ color: '#cbd5e1', lineHeight: 1.6, marginBottom: 'var(--space-4)', fontSize: 'var(--text-base)' }}>
              Derrière l'intelligence artificielle, vous bénéficiez de l'accompagnement direct de <strong>Laetitia Badji</strong> (Cabinet Maé / AKILIGUE SAS), juriste spécialisée depuis plus de 15 ans dans le médico-social, l'animation et l'insertion.
            </p>
            <p style={{ color: '#cbd5e1', lineHeight: 1.6, marginBottom: 'var(--space-6)', fontSize: 'var(--text-base)' }}>
              Chaque question escaladée fait l'objet d'un examen approfondi de vos pièces et de vos conventions pour vous délivrer une réponse formelle sous 48h ouvrées.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={20} style={{ color: 'var(--color-lime)' }} />
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700 }}>Délai garanti : 48h ouvrées</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={20} style={{ color: 'var(--color-lime)' }} />
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700 }}>+15 ans d'expérience associative</span>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 140,
              height: 140,
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '3px solid var(--color-lime)',
              margin: '0 auto var(--space-4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-lime)'
            }}>
              <Compass size={68} style={{ color: 'var(--color-lime)' }} />
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '22px' }}>
              Laetitia Badji
            </div>
            <div style={{ color: 'var(--color-lime)', fontSize: 'var(--text-sm)', fontWeight: 600 }}>
              Cabinet Maé &bull; AKILIGUE SAS
            </div>
            <div style={{ color: '#94a3b8', fontSize: 'var(--text-xs)', marginTop: 4 }}>
              contact@cabinet-mae.fr
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SEO & RICH SNIPPETS INSPECTION TOOL
          ========================================================================= */}
      <section style={{ maxWidth: 1100, margin: 'var(--space-8) auto', padding: '0 var(--space-6)' }}>
        <div className="card" style={{ border: '1px solid var(--color-border)', backgroundColor: '#ffffff' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-blue-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-blue)'
              }}>
                <Code2 size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: 'var(--text-base)', color: 'var(--color-navy)', fontWeight: 700 }}>
                  Gabarit SEO & Balisage JSON-LD Schema.org
                </h3>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-navy-muted)' }}>
                  Indexation et données structurées prêtes pour Google et les moteurs de recherche.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowJsonLdModal(!showJsonLdModal)}
              className="btn btn-sm btn-outline-blue"
            >
              <FileSearch size={14} />
              <span>{showJsonLdModal ? 'Masquer le JSON-LD' : 'Inspecter le JSON-LD en direct'}</span>
            </button>
          </div>

          {showJsonLdModal && (
            <div style={{ marginTop: 'var(--space-4)', backgroundColor: 'var(--color-navy)', color: '#38bdf8', padding: '16px', borderRadius: 'var(--radius-md)', fontSize: '13px', overflowX: 'auto', fontFamily: 'monospace' }}>
              <pre>{JSON.stringify(jsonLdData, null, 2)}</pre>
            </div>
          )}
        </div>
      </section>

      {/* =========================================================================
          FAQ SECTION (PilotAsso Style)
          ========================================================================= */}
      <section id="faq" style={{ maxWidth: 900, margin: 'var(--space-16) auto', padding: '0 var(--space-6)' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
          <span className="badge badge-blue" style={{ marginBottom: '8px' }}>
            Questions fréquentes
          </span>
          <h2 style={{ fontSize: 'var(--text-3xl)', color: 'var(--color-navy)', marginBottom: '8px', fontWeight: 800 }}>
            Tout ce que vous devez savoir sur AssoExpert IA
          </h2>
          <p style={{ color: 'var(--color-navy-muted)', fontSize: '15px' }}>
            Des réponses claires pour vous guider avant d'équiper votre structure.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {faqs.map((f, idx) => (
            <div
              key={idx}
              className="card card-hover"
              style={{
                cursor: 'pointer',
                padding: 'var(--space-4) var(--space-6)',
                backgroundColor: '#ffffff'
              }}
              onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                <span style={{ fontWeight: 700, fontSize: '16px', color: 'var(--color-navy)' }}>
                  {f.q}
                </span>
                <ChevronRight
                  size={18}
                  style={{
                    color: 'var(--color-blue)',
                    transform: activeFaq === idx ? 'rotate(90deg)' : 'none',
                    transition: 'transform var(--transition-fast)'
                  }}
                />
              </div>
              {activeFaq === idx && (
                <div style={{
                  marginTop: 'var(--space-3)',
                  color: 'var(--color-navy-muted)',
                  fontSize: '14px',
                  lineHeight: 1.6,
                  borderTop: '1px solid var(--color-border)',
                  paddingTop: 'var(--space-3)'
                }}>
                  {f.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          PILOTASSO-STYLE BOTTOM CTA BANNER
          ========================================================================= */}
      <section style={{
        backgroundColor: '#f8fafc',
        borderTop: '1px solid var(--color-border)',
        padding: 'var(--space-16) var(--space-6)',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(26px, 4vw, 36px)', fontWeight: 800, color: 'var(--color-navy)', marginBottom: '12px' }}>
            30 minutes suffisent pour voir si AssoExpert IA répond à vos besoins
          </h2>
          <p style={{ fontSize: '16px', color: 'var(--color-navy-muted)', marginBottom: '28px' }}>
            Une démonstration personnalisée, construite autour de vos conventions collectives et de vos priorités de gestion.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setIsDemoModalOpen(true)}
              className="btn btn-primary"
              style={{ height: 50, padding: '0 32px', borderRadius: 'var(--radius-pill)', fontWeight: 700 }}
            >
              <span>Réserver ma démo gratuite</span>
              <ArrowRight size={18} />
            </button>
            <button
              onClick={() => onStartOnboarding('pro')}
              className="btn btn-secondary"
              style={{ height: 50, padding: '0 24px', borderRadius: 'var(--radius-pill)', fontWeight: 600 }}
            >
              <span>S'abonner en ligne</span>
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          PILOTASSO-STYLE FULL FOOTER
          ========================================================================= */}
      <footer style={{
        backgroundColor: '#ffffff',
        borderTop: '1px solid var(--color-border)',
        padding: 'var(--space-16) var(--space-6) var(--space-8)'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--space-8)',
            marginBottom: 'var(--space-12)'
          }}>
            {/* Brand column */}
            <div style={{ gridColumn: 'span 1' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, var(--color-blue) 0%, #003680 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff'
                }}>
                  <Compass size={18} />
                </div>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '18px', color: 'var(--color-navy)' }}>
                  AssoExpert<span style={{ color: 'var(--color-blue)' }}>.IA</span>
                </span>
              </div>
              <p style={{ color: 'var(--color-navy-muted)', fontSize: '13px', lineHeight: 1.6, marginBottom: '16px' }}>
                La plateforme de pilotage des associations. Construite avec des associations, pour les associations.
              </p>
              <div style={{ fontSize: '12px', color: 'var(--color-navy-muted)' }}>
                Éditée par <strong>Cabinet Maé / AKILIGUE SAS</strong>
              </div>
            </div>

            {/* Produit & Solutions */}
            <div>
              <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--color-navy)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Solutions
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                <li><a href="#centralisation" style={{ color: 'var(--color-navy-muted)' }}>Centralisation du pilotage</a></li>
                <li><a href="#finances" style={{ color: 'var(--color-navy-muted)' }}>Pilotez vos finances</a></li>
                <li><a href="#financements" style={{ color: 'var(--color-navy-muted)' }}>Trouvez et suivez vos financements</a></li>
                <li><a href="#rh" style={{ color: 'var(--color-navy-muted)' }}>RH & Conventions collectives</a></li>
                <li><a href="#gouvernance" style={{ color: 'var(--color-navy-muted)' }}>Gouvernance Loi 1901</a></li>
                <li><a href="#centralisation" style={{ color: 'var(--color-navy-muted)' }}>Conformité & DUERP</a></li>
              </ul>
            </div>

            {/* Ressources & Entreprise */}
            <div>
              <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--color-navy)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Entreprise & Tarifs
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                <li><a href="#tarifs" style={{ color: 'var(--color-navy-muted)' }}>Tarifs & Abonnements</a></li>
                <li><button onClick={() => setIsDemoModalOpen(true)} style={{ background: 'none', border: 'none', padding: 0, color: 'var(--color-navy-muted)', cursor: 'pointer', fontSize: '13px', textAlign: 'left' }}>Demander une démo (30 min)</button></li>
                <li><a href="#faq" style={{ color: 'var(--color-navy-muted)' }}>FAQ & Ressources</a></li>
                <li><a href="#experte" style={{ color: 'var(--color-navy-muted)' }}>L'Experte Laetitia Badji</a></li>
                <li><a href="mailto:contact@cabinet-mae.fr" style={{ color: 'var(--color-navy-muted)' }}>Contact</a></li>
              </ul>
            </div>

            {/* Newsletter Subscription (PilotAsso Style) */}
            <div>
              <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--color-navy)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Restez informé
              </div>
              <p style={{ color: 'var(--color-navy-muted)', fontSize: '13px', lineHeight: 1.5, marginBottom: '12px' }}>
                Recevez l'actualité réglementaire et les évolutions d'AssoExpert IA avant tout le monde.
              </p>

              {newsletterSubscribed ? (
                <div style={{ backgroundColor: '#ebf3fd', color: 'var(--color-blue)', padding: '10px', borderRadius: '8px', fontSize: '12px', fontWeight: 600 }}>
                  &check; Merci ! Vous êtes bien inscrit(e) à la veille associative.
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (newsletterEmail) setNewsletterSubscribed(true);
                  }}
                  style={{ display: 'flex', gap: '6px' }}
                >
                  <input
                    type="email"
                    required
                    placeholder="Votre email pro"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    style={{
                      flexGrow: 1,
                      height: 38,
                      padding: '0 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--color-border)',
                      fontSize: '13px'
                    }}
                  />
                  <button
                    type="submit"
                    className="btn btn-sm btn-primary"
                    style={{ height: 38, padding: '0 12px' }}
                  >
                    <Send size={14} />
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Bottom Legal & Copyright Bar */}
          <div style={{
            borderTop: '1px solid var(--color-border)',
            paddingTop: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            fontSize: '12px',
            color: 'var(--color-navy-muted)'
          }}>
            <div>
              &copy; 2026 AssoExpert IA &bull; Cabinet Maé / AKILIGUE SAS. Tous droits réservés.
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <span>Hébergement souverain VPS France</span>
              <span>100% RGPD</span>
              <a href="#faq" style={{ color: 'var(--color-navy-muted)' }}>Mentions Légales</a>
              <a href="#faq" style={{ color: 'var(--color-navy-muted)' }}>Confidentialité</a>
              <a href="#faq" style={{ color: 'var(--color-navy-muted)' }}>CGU & CGV</a>
            </div>
          </div>
        </div>
      </footer>

      {/* =========================================================================
          INTERACTIVE DEMO BOOKING MODAL (PilotAsso "Réserver ma démo de 30 min")
          ========================================================================= */}
      {isDemoModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(10, 37, 64, 0.65)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '16px'
        }}>
          <div className="card animate-fade-in" style={{
            maxWidth: 520,
            width: '100%',
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            padding: '32px',
            boxShadow: 'var(--shadow-float)',
            position: 'relative'
          }}>
            {/* Close Button */}
            <button
              onClick={() => { setIsDemoModalOpen(false); setDemoSubmitted(false); }}
              style={{
                position: 'absolute',
                top: 18,
                right: 18,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-navy-muted)'
              }}
              aria-label="Fermer"
            >
              <X size={22} />
            </button>

            {demoSubmitted ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div style={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(193, 255, 114, 0.4)',
                  color: 'var(--color-lime-dark)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}>
                  <CheckCircle2 size={36} />
                </div>
                <h3 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-navy)', marginBottom: '8px' }}>
                  Votre demande de démo est enregistrée !
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--color-navy-muted)', lineHeight: 1.6, marginBottom: '24px' }}>
                  Un membre de l'équipe du Cabinet Maé vous contactera sous 24h ouvrées pour convenir du créneau de 30 minutes adapté à <strong>{demoForm.assoName}</strong>.
                </p>
                <button
                  onClick={() => { setIsDemoModalOpen(false); setDemoSubmitted(false); }}
                  className="btn btn-primary"
                  style={{ borderRadius: 'var(--radius-pill)', width: '100%' }}
                >
                  Fermer
                </button>
              </div>
            ) : (
              <div>
                <div style={{ marginBottom: '20px' }}>
                  <span className="badge badge-lime" style={{ marginBottom: '6px' }}>
                    30 minutes sans engagement
                  </span>
                  <h3 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-navy)', marginBottom: '6px' }}>
                    Réserver une démo d’AssoExpert IA
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--color-navy-muted)' }}>
                    Construite autour de vos priorités (conventions, budgets, subventions).
                  </p>
                </div>

                <form onSubmit={handleDemoSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-navy)', display: 'block', marginBottom: 4 }}>
                      Votre nom & fonction
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex : Céline Lambert (Directrice Générale)"
                      className="input"
                      value={demoForm.name}
                      onChange={(e) => setDemoForm({ ...demoForm, name: e.target.value })}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-navy)', display: 'block', marginBottom: 4 }}>
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

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-navy)', display: 'block', marginBottom: 4 }}>
                        Nom de l'association
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
                      <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-navy)', display: 'block', marginBottom: 4 }}>
                        Taille de l'équipe
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
                        <option value="Bénévoles uniquement">Bénévoles uniquement</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-navy)', display: 'block', marginBottom: 4 }}>
                      Convention collective principale
                    </label>
                    <select
                      className="select"
                      value={demoForm.ccn}
                      onChange={(e) => setDemoForm({ ...demoForm, ccn: e.target.value })}
                    >
                      <option value="CCN 66 (Médico-social)">CCN 66 (Établissements pour personnes inadaptées)</option>
                      <option value="CCN 51 (FEHAP)">CCN 51 (FEHAP - Santé & médico-social)</option>
                      <option value="ÉCLAT (Animation)">ÉCLAT (Animation socio-culturelle)</option>
                      <option value="ALISFA (Centres sociaux)">ALISFA (Lien social & familial)</option>
                      <option value="Autre / Sans CCN">Autre convention collective</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-navy)', display: 'block', marginBottom: 4 }}>
                      Vos priorités actuelles (optionnel)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex : Congés d'ancienneté, contrôle CER, refonte statuts"
                      className="input"
                      value={demoForm.message}
                      onChange={(e) => setDemoForm({ ...demoForm, message: e.target.value })}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ height: 48, borderRadius: 'var(--radius-pill)', fontWeight: 700, marginTop: 8 }}
                  >
                    <span>Confirmer ma demande de démo</span>
                    <ArrowRight size={16} />
                  </button>

                  <div style={{ fontSize: '11px', color: 'var(--color-navy-muted)', textAlign: 'center' }}>
                    Pas de paiement requis &bull; Confidentialité garantie &bull; Sans engagement
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
