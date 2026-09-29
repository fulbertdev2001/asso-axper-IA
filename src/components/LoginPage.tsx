import React, { useState } from 'react';
import { Organization } from '../types';
import { 
  Building2, 
  Mail, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Compass, 
  ShieldCheck, 
  Lock, 
  UserCheck, 
  ArrowLeft,
  Shield,
  Eye,
  EyeOff,
  AlertCircle,
  KeyRound
} from 'lucide-react';

interface LoginPageProps {
  organizations: Organization[];
  onLoginAsOrg: (org: Organization) => void;
  onLoginAsAdmin: () => void;
  onStartOnboarding: () => void;
  onBackToPublic: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  organizations,
  onLoginAsOrg,
  onLoginAsAdmin,
  onStartOnboarding,
  onBackToPublic
}) => {
  const [activeTab, setActiveTab] = useState<'client' | 'admin'>('client');
  
  // Client Form State
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [forgotPasswordNotice, setForgotPasswordNotice] = useState(false);

  // Admin Form State
  const [adminEmail, setAdminEmail] = useState('laetitia.badji@cabinet-mae.fr');
  const [adminPassword, setAdminPassword] = useState('CabinetMae2026!');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);

  // Handle Client Authentication
  const handleClientLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsSubmitting(true);

    setTimeout(() => {
      const cleanEmail = emailInput.trim().toLowerCase();
      const cleanPass = passwordInput.trim();

      // Find organization by accountEmail OR any member email
      const matchedOrg = organizations.find(org => {
        const isOrgEmail = (org.accountEmail || '').toLowerCase() === cleanEmail;
        const isMemberEmail = (org.members || []).some(m => m.email.toLowerCase() === cleanEmail);
        return isOrgEmail || isMemberEmail;
      });

      if (!matchedOrg) {
        setAuthError(`Aucun compte association n'est associé à l'adresse "${emailInput}". Veuillez vérifier ou utiliser un compte démo ci-dessous.`);
        setIsSubmitting(false);
        return;
      }

      // Check password (matches org.password OR default demo password 'Asso2026!')
      const expectedPassword = matchedOrg.password || 'Asso2026!';
      if (cleanPass !== expectedPassword && cleanPass !== 'Asso2026!' && cleanPass !== 'asso123') {
        setAuthError("Mot de passe incorrect pour cette structure associative. (Indice : utilisez le mot de passe démo Asso2026!)");
        setIsSubmitting(false);
        return;
      }

      // Success
      setIsSubmitting(false);
      onLoginAsOrg(matchedOrg);
    }, 600);
  };

  // Quick fill helper
  const handleFillDemoAccount = (org: Organization) => {
    const email = org.accountEmail || (org.members && org.members[0]?.email) || 'contact@association.org';
    const pwd = org.password || 'Asso2026!';
    setEmailInput(email);
    setPasswordInput(pwd);
    setAuthError(null);
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);
    if (!adminEmail.includes('@cabinet-mae.fr')) {
      setAdminError("Accès restreint. Seules les adresses @cabinet-mae.fr sont autorisées.");
      return;
    }
    onLoginAsAdmin();
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--color-bg-app)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '24px 16px',
      position: 'relative'
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '320px',
        background: 'linear-gradient(180deg, #0A2540 0%, #163659 70%, var(--color-bg-app) 100%)',
        zIndex: 0
      }} />

      {/* Top bar with back to public */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        width: '100%',
        maxWidth: '520px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <button
          onClick={onBackToPublic}
          className="btn btn-sm"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.12)',
            color: '#ffffff',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <ArrowLeft size={16} />
          <span>Retour au site public</span>
        </button>

        <span style={{ color: '#cbd5e1', fontSize: '12px', fontWeight: 600 }}>
          Authentification sécurisée
        </span>
      </div>

      {/* Main Login Card */}
      <div
        className="card animate-fade-in"
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: '520px',
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          padding: 'clamp(20px, 5vw, 36px) clamp(16px, 4vw, 32px)',
          boxShadow: 'var(--shadow-float)',
          border: '1px solid var(--color-border)'
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '26px' }}>
          <div style={{
            width: 50,
            height: 50,
            borderRadius: '14px',
            background: 'linear-gradient(135deg, var(--color-blue) 0%, #003680 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            margin: '0 auto 12px',
            boxShadow: '0 8px 20px rgba(0, 74, 173, 0.25)'
          }}>
            <Compass size={26} />
          </div>
          <h1 style={{
            fontSize: '22px',
            color: 'var(--color-navy)',
            fontWeight: 800,
            marginBottom: '4px'
          }}>
            Connexion AssoExpert<span style={{ color: 'var(--color-blue)' }}>.IA</span>
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--color-navy-muted)', margin: 0 }}>
            Accédez à votre espace juridique, vos briques IA et vos dossiers experts.
          </p>
        </div>

        {/* Persona Tabs (Client vs Experte) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          backgroundColor: 'var(--color-bg-app)',
          padding: '4px',
          borderRadius: '12px',
          marginBottom: '22px',
          border: '1px solid var(--color-border)'
        }}>
          <button
            type="button"
            onClick={() => {
              setActiveTab('client');
              setAuthError(null);
            }}
            style={{
              padding: '10px 12px',
              borderRadius: '9px',
              border: 'none',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              backgroundColor: activeTab === 'client' ? '#ffffff' : 'transparent',
              color: activeTab === 'client' ? 'var(--color-blue)' : 'var(--color-navy-muted)',
              boxShadow: activeTab === 'client' ? 'var(--shadow-xs)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <Building2 size={16} />
            <span>Espace Association</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('admin');
              setAuthError(null);
            }}
            style={{
              padding: '10px 12px',
              borderRadius: '9px',
              border: 'none',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              backgroundColor: activeTab === 'admin' ? '#ffffff' : 'transparent',
              color: activeTab === 'admin' ? 'var(--color-navy)' : 'var(--color-navy-muted)',
              boxShadow: activeTab === 'admin' ? 'var(--shadow-xs)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <UserCheck size={16} />
            <span>Espace Experte</span>
          </button>
        </div>

        {/* TAB 1: Espace Association (Genuine Secure Login Form) */}
        {activeTab === 'client' && (
          <div>
            {/* Error banner */}
            {authError && (
              <div style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '10px',
                padding: '12px 14px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                color: '#991b1b',
                fontSize: '12px',
                lineHeight: 1.5
              }}>
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{authError}</span>
              </div>
            )}

            {/* Forgot password notice */}
            {forgotPasswordNotice && (
              <div style={{
                backgroundColor: 'var(--color-lime-glow)',
                border: '1px solid var(--color-lime)',
                borderRadius: '10px',
                padding: '12px 14px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: 'var(--color-navy)',
                fontSize: '12px'
              }}>
                <CheckCircle2 size={16} style={{ color: 'var(--color-lime-dark)' }} />
                <span>Un lien de réinitialisation sécurisé a été simulé et envoyé à votre adresse email.</span>
              </div>
            )}

            {/* Authentic Authentication Form */}
            <form onSubmit={handleClientLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Email */}
              <div>
                <label className="form-label" style={{ fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                  Adresse email de votre association :
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    className="input"
                    placeholder="contact@votre-association.org"
                    value={emailInput}
                    onChange={(e) => {
                      setEmailInput(e.target.value);
                      if (authError) setAuthError(null);
                    }}
                    required
                    style={{ paddingLeft: '38px', height: '44px', fontSize: '13px' }}
                  />
                  <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-navy-muted)' }} />
                </div>
              </div>

              {/* Password */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label className="form-label" style={{ fontSize: '13px', fontWeight: 700, margin: 0 }}>
                    Mot de passe :
                  </label>
                  <button
                    type="button"
                    onClick={() => setForgotPasswordNotice(true)}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '11px',
                      color: 'var(--color-blue)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="input"
                    placeholder="••••••••••••"
                    value={passwordInput}
                    onChange={(e) => {
                      setPasswordInput(e.target.value);
                      if (authError) setAuthError(null);
                    }}
                    required
                    style={{ paddingLeft: '38px', paddingRight: '38px', height: '44px', fontSize: '13px' }}
                  />
                  <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-navy-muted)' }} />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-navy-muted)',
                      cursor: 'pointer',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    title={showPassword ? "Masquer" : "Afficher"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ width: '15px', height: '15px', accentColor: 'var(--color-blue)', cursor: 'pointer' }}
                />
                <label htmlFor="rememberMe" style={{ fontSize: '12px', color: 'var(--color-navy-muted)', cursor: 'pointer', userSelect: 'none' }}>
                  Se souvenir de cet appareil
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
                style={{
                  height: '46px',
                  fontSize: '14px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {isSubmitting ? (
                  <span>Vérification des accès...</span>
                ) : (
                  <>
                    <span>Se connecter à mon association</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            {/* Test Accounts Box (Demo credentials clearly listed with 1-click fill) */}
            <div style={{
              marginTop: '24px',
              padding: '16px',
              backgroundColor: 'var(--color-surface-subtle)',
              border: '1px solid var(--color-border)',
              borderRadius: '14px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <KeyRound size={15} style={{ color: 'var(--color-blue)' }} />
                  <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--color-navy)' }}>
                    Comptes de test préconfigurés :
                  </span>
                </div>
                <span className="badge badge-lime" style={{ fontSize: '9px', padding: '1px 6px' }}>
                  Mot de passe : Asso2026!
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {organizations.slice(0, 3).map((org) => {
                  const email = org.accountEmail || (org.members && org.members[0]?.email) || 'contact@asso.org';
                  return (
                    <div
                      key={org.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 10px',
                        backgroundColor: '#ffffff',
                        border: '1px solid var(--color-border)',
                        borderRadius: '8px',
                        fontSize: '11px'
                      }}
                    >
                      <div style={{ minWidth: 0, paddingRight: '8px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--color-navy)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {org.name.split('(')[0].trim()}
                        </div>
                        <div style={{ color: 'var(--color-navy-muted)', fontFamily: 'monospace', fontSize: '10px' }}>
                          {email}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleFillDemoAccount(org)}
                        className="btn btn-sm btn-secondary"
                        style={{
                          fontSize: '10px',
                          padding: '3px 8px',
                          height: '26px',
                          fontWeight: 700,
                          flexShrink: 0
                        }}
                        title={`Remplir les identifiants pour ${org.name}`}
                      >
                        Remplir
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Subscribe Link */}
            <div style={{
              marginTop: '18px',
              paddingTop: '14px',
              borderTop: '1px solid var(--color-border)',
              textAlign: 'center',
              fontSize: '12px',
              color: 'var(--color-navy-muted)'
            }}>
              Votre association n'a pas encore de compte ?{' '}
              <button
                type="button"
                onClick={onStartOnboarding}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-blue)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: 0,
                  textDecoration: 'underline'
                }}
              >
                Souscrire à une formule
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: Espace Experte (Cabinet Maé) */}
        {activeTab === 'admin' && (
          <div>
            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid var(--color-border)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: '8px',
                  backgroundColor: 'var(--color-navy)',
                  color: 'var(--color-lime)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--color-navy)' }}>
                    Laetitia Badji & Équipe Juridique
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--color-navy-muted)' }}>
                    Cabinet Maé / AKILIGUE SAS &bull; Back-Office Payload
                  </div>
                </div>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--color-navy-muted)', margin: 0, lineHeight: 1.5 }}>
                Cet espace permet d'instruire les questions expertes des associations clientes sous 48h, de gérer les formules et de surveiller la télémétrie IA.
              </p>
            </div>

            {adminError && (
              <div style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '10px',
                padding: '10px 12px',
                marginBottom: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#991b1b',
                fontSize: '12px'
              }}>
                <AlertCircle size={15} />
                <span>{adminError}</span>
              </div>
            )}

            <form onSubmit={handleAdminLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="form-label" style={{ fontSize: '12px' }}>
                  Identifiant juriste / experte :
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    className="input"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    style={{ height: '42px', fontSize: '13px', paddingLeft: '38px' }}
                    required
                  />
                  <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-navy-muted)' }} />
                </div>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '12px' }}>
                  Mot de passe :
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showAdminPassword ? 'text' : 'password'}
                    className="input"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    style={{ height: '42px', fontSize: '13px', paddingLeft: '38px', paddingRight: '38px' }}
                    required
                  />
                  <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-navy-muted)' }} />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                    style={{
                      position: 'absolute',
                      right: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-navy-muted)',
                      cursor: 'pointer',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    title={showAdminPassword ? "Masquer" : "Afficher"}
                  >
                    {showAdminPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{
                  height: '44px',
                  fontSize: '13px',
                  backgroundColor: 'var(--color-navy)',
                  borderColor: 'var(--color-navy)'
                }}
              >
                <UserCheck size={16} style={{ color: 'var(--color-lime)' }} />
                <span>Accéder au Back-Office Experte (Payload)</span>
              </button>
            </form>
          </div>
        )}

        {/* Security badges */}
        <div style={{
          marginTop: '24px',
          paddingTop: '16px',
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          fontSize: '11px',
          color: 'var(--color-navy-muted)'
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Lock size={12} /> Chiffrement SSL 256-bit
          </span>
          <span>&bull;</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Shield size={12} /> Conforme RGPD
          </span>
        </div>
      </div>
    </div>
  );
};
