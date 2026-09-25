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
  ArrowRight
} from 'lucide-react';

interface AdminPayloadViewProps {
  plans: Plan[];
  onUpdatePlans: (updatedPlans: Plan[]) => void;
  tickets: ExpertTicket[];
  onUpdateTicket: (updatedTicket: ExpertTicket) => void;
  aiUsageRecords: AiUsageRecord[];
}

export const AdminPayloadView: React.FC<AdminPayloadViewProps> = ({
  plans,
  onUpdatePlans,
  tickets,
  onUpdateTicket,
  aiUsageRecords
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

  return (
    <div className="animate-fade-in" style={{ maxWidth: 1300, margin: '0 auto', padding: 'var(--space-6)' }}>
      {/* Admin Header */}
      <div className="card" style={{
        backgroundColor: 'var(--color-navy)',
        color: '#ffffff',
        marginBottom: 'var(--space-8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            border: '2px solid var(--color-lime)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-lime)'
          }}>
            <Settings2 size={26} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ color: '#ffffff', fontSize: 'var(--text-2xl)' }}>
                Espace Back-Office (Payload CMS)
              </h1>
              <span className="badge badge-lime" style={{ fontSize: '10px' }}>
                Accès Laetitia Badji
              </span>
            </div>
            <p style={{ color: '#cbd5e1', fontSize: 'var(--text-sm)' }}>
              Gestion des questions expertes, édition des formules/tarifs sans développeur, suivi des coûts IA.
            </p>
          </div>
        </div>

        {/* Admin Navigation Pills */}
        <div style={{ display: 'flex', gap: '6px', backgroundColor: 'rgba(255, 255, 255, 0.08)', padding: '4px', borderRadius: 'var(--radius-md)' }}>
          <button
            onClick={() => setActiveTab('tickets')}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '13px',
              fontWeight: 600,
              backgroundColor: activeTab === 'tickets' ? 'var(--color-blue)' : 'transparent',
              color: '#ffffff'
            }}
          >
            Questions Expertes ({tickets.filter(t => t.status !== 'answered').length} à traiter)
          </button>

          <button
            onClick={() => setActiveTab('plans')}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '13px',
              fontWeight: 600,
              backgroundColor: activeTab === 'plans' ? 'var(--color-blue)' : 'transparent',
              color: '#ffffff'
            }}
          >
            Formules & Quotas
          </button>

          <button
            onClick={() => setActiveTab('ai_usage')}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '13px',
              fontWeight: 600,
              backgroundColor: activeTab === 'ai_usage' ? 'var(--color-blue)' : 'transparent',
              color: '#ffffff'
            }}
          >
            Télémétrie & Coûts IA
          </button>

          <button
            onClick={() => setActiveTab('seo')}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '13px',
              fontWeight: 600,
              backgroundColor: activeTab === 'seo' ? 'var(--color-blue)' : 'transparent',
              color: '#ffffff'
            }}
          >
            CMS Pages SEO
          </button>
        </div>
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
        <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 'var(--space-6)' }}>
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
                <label className="form-label">
                  Réponse juridique & sociale rédigée par Laetitia Badji (transmise par email et dans l'app) :
                </label>
                <textarea
                  className="textarea"
                  value={expertReply}
                  onChange={(e) => setExpertReply(e.target.value)}
                  rows={8}
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
  );
};
