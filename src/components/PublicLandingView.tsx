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
  Code2,
  FileSearch,
  LogIn
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

  const domains = [
    {
      id: 'rh',
      icon: <Users size={26} style={{ color: '#ffffff' }} />,
      gradient: 'linear-gradient(135deg, #004AAD 0%, #1f6fd8 100%)',
      title: 'RH & Conventions Collectives',
      description: 'L expertise pointue sur vos conventions : CCN 66, CCN 51 (FEHAP), ÉCLAT (Animation), ALISFA.',
      details: ['Congés d ancienneté & congés trimestriels', 'Grilles de classifications & salaires conventionnels', 'Ruptures conventionnelles & calcul des préavis']
    },
    {
      id: 'gouvernance',
      icon: <Scale size={26} style={{ color: '#ffffff' }} />,
      gradient: 'linear-gradient(135deg, #0A2540 0%, #224368 100%)',
      title: 'Gouvernance Loi 1901',
      description: 'Sécurisez juridiquement vos instances et guidez sereinement vos administrateurs bénévoles.',
      details: ['Quorum d Assemblée Générale & vote par procuration', 'Responsabilité civile et pénale des dirigeants', 'Délégations de pouvoirs et refonte des statuts']
    },
    {
      id: 'finance',
      icon: <FileText size={26} style={{ color: '#ffffff' }} />,
      gradient: 'linear-gradient(135deg, #004AAD 0%, #0077e6 100%)',
      title: 'Finance & Subventions',
      description: 'Justifiez rigoureusement l utilisation des fonds publics et fiabilisez vos clôtures d exercice.',
      details: ['Compte d Emploi des Ressources (CER)', 'Traitement des reliquats non consommés (fonds dédiés)', 'Seuil légal de Commissaire aux comptes (153 k€)']
    },
    {
      id: 'conformite',
      icon: <ShieldCheck size={26} style={{ color: '#ffffff' }} />,
      gradient: 'linear-gradient(135deg, #0A2540 0%, #173b5c 100%)',
      title: 'Conformité & DUERP',
      description: 'Protégez vos salariés et respectez scrupuleusement la réglementation du travail associatif.',
      details: ['Document Unique d Évaluation des Risques Professionnels', 'Affichages obligatoires & registre unique du personnel', 'Mise en conformité RGPD (salariés et adhérents)']
    }
  ];

  const faqs = [
    {
      q: 'En quoi AssoExpert IA est-il différent d un outil d IA généraliste comme ChatGPT ?',
      a: 'AssoExpert IA intègre nativement les conventions collectives spécifiques au monde associatif (CCN66, CCN51, Éclat, Alisfa) ainsi que les particularités de la loi 1901. Il contextualise systématiquement chaque réponse selon la convention, la taille et les financeurs déclarés de votre association. Surtout, vous bénéficiez d une escalade humaine vers Laetitia Badji (Cabinet Maé), juriste experte du secteur, avec réponse argumentée sous 48h ouvrées.'
    },
    {
      q: 'Comment fonctionne l escalade vers l experte humaine ?',
      a: 'Dès qu une situation nécessite une analyse délicate, un litige potentiel ou une validation formelle, un simple bouton préremplit votre demande. Laetitia Badji examine personnellement votre dossier et vos conventions, puis vous adresse une note juridique personnalisée sous 48h ouvrées.'
    },
    {
      q: 'Nos données et questions restent-elles strictement confidentielles ?',
      a: 'Oui. Le contenu de vos questions et des réponses n est jamais envoyé dans les outils d analytics, de logs ou d erreurs (GlitchTip / Sentry). Aucune donnée n est utilisée pour réentraîner des modèles publics. Vos données restent cantonnées à votre organisation.'
    },
    {
      q: 'Puis-je changer de formule ou résilier sans engagement ?',
      a: 'Oui, tous nos abonnements sont sans engagement de durée. Vous pouvez modifier votre formule ou résilier en totale autonomie en un clic via le portail Stripe sécurisé.'
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

  return (
    <div className="animate-fade-in" style={{ paddingBottom: 'var(--space-16)' }}>
      {/* Public Visitor Header Navbar */}
      <nav style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid var(--color-border)',
        padding: '14px 24px',
        position: 'sticky',
        top: 45,
        zIndex: 40,
        boxShadow: '0 2px 8px rgba(10, 37, 64, 0.04)'
      }}>
        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--color-blue) 0%, #003680 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 12px rgba(0, 74, 173, 0.25)'
            }}>
              <Compass size={24} />
            </div>
            <div>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: '20px',
                color: 'var(--color-navy)',
                letterSpacing: '-0.02em'
              }}>
                AssoExpert<span style={{ color: 'var(--color-blue)' }}>.IA</span>
              </span>
              <span className="badge badge-lime" style={{ fontSize: '9px', padding: '1px 6px', marginLeft: '6px' }}>
                Cabinet Maé
              </span>
            </div>
          </div>

          {/* Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', fontSize: '14px', fontWeight: 600, color: 'var(--color-navy)' }}>
            <a href="#domaines" style={{ color: 'var(--color-navy)' }}>Les 4 Domaines</a>
            <a href="#tarifs" style={{ color: 'var(--color-navy)' }}>Tarifs</a>
            <a href="#experte" style={{ color: 'var(--color-navy)' }}>L'Experte</a>
            <a href="#faq" style={{ color: 'var(--color-navy)' }}>FAQ</a>
          </div>

          {/* Connection Button for Visitors */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button
              onClick={onOpenLogin}
              className="btn btn-sm btn-primary"
              style={{ fontWeight: 700 }}
            >
              <LogIn size={15} />
              <span>Se connecter</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        position: 'relative',
        background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(0, 74, 173, 0.12) 0%, rgba(245, 247, 250, 0) 100%), #ffffff',
        padding: 'var(--space-16) var(--space-6) var(--space-12)',
        borderBottom: '1px solid var(--color-border)',
        overflow: 'hidden'
      }}>
        {/* Subtle decorative glowing orb */}
        <div style={{
          position: 'absolute',
          top: -120,
          right: '15%',
          width: 450,
          height: 450,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(193, 255, 114, 0.25) 0%, rgba(193, 255, 114, 0) 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(0, 74, 173, 0.08)',
            border: '1px solid rgba(0, 74, 173, 0.2)',
            color: 'var(--color-blue)',
            padding: '6px 18px',
            borderRadius: 'var(--radius-pill)',
            fontSize: 'var(--text-sm)',
            fontWeight: 700,
            marginBottom: 'var(--space-6)'
          }}>
            <Sparkles size={16} />
            <span>L'IA juridique et sociale dédiée aux associations employeuses (1 à 100 salariés)</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(34px, 5.5vw, 58px)',
            fontWeight: 800,
            color: 'var(--color-navy)',
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            marginBottom: 'var(--space-6)'
          }}>
            Sécurisez la gestion RH et la gouvernance de votre association en temps réel
          </h1>

          <p style={{
            fontSize: 'var(--text-xl)',
            color: 'var(--color-navy-muted)',
            lineHeight: 1.6,
            maxWidth: 820,
            margin: '0 auto var(--space-8)'
          }}>
            Un assistant conversationnel instruit de vos conventions collectives (<strong>CCN 66, CCN 51, ÉCLAT, ALISFA</strong>), couplé à une <strong>escalade humaine sous 48h</strong> assurée par Laetitia Badji (Cabinet Maé).
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: 'var(--space-12)' }}>
            <button
              onClick={() => onStartOnboarding('pro')}
              className="btn btn-primary"
              style={{ height: 54, padding: '0 32px', fontSize: 'var(--text-base)', boxShadow: '0 8px 24px rgba(0, 74, 173, 0.28)' }}
            >
              <span>Créer mon compte & Démarrer l'essai</span>
              <ArrowRight size={18} />
            </button>
            <button
              onClick={onOpenLogin}
              className="btn btn-secondary"
              style={{ height: 54, padding: '0 26px' }}
            >
              <LogIn size={18} style={{ color: 'var(--color-blue)' }} />
              <span>Accéder à mon espace existant</span>
            </button>
          </div>

          {/* Live Preview Card inside Hero */}
          <div className="card card-hover" style={{
            maxWidth: 850,
            margin: '0 auto',
            textAlign: 'left',
            padding: '24px',
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            boxShadow: 'var(--shadow-float)',
            border: '1.5px solid var(--color-border)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: 'var(--color-lime)', boxShadow: '0 0 10px var(--color-lime)' }} />
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-navy)' }}>
                  Exemple d'analyse pour : {currentOrg.name}
                </span>
                <span className="badge badge-blue" style={{ fontSize: '10px' }}>
                  {currentOrg.ccn.split('(')[0]}
                </span>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--color-navy-muted)' }}>
                Format officiel CDC &bull; 5 sections
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: 'var(--text-sm)' }}>
              <div style={{ backgroundColor: 'var(--color-bg-app)', padding: '12px 16px', borderRadius: '12px', borderLeft: '4px solid var(--color-blue)', fontWeight: 600 }}>
                Question : « Quels sont les congés conventionnels d'ancienneté prévus pour nos salariés ? »
              </div>
              <div style={{ color: 'var(--color-navy)', lineHeight: 1.55 }}>
                <strong>1. Synthèse directe :</strong> Selon votre convention, les salariés bénéficient de jours de congés supplémentaires s'ajoutant aux 2,5 jours ouvrables légaux par tranche de 5 ans de présence.<br />
                <strong>2. Références citées :</strong> Titre IV CCN &bull; Article L. 3141-10 du Code du travail.<br />
                <strong>3. Garantie experte :</strong> Besoin de calcul précis sur vos fiches de paie ? Laetitia Badji vous répond sous 48h.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Counter Bar */}
      <section style={{ maxWidth: 1200, margin: '-24px auto var(--space-12)', padding: '0 var(--space-6)', position: 'relative', zIndex: 2 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px'
        }}>
          <div className="card" style={{ padding: '18px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: 44, height: 44, borderRadius: '12px', backgroundColor: 'var(--color-blue-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-blue)' }}>
              <Users size={22} />
            </div>
            <div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-navy)', fontFamily: 'var(--font-display)' }}>4 Domaines</div>
              <div style={{ fontSize: '12px', color: 'var(--color-navy-muted)', fontWeight: 500 }}>RH, Gouvernance, Finance, DUERP</div>
            </div>
          </div>

          <div className="card" style={{ padding: '18px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: 44, height: 44, borderRadius: '12px', backgroundColor: 'rgba(193, 255, 114, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-lime-dark)' }}>
              <Award size={22} />
            </div>
            <div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-navy)', fontFamily: 'var(--font-display)' }}>CCN Intégrées</div>
              <div style={{ fontSize: '12px', color: 'var(--color-navy-muted)', fontWeight: 500 }}>CCN 66, CCN 51, ÉCLAT, ALISFA</div>
            </div>
          </div>

          <div className="card" style={{ padding: '18px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: 44, height: 44, borderRadius: '12px', backgroundColor: 'var(--color-orange-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-orange-dark)' }}>
              <Clock size={22} />
            </div>
            <div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-navy)', fontFamily: 'var(--font-display)' }}>48h Ouvrées</div>
              <div style={{ fontSize: '12px', color: 'var(--color-navy-muted)', fontWeight: 500 }}>Délai garanti de réponse experte</div>
            </div>
          </div>

          <div className="card" style={{ padding: '18px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: 44, height: 44, borderRadius: '12px', backgroundColor: 'var(--color-surface-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-navy)' }}>
              <ShieldCheck size={22} />
            </div>
            <div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-navy)', fontFamily: 'var(--font-display)' }}>100% RGPD</div>
              <div style={{ fontSize: '12px', color: 'var(--color-navy-muted)', fontWeight: 500 }}>Aucune donnée dans les logs</div>
            </div>
          </div>
        </div>
      </section>

      {/* The 4 Domains Section */}
      <section id="domaines" style={{ maxWidth: 1200, margin: 'var(--space-16) auto', padding: '0 var(--space-6)' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
          <span className="badge badge-blue" style={{ marginBottom: 'var(--space-3)' }}>
            Expertise métier
          </span>
          <h2 style={{ fontSize: 'var(--text-3xl)', color: 'var(--color-navy)', marginBottom: 'var(--space-3)' }}>
            Les 4 domaines d'accompagnement de l'association employeuse
          </h2>
          <p style={{ color: 'var(--color-navy-muted)', maxWidth: 660, margin: '0 auto', fontSize: 'var(--text-base)' }}>
            Une assistance rigoureuse conçue pour sécuriser le quotidien des présidents, trésoriers et directeurs salariés.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
          gap: 'var(--space-6)'
        }}>
          {domains.map((dom) => (
            <div key={dom.id} className="card card-hover" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{
                width: 52,
                height: 52,
                borderRadius: 'var(--radius-md)',
                background: dom.gradient,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 'var(--space-4)',
                boxShadow: '0 4px 12px rgba(10, 37, 64, 0.15)'
              }}>
                {dom.icon}
              </div>
              <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-2)' }}>{dom.title}</h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-navy-muted)', marginBottom: 'var(--space-4)', flexGrow: 1, lineHeight: 1.55 }}>
                {dom.description}
              </p>
              <div style={{
                borderTop: '1px solid var(--color-border)',
                paddingTop: 'var(--space-3)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                {dom.details.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: 'var(--color-navy)' }}>
                    <div style={{ minWidth: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--color-blue)', marginTop: 7 }}></div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="tarifs" style={{
        backgroundColor: '#ffffff',
        borderTop: '1px solid var(--color-border)',
        borderBottom: '1px solid var(--color-border)',
        padding: 'var(--space-16) var(--space-6)'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
            <span className="badge badge-lime" style={{ marginBottom: 'var(--space-3)' }}>
              Tarification sans engagement
            </span>
            <h2 style={{ fontSize: 'var(--text-3xl)', color: 'var(--color-navy)', marginBottom: 'var(--space-3)' }}>
              Des formules adaptées aux besoins de votre structure
            </h2>
            <p style={{ color: 'var(--color-navy-muted)', maxWidth: 620, margin: '0 auto' }}>
              Facturation mensuelle via Stripe. Changez de formule ou résiliez en toute autonomie.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 'var(--space-8)',
            alignItems: 'stretch'
          }}>
            {plans.map((p) => (
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
                  transform: p.highlighted ? 'scale(1.02)' : 'none',
                  padding: 'var(--space-8)'
                }}
              >
                {p.highlighted && (
                  <div style={{
                    position: 'absolute',
                    top: -14,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: 'var(--color-blue)',
                    color: '#ffffff',
                    padding: '4px 16px',
                    borderRadius: 'var(--radius-pill)',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 800,
                    letterSpacing: '0.04em',
                    boxShadow: '0 4px 12px rgba(0, 74, 173, 0.35)'
                  }}>
                    RECOMMANDÉ POUR LES ASSOCIATIONS
                  </div>
                )}

                <div style={{ marginBottom: 'var(--space-4)' }}>
                  <h3 style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-1)' }}>{p.label}</h3>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-navy-muted)', lineHeight: 1.45 }}>{p.description}</p>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '6px',
                  marginBottom: 'var(--space-6)',
                  paddingBottom: 'var(--space-4)',
                  borderBottom: '1px solid var(--color-border)'
                }}>
                  <span style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '48px',
                    fontWeight: 800,
                    color: 'var(--color-navy)',
                    letterSpacing: '-0.03em'
                  }}>
                    {p.priceMonthly}&nbsp;€
                  </span>
                  <span style={{ color: 'var(--color-navy-muted)', fontSize: 'var(--text-sm)', fontWeight: 600 }}>
                    / mois HT
                  </span>
                </div>

                {/* Features List */}
                <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: 'var(--space-8)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: 'var(--text-sm)' }}>
                    <CheckCircle2 size={18} style={{ color: 'var(--color-blue)', minWidth: 18 }} />
                    <span>Moteur IA : <strong>{p.features.aiModel}</strong></span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: 'var(--text-sm)' }}>
                    <CheckCircle2 size={18} style={{ color: 'var(--color-blue)', minWidth: 18 }} />
                    <span>Briques : <strong>RH & Gouvernance 1901</strong></span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: 'var(--text-sm)', color: p.features.briqueFinance ? 'var(--color-navy)' : '#94a3b8' }}>
                    {p.features.briqueFinance ? (
                      <CheckCircle2 size={18} style={{ color: 'var(--color-blue)', minWidth: 18 }} />
                    ) : (
                      <Lock size={18} style={{ color: '#94a3b8', minWidth: 18 }} />
                    )}
                    <span>Brique <strong>Finance & Subventions</strong></span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: 'var(--text-sm)', color: p.features.briqueConformite ? 'var(--color-navy)' : '#94a3b8' }}>
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
                    fontSize: 'var(--text-sm)',
                    backgroundColor: p.features.expertQuestionsMonth > 0 ? 'var(--color-lime-glow)' : 'transparent',
                    padding: p.features.expertQuestionsMonth > 0 ? '10px 12px' : '0',
                    borderRadius: 'var(--radius-sm)'
                  }}>
                    <Award size={18} style={{ color: p.features.expertQuestionsMonth > 0 ? 'var(--color-navy)' : '#94a3b8', minWidth: 18 }} />
                    <span>
                      {p.features.expertQuestionsMonth > 0 ? (
                        <strong>{p.features.expertQuestionsMonth} question experte 48h / mois</strong>
                      ) : (
                        <span style={{ color: '#94a3b8' }}>Sans question experte incluse</span>
                      )}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onStartOnboarding(p.code)}
                  className={p.highlighted ? 'btn btn-primary' : 'btn btn-secondary'}
                  style={{ width: '100%', height: 48 }}
                >
                  <span>Souscrire à l'offre {p.label.split(' ')[0]}</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* L'Experte Section */}
      <section id="experte" style={{ maxWidth: 1100, margin: 'var(--space-16) auto', padding: '0 var(--space-6)' }}>
        <div className="card" style={{
          background: 'linear-gradient(135deg, #07192b 0%, var(--color-navy) 60%, #153759 100%)',
          color: '#ffffff',
          borderRadius: '24px',
          padding: 'var(--space-12) var(--space-12)',
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
              Une experte juridique reconnue à vos côtés
            </h2>
            <p style={{ color: '#cbd5e1', lineHeight: 1.6, marginBottom: 'var(--space-4)', fontSize: 'var(--text-base)' }}>
              Derrière l'intelligence artificielle, vous bénéficiez de l'accompagnement direct de <strong>Laetitia Badji</strong> (Cabinet Maé / AKILIGUE SAS), juriste spécialisée dans le secteur médico-social, l'animation et l'insertion.
            </p>
            <p style={{ color: '#cbd5e1', lineHeight: 1.6, marginBottom: 'var(--space-6)', fontSize: 'var(--text-base)' }}>
              Chaque question escaladée est analysée au cas par cas, en tenant compte des spécificités conventionnelles de votre association et des équilibres budgétaires.
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

      {/* SEO & Schema.org Rich Snippets Inspection Tool */}
      <section style={{ maxWidth: 1200, margin: 'var(--space-12) auto', padding: '0 var(--space-6)' }}>
        <div className="card" style={{ border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
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
                <h3 style={{ fontSize: 'var(--text-base)', color: 'var(--color-navy)' }}>
                  Gabarit SEO & Balisage JSON-LD (Conforme Lot 6)
                </h3>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-navy-muted)' }}>
                  Vérification du balisage Schema.org pour l'indexation et la visibilité GEO / SEO.
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

      {/* FAQ Section */}
      <section id="faq" style={{ maxWidth: 900, margin: 'var(--space-12) auto', padding: '0 var(--space-6)' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
          <h2 style={{ fontSize: 'var(--text-2xl)', color: 'var(--color-navy)', marginBottom: 'var(--space-2)' }}>
            Questions fréquentes
          </h2>
          <p style={{ color: 'var(--color-navy-muted)', fontSize: 'var(--text-sm)' }}>
            Tout ce que vous devez savoir avant d'équiper votre association.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {faqs.map((f, idx) => (
            <div
              key={idx}
              className="card card-hover"
              style={{
                cursor: 'pointer',
                padding: 'var(--space-4) var(--space-6)'
              }}
              onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                <span style={{ fontWeight: 600, fontSize: 'var(--text-base)', color: 'var(--color-navy)' }}>
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
                <div style={{ marginTop: 'var(--space-3)', color: 'var(--color-navy-muted)', fontSize: 'var(--text-sm)', lineHeight: 1.6, borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-3)' }}>
                  {f.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        maxWidth: 1200,
        margin: 'var(--space-16) auto 0',
        padding: 'var(--space-12) var(--space-6) var(--space-8)',
        borderTop: '1px solid var(--color-border)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 'var(--space-8)',
        fontSize: 'var(--text-sm)'
      }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '20px', color: 'var(--color-navy)', marginBottom: 'var(--space-2)' }}>
            AssoExpert<span style={{ color: 'var(--color-blue)' }}>.IA</span>
          </div>
          <p style={{ color: 'var(--color-navy-muted)', fontSize: '13px', lineHeight: 1.55 }}>
            Une solution éditée par Cabinet Maé / AKILIGUE SAS pour simplifier et sécuriser la gestion des employeurs associatifs.
          </p>
        </div>

        <div>
          <div style={{ fontWeight: 700, color: 'var(--color-navy)', marginBottom: 'var(--space-2)' }}>
            Pages Piliers SEO
          </div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li><a href="#domaines">RH & Conventions Collectives</a></li>
            <li><a href="#domaines">Gouvernance Loi 1901</a></li>
            <li><a href="#domaines">Finance & Subventions</a></li>
            <li><a href="#domaines">Conformité & DUERP</a></li>
          </ul>
        </div>

        <div>
          <div style={{ fontWeight: 700, color: 'var(--color-navy)', marginBottom: 'var(--space-2)' }}>
            Conformité & Légal
          </div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--color-navy-muted)', fontSize: '13px' }}>
            <li>Hébergement : VPS France &bull; Coolify</li>
            <li>RGPD : Zéro tracking de données personnelles</li>
            <li>Conditions Générales de Vente</li>
            <li>Mentions Légales &bull; AKILIGUE SAS</li>
          </ul>
        </div>
      </footer>
    </div>
  );
};
