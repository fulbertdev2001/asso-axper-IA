import React, { useState } from 'react';
import { Plan, ExpertTicket, AiUsageRecord } from '../types';
import { 
  Settings2, 
  CheckCircle2, 
  UserCheck, 
  DollarSign, 
  Cpu, 
  Globe2, 
  FileEdit, 
  Save, 
  Search,
  MessageSquare,
  Lock,
  ArrowRight,
  LogOut,
  Sparkles,
  Scale
} from 'lucide-react';

interface AdminPayloadViewProps {
  plans: Plan[];
  onUpdatePlans: (updatedPlans: Plan[]) => void;
  tickets: ExpertTicket[];
  onUpdateTicket: (updatedTicket: ExpertTicket) => void;
  aiUsageRecords: AiUsageRecord[];
  onLogout?: () => void;
}

export const AdminPayloadView: React.FC<AdminPayloadViewProps> = ({
  plans,
  onUpdatePlans,
  tickets,
  onUpdateTicket,
  aiUsageRecords,
  onLogout
}) => {
  const [activeTab, setActiveTab] = useState<'tickets' | 'plans' | 'ai_usage' | 'seo'>('tickets');
  const [selectedTicket, setSelectedTicket] = useState<ExpertTicket | null>(tickets[0] || null);
  const [expertReply, setExpertReply] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [editablePlans, setEditablePlans] = useState<Plan[]>([...plans]);
  const [saveToast, setSaveToast] = useState(false);

  // SEO CMS State
  const [seoPages, setSeoPages] = useState([
    {
      slug: '/rh/',
      title: 'Guide RH & Conventions Collectives du secteur associatif',
      metaDescription: 'Maîtrisez les grilles CCN 66, CCN 51 et ÉCLAT. Réponses expertes sous 48h.',
      h1: 'L assistance RH dédiée aux associations employeuses'
    },
    {
      slug: '/tarifs',
      title: 'Tarifs transparents & Formules AssoExpert IA',
      metaDescription: 'Initiale, Pro et Expert. Choisissez la formule adaptée au nombre de vos salariés.',
      h1: 'Des formules claires pour toutes les associations employeuses'
    }
  ]);

  const handleSelectTicketToReview = (ticket: ExpertTicket) => {
    setSelectedTicket(ticket);
    setExpertReply(ticket.answer || '');
    setInternalNotes(ticket.internalNotes || '');
  };

  const handleSaveExpertAnswer = (markAsAnswered: boolean = true) => {
    if (!selectedTicket) return;

    const updated: ExpertTicket = {
      ...selectedTicket,
      answer: expertReply,
      internalNotes: internalNotes,
      status: markAsAnswered ? 'answered' : 'in_progress',
      answeredAt: markAsAnswered ? new Date().toISOString() : selectedTicket.answeredAt
    };

    onUpdateTicket(updated);
    setSelectedTicket(updated);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  const handlePlanPriceChange = (code: string, newPrice: number) => {
    setEditablePlans(prev => prev.map(p => p.code === code ? { ...p, priceMonthly: newPrice } : p));
  };

  const handlePlanQuotaChange = (code: string, newQuota: number) => {
    setEditablePlans(prev => prev.map(p => p.code === code ? {
      ...p,
      features: { ...p.features, expertQuestionsMonth: newQuota }
    } : p));
  };

  const handleSaveAllPlans = () => {
    onUpdatePlans(editablePlans);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  const pendingTicketsCount = tickets.filter(t => t.status !== 'answered').length;

  return (
    <div className="animate-fade-in" style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg)' }}>
      {/* SaaS Admin Header Bar for Laetitia Badji (All on 1 single row) */}
      <header style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid var(--color-border)',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        boxShadow: '0 2px 8px rgba(10, 37, 64, 0.04)',
        padding: '0 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        height: '62px'
      }}>
        {/* Left: Identity & Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, var(--color-blue) 0%, #003680 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 3px 10px rgba(0, 74, 173, 0.25)',
            flexShrink: 0
          }}>
            <Scale size={18} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: 800, fontSize: '14px', color: 'var(--color-navy)', letterSpacing: '-0.02em' }}>
                Cabinet Maé
              </span>
              <span className="badge badge-lime" style={{ fontSize: '9px', padding: '1px 5px' }}>
                Payload CMS
              </span>
            </div>
            <div className="hide-on-mobile" style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'var(--color-navy-muted)' }}>
              <span style={{
                display: 'inline-block',
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: '#10b981'
              }} />
              <span style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Laetitia Badji</span>
            </div>
          </div>
        </div>

        {/* Center: Navigation Tabs (On the SAME row) */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '2px',
          overflowX: 'auto',
          whiteSpace: 'nowrap',
          scrollbarWidth: 'none',
          height: '100%',
          flex: 1,
          justifyContent: 'center',
          minWidth: 0
        }}>
          {/* Tab 1: Questions */}
          <button
            onClick={() => setActiveTab('tickets')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0 14px',
              height: '100%',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              border: 'none',
              backgroundColor: 'transparent',
              color: activeTab === 'tickets' ? 'var(--color-blue)' : 'var(--color-navy-muted)',
              borderBottom: activeTab === 'tickets' ? '3px solid var(--color-blue)' : '3px solid transparent',
              transition: 'all 0.15s ease',
              flexShrink: 0
            }}
          >
            <UserCheck size={16} />
            <span>Questions & Arbitrages</span>
            <span className={pendingTicketsCount > 0 ? "badge badge-orange" : "badge badge-lime"} style={{ fontSize: '9px', padding: '1px 5px' }}>
              {pendingTicketsCount}
            </span>
          </button>

          {/* Tab 2: Plans */}
          <button
            onClick={() => setActiveTab('plans')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0 14px',
              height: '100%',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              border: 'none',
              backgroundColor: 'transparent',
              color: activeTab === 'plans' ? 'var(--color-blue)' : 'var(--color-navy-muted)',
              borderBottom: activeTab === 'plans' ? '3px solid var(--color-blue)' : '3px solid transparent',
              transition: 'all 0.15s ease',
              flexShrink: 0
            }}
          >
            <DollarSign size={16} />
            <span>Formules & Quotas</span>
          </button>

          {/* Tab 3: AI Telemetry */}
          <button
            onClick={() => setActiveTab('ai_usage')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0 14px',
              height: '100%',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              border: 'none',
              backgroundColor: 'transparent',
              color: activeTab === 'ai_usage' ? 'var(--color-blue)' : 'var(--color-navy-muted)',
              borderBottom: activeTab === 'ai_usage' ? '3px solid var(--color-blue)' : '3px solid transparent',
              transition: 'all 0.15s ease',
              flexShrink: 0
            }}
          >
            <Cpu size={16} />
            <span>Télémétrie IA</span>
          </button>

          {/* Tab 4: SEO CMS */}
          <button
            onClick={() => setActiveTab('seo')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0 14px',
              height: '100%',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              border: 'none',
              backgroundColor: 'transparent',
              color: activeTab === 'seo' ? 'var(--color-blue)' : 'var(--color-navy-muted)',
              borderBottom: activeTab === 'seo' ? '3px solid var(--color-blue)' : '3px solid transparent',
              transition: 'all 0.15s ease',
              flexShrink: 0
            }}
          >
            <Globe2 size={16} />
            <span>CMS SEO</span>
          </button>
        </nav>

        {/* Right actions: Counter, Avatar, Logout (On the SAME row) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <div className="hide-on-mobile" style={{
            backgroundColor: pendingTicketsCount > 0 ? '#fff7ed' : 'var(--color-surface-subtle)',
            border: `1px solid ${pendingTicketsCount > 0 ? '#ffedd5' : 'var(--color-border)'}`,
            padding: '4px 10px',
            borderRadius: 'var(--radius-pill)',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            fontSize: '11px'
          }}>
            <Sparkles size={13} style={{ color: pendingTicketsCount > 0 ? '#ea580c' : 'var(--color-lime-dark)' }} />
            <span style={{
              color: pendingTicketsCount > 0 ? '#c2410c' : 'var(--color-navy)',
              fontWeight: 700
            }}>
              {pendingTicketsCount} à traiter
            </span>
          </div>

          <div style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            backgroundColor: 'var(--color-navy)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '11px',
            boxShadow: '0 2px 6px rgba(10, 37, 64, 0.2)'
          }}>
            LB
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              className="btn btn-sm"
              style={{
                fontSize: '12px',
                padding: '3px 10px',
                height: '30px',
                color: 'var(--color-red)',
                backgroundColor: 'var(--color-red-light)',
                border: '1px solid rgba(229, 62, 62, 0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              title="Se déconnecter de l'espace experte"
            >
              <LogOut size={13} />
              <span className="hide-on-mobile">Déconnexion</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Back-Office Content Container */}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '24px 24px' }}>
        {/* Contextual Sub-header */}
        <div style={{ marginBottom: '20px' }}>
          <h1 style={{ fontSize: 'var(--text-2xl)', color: 'var(--color-navy)', marginBottom: '4px' }}>
            {activeTab === 'tickets' && "File d'attente des arbitrages juridiques"}
            {activeTab === 'plans' && "Gestion des formules d'abonnement & quotas"}
            {activeTab === 'ai_usage' && "Supervision des modèles & télémétrie IA"}
            {activeTab === 'seo' && "Éditeur de pages & référencement SEO"}
          </h1>
          <p style={{ color: 'var(--color-navy-muted)', fontSize: 'var(--text-sm)', margin: 0 }}>
            {activeTab === 'tickets' && "Consultez les sollicitations escaladées par les associations clientes et rédigez vos réponses argumentées sous 48h."}
            {activeTab === 'plans' && "Ajustez les tarifs mensuels et les plafonds de questions expertes en direct sans déploiement technique."}
            {activeTab === 'ai_usage' && "Audit des tokens consommés et suivi des coûts des modèles d'IA par structure cliente."}
            {activeTab === 'seo' && "Personnalisez les balises méta, titres H1 et contenus des pages sectorielles pour le moteur de recherche."}
          </p>
        </div>

      {saveToast && (
        <div className="card animate-fade-in" style={{
          backgroundColor: 'var(--color-lime-glow)',
          borderColor: 'var(--color-lime)',
          marginBottom: 'var(--space-6)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <CheckCircle2 size={24} style={{ color: 'var(--color-lime-dark)' }} />
          <div style={{ fontWeight: 700, color: 'var(--color-navy)' }}>
            Modifications enregistrées en base Payload avec succès !
          </div>
        </div>
      )}

      {/* TAB 1: Questions Expertes (Traitement) */}
      {activeTab === 'tickets' && (
        <div className="admin-split-grid">
          {/* List of tickets */}
          <div className="card" style={{ padding: 'var(--space-4)' }}>
            <h3 style={{ fontSize: 'var(--text-base)', marginBottom: 'var(--space-4)', color: 'var(--color-navy)' }}>
              File des questions ({tickets.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {tickets.map((t) => (
                <div
                  key={t.id}
                  onClick={() => handleSelectTicketToReview(t)}
                  style={{
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    border: `1.5px solid ${selectedTicket?.id === t.id ? 'var(--color-blue)' : 'var(--color-border)'}`,
                    backgroundColor: selectedTicket?.id === t.id ? 'var(--color-blue-light)' : '#ffffff',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '12px', color: 'var(--color-blue)' }}>
                      {t.ref}
                    </span>
                    <span className={
                      t.status === 'answered' ? 'badge badge-lime' :
                      t.status === 'in_progress' ? 'badge badge-blue' : 'badge badge-orange'
                    } style={{ fontSize: '10px' }}>
                      {t.status === 'answered' ? 'Répondu' :
                       t.status === 'in_progress' ? 'En cours' : 'À traiter'}
                    </span>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--color-navy)', marginBottom: '2px' }}>
                    {t.object}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--color-navy-muted)' }}>
                    {t.orgName}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ticket Review & Answer Panel */}
          {selectedTicket ? (
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-3)' }}>
                <div>
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--color-blue)', fontSize: '13px' }}>
                    Réf : {selectedTicket.ref} &bull; {selectedTicket.orgName}
                  </span>
                  <h2 style={{ fontSize: 'var(--text-xl)' }}>{selectedTicket.object}</h2>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleSaveExpertAnswer(false)}
                    className="btn btn-sm btn-secondary"
                  >
                    Sauvegarder brouillon
                  </button>
                  <button
                    onClick={() => handleSaveExpertAnswer(true)}
                    className="btn btn-sm btn-lime"
                  >
                    <CheckCircle2 size={16} />
                    <span>Transmettre la réponse à l'asso</span>
                  </button>
                </div>
              </div>

              {/* Question details */}
              <div style={{ marginBottom: 'var(--space-4)' }}>
                <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-navy-muted)', marginBottom: '4px' }}>
                  Question posée par l'association :
                </div>
                <div style={{ backgroundColor: 'var(--color-surface-subtle)', padding: '12px 16px', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', lineHeight: 1.6, color: 'var(--color-navy)' }}>
                  {selectedTicket.question}
                </div>
              </div>

              {/* Response Editor */}
              <div style={{ marginBottom: 'var(--space-4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                  <label className="form-label" style={{ margin: 0 }}>
                    Réponse juridique & sociale rédigée par Laetitia Badji (transmise par email et dans l'app) :
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '11px', color: 'var(--color-navy-muted)', fontWeight: 600 }}>
                      Modèles rapides :
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setExpertReply(`Bonjour,\n\nAprès analyse approfondie de votre situation au regard des dispositions légales et de votre convention collective (${selectedTicket.orgName}) :\n\n1. Cadre juridique applicable : La procédure requiert une convocation écrite avec délai de prévenance strict et information explicite sur la faculté d'assistance.\n\n2. Risques identifiés : Veillez à consigner l'accord dans le formulaire Cerfa réglementaire et respecter le délai d'homologation DREETS de 15 jours ouvrables.\n\n3. Recommandation du Cabinet Maé : Nous vous recommandons de formaliser l'entretien préalable par écrit avant toute signature de protocole transactionnel.\n\nRestant à votre entière disposition pour vous assister.\n\nBien cordialement,\nLaetitia Badji\nJuriste Référente Associations — Cabinet Maé / AKILIGUE SAS`);
                      }}
                      className="btn btn-sm"
                      style={{ fontSize: '11px', padding: '3px 8px', backgroundColor: 'var(--color-surface-subtle)', border: '1px solid var(--color-border)' }}
                    >
                      <Sparkles size={12} style={{ color: 'var(--color-blue)' }} />
                      <span>Modèle RH / Procédure</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setExpertReply(`Bonjour,\n\nConcernant votre problématique de gouvernance et de régularité des délibérations associatives :\n\n1. Règle statutaire : En l'absence de quorum suffisant lors de la première convocation, l'Assemblée ne peut valablement délibérer sous peine de nullité des résolutions adoptées.\n\n2. Procédure de régularisation : Vous devez adresser une seconde convocation dans un délai de 15 jours. Sauf stipulation contraire expresse de vos statuts, cette seconde AG délibérera valablement quel que soit le nombre de membres présents ou représentés.\n\n3. Formalités : Pensez à annexer la feuille d'émargement de la première séance infructueuse au procès-verbal définitif.\n\nBien à vous,\nLaetitia Badji\nCabinet Maé`);
                      }}
                      className="btn btn-sm"
                      style={{ fontSize: '11px', padding: '3px 8px', backgroundColor: 'var(--color-surface-subtle)', border: '1px solid var(--color-border)' }}
                    >
                      <Sparkles size={12} style={{ color: 'var(--color-blue)' }} />
                      <span>Modèle AG / Quorum</span>
                    </button>
                  </div>
                </div>

                <textarea
                  className="textarea"
                  value={expertReply}
                  onChange={(e) => setExpertReply(e.target.value)}
                  rows={9}
                  placeholder="Rédigez l'analyse juridique, les références conventionnelles et les préconisations concrètes..."
                />
              </div>

              {/* Internal Notes */}
              <div>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Lock size={14} style={{ color: 'var(--color-navy-muted)' }} />
                  <span>Notes internes confidentielles (visibles uniquement par le cabinet Maé) :</span>
                </label>
                <input
                  type="text"
                  className="input"
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="Ex: Risque prud'homal modéré, à recontacter si récidive..."
                />
              </div>
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: 'var(--space-12)', color: 'var(--color-navy-muted)' }}>
              Sélectionnez un ticket pour rédiger la réponse experte.
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Formules & Quotas Editor */}
      {activeTab === 'plans' && (
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)' }}>
            <div>
              <h2 style={{ fontSize: 'var(--text-xl)' }}>Éditeur dynamique des formules et des quotas</h2>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-navy-muted)' }}>
                Exigence CDC §3 : aucun prix ou quota codé en dur. Les modifications s'appliquent immédiatement à la page tarifs et aux droits de l'application.
              </p>
            </div>
            <button onClick={handleSaveAllPlans} className="btn btn-primary">
              <Save size={16} />
              <span>Publier les nouveaux tarifs</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-6)' }}>
            {editablePlans.map((p) => (
              <div key={p.code} className="card" style={{ backgroundColor: 'var(--color-surface-subtle)', padding: 'var(--space-6)' }}>
                <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)' }}>Formule {p.label}</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  <div>
                    <label className="form-label">Prix mensuel (€ HT) :</label>
                    <input
                      type="number"
                      className="input"
                      value={p.priceMonthly}
                      onChange={(e) => handlePlanPriceChange(p.code, parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  <div>
                    <label className="form-label">Questions expertes par mois :</label>
                    <input
                      type="number"
                      className="input"
                      value={p.features.expertQuestionsMonth}
                      onChange={(e) => handlePlanQuotaChange(p.code, parseInt(e.target.value) || 0)}
                    />
                  </div>

                  <div>
                    <label className="form-label">Modèle Claude configuré :</label>
                    <input
                      type="text"
                      className="input"
                      value={p.features.aiModel}
                      readOnly
                      style={{ backgroundColor: '#ffffff', opacity: 0.8 }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Télémétrie & Coûts IA */}
      {activeTab === 'ai_usage' && (
        <div className="card">
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <h2 style={{ fontSize: 'var(--text-xl)' }}>Journalisation de l'usage de l'IA (`ai_usage`)</h2>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-navy-muted)' }}>
              Conformité stricte CDC §3.7 : <strong>aucun contenu</strong> de question ou de réponse n'est conservé dans les logs techniques. Seuls les tokens, versions de prompts et coûts estimés sont enregistrés.
            </p>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'var(--text-sm)' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border)', color: 'var(--color-navy-muted)' }}>
                <th style={{ padding: '10px 12px' }}>Organisation</th>
                <th style={{ padding: '10px 12px' }}>Modèle</th>
                <th style={{ padding: '10px 12px' }}>Version Prompt</th>
                <th style={{ padding: '10px 12px' }}>Tokens In</th>
                <th style={{ padding: '10px 12px' }}>Tokens Out</th>
                <th style={{ padding: '10px 12px' }}>Coût Estimé</th>
                <th style={{ padding: '10px 12px' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {aiUsageRecords.map((r) => (
                <tr key={r.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 600 }}>{r.orgName}</td>
                  <td style={{ padding: '10px 12px', fontFamily: 'monospace' }}>{r.model}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span className="badge badge-blue" style={{ fontSize: '10px' }}>{r.promptVersion}</span>
                  </td>
                  <td style={{ padding: '10px 12px' }}>{r.inputTokens}</td>
                  <td style={{ padding: '10px 12px' }}>{r.outputTokens}</td>
                  <td style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--color-lime-dark)' }}>
                    {r.costEstimateEur.toFixed(4)} €
                  </td>
                  <td style={{ padding: '10px 12px', color: 'var(--color-navy-muted)' }}>{r.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 4: CMS Pages SEO */}
      {activeTab === 'seo' && (
        <div className="card">
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <h2 style={{ fontSize: 'var(--text-xl)' }}>Éditeur de pages SEO (Gabarit Payload)</h2>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-navy-muted)' }}>
              Permet à Laetitia de modifier les métadonnées des pages piliers sans développeur.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            {seoPages.map((page, idx) => (
              <div key={idx} className="card" style={{ backgroundColor: 'var(--color-surface-subtle)' }}>
                <div style={{ fontWeight: 700, color: 'var(--color-blue)', marginBottom: 'var(--space-2)' }}>
                  Slug : {page.slug}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  <div>
                    <label className="form-label">Meta Title :</label>
                    <input
                      type="text"
                      className="input"
                      value={page.title}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSeoPages(prev => prev.map((p, i) => i === idx ? { ...p, title: val } : p));
                      }}
                    />
                  </div>
                  <div>
                    <label className="form-label">Meta Description :</label>
                    <input
                      type="text"
                      className="input"
                      value={page.metaDescription}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSeoPages(prev => prev.map((p, i) => i === idx ? { ...p, metaDescription: val } : p));
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
            <button onClick={() => {
              setSaveToast(true);
              setTimeout(() => setSaveToast(false), 3000);
            }} className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
              <Save size={16} />
              <span>Publier les pages SEO</span>
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};
