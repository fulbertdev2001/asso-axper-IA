import React, { useState } from 'react';
import { m, AnimatePresence } from 'motion/react';
import { Plan, Subscription, Organization } from '../types';
import {
  CreditCard,
  AlertTriangle,
  ExternalLink,
  Check,
  Minus,
  Lock,
  FileText,
  ChevronDown,
  X,
  Info
} from 'lucide-react';
import './SubscriptionView.css';

interface SubscriptionViewProps {
  currentOrg: Organization;
  currentPlan: Plan;
  plans: Plan[];
  subscription: Subscription;
  onUpdateSubscription: (sub: Partial<Subscription>) => void;
  onSelectPlan: (planCode: 'initiale' | 'pro' | 'expert') => void;
}

interface StripeEventLog {
  id: string;
  type: string;
  processedAt: string;
  status: 'success' | 'ignored_duplicate';
}

const EASE = [0.22, 1, 0.36, 1] as const;
const planName = (label: string) => label.replace(/\s*\(.*\)\s*/, '');
const fadeUp = (i: number) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease: EASE, delay: i * 0.06 }
});

export const SubscriptionView: React.FC<SubscriptionViewProps> = ({
  currentOrg,
  currentPlan,
  plans,
  subscription,
  onUpdateSubscription,
  onSelectPlan
}) => {
  const [showPortalModal, setShowPortalModal] = useState(false);
  const [stripeEvents, setStripeEvents] = useState<StripeEventLog[]>([
    { id: 'evt_1Qz001Akiligue', type: 'customer.subscription.created', processedAt: '2026-09-01 10:14:00', status: 'success' },
    { id: 'evt_1Qz045InvoicePaid', type: 'invoice.payment_succeeded', processedAt: '2026-09-01 10:14:02', status: 'success' }
  ]);

  const triggerWebhookSimulation = (eventType: string) => {
    const eventId = `evt_${Date.now()}`;
    const nowStr = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    if (eventType === 'invoice.payment_failed') {
      const graceDate = new Date();
      graceDate.setDate(graceDate.getDate() + 3);
      onUpdateSubscription({
        status: 'past_due',
        graceUntil: graceDate.toLocaleDateString('fr-FR')
      });
    } else if (eventType === 'customer.subscription.updated') {
      onUpdateSubscription({
        status: 'active',
        graceUntil: null
      });
    }

    setStripeEvents(prev => [
      { id: eventId, type: eventType, processedAt: nowStr, status: 'success' },
      ...prev
    ]);
  };

  const quota = currentPlan.features.expertQuestionsMonth;
  const used = subscription.questionsUsedThisMonth;
  const usagePct = quota > 0 ? Math.min(100, Math.round((used / quota) * 100)) : 0;

  const statusBadge =
    subscription.status === 'active' ? (
      <span className="ax-badge ax-badge-lime"><span className="ax-dot" />Actif</span>
    ) : subscription.status === 'past_due' ? (
      <span className="ax-badge ax-badge-orange"><span className="ax-dot" />Paiement en attente</span>
    ) : (
      <span className="ax-badge ax-badge-red"><span className="ax-dot" />Résilié</span>
    );

  const modules = [
    { on: true, label: 'RH et conventions collectives' },
    { on: true, label: 'Gouvernance' },
    { on: currentPlan.features.briqueFinance, label: 'Finance et subventions' },
    { on: currentPlan.features.briqueConformite, label: 'Conformité employeur (DUERP)' }
  ];

  return (
    <div className="ax-stack-lg">
      {/* En-tête */}
      <m.div className="ax-page-head" style={{ marginBottom: 0 }} {...fadeUp(0)}>
        <div>
          <h1 className="ax-page-title">Abonnement</h1>
          <p className="ax-page-sub">Votre formule, votre consommation et vos factures pour {currentOrg.name}.</p>
        </div>
      </m.div>

      {/* Alertes de statut */}
      {subscription.graceUntil && (
        <m.div className="ax-alert ax-alert-warning" role="alert" {...fadeUp(1)}>
          <AlertTriangle size={18} />
          <div className="ax-row-between" style={{ flex: 1 }}>
            <div>
              <div className="ax-alert-title">Le dernier paiement n’a pas abouti</div>
              <div className="ax-small">Votre accès est maintenu jusqu’au {subscription.graceUntil}. Mettez à jour votre moyen de paiement pour éviter la suspension.</div>
            </div>
            <button onClick={() => setShowPortalModal(true)} className="ax-btn ax-btn-secondary ax-btn-sm">
              Mettre à jour le paiement
            </button>
          </div>
        </m.div>
      )}
      {subscription.status === 'canceled' && (
        <m.div className="ax-alert ax-alert-info" role="status" {...fadeUp(1)}>
          <Info size={18} />
          <div className="ax-row-between" style={{ flex: 1 }}>
            <div>
              <div className="ax-alert-title">Votre abonnement est résilié</div>
              <div className="ax-small">Il reste accessible jusqu’au {subscription.currentPeriodEnd}.</div>
            </div>
            <button onClick={() => setShowPortalModal(true)} className="ax-btn ax-btn-secondary ax-btn-sm">
              Gérer l’abonnement
            </button>
          </div>
        </m.div>
      )}

      {/* Formule actuelle */}
      <m.section className="ax-card ax-card-pad" {...fadeUp(2)}>
        <div className="sv-current">
          <div className="ax-stack">
            <div className="ax-stack-sm">
              <div className="ax-row">
                <span className="ax-small ax-muted">Formule actuelle</span>
                {statusBadge}
              </div>
              <div className="ax-row-between" style={{ alignItems: 'baseline' }}>
                <h2 className="sv-plan-name">{planName(currentPlan.label)}</h2>
                <div className="sv-price">
                  <strong>{currentPlan.priceMonthly} €</strong>
                  <span>HT / mois</span>
                </div>
              </div>
              <p className="ax-small ax-muted">
                {subscription.status === 'canceled' ? 'Fin d’accès le ' : 'Prochain renouvellement le '}
                <span className="ax-strong" style={{ color: 'var(--color-navy)' }}>{subscription.currentPeriodEnd}</span>
              </p>
            </div>

            <hr className="ax-divider" />

            <div className="ax-stack-sm">
              <div className="ax-small ax-strong">Modules inclus</div>
              <ul className="sv-modules">
                {modules.map(mod => (
                  <li key={mod.label} className={mod.on ? '' : 'is-off'}>
                    {mod.on ? <Check size={16} /> : <Lock size={14} />}
                    <span>{mod.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="ax-stack">
            <div className="sv-usage">
              <div className="ax-small ax-muted">Questions à l’experte ce mois-ci</div>
              {quota > 0 ? (
                <>
                  <div className="sv-usage-value" style={{ margin: '4px 0 10px' }}>
                    {used} <span className="ax-small ax-muted" style={{ fontWeight: 500 }}>sur {quota}</span>
                  </div>
                  <div className="ax-progress" role="progressbar" aria-valuenow={used} aria-valuemin={0} aria-valuemax={quota}>
                    <m.span
                      initial={{ width: 0 }}
                      animate={{ width: `${usagePct}%` }}
                      transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
                    />
                  </div>
                </>
              ) : (
                <div className="ax-small" style={{ marginTop: 6 }}>Non incluses dans cette formule.</div>
              )}
            </div>
            <div className="ax-row sv-actions">
              <button onClick={() => setShowPortalModal(true)} className="ax-btn ax-btn-primary ax-btn-block">
                <ExternalLink size={16} />
                Gérer l’abonnement
              </button>
            </div>
          </div>
        </div>
      </m.section>

      {/* Choix de formule */}
      <section className="ax-stack">
        <m.div {...fadeUp(3)}>
          <h2 className="sv-section-title">Changer de formule</h2>
          <p className="ax-small ax-muted">Le changement s’applique immédiatement, sans engagement.</p>
        </m.div>
        <div className="ax-grid-3 sv-plans">
          {plans.map((p, i) => {
            const f = p.features;
            const isCurrent = p.code === currentPlan.code;
            const items = [
              { on: f.briqueRh, label: 'RH et conventions collectives' },
              { on: f.briqueGouvernance, label: 'Gouvernance' },
              { on: f.briqueFinance, label: 'Finance et subventions' },
              { on: f.briqueConformite, label: 'Conformité employeur' },
              {
                on: f.expertQuestionsMonth > 0,
                label: f.expertQuestionsMonth > 0
                  ? `${f.expertQuestionsMonth} question${f.expertQuestionsMonth > 1 ? 's' : ''} à l’experte / mois`
                  : 'Question à l’experte'
              }
            ];
            return (
              <m.div
                key={p.code}
                className={`sv-plan${p.highlighted ? ' sv-plan-featured' : ''}${isCurrent ? ' sv-plan-current' : ''}`}
                {...fadeUp(4 + i)}
                whileHover={{ y: -3 }}
              >
                {(isCurrent || p.highlighted) && (
                  <span className="sv-plan-badge">
                    {isCurrent ? (
                      <span className="ax-badge ax-badge-navy">Formule actuelle</span>
                    ) : (
                      <span className="ax-badge" style={{ background: 'var(--color-blue)', color: '#fff' }}>Conseillée</span>
                    )}
                  </span>
                )}
                <h3>{planName(p.label)}</h3>
                <p className="sv-plan-desc">{p.description}</p>
                <div className="sv-price">
                  <strong>{p.priceMonthly} €</strong>
                  <span>HT / mois</span>
                </div>
                <ul>
                  {items.map(it => (
                    <li key={it.label} className={it.on ? '' : 'is-off'}>
                      {it.on ? <Check size={16} /> : <Minus size={16} />}
                      {it.label}
                    </li>
                  ))}
                </ul>
                {isCurrent ? (
                  <button className="ax-btn ax-btn-secondary ax-btn-block" disabled>
                    Formule actuelle
                  </button>
                ) : (
                  <button
                    onClick={() => onSelectPlan(p.code)}
                    className={`ax-btn ax-btn-block ${p.highlighted ? 'ax-btn-primary' : 'ax-btn-secondary'}`}
                  >
                    Passer à {planName(p.label)}
                  </button>
                )}
              </m.div>
            );
          })}
        </div>
      </section>

      {/* Facturation */}
      <m.section className="ax-card" {...fadeUp(7)}>
        <div className="ax-card-head">
          <div>
            <div className="ax-card-title">Facturation</div>
            <div className="ax-card-sub">Paiement sécurisé par Stripe · facture mensuelle</div>
          </div>
          <button onClick={() => setShowPortalModal(true)} className="ax-btn ax-btn-ghost ax-btn-sm">
            <ExternalLink size={14} />
            <span className="ax-hide-sm">Portail de paiement</span>
          </button>
        </div>
        <div className="ax-card-body ax-stack">
          <div className="ax-row-between">
            <div className="ax-row" style={{ gap: 12 }}>
              <span className="ax-avatar ax-avatar-soft ax-avatar-sm"><CreditCard size={15} /></span>
              <div>
                <div className="ax-small ax-strong">Visa se terminant par 4242</div>
                <div className="ax-xs ax-muted">Expire le 12/28</div>
              </div>
            </div>
            <span className="ax-xs ax-faint sv-mono">{subscription.stripeCustomerId}</span>
          </div>
          <div className="ax-table-wrap" style={{ border: '1px solid var(--ax-line)', borderRadius: 12 }}>
            <table className="ax-table">
              <thead>
                <tr>
                  <th>Facture</th>
                  <th className="ax-num">Montant</th>
                  <th className="ax-num"><span className="ax-hide-sm">Document</span></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <span className="ax-row" style={{ flexWrap: 'nowrap' }}>
                      <FileText size={15} className="ax-faint" />
                      <span>INV-2026-0901</span>
                    </span>
                  </td>
                  <td className="ax-num">{currentPlan.priceMonthly} € TTC</td>
                  <td className="ax-num">
                    <button onClick={() => setShowPortalModal(true)} className="ax-btn ax-btn-ghost ax-btn-sm">PDF</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </m.section>

      {/* Outils de démonstration Stripe */}
      <m.details className="ax-card sv-demo" {...fadeUp(8)}>
        <summary>
          <div>
            <div className="ax-card-title">Mode démonstration</div>
            <div className="ax-card-sub">Simulez des événements Stripe pour tester les accès.</div>
          </div>
          <ChevronDown size={18} className="sv-chevron" />
        </summary>
        <div className="ax-card-body ax-stack">
          <div className="ax-row">
            <button
              onClick={() => triggerWebhookSimulation('invoice.payment_failed')}
              className="ax-btn ax-btn-secondary ax-btn-sm"
            >
              Simuler un échec de paiement
            </button>
            <button
              onClick={() => triggerWebhookSimulation('customer.subscription.updated')}
              className="ax-btn ax-btn-secondary ax-btn-sm"
            >
              Simuler une régularisation
            </button>
          </div>
          <div className="ax-table-wrap" style={{ border: '1px solid var(--ax-line)', borderRadius: 12 }}>
            <table className="ax-table" style={{ minWidth: 520 }}>
              <thead>
                <tr>
                  <th>Événement</th>
                  <th>Identifiant</th>
                  <th>Traité le</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {stripeEvents.map((evt) => (
                    <m.tr
                      key={evt.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <td className="sv-mono">{evt.type}</td>
                      <td className="sv-mono ax-faint">{evt.id}</td>
                      <td className="ax-small ax-muted">{evt.processedAt}</td>
                      <td><span className="ax-badge ax-badge-lime">Traité une fois</span></td>
                    </m.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      </m.details>

      {/* Portail client Stripe (simulé) */}
      <AnimatePresence>
        {showPortalModal && (
          <m.div
            className="ax-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => { if (e.target === e.currentTarget) setShowPortalModal(false); }}
          >
            <m.div
              className="ax-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="sv-portal-title"
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.3, ease: EASE }}
            >
              <div className="ax-card-head">
                <div>
                  <div id="sv-portal-title" className="ax-card-title">Portail de paiement</div>
                  <div className="ax-card-sub">Simulation du portail client Stripe</div>
                </div>
                <button onClick={() => setShowPortalModal(false)} className="ax-btn ax-btn-ghost ax-btn-icon" aria-label="Fermer">
                  <X size={18} />
                </button>
              </div>

              <div className="ax-card-body">
                <div className="sv-modal-row">
                  <span className="ax-muted">Client</span>
                  <span className="ax-strong">
                    {currentOrg.name} <span className="sv-mono ax-faint">{subscription.stripeCustomerId}</span>
                  </span>
                </div>
                <div className="sv-modal-row">
                  <span className="ax-muted">Moyen de paiement</span>
                  <span className="ax-strong">Visa •••• 4242 · 12/28</span>
                </div>
                <div className="sv-modal-row">
                  <span>Facture INV-2026-0901 · {currentPlan.priceMonthly} € TTC</span>
                  <span className="ax-small ax-strong" style={{ color: 'var(--color-blue)', cursor: 'pointer' }}>Télécharger le PDF</span>
                </div>
              </div>

              <div className="ax-card-foot" style={{ flexWrap: 'wrap', justifyContent: 'space-between' }}>
                <button
                  onClick={() => {
                    if (confirm('Confirmez-vous la résiliation à échéance ?')) {
                      onUpdateSubscription({ status: 'canceled' });
                      setShowPortalModal(false);
                    }
                  }}
                  className="ax-btn ax-btn-danger"
                >
                  Résilier l’abonnement
                </button>
                <button
                  onClick={() => {
                    alert('Simulation : Carte mise à jour sur Stripe avec succès.');
                    setShowPortalModal(false);
                  }}
                  className="ax-btn ax-btn-primary"
                >
                  Mettre à jour la carte
                </button>
              </div>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
};
