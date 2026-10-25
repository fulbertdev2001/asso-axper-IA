import React, { useState } from 'react';
import { m, AnimatePresence } from 'motion/react';
import { Plan, ExpertTicket, AiUsageRecord } from '../types';
import {
  CheckCircle2,
  UserCheck,
  CreditCard,
  Cpu,
  Globe2,
  Save,
  Send,
  Lock,
  Inbox,
  FileText,
  AlertCircle
} from 'lucide-react';
import { AppShell, AppShellNavItem, EASE } from './AppShell';
import './AdminPayloadView.css';

interface AdminPayloadViewProps {
  plans: Plan[];
  onUpdatePlans: (updatedPlans: Plan[]) => void;
  tickets: ExpertTicket[];
  onUpdateTicket: (updatedTicket: ExpertTicket) => void;
  aiUsageRecords: AiUsageRecord[];
  onLogout?: () => void;
}

type AdminTab = 'tickets' | 'plans' | 'ai_usage' | 'seo';

const DOMAIN_LABELS: Record<string, string> = {
  rh: 'RH',
  gouvernance: 'Gouvernance',
  finance: 'Finance',
  conformite: 'Conformité'
};

const STATUS_META: Record<ExpertTicket['status'], { label: string; cls: string }> = {
  pending: { label: 'À traiter', cls: 'ax-badge ax-badge-orange' },
  in_progress: { label: 'En cours', cls: 'ax-badge ax-badge-blue' },
  answered: { label: 'Répondu', cls: 'ax-badge ax-badge-lime' }
};

// Affichage uniquement : date courte si la valeur est interprétable, sinon valeur brute
const formatDate = (value: string) => {
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
};

const listItem = {
  hidden: { opacity: 0, y: 8 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.3, ease: EASE, delay: Math.min(i, 10) * 0.04 } })
};

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

  // Valeurs dérivées en lecture seule (affichage des indicateurs)
  const countPending = tickets.filter(t => t.status === 'pending').length;
  const countInProgress = tickets.filter(t => t.status === 'in_progress').length;
  const countAnswered = tickets.filter(t => t.status === 'answered').length;
  const totalCost = aiUsageRecords.reduce((sum, r) => sum + r.costEstimateEur, 0);
  const totalTokens = aiUsageRecords.reduce((sum, r) => sum + r.inputTokens + r.outputTokens, 0);

  const navItems: AppShellNavItem<AdminTab>[] = [
    {
      key: 'tickets',
      label: 'Questions',
      shortLabel: 'Questions',
      icon: UserCheck,
      count: pendingTicketsCount,
      countTone: pendingTicketsCount > 0 ? 'alert' : 'neutral'
    },
    { key: 'plans', label: 'Formules', shortLabel: 'Formules', icon: CreditCard },
    { key: 'ai_usage', label: 'Usage IA', shortLabel: 'Usage IA', icon: Cpu },
    { key: 'seo', label: 'Pages SEO', shortLabel: 'SEO', icon: Globe2 }
  ];

  return (
    <AppShell
      spaceLabel="Espace experte"
      contextCard={{ title: 'Cabinet Maé', meta: 'DAF externalisée · secteur associatif' }}
      navItems={navItems}
      activeKey={activeTab}
      onSelect={setActiveTab}
      user={{ initials: 'LB', name: 'Laetitia Badji', role: 'Cabinet Maé' }}
      onLogout={onLogout}
    >
      {/* Questions expertes */}
      {activeTab === 'tickets' && (
        <div className="ax-stack-lg">
          <div className="ax-page-head" style={{ marginBottom: 0 }}>
            <div>
              <h1 className="ax-page-title">Questions des associations</h1>
              <p className="ax-page-sub">Répondez aux questions transmises par vos associations clientes, sous 48 h.</p>
            </div>
          </div>

          <div className="ax-stats">
            <div className="ax-stat">
              <div className="ax-stat-label"><span className="ax-dot" style={{ color: 'var(--color-orange)' }} />À traiter</div>
              <div className="ax-stat-value">{countPending}</div>
            </div>
            <div className="ax-stat">
              <div className="ax-stat-label"><span className="ax-dot" style={{ color: 'var(--color-blue)' }} />En cours</div>
              <div className="ax-stat-value">{countInProgress}</div>
            </div>
            <div className="ax-stat">
              <div className="ax-stat-label"><span className="ax-dot" style={{ color: 'var(--color-lime-dark)' }} />Répondues</div>
              <div className="ax-stat-value">{countAnswered}</div>
            </div>
          </div>

          <div className="ax-split-list">
            {/* Liste des questions */}
            <div className="ax-card">
              <div className="ax-card-head">
                <div className="ax-card-title">Toutes les questions</div>
                <span className="ax-count">{tickets.length}</span>
              </div>
              {tickets.length === 0 ? (
                <div className="ax-empty">
                  <div className="ax-empty-icon"><Inbox size={22} /></div>
                  <div className="ax-empty-title">Aucune question</div>
                  <div className="ax-small">Les nouvelles questions apparaîtront ici.</div>
                </div>
              ) : (
                <div className="ax-list" style={{ borderRadius: '0 0 16px 16px', overflow: 'hidden' }}>
                  {tickets.map((t, i) => {
                    const status = STATUS_META[t.status];
                    return (
                      <m.button
                        type="button"
                        key={t.id}
                        custom={i}
                        variants={listItem}
                        initial="hidden"
                        animate="show"
                        onClick={() => handleSelectTicketToReview(t)}
                        className={`ax-list-item${selectedTicket?.id === t.id ? ' is-active' : ''}`}
                        aria-current={selectedTicket?.id === t.id ? 'true' : undefined}
                      >
                        <div className="apv-ticket-top">
                          <span className="apv-ticket-org ax-ellipsis">{t.orgName}</span>
                          <span className={status.cls}>{status.label}</span>
                        </div>
                        <div className="apv-ticket-object">{t.object}</div>
                        <div className="apv-ticket-meta">
                          <span>{DOMAIN_LABELS[t.domain] ?? t.domain}</span>
                          <span aria-hidden="true">·</span>
                          <span>{formatDate(t.createdAt)}</span>
                          {t.urgency === 'urgent' && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="apv-urgent"><AlertCircle size={12} />Urgent</span>
                            </>
                          )}
                        </div>
                      </m.button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Question sélectionnée et réponse */}
            <AnimatePresence mode="wait" initial={false}>
              {selectedTicket ? (
                <m.div
                  key={selectedTicket.id}
                  className="ax-stack"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.24, ease: EASE }}
                >
                  <article className="ax-card ax-card-pad">
                    <div className="apv-doc-meta">
                      <span className={STATUS_META[selectedTicket.status].cls}>{STATUS_META[selectedTicket.status].label}</span>
                      {selectedTicket.urgency === 'urgent' && <span className="ax-badge ax-badge-orange">Urgent</span>}
                      <span className="ax-strong" style={{ color: 'var(--color-navy)' }}>{selectedTicket.orgName}</span>
                      <span aria-hidden="true">·</span>
                      <span>{DOMAIN_LABELS[selectedTicket.domain] ?? selectedTicket.domain}</span>
                      <span aria-hidden="true">·</span>
                      <span className="ax-faint">Réf. {selectedTicket.ref}</span>
                    </div>
                    <h2 className="apv-doc-title">{selectedTicket.object}</h2>
                    <div className="ax-xs ax-faint" style={{ marginTop: 4 }}>
                      Reçue le {formatDate(selectedTicket.createdAt)}
                    </div>
                    <div className="apv-question">{selectedTicket.question}</div>
                  </article>

                  <div className="ax-card">
                    <div className="ax-card-head" style={{ flexWrap: 'wrap' }}>
                      <div>
                        <div className="ax-card-title">Votre réponse</div>
                        <div className="ax-card-sub">Envoyée à l’association par e-mail et dans l’application.</div>
                      </div>
                      <div className="ax-row apv-templates">
                        <span className="ax-xs ax-muted">Modèles</span>
                        <button
                          type="button"
                          onClick={() => {
                            setExpertReply(`Bonjour,\n\nAprès analyse approfondie de votre situation au regard des dispositions légales et de votre convention collective (${selectedTicket.orgName}) :\n\n1. Cadre juridique applicable : La procédure requiert une convocation écrite avec délai de prévenance strict et information explicite sur la faculté d'assistance.\n\n2. Risques identifiés : Veillez à consigner l'accord dans le formulaire Cerfa réglementaire et respecter le délai d'homologation DREETS de 15 jours ouvrables.\n\n3. Recommandation du Cabinet Maé : Nous vous recommandons de formaliser l'entretien préalable par écrit avant toute signature de protocole transactionnel.\n\nRestant à votre entière disposition pour vous assister.\n\nBien cordialement,\nLaetitia Badji\nJuriste Référente Associations — Cabinet Maé / AKILIGUE SAS`);
                          }}
                          className="ax-chip"
                        >
                          <FileText size={13} />
                          <span>Procédure RH</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setExpertReply(`Bonjour,\n\nConcernant votre problématique de gouvernance et de régularité des délibérations associatives :\n\n1. Règle statutaire : En l'absence de quorum suffisant lors de la première convocation, l'Assemblée ne peut valablement délibérer sous peine de nullité des résolutions adoptées.\n\n2. Procédure de régularisation : Vous devez adresser une seconde convocation dans un délai de 15 jours. Sauf stipulation contraire expresse de vos statuts, cette seconde AG délibérera valablement quel que soit le nombre de membres présents ou représentés.\n\n3. Formalités : Pensez à annexer la feuille d'émargement de la première séance infructueuse au procès-verbal définitif.\n\nBien à vous,\nLaetitia Badji\nCabinet Maé`);
                          }}
                          className="ax-chip"
                        >
                          <FileText size={13} />
                          <span>AG et quorum</span>
                        </button>
                      </div>
                    </div>

                    <div className="ax-card-body ax-stack">
                      <div className="ax-field">
                        <label className="ax-label" htmlFor="apv-reply">Réponse</label>
                        <textarea
                          id="apv-reply"
                          className="ax-textarea apv-reply"
                          value={expertReply}
                          onChange={(e) => setExpertReply(e.target.value)}
                          rows={9}
                          placeholder="Analyse, références applicables et recommandations concrètes…"
                        />
                      </div>

                      <div className="ax-field">
                        <label className="ax-label ax-row" htmlFor="apv-notes" style={{ gap: 6 }}>
                          <Lock size={13} className="ax-faint" />
                          <span>Notes internes</span>
                        </label>
                        <textarea
                          id="apv-notes"
                          className="ax-textarea apv-notes"
                          value={internalNotes}
                          onChange={(e) => setInternalNotes(e.target.value)}
                          rows={2}
                          placeholder="Ex. : risque prud’homal modéré, à recontacter si récidive"
                        />
                        <span className="ax-hint">Visibles uniquement par vous.</span>
                      </div>
                    </div>

                    <div className="ax-card-foot apv-actions">
                      <button
                        type="button"
                        onClick={() => handleSaveExpertAnswer(false)}
                        className="ax-btn ax-btn-secondary"
                      >
                        <Save size={16} />
                        <span>Enregistrer le brouillon</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveExpertAnswer(true)}
                        className="ax-btn ax-btn-primary"
                      >
                        <Send size={16} />
                        <span>Envoyer la réponse</span>
                      </button>
                    </div>
                  </div>
                </m.div>
              ) : (
                <m.div
                  key="empty"
                  className="ax-card ax-empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="ax-empty-icon"><Inbox size={22} /></div>
                  <div className="ax-empty-title">Aucune question sélectionnée</div>
                  <div className="ax-small">Choisissez une question dans la liste pour y répondre.</div>
                </m.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Formules et quotas */}
      {activeTab === 'plans' && (
        <div className="ax-stack-lg">
          <div className="ax-page-head" style={{ marginBottom: 0 }}>
            <div>
              <h1 className="ax-page-title">Formules</h1>
              <p className="ax-page-sub">Les tarifs et quotas s’appliquent immédiatement à la page tarifs et aux comptes.</p>
            </div>
            <div className="ax-page-actions">
              <button type="button" onClick={handleSaveAllPlans} className="ax-btn ax-btn-primary">
                <Save size={16} />
                <span>Enregistrer les formules</span>
              </button>
            </div>
          </div>

          <div className="ax-grid-3">
            {editablePlans.map((p, i) => (
              <m.div
                key={p.code}
                className="ax-card"
                custom={i}
                variants={listItem}
                initial="hidden"
                animate="show"
              >
                <div className="ax-card-head">
                  <div className="ax-card-title">{p.label}</div>
                </div>
                <div className="ax-card-body ax-stack">
                  <div className="ax-field">
                    <label className="ax-label" htmlFor={`apv-price-${p.code}`}>Prix mensuel</label>
                    <div className="apv-input-suffix">
                      <input
                        id={`apv-price-${p.code}`}
                        type="number"
                        className="ax-input"
                        value={p.priceMonthly}
                        onChange={(e) => handlePlanPriceChange(p.code, parseFloat(e.target.value) || 0)}
                      />
                      <span>€ HT</span>
                    </div>
                  </div>

                  <div className="ax-field">
                    <label className="ax-label" htmlFor={`apv-quota-${p.code}`}>Questions expertes par mois</label>
                    <input
                      id={`apv-quota-${p.code}`}
                      type="number"
                      className="ax-input"
                      value={p.features.expertQuestionsMonth}
                      onChange={(e) => handlePlanQuotaChange(p.code, parseInt(e.target.value) || 0)}
                    />
                  </div>

                  <div className="ax-field">
                    <label className="ax-label" htmlFor={`apv-model-${p.code}`}>Modèle d’IA</label>
                    <input
                      id={`apv-model-${p.code}`}
                      type="text"
                      className="ax-input apv-mono"
                      value={p.features.aiModel}
                      readOnly
                      disabled
                    />
                  </div>
                </div>
              </m.div>
            ))}
          </div>
        </div>
      )}

      {/* Usage de l'IA */}
      {activeTab === 'ai_usage' && (
        <div className="ax-stack-lg">
          <div className="ax-page-head" style={{ marginBottom: 0 }}>
            <div>
              <h1 className="ax-page-title">Usage IA</h1>
              <p className="ax-page-sub">Tokens et coûts estimés par association. Aucun contenu de question n’est conservé.</p>
            </div>
          </div>

          <div className="ax-stats">
            <div className="ax-stat">
              <div className="ax-stat-label">Coût total estimé</div>
              <div className="ax-stat-value">{totalCost.toFixed(2)} €</div>
            </div>
            <div className="ax-stat">
              <div className="ax-stat-label">Requêtes</div>
              <div className="ax-stat-value">{aiUsageRecords.length}</div>
            </div>
            <div className="ax-stat">
              <div className="ax-stat-label">Tokens</div>
              <div className="ax-stat-value">{totalTokens.toLocaleString('fr-FR')}</div>
            </div>
          </div>

          <div className="ax-card" style={{ overflow: 'hidden' }}>
            {aiUsageRecords.length === 0 ? (
              <div className="ax-empty">
                <div className="ax-empty-icon"><Cpu size={22} /></div>
                <div className="ax-empty-title">Aucune utilisation enregistrée</div>
              </div>
            ) : (
              <div className="ax-table-wrap">
                <table className="ax-table">
                  <thead>
                    <tr>
                      <th>Association</th>
                      <th className="ax-hide-sm">Modèle</th>
                      <th className="ax-hide-sm">Version du prompt</th>
                      <th className="ax-num ax-hide-sm">Tokens entrée</th>
                      <th className="ax-num ax-hide-sm">Tokens sortie</th>
                      <th className="ax-num">Coût estimé</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {aiUsageRecords.map((r) => (
                      <tr key={r.id}>
                        <td className="ax-strong">{r.orgName}</td>
                        <td className="apv-mono ax-muted ax-hide-sm">{r.model}</td>
                        <td className="ax-hide-sm">
                          <span className="ax-badge">{r.promptVersion}</span>
                        </td>
                        <td className="ax-num ax-hide-sm">{r.inputTokens}</td>
                        <td className="ax-num ax-hide-sm">{r.outputTokens}</td>
                        <td className="ax-num ax-strong">{r.costEstimateEur.toFixed(4)} €</td>
                        <td className="ax-muted" style={{ whiteSpace: 'nowrap' }}>{r.createdAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pages SEO */}
      {activeTab === 'seo' && (
        <div className="ax-stack-lg">
          <div className="ax-page-head" style={{ marginBottom: 0 }}>
            <div>
              <h1 className="ax-page-title">Pages SEO</h1>
              <p className="ax-page-sub">Modifiez le titre et la description des pages principales.</p>
            </div>
            <div className="ax-page-actions">
              <button
                type="button"
                onClick={() => {
                  setSaveToast(true);
                  setTimeout(() => setSaveToast(false), 3000);
                }}
                className="ax-btn ax-btn-primary"
              >
                <Save size={16} />
                <span>Publier les pages</span>
              </button>
            </div>
          </div>

          <div className="ax-stack">
            {seoPages.map((page, idx) => (
              <m.div
                key={idx}
                className="ax-card"
                custom={idx}
                variants={listItem}
                initial="hidden"
                animate="show"
              >
                <div className="ax-card-head">
                  <span className="ax-badge apv-slug">{page.slug}</span>
                </div>
                <div className="ax-card-body ax-stack">
                  <div className="ax-field">
                    <label className="ax-label" htmlFor={`apv-seo-title-${idx}`}>Titre de la page</label>
                    <input
                      id={`apv-seo-title-${idx}`}
                      type="text"
                      className="ax-input"
                      value={page.title}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSeoPages(prev => prev.map((p, i) => i === idx ? { ...p, title: val } : p));
                      }}
                    />
                  </div>
                  <div className="ax-field">
                    <label className="ax-label" htmlFor={`apv-seo-desc-${idx}`}>Description</label>
                    <input
                      id={`apv-seo-desc-${idx}`}
                      type="text"
                      className="ax-input"
                      value={page.metaDescription}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSeoPages(prev => prev.map((p, i) => i === idx ? { ...p, metaDescription: val } : p));
                      }}
                    />
                  </div>
                </div>
              </m.div>
            ))}
          </div>
        </div>
      )}

      <AnimatePresence>
        {saveToast && (
          <m.div
            className="ax-toast apv-toast"
            role="status"
            initial={{ opacity: 0, y: 12, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 8, x: '-50%' }}
            transition={{ duration: 0.25, ease: EASE }}
          >
            <CheckCircle2 size={18} />
            <span>Modifications enregistrées</span>
          </m.div>
        )}
      </AnimatePresence>
    </AppShell>
  );
};
