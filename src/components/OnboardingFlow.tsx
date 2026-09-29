import React, { useState } from 'react';
import { Organization, Plan, Subscription } from '../types';
import { 
  Building2, 
  Users, 
  CreditCard, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  ShieldCheck, 
  Lock, 
  Compass, 
  Award, 
  Coins, 
  Calendar 
} from 'lucide-react';

interface OnboardingFlowProps {
  plans: Plan[];
  onCompleteOnboarding: (newOrg: Organization, selectedPlanCode: 'initiale' | 'pro' | 'expert') => void;
  onCancel: () => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  plans,
  onCompleteOnboarding,
  onCancel
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form State
  const [leaderName, setLeaderName] = useState('Claire Delorme');
  const [leaderRole, setLeaderRole] = useState('Directrice générale');
  const [leaderEmail, setLeaderEmail] = useState('direction@asso-initiative.org');

  const [orgName, setOrgName] = useState('Initiative & Solidarité');
  const [siren, setSiren] = useState('512 890 123');
  const [rna, setRna] = useState('W751098432');
  const [sector, setSector] = useState('Médico-social & Handicap');
  const [employeesCount, setEmployeesCount] = useState<number>(16);
  const [annualBudget, setAnnualBudget] = useState<number>(680000);
  const [fiscalYearEnd, setFiscalYearEnd] = useState('31 décembre');
  const [usualAgMonth, setUsualAgMonth] = useState('Juin');
  const [mainFunders, setMainFunders] = useState('Conseil Départemental, ARS, CAF');

  const [ccn, setCcn] = useState('CCN 66 (Convention Collective Nationale de 1966)');

  const [selectedPlanCode, setSelectedPlanCode] = useState<'initiale' | 'pro' | 'expert'>('pro');
  const [isProcessingStripe, setIsProcessingStripe] = useState(false);
  const [cardHolder, setCardHolder] = useState('Claire Delorme');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('123');

  const ccnOptions = [
    'CCN 66 (Convention Collective Nationale de 1966)',
    'CCN 51 (FEHAP - Établissements privés d hospitalisation et de soins)',
    'Convention collective ÉCLAT (ex-Animation)',
    'ALISFA (Acteurs du lien social et familial)',
    'CCN de la Branche de l aide et du soin à domicile (BAD)',
    'CCN du Sport (IDCC 2511)'
  ];

  const handleFinish = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessingStripe(true);

    setTimeout(() => {
      const names = leaderName.trim().split(' ');
      const firstName = names[0] || 'Responsable';
      const lastName = names.slice(1).join(' ') || 'Association';

      const newOrg: Organization = {
        id: 'org-' + Date.now(),
        name: orgName.trim(),
        siren: siren.trim(),
        rna: rna.trim(),
        sector: sector.trim(),
        employeesCount: Number(employeesCount) || 1,
        annualBudget: Number(annualBudget) || 100000,
        ccn: ccn,
        fiscalYearEnd: fiscalYearEnd,
        usualAgMonth: usualAgMonth,
        governanceSummary: `Gouvernance déclarée par ${leaderName} (${leaderRole})`,
        mainFunders: mainFunders.split(',').map(s => s.trim()).filter(Boolean),
        establishmentsCount: 1,
        accountEmail: leaderEmail.trim(),
        password: 'Asso2026!',
        members: [
          {
            id: 'mem-' + Date.now(),
            firstName,
            lastName,
            role: leaderRole || 'Présidente / Direction',
            email: leaderEmail,
            joinedDate: new Date().toLocaleDateString('fr-FR')
          }
        ]
      };

      onCompleteOnboarding(newOrg, selectedPlanCode);
    }, 1500);
  };

  const selectedPlan = plans.find(p => p.code === selectedPlanCode) || plans[1];

  return (
    <div className="animate-fade-in" style={{
      maxWidth: 860,
      margin: '24px auto 60px',
      padding: '0 clamp(14px, 3vw, 24px)'
    }}>
      {/* Progress Steps Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <span className="badge badge-blue" style={{ marginBottom: '6px' }}>
              Parcours Onboarding Association (Lot 2 & 3)
            </span>
            <h1 style={{ fontSize: 'var(--text-2xl)', color: 'var(--color-navy)', margin: 0 }}>
              Configuration de votre association
            </h1>
          </div>
          <button onClick={onCancel} className="btn btn-sm btn-secondary">
            Annuler
          </button>
        </div>

        {/* Desktop Steps Breadcrumbs */}
        <div className="hide-on-mobile" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
          {[
            { step: 1, title: '1. Responsable' },
            { step: 2, title: '2. Association' },
            { step: 3, title: '3. Convention' },
            { step: 4, title: '4. Formule & Stripe' }
          ].map((item) => (
            <div
              key={item.step}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                backgroundColor: currentStep >= item.step ? 'var(--color-blue)' : 'var(--color-surface-subtle)',
                color: currentStep >= item.step ? '#ffffff' : 'var(--color-navy-muted)',
                fontSize: '12px',
                fontWeight: 700,
                textAlign: 'center',
                transition: 'all 0.2s ease'
              }}
            >
              {item.title}
            </div>
          ))}
        </div>

        {/* Mobile Stepper Bar */}
        <div className="show-on-mobile" style={{ display: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--color-blue)' }}>
              Étape {currentStep} sur 4
            </span>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-navy-muted)' }}>
              {currentStep === 1 && "Responsable"}
              {currentStep === 2 && "Association"}
              {currentStep === 3 && "Convention"}
              {currentStep === 4 && "Formule & Stripe"}
            </span>
          </div>
          <div style={{ height: '6px', borderRadius: '3px', backgroundColor: 'var(--color-surface-subtle)', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${currentStep * 25}%`,
              backgroundColor: 'var(--color-blue)',
              borderRadius: '3px',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>
      </div>

      {/* STEP 1: Responsable & Contact */}
      {currentStep === 1 && (
        <div className="card animate-fade-in" style={{ padding: 'clamp(18px, 4vw, 32px)' }}>
          <h2 style={{ fontSize: '20px', color: 'var(--color-navy)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={22} style={{ color: 'var(--color-blue)' }} />
            <span>Identité du responsable de compte</span>
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--color-navy-muted)', marginBottom: '24px' }}>
            Ces coordonnées serviront aux notifications de l'experte Laetitia Badji et à l'accès sécurisé Better Auth.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label className="form-label">Nom et prénom du dirigeant / coordinateur :</label>
              <input
                type="text"
                className="input"
                value={leaderName}
                onChange={(e) => setLeaderName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="form-label">Fonction dans l'association :</label>
              <select
                className="select"
                value={leaderRole}
                onChange={(e) => setLeaderRole(e.target.value)}
              >
                <option value="Directeur / Directrice générale">Directeur / Directrice générale</option>
                <option value="Président / Présidente bénévole">Président / Présidente bénévole</option>
                <option value="Trésorier / Trésorière">Trésorier / Trésorière</option>
                <option value="Responsable RH / Coordinateur">Responsable RH / Coordinateur</option>
              </select>
            </div>

            <div>
              <label className="form-label">Adresse email professionnelle :</label>
              <input
                type="email"
                className="input"
                value={leaderEmail}
                onChange={(e) => setLeaderEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px' }}>
            <button
              onClick={() => setCurrentStep(2)}
              className="btn btn-primary"
            >
              <span>Continuer : Identité de l'association</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Identité Légale de l'Association */}
      {currentStep === 2 && (
        <div className="card animate-fade-in" style={{ padding: 'clamp(18px, 4vw, 32px)' }}>
          <h2 style={{ fontSize: '20px', color: 'var(--color-navy)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building2 size={22} style={{ color: 'var(--color-blue)' }} />
            <span>Identité légale et déclarative (CDC §12.1)</span>
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--color-navy-muted)', marginBottom: '24px' }}>
            Ces informations définissent le périmètre juridique et fiscal que l'assistant IA prendra en compte.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Nom officiel de l'association :</label>
              <input
                type="text"
                className="input"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="form-label">Numéro SIREN (9 chiffres) :</label>
              <input
                type="text"
                className="input"
                value={siren}
                onChange={(e) => setSiren(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="form-label">Numéro RNA (W...) :</label>
              <input
                type="text"
                className="input"
                value={rna}
                onChange={(e) => setRna(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="form-label">Secteur d'activité :</label>
              <select className="select" value={sector} onChange={(e) => setSector(e.target.value)}>
                <option value="Médico-social & Handicap">Médico-social & Handicap</option>
                <option value="Animation socioculturelle">Animation socioculturelle</option>
                <option value="Insertion par l activité économique (IAE)">Insertion par l activité économique</option>
                <option value="Culture & Spectacle vivant">Culture & Spectacle vivant</option>
                <option value="Sport & Loisirs">Sport & Loisirs</option>
              </select>
            </div>

            <div>
              <label className="form-label">Nombre de salariés (1 à 100) :</label>
              <input
                type="number"
                min={1}
                max={100}
                className="input"
                value={employeesCount}
                onChange={(e) => setEmployeesCount(parseInt(e.target.value) || 1)}
                required
              />
            </div>

            <div>
              <label className="form-label">Budget annuel global (€) :</label>
              <input
                type="number"
                step={5000}
                className="input"
                value={annualBudget}
                onChange={(e) => setAnnualBudget(parseInt(e.target.value) || 0)}
                required
              />
            </div>

            <div>
              <label className="form-label">Mois de l'Assemblée Générale :</label>
              <input
                type="text"
                className="input"
                value={usualAgMonth}
                onChange={(e) => setUsualAgMonth(e.target.value)}
                placeholder="Ex: Juin"
                required
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Principaux financeurs publics (séparés par des virgules) :</label>
              <input
                type="text"
                className="input"
                value={mainFunders}
                onChange={(e) => setMainFunders(e.target.value)}
                placeholder="Ex: Conseil Départemental 75, CAF, ARS"
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px' }}>
            <button onClick={() => setCurrentStep(1)} className="btn btn-secondary">
              <ArrowLeft size={16} />
              <span>Précédent</span>
            </button>
            <button onClick={() => setCurrentStep(3)} className="btn btn-primary">
              <span>Continuer : Convention collective</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Convention Collective (CCN) */}
      {currentStep === 3 && (
        <div className="card animate-fade-in" style={{ padding: 'clamp(18px, 4vw, 32px)' }}>
          <h2 style={{ fontSize: '20px', color: 'var(--color-navy)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={22} style={{ color: 'var(--color-blue)' }} />
            <span>Convention collective applicable</span>
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--color-navy-muted)', marginBottom: '24px' }}>
            L'assistant IA utilisera les textes précis de votre convention de branche pour toutes vos réponses RH (congés, grilles de classification, préavis).
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
            {ccnOptions.map((opt, idx) => (
              <label
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  border: `2px solid ${ccn === opt ? 'var(--color-blue)' : 'var(--color-border)'}`,
                  backgroundColor: ccn === opt ? 'var(--color-blue-light)' : '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <input
                  type="radio"
                  name="ccn_choice"
                  checked={ccn === opt}
                  onChange={() => setCcn(opt)}
                />
                <span style={{ fontSize: '14px', fontWeight: ccn === opt ? 700 : 500, color: 'var(--color-navy)' }}>
                  {opt}
                </span>
              </label>
            ))}
          </div>

          <div style={{ backgroundColor: 'var(--color-surface-subtle)', padding: '14px', borderRadius: '12px', fontSize: '13px', color: 'var(--color-navy)', display: 'flex', gap: '10px' }}>
            <ShieldCheck size={20} style={{ color: 'var(--color-blue)', minWidth: 20 }} />
            <span>
              La convention <strong>{ccn.split('(')[0]}</strong> sera automatiquement verrouillée dans le prompt de votre organisation.
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px', flexWrap: 'wrap', gap: '10px' }}>
            <button onClick={() => setCurrentStep(2)} className="btn btn-secondary">
              <ArrowLeft size={16} />
              <span>Précédent</span>
            </button>
            <button onClick={() => setCurrentStep(4)} className="btn btn-primary">
              <span>Continuer : Formule & Activation Stripe</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Formule & Simulation Stripe Checkout (Lot 3) */}
      {currentStep === 4 && (
        <div className="card animate-fade-in" style={{ padding: 'clamp(18px, 4vw, 32px)' }}>
          <h2 style={{ fontSize: '20px', color: 'var(--color-navy)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CreditCard size={22} style={{ color: 'var(--color-blue)' }} />
            <span>Choix de la formule & Activation Stripe</span>
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--color-navy-muted)', marginBottom: '24px' }}>
            Paiement sécurisé Stripe &bull; Sans engagement de durée &bull; Résiliable en un clic.
          </p>

          {/* Plan Picker */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '24px' }}>
            {plans.map((p) => (
              <div
                key={p.code}
                onClick={() => setSelectedPlanCode(p.code)}
                style={{
                  padding: '16px',
                  borderRadius: '14px',
                  border: `2px solid ${selectedPlanCode === p.code ? 'var(--color-blue)' : 'var(--color-border)'}`,
                  backgroundColor: selectedPlanCode === p.code ? 'var(--color-blue-light)' : '#ffffff',
                  cursor: 'pointer',
                  position: 'relative'
                }}
              >
                {p.highlighted && (
                  <span className="badge badge-blue" style={{ position: 'absolute', top: -10, right: 12, fontSize: '9px' }}>
                    CONSEILLÉE
                  </span>
                )}
                <div style={{ fontWeight: 800, fontSize: '16px', color: 'var(--color-navy)', marginBottom: '4px' }}>
                  {p.label}
                </div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-blue)', marginBottom: '8px' }}>
                  {p.priceMonthly} € <span style={{ fontSize: '12px', color: 'var(--color-navy-muted)' }}>/ mois</span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-navy-muted)' }}>
                  {p.features.expertQuestionsMonth > 0 ? (
                    <strong>{p.features.expertQuestionsMonth} question experte 48h</strong>
                  ) : (
                    <span>Sans question experte</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Stripe Card Simulator */}
          <div style={{
            border: '1.5px solid #cbd5e1',
            borderRadius: '16px',
            padding: '20px',
            backgroundColor: '#f8fafc',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-navy)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CreditCard size={16} style={{ color: 'var(--color-blue)' }} />
                <span>Paiement sécurisé par carte bancaire (Stripe Elements) :</span>
              </div>
              <span className="badge badge-navy" style={{ fontSize: '10px' }}>Mode Test Stripe</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label className="form-label" style={{ fontSize: '11px', marginBottom: '4px' }}>Titulaire de la carte :</label>
                <input
                  type="text"
                  className="input"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  placeholder="Nom Prénom"
                  style={{ backgroundColor: '#ffffff', fontSize: '13px' }}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '11px', marginBottom: '4px' }}>Numéro de carte :</label>
                <input
                  type="text"
                  className="input"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  style={{ backgroundColor: '#ffffff', fontFamily: 'monospace', fontWeight: 600, fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '11px', marginBottom: '4px' }}>Date d'expiration :</label>
                  <input
                    type="text"
                    className="input"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    placeholder="MM/AA"
                    style={{ backgroundColor: '#ffffff', fontFamily: 'monospace', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '11px', marginBottom: '4px' }}>Cryptogramme (CVC) :</label>
                  <input
                    type="text"
                    className="input"
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    placeholder="123"
                    maxLength={4}
                    style={{ backgroundColor: '#ffffff', fontFamily: 'monospace', fontSize: '13px' }}
                  />
                </div>
              </div>
            </div>

            <div style={{ marginTop: '12px', fontSize: '11px', color: 'var(--color-navy-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Lock size={12} />
              <span>Chiffrement SSL 256 bits direct vers l'infrastructure bancaire de Stripe. Sans engagement.</span>
            </div>
          </div>

          {/* Pricing & VAT Breakdown */}
          <div style={{
            backgroundColor: 'var(--color-surface-subtle)',
            borderRadius: '14px',
            padding: '16px 20px',
            marginBottom: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--color-navy-muted)' }}>
              <span>Abonnement mensuel Formule {selectedPlan.label} :</span>
              <span>{selectedPlan.priceMonthly},00 € HT</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--color-navy-muted)' }}>
              <span>TVA (20,0%) :</span>
              <span>{(selectedPlan.priceMonthly * 0.2).toFixed(2)} €</span>
            </div>
            <div style={{ height: '1px', backgroundColor: 'var(--color-border)', margin: '4px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--color-navy)' }}>
                  Total débité aujourd'hui :
                </div>
                <div style={{ fontSize: '11px', color: 'var(--color-navy-muted)' }}>
                  Prochain renouvellement automatique à J+30
                </div>
              </div>
              <span style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-blue)' }}>
                {(selectedPlan.priceMonthly * 1.2).toFixed(2)} € TTC
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button onClick={() => setCurrentStep(3)} className="btn btn-secondary" disabled={isProcessingStripe}>
              <ArrowLeft size={16} />
              <span>Précédent</span>
            </button>
            <button
              onClick={handleFinish}
              className="btn btn-lime"
              style={{ minWidth: 280, height: 48, fontSize: '14px', fontWeight: 800 }}
              disabled={isProcessingStripe}
            >
              {isProcessingStripe ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="live-dot" />
                  <span>Validation bancaire Stripe en cours...</span>
                </div>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  <span>Payer {(selectedPlan.priceMonthly * 1.2).toFixed(2)} € et Activer</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
