'use client';
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
  Calendar,
  Search,
  ChevronDown,
  Eye,
  EyeOff,
  AlertCircle,
  Info
} from 'lucide-react';

interface SearchableComboboxProps {
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder: string;
}

const SearchableCombobox: React.FC<SearchableComboboxProps> = ({
  value,
  onChange,
  options,
  placeholder
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const filtered = options.filter((opt) =>
    opt.toLowerCase().includes(value.trim().toLowerCase())
  );

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <Search
          size={15}
          style={{
            position: 'absolute',
            left: 12,
            color: 'var(--color-navy-muted)',
            pointerEvents: 'none'
          }}
        />
        <input
          type="text"
          className="input"
          style={{ paddingLeft: 36, paddingRight: 36 }}
          placeholder={placeholder}
          value={value}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 180)}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          required
        />
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          style={{
            position: 'absolute',
            right: 10,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--color-navy-muted)',
            display: 'flex',
            alignItems: 'center'
          }}
          tabIndex={-1}
        >
          <ChevronDown size={16} />
        </button>
      </div>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            zIndex: 40,
            backgroundColor: '#ffffff',
            border: '1px solid var(--color-border)',
            borderRadius: 10,
            boxShadow: '0 10px 25px rgba(15, 23, 42, 0.12)',
            maxHeight: 220,
            overflowY: 'auto',
            padding: 4
          }}
        >
          {filtered.length > 0 ? (
            filtered.map((opt, idx) => (
              <div
                key={idx}
                onMouseDown={() => {
                  onChange(opt);
                  setIsOpen(false);
                }}
                style={{
                  padding: '9px 12px',
                  fontSize: 13,
                  borderRadius: 7,
                  cursor: 'pointer',
                  fontWeight: value === opt ? 700 : 500,
                  backgroundColor: value === opt ? 'var(--color-blue-light)' : 'transparent',
                  color: 'var(--color-navy)'
                }}
              >
                {opt}
              </div>
            ))
          ) : (
            <div style={{ padding: '10px 12px', fontSize: 12, color: 'var(--color-navy-muted)' }}>
              Saisie personnalisée conservée : <strong>« {value} »</strong>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

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

  // Form State (aucun champ prérempli)
  const [leaderName, setLeaderName] = useState('');
  const [leaderRole, setLeaderRole] = useState('');
  const [leaderEmail, setLeaderEmail] = useState('');
  const [leaderPassword, setLeaderPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [step1Error, setStep1Error] = useState<string | null>(null);

  const [orgName, setOrgName] = useState('');
  const [siren, setSiren] = useState('');
  const [rna, setRna] = useState('');
  const [sector, setSector] = useState('');
  const [employeesCount, setEmployeesCount] = useState<string>('');
  const [annualBudget, setAnnualBudget] = useState<string>('');
  const [fiscalYearEnd, setFiscalYearEnd] = useState('31 décembre');
  const [usualAgMonth, setUsualAgMonth] = useState('');
  const [mainFunders, setMainFunders] = useState('');

  const roleSuggestions = [
    'Directeur / Directrice générale',
    'Président / Présidente bénévole',
    'Trésorier / Trésorière',
    'Secrétaire général(e)',
    'Responsable RH / Coordinateur',
    'Directeur Administratif et Financier (DAF)',
    'Chef(fe) de service éducatif',
    'Administrateur / Membre du Bureau',
    'Expert-comptable / Commissaire aux comptes'
  ];

  const sectorSuggestions = [
    'Médico-social & Handicap',
    'Protection de l’enfance (MECS)',
    'Animation socioculturelle & Centre social',
    'Insertion par l’activité économique (IAE / ACI)',
    'Aide et soin à domicile (SAAD / SSIAD)',
    'Petite enfance & Crèches associatives',
    'Culture & Spectacle vivant',
    'Sport & Loisirs',
    'Éducation populaire & Jeunesse',
    'Humanitaire, Caritatif & Aide alimentaire',
    'Environnement & Transition écologique'
  ];

  const [ccn, setCcn] = useState('CCN 66 (Convention Collective Nationale de 1966)');

  const [selectedPlanCode, setSelectedPlanCode] = useState<'initiale' | 'pro' | 'expert'>('pro');
  const [isProcessingStripe, setIsProcessingStripe] = useState(false);
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');

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
        password: leaderPassword.trim(),
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
            {step1Error && (
              <div style={{
                padding: '12px 14px',
                borderRadius: 10,
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                fontSize: 13,
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                <AlertCircle size={16} />
                <span>{step1Error}</span>
              </div>
            )}

            <div>
              <label className="form-label">Nom et prénom du dirigeant / coordinateur :</label>
              <input
                type="text"
                className="input"
                placeholder="Ex: Jean Dupont"
                value={leaderName}
                onChange={(e) => setLeaderName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="form-label">
                Fonction dans l'association <span style={{ fontWeight: 400, fontSize: 12, color: 'var(--color-navy-muted)' }}>(recherchez dans la liste ou saisissez librement votre fonction)</span> :
              </label>
              <SearchableCombobox
                value={leaderRole}
                onChange={setLeaderRole}
                options={roleSuggestions}
                placeholder="Rechercher ou saisir votre fonction (ex: Président, Coordinatrice...)"
              />
            </div>

            <div>
              <label className="form-label">Adresse email professionnelle :</label>
              <input
                type="email"
                className="input"
                placeholder="direction@votre-association.org"
                value={leaderEmail}
                onChange={(e) => setLeaderEmail(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
              <div>
                <label className="form-label">Créer votre mot de passe :</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="input"
                    style={{ paddingRight: 38 }}
                    placeholder="Minimum 8 caractères"
                    value={leaderPassword}
                    onChange={(e) => setLeaderPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: 10,
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--color-navy-muted)'
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="form-label">Confirmer le mot de passe :</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input"
                  placeholder="Répétez votre mot de passe"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px' }}>
            <button
              onClick={() => {
                setStep1Error(null);
                if (!leaderName.trim() || !leaderRole.trim() || !leaderEmail.trim()) {
                  setStep1Error('Veuillez renseigner votre nom, votre fonction et votre adresse email.');
                  return;
                }
                if (leaderPassword.trim().length < 8) {
                  setStep1Error('Votre mot de passe doit contenir au moins 8 caractères.');
                  return;
                }
                if (leaderPassword !== confirmPassword) {
                  setStep1Error('Les deux mots de passe ne correspondent pas.');
                  return;
                }
                setCurrentStep(2);
              }}
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
                placeholder="Ex: Association Entraide & Solidarité"
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
                placeholder="Ex: 512 890 123"
                value={siren}
                onChange={(e) => setSiren(e.target.value)}
                required
              />
              <div style={{ fontSize: 11, color: 'var(--color-navy-muted)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Info size={12} />
                <span>Identifiant INSEE à 9 chiffres (employeur / subventions).</span>
              </div>
            </div>

            <div>
              <label className="form-label">Numéro RNA (W...) :</label>
              <input
                type="text"
                className="input"
                placeholder="Ex: W751098432"
                value={rna}
                onChange={(e) => setRna(e.target.value)}
                required
              />
              <div style={{ fontSize: 11, color: 'var(--color-navy-muted)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Info size={12} />
                <span>Répertoire National des Associations (W + 9 chiffres, Préfecture).</span>
              </div>
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">
                Secteur d'activité <span style={{ fontWeight: 400, fontSize: 12, color: 'var(--color-navy-muted)' }}>(recherchez dans la liste ou saisissez librement votre secteur)</span> :
              </label>
              <SearchableCombobox
                value={sector}
                onChange={setSector}
                options={sectorSuggestions}
                placeholder="Rechercher ou saisir votre secteur d'activité..."
              />
            </div>

            <div>
              <label className="form-label">Nombre de salariés (1 à 100) :</label>
              <input
                type="number"
                min={1}
                max={100}
                className="input"
                placeholder="Ex: 15"
                value={employeesCount}
                onChange={(e) => setEmployeesCount(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="form-label">Budget annuel global (€) :</label>
              <input
                type="number"
                step={5000}
                className="input"
                placeholder="Ex: 500000"
                value={annualBudget}
                onChange={(e) => setAnnualBudget(e.target.value)}
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
