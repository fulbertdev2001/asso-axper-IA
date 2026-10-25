import React, { useState } from 'react';
import { m, AnimatePresence } from 'motion/react';
import { Domain, Organization, Plan, Subscription, ExpertTicket } from '../types';
import { getDomainLabel } from '../services/aiSimulator';
import {
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  Building2,
  MessageSquare,
  ArrowRight,
  X
} from 'lucide-react';
import './ExpertEscalationView.css';

interface ExpertEscalationViewProps {
  currentOrg: Organization;
  currentPlan: Plan;
  subscription: Subscription;
  tickets: ExpertTicket[];
  onAddTicket: (ticket: ExpertTicket) => void;
  onUpgradePlan: () => void;
  prefillDomain?: Domain;
  prefillQuestion?: string;
  onUpdateTicket?: (ticket: ExpertTicket) => void;
}

const ease = [0.22, 1, 0.36, 1] as const;

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease, delay }
});

const statusBadge = (status: ExpertTicket['status']) =>
  status === 'answered'
    ? { className: 'ax-badge ax-badge-lime', label: 'Répondue' }
    : status === 'in_progress'
      ? { className: 'ax-badge ax-badge-blue', label: 'En cours' }
      : { className: 'ax-badge ax-badge-orange', label: 'En attente' };

export const ExpertEscalationView: React.FC<ExpertEscalationViewProps> = ({
  currentOrg,
  currentPlan,
  subscription,
  tickets,
  onAddTicket,
  onUpgradePlan,
  prefillDomain = 'rh',
  prefillQuestion = '',
  onUpdateTicket
}) => {
  const [domain, setDomain] = useState<Domain>(prefillDomain);
  const [urgency, setUrgency] = useState<'normal_48h' | 'urgent'>('normal_48h');
  const [object, setObject] = useState('');
  const [question, setQuestion] = useState(prefillQuestion);
  const [selectedTicket, setSelectedTicket] = useState<ExpertTicket | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [followUpText, setFollowUpText] = useState('');

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

  // Affichage uniquement : référence de la question la plus récente (confirmation)
  const latestTicket = orgTickets.reduce<ExpertTicket | null>(
    (latest, t) => (!latest || t.createdAt > latest.createdAt ? t : latest),
    null
  );
  const quotaPercent = quotaTotal > 0 ? Math.min(100, (quotaUsed / quotaTotal) * 100) : 100;
  const ccnShort = currentOrg.ccn.split('(')[0];

  return (
    <div>
      {/* En-tête */}
      <m.header className="ax-page-head" {...fadeUp(0)}>
        <div>
          <h1 className="ax-page-title">Questions à l'experte</h1>
          <p className="ax-page-sub">
            Posez une question à Laetitia Badji (Cabinet Maé). Réponse sous 48 h ouvrées.
          </p>
        </div>
      </m.header>

      {/* Quota */}
      <m.section className="ax-card ax-esc-quota" {...fadeUp(0.05)} aria-label="Quota mensuel">
        <div className="ax-esc-quota-main">
          <div className="ax-esc-quota-value">
            {quotaTotal === 0 ? (
              'Votre formule n’inclut pas de question à l’experte'
            ) : (
              <>
                <strong>{quotaRemaining}</strong> sur {quotaTotal}{' '}
                {quotaRemaining > 1 ? 'questions restantes' : 'question restante'} ce mois-ci
              </>
            )}
          </div>
          {quotaTotal > 0 && (
            <div
              className="ax-progress"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={quotaTotal}
              aria-valuenow={Math.min(quotaUsed, quotaTotal)}
            >
              <span style={{ width: `${quotaPercent}%` }} />
            </div>
          )}
        </div>
        <span className="ax-xs ax-faint">Renouvelé le 1er de chaque mois</span>
      </m.section>

      <AnimatePresence initial={false}>
        {showSuccessToast && (
          <m.div
            key="success"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease }}
            style={{ overflow: 'hidden' }}
          >
            <div className="ax-alert ax-alert-success" role="status" style={{ marginBottom: 24 }}>
              <CheckCircle2 size={18} />
              <div>
                <div className="ax-alert-title">Votre question a bien été envoyée</div>
                <div className="ax-small ax-muted">
                  {latestTicket ? <>Référence {latestTicket.ref}. </> : null}
                  Laetitia Badji vous répondra sous 48 h ouvrées.
                </div>
              </div>
            </div>
          </m.div>
        )}
      </AnimatePresence>

      <div className="ax-split">
        {/* Formulaire */}
        <m.section className="ax-card" {...fadeUp(0.1)}>
          <div className="ax-card-head">
            <div>
              <h2 className="ax-card-title">Nouvelle question</h2>
              <p className="ax-card-sub">Décrivez votre situation le plus précisément possible.</p>
            </div>
          </div>

          <div className="ax-card-body">
            {isQuotaExceeded ? (
              <div className="ax-alert ax-alert-warning">
                <AlertCircle size={18} />
                <div className="ax-stack-sm" style={{ flex: 1, minWidth: 0 }}>
                  <div className="ax-alert-title">
                    {quotaTotal === 0 ? 'Option non incluse dans votre formule' : 'Quota du mois atteint'}
                  </div>
                  <p className="ax-small ax-muted">
                    {quotaTotal === 0
                      ? 'Les formules Pro et Expert incluent des questions à Laetitia Badji.'
                      : `Vous avez utilisé vos ${quotaTotal} question(s) de la formule ${currentPlan.label.replace(/\s*\(.*\)\s*/, '')} ce mois-ci.`}
                  </p>
                  <div>
                    <button type="button" onClick={onUpgradePlan} className="ax-btn ax-btn-primary ax-btn-sm">
                      <span>Changer de formule</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="ax-stack-lg">
                <div className="ax-esc-org">
                  <Building2 size={15} />
                  <span>
                    Pour <strong className="ax-strong" style={{ color: 'var(--color-navy)' }}>{currentOrg.name}</strong>
                    {' '}· SIREN {currentOrg.siren} · CCN {ccnShort}
                  </span>
                </div>

                <div className="ax-form-grid">
                  <div className="ax-field">
                    <label className="ax-label" htmlFor="esc-domain">Domaine</label>
                    <select
                      id="esc-domain"
                      className="ax-select"
                      value={domain}
                      onChange={(e) => setDomain(e.target.value as Domain)}
                    >
                      <option value="rh">RH et convention collective ({ccnShort.trim()})</option>
                      <option value="gouvernance">Gouvernance loi 1901 (AG, CA, statuts)</option>
                      <option value="finance">Finance et subventions</option>
                      <option value="conformite">Conformité (DUERP, sécurité, RGPD)</option>
                    </select>
                  </div>

                  <div className="ax-field">
                    <span className="ax-label" id="esc-urgency-label">Délai souhaité</span>
                    <div className="ax-segmented ax-esc-urgency" role="radiogroup" aria-labelledby="esc-urgency-label">
                      <button
                        type="button"
                        role="radio"
                        aria-checked={urgency === 'normal_48h'}
                        className={`ax-seg-btn${urgency === 'normal_48h' ? ' is-active' : ''}`}
                        onClick={() => setUrgency('normal_48h')}
                      >
                        Normal · 48 h
                      </button>
                      <button
                        type="button"
                        role="radio"
                        aria-checked={urgency === 'urgent'}
                        className={`ax-seg-btn${urgency === 'urgent' ? ' is-active' : ''}`}
                        onClick={() => setUrgency('urgent')}
                      >
                        <Clock size={13} />
                        Prioritaire
                      </button>
                    </div>
                  </div>

                  <div className="ax-field ax-span-2">
                    <label className="ax-label" htmlFor="esc-object">Objet</label>
                    <input
                      id="esc-object"
                      type="text"
                      className="ax-input"
                      placeholder="Ex. : calcul du préavis de démission, CCN 66"
                      value={object}
                      onChange={(e) => setObject(e.target.value)}
                      required
                    />
                  </div>

                  <div className="ax-field ax-span-2">
                    <label className="ax-label" htmlFor="esc-question">Votre question</label>
                    <textarea
                      id="esc-question"
                      className="ax-textarea"
                      placeholder="Les faits, les dates, l'ancienneté du salarié, la clause ou la décision concernée…"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      rows={6}
                      required
                    />
                    <span className="ax-hint">Précisez les faits, les dates, les montants et les documents concernés. Votre question est transmise avec le profil de votre association.</span>
                  </div>
                </div>

                <div className="ax-row" style={{ justifyContent: 'flex-end' }}>
                  <button type="submit" className="ax-btn ax-btn-primary">
                    <Send size={15} />
                    <span>Envoyer la question</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </m.section>

        {/* Historique */}
        <m.section className="ax-card ax-sticky" {...fadeUp(0.15)}>
          <div className="ax-card-head">
            <h2 className="ax-card-title">Vos questions</h2>
            <span className="ax-count">{orgTickets.length}</span>
          </div>

          {orgTickets.length === 0 ? (
            <div className="ax-empty">
              <div className="ax-empty-icon">
                <MessageSquare size={22} />
              </div>
              <div className="ax-empty-title">Aucune question pour l'instant</div>
              <p className="ax-small">Les questions envoyées et les réponses de l'experte apparaîtront ici.</p>
            </div>
          ) : (
            <div className="ax-list ax-esc-list">
              {orgTickets.map((t, i) => {
                const badge = statusBadge(t.status);
                return (
                  <m.button
                    key={t.id}
                    type="button"
                    className={`ax-list-item${selectedTicket?.id === t.id ? ' is-active' : ''}`}
                    onClick={() => setSelectedTicket(t)}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease, delay: 0.2 + Math.min(i, 8) * 0.04 }}
                  >
                    <div className="ax-row-between" style={{ flexWrap: 'nowrap', alignItems: 'flex-start' }}>
                      <span className="ax-strong" style={{ minWidth: 0, wordBreak: 'break-word' }}>{t.object}</span>
                      <span className={badge.className}>{badge.label}</span>
                    </div>
                    <div className="ax-esc-ticket-meta">
                      <span className="ax-ellipsis">{getDomainLabel(t.domain)}</span>
                      <span style={{ flexShrink: 0 }}>{new Date(t.createdAt).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </m.button>
                );
              })}
            </div>
          )}
        </m.section>
      </div>

      {/* Détail d'une question */}
      <AnimatePresence>
        {selectedTicket && (
          <m.div
            key="ticket-overlay"
            className="ax-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <m.div
              className="ax-modal ax-esc-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="esc-ticket-title"
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.3, ease }}
            >
              <div className="ax-card-head" style={{ alignItems: 'flex-start' }}>
                <div style={{ minWidth: 0 }}>
                  <div className="ax-row" style={{ marginBottom: 4 }}>
                    <span className="ax-esc-ref">{selectedTicket.ref}</span>
                    <span className={statusBadge(selectedTicket.status).className}>
                      {statusBadge(selectedTicket.status).label}
                    </span>
                  </div>
                  <h3 id="esc-ticket-title" className="ax-h3" style={{ wordBreak: 'break-word' }}>
                    {selectedTicket.object}
                  </h3>
                  <div className="ax-xs ax-muted" style={{ marginTop: 2 }}>
                    {getDomainLabel(selectedTicket.domain)} · {new Date(selectedTicket.createdAt).toLocaleDateString('fr-FR')}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="ax-btn ax-btn-ghost ax-btn-icon"
                  aria-label="Fermer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="ax-card-body ax-stack-lg">
                <div>
                  <div className="ax-esc-section-label">Votre question</div>
                  <div className="ax-esc-question ax-prewrap">{selectedTicket.question}</div>
                </div>

                {selectedTicket.status === 'answered' && selectedTicket.answer ? (
                  <div className="ax-stack">
                    <div className="ax-row">
                      <span className="ax-avatar">LB</span>
                      <div style={{ minWidth: 0 }}>
                        <div className="ax-strong">Laetitia Badji</div>
                        <div className="ax-xs ax-muted">
                          Cabinet Maé ·{' '}
                          {selectedTicket.answeredAt
                            ? new Date(selectedTicket.answeredAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                            : 'Réponse transmise'}
                        </div>
                      </div>
                    </div>

                    <div className="ax-esc-answer ax-prewrap">{selectedTicket.answer}</div>

                    <hr className="ax-divider" />

                    <div className="ax-field">
                      <label className="ax-label" htmlFor="esc-followup">Besoin d'une précision ?</label>
                      <div className="ax-esc-followup">
                        <input
                          id="esc-followup"
                          type="text"
                          className="ax-input"
                          placeholder="Ex. : pouvez-vous préciser le délai de prévenance ?"
                          value={followUpText}
                          onChange={(e) => setFollowUpText(e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (!followUpText.trim() || !onUpdateTicket) return;
                            const updated: ExpertTicket = {
                              ...selectedTicket,
                              question: `${selectedTicket.question}\n\n[Précision association le ${new Date().toLocaleTimeString('fr-FR')}] : ${followUpText.trim()}`,
                              status: 'in_progress'
                            };
                            onUpdateTicket(updated);
                            setSelectedTicket(updated);
                            setFollowUpText('');
                          }}
                          className="ax-btn ax-btn-primary"
                        >
                          <Send size={14} />
                          <span>Envoyer</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="ax-alert ax-alert-info">
                    <Clock size={18} />
                    <span className="ax-muted">
                      Laetitia Badji étudie votre question. Vous recevrez sa réponse sous 48 h ouvrées.
                    </span>
                  </div>
                )}
              </div>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
};
