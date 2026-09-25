import React, { useState } from 'react';
import { Domain, Organization, Plan, Subscription, ExpertTicket } from '../types';
import { getDomainLabel } from '../services/aiSimulator';
import { 
  UserCheck, 
  Clock, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  ShieldAlert, 
  FileText, 
  MessageSquare,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface ExpertEscalationViewProps {
  currentOrg: Organization;
  currentPlan: Plan;
  subscription: Subscription;
  tickets: ExpertTicket[];
  onAddTicket: (ticket: ExpertTicket) => void;
  onUpgradePlan: () => void;
  prefillDomain?: Domain;
  prefillQuestion?: string;
}

export const ExpertEscalationView: React.FC<ExpertEscalationViewProps> = ({
  currentOrg,
  currentPlan,
  subscription,
  tickets,
  onAddTicket,
  onUpgradePlan,
  prefillDomain = 'rh',
  prefillQuestion = ''
}) => {
  const [domain, setDomain] = useState<Domain>(prefillDomain);
  const [urgency, setUrgency] = useState<'normal_48h' | 'urgent'>('normal_48h');
  const [object, setObject] = useState('');
  const [question, setQuestion] = useState(prefillQuestion);
  const [selectedTicket, setSelectedTicket] = useState<ExpertTicket | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const quotaTotal = currentPlan.features.expertQuestionsMonth;
  const quotaUsed = subscription.questionsUsedThisMonth;
  const quotaRemaining = Math.max(0, quotaTotal - quotaUsed);
  const isQuotaExceeded = quotaRemaining <= 0;

  // Filter tickets for the current organization
  const orgTickets = tickets.filter(t => t.orgId === currentOrg.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isQuotaExceeded) return;
    if (!object.trim() || !question.trim()) return;

    // Generate unique readable reference AE-2026-XXXXX
    const randomSeq = Math.floor(1000 + Math.random() * 9000);
    const newRef = `AE-2026-000${randomSeq}`;

    const newTicket: ExpertTicket = {
      id: 'ticket-' + Date.now(),
      ref: newRef,
      orgId: currentOrg.id,
      orgName: currentOrg.name,
      domain,
      urgency,
      object: object.trim(),
      question: question.trim(),
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    onAddTicket(newTicket);
    setObject('');
    setQuestion('');
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 5000);
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: 1200, margin: '0 auto', padding: 'var(--space-6)' }}>
      {/* Header Banner */}
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
            backgroundColor: 'var(--color-lime)',
            color: 'var(--color-navy)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-lime)'
          }}>
            <UserCheck size={28} />
          </div>
          <div>
            <h1 style={{ color: '#ffffff', fontSize: 'var(--text-2xl)', marginBottom: '4px' }}>
              Escalade vers l'Experte (Laetitia Badji)
            </h1>
            <p style={{ color: '#cbd5e1', fontSize: 'var(--text-sm)' }}>
              Analyse juridique et sociale personnalisée transmise sous 48h ouvrées par le Cabinet Maé.
            </p>
          </div>
        </div>

        {/* Quota Counter Card */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          padding: '12px 20px',
          borderRadius: 'var(--radius-md)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#cbd5e1', fontWeight: 600 }}>
            Quota mensuel de questions
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-lime)' }}>
            {quotaRemaining} / {quotaTotal}
          </div>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>
            Renouvelé au 1er du mois
          </div>
        </div>
      </div>

      {showSuccessToast && (
        <div className="card animate-fade-in" style={{
          backgroundColor: 'var(--color-lime-glow)',
          borderColor: 'var(--color-lime)',
          marginBottom: 'var(--space-6)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <CheckCircle2 size={24} style={{ color: 'var(--color-lime-dark)' }} />
          <div>
            <div style={{ fontWeight: 700, color: 'var(--color-navy)' }}>
              Votre question a bien été enregistrée et transmise à Laetitia Badji !
            </div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-navy-muted)' }}>
              Un accusé de réception a été envoyé à votre adresse et une réponse motivée sera formulée sous 48h ouvrées.
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 'var(--space-8)' }}>
        {/* Form Submission */}
        <div>
          <div className="card">
            <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-4)' }}>
              Soumettre une nouvelle question
            </h2>

            {isQuotaExceeded ? (
              <div style={{
                backgroundColor: 'var(--color-orange-light)',
                border: '1px solid var(--color-orange)',
                padding: 'var(--space-6)',
                borderRadius: 'var(--radius-md)',
                textAlign: 'center'
              }}>
                <AlertCircle size={32} style={{ color: 'var(--color-orange-dark)', margin: '0 auto var(--space-2)' }} />
                <h3 style={{ fontSize: 'var(--text-base)', color: 'var(--color-navy)', marginBottom: 'var(--space-2)' }}>
                  Quota mensuel de questions atteint
                </h3>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-navy-muted)', marginBottom: 'var(--space-4)' }}>
                  {quotaTotal === 0 ? (
                    'Votre formule Initiale n inclut pas de question experte. Passez à la formule Pro ou Expert pour débloquer l assistance de Laetitia Badji.'
                  ) : (
                    `Vous avez consommé l intégralité de vos ${quotaTotal} question(s) ce mois-ci sous la formule ${currentPlan.label}.`
                  )}
                </p>
                <button onClick={onUpgradePlan} className="btn btn-primary" style={{ width: '100%' }}>
                  <Sparkles size={16} />
                  <span>Passer à l'offre supérieure</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {/* Prefilled association information */}
                <div style={{
                  backgroundColor: 'var(--color-surface-subtle)',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-navy-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Building2 size={16} style={{ color: 'var(--color-blue)', minWidth: 16 }} />
                  <div>
                    Prérempli pour : <strong>{currentOrg.name}</strong> (SIREN {currentOrg.siren}, CCN {currentOrg.ccn.split('(')[0]})
                  </div>
                </div>

                {/* Domain Selector */}
                <div>
                  <label className="form-label">Domaine juridique ou technique :</label>
                  <select
                    className="select"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value as Domain)}
                  >
                    <option value="rh">RH & Conventions Collectives ({currentOrg.ccn.split('(')[0]})</option>
                    <option value="gouvernance">Gouvernance Loi 1901 (AG, CA, Statuts)</option>
                    <option value="finance">Finance & Subventions (CER, Financement public)</option>
                    <option value="conformite">Conformité (DUERP, Sécurité, RGPD)</option>
                  </select>
                </div>

                {/* Urgency */}
                <div>
                  <label className="form-label">Délai de traitement souhaité :</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: `1.5px solid ${urgency === 'normal_48h' ? 'var(--color-blue)' : 'var(--color-border)'}`,
                      backgroundColor: urgency === 'normal_48h' ? 'var(--color-blue-light)' : 'transparent',
                      cursor: 'pointer',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 600
                    }}>
                      <input
                        type="radio"
                        name="urgency"
                        checked={urgency === 'normal_48h'}
                        onChange={() => setUrgency('normal_48h')}
                      />
                      <span>Normal (48h ouvrées)</span>
                    </label>

                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: `1.5px solid ${urgency === 'urgent' ? 'var(--color-orange)' : 'var(--color-border)'}`,
                      backgroundColor: urgency === 'urgent' ? 'var(--color-orange-light)' : 'transparent',
                      cursor: 'pointer',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 600
                    }}>
                      <input
                        type="radio"
                        name="urgency"
                        checked={urgency === 'urgent'}
                        onChange={() => setUrgency('urgent')}
                      />
                      <span>Prioritaire</span>
                    </label>
                  </div>
                </div>

                {/* Object */}
                <div>
                  <label className="form-label">Objet synthétique de la demande :</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Ex: Modalités de calcul du préavis de démission CCN 66"
                    value={object}
                    onChange={(e) => setObject(e.target.value)}
                    required
                  />
                </div>

                {/* Question */}
                <div>
                  <label className="form-label">Détail de votre situation et questions :</label>
                  <textarea
                    className="textarea"
                    placeholder="Exposez précisément les faits, l'ancienneté du salarié concerné, les clauses contractuelles ou la décision de l'AG..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    rows={5}
                    required
                  />
                  <div className="form-hint">
                    Transmis directement à contact@cabinet-mae.fr avec votre profil d'association.
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                  <Send size={16} />
                  <span>Envoyer la question à l'experte</span>
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Existing Tickets List & Tracking */}
        <div>
          <div className="card">
            <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-4)' }}>
              Historique des questions expertes ({orgTickets.length})
            </h2>

            {orgTickets.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-navy-muted)' }}>
                <MessageSquare size={36} style={{ margin: '0 auto var(--space-2)', opacity: 0.4 }} />
                <p style={{ fontSize: 'var(--text-sm)' }}>
                  Aucune question experte soumise pour le moment pour {currentOrg.name}.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {orgTickets.map((t) => (
                  <div
                    key={t.id}
                    className="card"
                    style={{
                      cursor: 'pointer',
                      borderLeft: `4px solid ${
                        t.status === 'answered' ? 'var(--color-lime-dark)' :
                        t.status === 'in_progress' ? 'var(--color-blue)' : 'var(--color-orange)'
                      }`,
                      padding: '14px 16px'
                    }}
                    onClick={() => setSelectedTicket(t)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '12px', color: 'var(--color-blue)' }}>
                        {t.ref}
                      </span>
                      <span className={
                        t.status === 'answered' ? 'badge badge-lime' :
                        t.status === 'in_progress' ? 'badge badge-blue' : 'badge badge-orange'
                      } style={{ fontSize: '10px' }}>
                        {t.status === 'answered' ? 'Réponse transmise' :
                         t.status === 'in_progress' ? 'En cours d analyse' : 'En attente'}
                      </span>
                    </div>

                    <div style={{ fontWeight: 600, fontSize: 'var(--text-base)', color: 'var(--color-navy)', marginBottom: '4px' }}>
                      {t.object}
                    </div>

                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-navy-muted)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>{getDomainLabel(t.domain)}</span>
                      <span>{new Date(t.createdAt).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ticket Details Modal */}
      {selectedTicket && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(10, 37, 64, 0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '24px'
        }}>
          <div className="card animate-fade-in" style={{ maxWidth: 700, width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-3)' }}>
              <div>
                <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '13px', color: 'var(--color-blue)' }}>
                  {selectedTicket.ref}
                </span>
                <h3 style={{ fontSize: 'var(--text-lg)', color: 'var(--color-navy)' }}>
                  {selectedTicket.object}
                </h3>
              </div>
              <button onClick={() => setSelectedTicket(null)} className="btn btn-sm btn-secondary">
                Fermer
              </button>
            </div>

            <div style={{ marginBottom: 'var(--space-4)' }}>
              <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-navy-muted)', marginBottom: '4px' }}>
                Question soumise par l'association :
              </div>
              <div style={{ backgroundColor: 'var(--color-surface-subtle)', padding: '12px 16px', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', color: 'var(--color-navy)', lineHeight: 1.6 }}>
                {selectedTicket.question}
              </div>
            </div>

            {selectedTicket.status === 'answered' && selectedTicket.answer ? (
              <div style={{ marginTop: 'var(--space-6)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-2)' }}>
                  <UserCheck size={18} style={{ color: 'var(--color-blue)' }} />
                  <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-navy)' }}>
                    Réponse officielle de Laetitia Badji (Cabinet Maé) :
                  </span>
                </div>
                <div style={{
                  backgroundColor: '#ffffff',
                  border: '1.5px solid var(--color-blue)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  fontSize: 'var(--text-sm)',
                  lineHeight: 1.6,
                  color: 'var(--color-navy)',
                  whiteSpace: 'pre-line'
                }}>
                  {selectedTicket.answer}
                </div>
              </div>
            ) : (
              <div style={{ backgroundColor: 'var(--color-orange-light)', padding: '16px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Clock size={20} style={{ color: 'var(--color-orange-dark)' }} />
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-orange-dark)', fontWeight: 500 }}>
                  Cette question est en cours d'instruction par Laetitia Badji. La réponse argumentée sera notifiée avant l'échéance des 48h ouvrées.
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
