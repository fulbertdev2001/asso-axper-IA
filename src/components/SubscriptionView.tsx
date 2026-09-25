import React, { useState } from 'react';
import { Plan, Subscription, Organization } from '../types';
import { 
  CreditCard, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink, 
  Clock, 
  ShieldCheck, 
  Zap, 
  FileText, 
  ArrowRight,
  RefreshCw,
  Lock
} from 'lucide-react';

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

  return (
    <div className="animate-fade-in" style={{ maxWidth: 1100, margin: '0 auto', padding: 'var(--space-6)' }}>
      {/* Title */}
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-2)' }}>
          <span className="badge badge-blue">Lot 3 — Stripe & Droits d'accès</span>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-navy-muted)' }}>
            Pas d'écran de facturation custom à coder &bull; Stripe Customer Portal
          </span>
        </div>
        <h1 style={{ fontSize: 'var(--text-3xl)', color: 'var(--color-navy)', marginBottom: 'var(--space-2)' }}>
          Abonnement et droits d'accès
        </h1>
        <p style={{ color: 'var(--color-navy-muted)' }}>
          Organisation active : <strong>{currentOrg.name}</strong> (Client Stripe : {subscription.stripeCustomerId})
        </p>
      </div>

      {/* Subscription Status Card */}
      <div className="card" style={{ marginBottom: 'var(--space-8)', borderColor: subscription.status === 'past_due' ? 'var(--color-orange)' : 'var(--color-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: 'var(--space-2)' }}>
              <h2 style={{ fontSize: 'var(--text-2xl)' }}>Formule {currentPlan.label}</h2>
              <span className={subscription.status === 'active' ? 'badge badge-lime' : 'badge badge-orange'}>
                {subscription.status === 'active' ? 'Abonnement actif' : 'Période de grâce (3 jours)'}
              </span>
            </div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-navy-muted)' }}>
              {currentPlan.priceMonthly} € HT / mois &bull; Prochain renouvellement le {subscription.currentPeriodEnd}
            </div>
            {subscription.graceUntil && (
              <div style={{ color: 'var(--color-orange-dark)', fontSize: '13px', fontWeight: 600, marginTop: '6px' }}>
                Incident de paiement signalé : accès maintenu jusqu'au {subscription.graceUntil} avant suspension.
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => setShowPortalModal(true)} className="btn btn-primary">
              <ExternalLink size={16} />
              <span>Gérer sur le Portail Stripe</span>
            </button>
          </div>
        </div>
      </div>

      {/* Entitlements Checker Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
        {/* Active features */}
        <div className="card">
          <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={20} style={{ color: 'var(--color-blue)' }} />
            <span>Droits d'accès vérifiés (`hasFeature`)</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: 'var(--text-sm)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--color-border)' }}>
              <span>Brique RH & Conventions</span>
              <span className="badge badge-lime">Active</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--color-border)' }}>
              <span>Brique Gouvernance 1901</span>
              <span className="badge badge-lime">Active</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--color-border)' }}>
              <span>Brique Finance & Subventions</span>
              {currentPlan.features.briqueFinance ? (
                <span className="badge badge-lime">Active</span>
              ) : (
                <span className="badge badge-orange">Verrouillée</span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--color-border)' }}>
              <span>Brique Conformité DUERP</span>
              {currentPlan.features.briqueConformite ? (
                <span className="badge badge-lime">Active</span>
              ) : (
                <span className="badge badge-orange">Verrouillée</span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}>
              <span>Quota questions expertes / mois</span>
              <strong>{currentPlan.features.expertQuestionsMonth} question(s)</strong>
            </div>
          </div>
        </div>

        {/* Change plan fast picker */}
        <div className="card">
          <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={20} style={{ color: 'var(--color-blue)' }} />
            <span>Changer de formule sans redéploiement</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {plans.map((p) => (
              <div
                key={p.code}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: `1.5px solid ${p.code === currentPlan.code ? 'var(--color-blue)' : 'var(--color-border)'}`,
                  backgroundColor: p.code === currentPlan.code ? 'var(--color-blue-light)' : 'transparent'
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: 'var(--text-base)', color: 'var(--color-navy)' }}>
                    {p.label}
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-navy-muted)' }}>
                    {p.priceMonthly} € / mois &bull; {p.features.expertQuestionsMonth} question(s) experte(s)
                  </div>
                </div>

                {p.code === currentPlan.code ? (
                  <span className="badge badge-blue">Formule active</span>
                ) : (
                  <button onClick={() => onSelectPlan(p.code)} className="btn btn-sm btn-outline-blue">
                    Basculer
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stripe Webhook & Idempotency Simulator (Lot 3 CA) */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: 'var(--text-lg)' }}>Simulation Webhooks Stripe & Idempotence (`stripe_events`)</h3>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-navy-muted)' }}>
              Testez la réaction de l'application et la résilience aux pannes réseau.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => triggerWebhookSimulation('invoice.payment_failed')}
              className="btn btn-sm btn-secondary"
              style={{ color: 'var(--color-orange-dark)', borderColor: 'var(--color-orange)' }}
            >
              Simuler échec paiement (Grâce 3j)
            </button>
            <button
              onClick={() => triggerWebhookSimulation('customer.subscription.updated')}
              className="btn btn-sm btn-secondary"
            >
              Simuler régularisation
            </button>
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--color-surface-subtle)', borderRadius: 'var(--radius-md)', padding: '12px', fontSize: '13px', fontFamily: 'monospace' }}>
          <div style={{ fontWeight: 700, marginBottom: '8px', color: 'var(--color-navy)' }}>
            Journal d'idempotence des événements Stripe :
          </div>
          {stripeEvents.map((evt) => (
            <div key={evt.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px dashed #cbd5e1' }}>
              <span style={{ color: 'var(--color-blue)' }}>{evt.id}</span>
              <span style={{ color: 'var(--color-navy)' }}>{evt.type}</span>
              <span style={{ color: '#64748b' }}>{evt.processedAt}</span>
              <span className="badge badge-lime" style={{ fontSize: '10px' }}>Idempotent OK</span>
            </div>
          ))}
        </div>
      </div>

      {/* Simulated Stripe Customer Portal Modal */}
      {showPortalModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(10, 37, 64, 0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '24px'
        }}>
          <div className="card animate-fade-in" style={{ maxWidth: 600, width: '100%', padding: 'var(--space-8)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CreditCard size={22} style={{ color: 'var(--color-blue)' }} />
                <h3 style={{ fontSize: 'var(--text-lg)', color: 'var(--color-navy)' }}>
                  Stripe Customer Portal (Simulateur officiel)
                </h3>
              </div>
              <button onClick={() => setShowPortalModal(false)} className="btn btn-sm btn-secondary">
                Fermer
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', fontSize: 'var(--text-sm)', color: 'var(--color-navy)' }}>
              <div>
                <strong>Client :</strong> {currentOrg.name} ({subscription.stripeCustomerId})
              </div>
              <div>
                <strong>Moyen de paiement :</strong> Carte Visa terminant par 4242 (Expire 12/28)
              </div>
              <div>
                <strong>Factures :</strong>
                <ul style={{ listStyle: 'none', paddingLeft: 0, marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <li style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--color-surface-subtle)', padding: '6px 10px', borderRadius: 'var(--radius-sm)' }}>
                    <span>Facture #INV-2026-0901 ({currentPlan.priceMonthly} € TTC)</span>
                    <span style={{ color: 'var(--color-blue)', cursor: 'pointer', fontWeight: 600 }}>Télécharger PDF</span>
                  </li>
                </ul>
              </div>

              <div style={{ marginTop: 'var(--space-4)', display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => {
                    alert('Simulation : Carte mise à jour sur Stripe avec succès.');
                    setShowPortalModal(false);
                  }}
                  className="btn btn-primary"
                  style={{ flexGrow: 1 }}
                >
                  Mettre à jour le moyen de paiement
                </button>
                <button
                  onClick={() => {
                    if (confirm('Confirmez-vous la résiliation à échéance ?')) {
                      onUpdateSubscription({ status: 'canceled' });
                      setShowPortalModal(false);
                    }
                  }}
                  className="btn btn-secondary"
                  style={{ color: 'var(--color-red)' }}
                >
                  Résilier l'abonnement
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
