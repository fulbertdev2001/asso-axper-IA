'use client';
import React, { useState } from 'react';
import { AnimatePresence, LazyMotion, MotionConfig, domMax, m } from 'motion/react';
import { Organization } from '../types';
import {
  Scale,
  Building2,
  Mail,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Lock,
  UserCheck,
  ShieldCheck,
  Eye,
  EyeOff,
  AlertCircle,
  BookOpen,
  MessageCircle
} from 'lucide-react';
import '../styles/app.css';
import './LoginPage.css';

interface LoginPageProps {
  organizations: Organization[];
  onLoginAsOrg: (org: Organization) => void;
  onLoginAsAdmin: () => void;
  onStartOnboarding: () => void;
  onBackToPublic: () => void;
}

const EASE = [0.22, 1, 0.36, 1] as const;

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } }
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } }
};

const panelSwap = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: EASE } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.18, ease: EASE } }
};

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
  const [resetSuccessMsg, setResetSuccessMsg] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  // Admin Form State
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);

  // Mot de passe oublié : envoi d'un lien de réinitialisation à usage unique par email
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setResetSuccessMsg(null);
    const cleanEmail = emailInput.trim().toLowerCase();
    if (!cleanEmail) {
      setAuthError('Veuillez saisir votre adresse email ci-dessous pour recevoir le lien de réinitialisation.');
      return;
    }

    setIsResetting(true);
    try {
      const res = await fetch('/api/auth/password-reset/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setAuthError(data.error || 'Impossible d’envoyer le lien de réinitialisation.');
        return;
      }
      setForgotPasswordNotice(false);
      setResetSuccessMsg(
        'Si un compte correspond à cette adresse, un lien de réinitialisation (valable 30 minutes) vient de vous être envoyé par email.'
      );
    } catch {
      setAuthError('Erreur lors de la demande de réinitialisation.');
    } finally {
      setIsResetting(false);
    }
  };

  // Handle Client Authentication
  const handleClientLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setResetSuccessMsg(null);
    setIsSubmitting(true);

    const cleanEmail = emailInput.trim().toLowerCase();
    const cleanPass = passwordInput.trim();

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: cleanPass })
      });
      const data = await res.json().catch(() => ({}));

      // Find organization by accountEmail OR any member email
      const matchedOrg = organizations.find((org) => {
        const isOrgEmail = (org.accountEmail || '').toLowerCase() === cleanEmail;
        const isMemberEmail = (org.members || []).some((m) => m.email.toLowerCase() === cleanEmail);
        return isOrgEmail || isMemberEmail;
      });

      if (res.ok && data.ok) {
        setIsSubmitting(false);
        const loggedOrg = data.organization || matchedOrg;
        if (!loggedOrg) {
          setAuthError('Aucune association n’est rattachée à ce compte.');
          return;
        }
        onLoginAsOrg(loggedOrg);
        return;
      }

      // L'authentification est exclusivement vérifiée côté serveur
      setAuthError(data.error || 'Adresse email ou mot de passe incorrect.');
    } catch {
      setAuthError('Impossible de joindre le serveur d’authentification.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);
    if (!adminEmail.includes('@cabinet-mae.fr')) {
      setAdminError("Accès restreint. Seules les adresses @cabinet-mae.fr sont autorisées.");
      return;
    }
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail.trim(), password: adminPassword })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setAdminError(data.error || 'Identifiants administrateur incorrects en base de données.');
        return;
      }
      if (!data.user?.isPlatformAdmin) {
        setAdminError('Ce compte ne dispose pas des droits administrateur Cabinet Maé.');
        return;
      }
      onLoginAsAdmin();
    } catch {
      setAdminError('Impossible de vérifier les identifiants auprès de la base de données.');
    }
  };

  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domMax} strict>
        <div className="ax lg">
          {/* Panneau de marque (desktop) */}
          <aside className="lg-brand">
            <div className="lg-shapes" aria-hidden="true">
              <div className="lg-dots" />
              <m.div
                className="lg-blob lg-blob-blue"
                animate={{ x: [0, 24, -12, 0], y: [0, -18, 12, 0] }}
                transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
              />
              <m.div
                className="lg-blob lg-blob-lime"
                animate={{ x: [0, -20, 12, 0], y: [0, 16, -10, 0] }}
                transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
              />
              <m.div
                className="lg-ring"
                animate={{ rotate: 360 }}
                transition={{ duration: 120, repeat: Infinity, ease: 'linear' }}
              >
                <span className="lg-ring-dot" />
              </m.div>
            </div>

            <m.div className="lg-brand-inner" variants={stagger} initial="hidden" animate="show">
              <m.div variants={fadeUp}>
                <button type="button" className="lg-logo" onClick={onBackToPublic}>
                  <span className="lg-logo-mark"><Scale size={16} /></span>
                  <span>AssoExpert</span>
                </button>
              </m.div>

              <div className="lg-brand-body">
                <m.h2 variants={fadeUp} className="lg-brand-title">
                  Votre association, <span className="lp-serif lg-serif">l’esprit tranquille.</span>
                </m.h2>
                <m.ul variants={fadeUp} className="lg-points">
                  <li>
                    <span className="lg-point-icon"><BookOpen size={16} /></span>
                    <span>Des réponses claires, sources à l’appui.</span>
                  </li>
                  <li>
                    <span className="lg-point-icon"><MessageCircle size={16} /></span>
                    <span>L’avis de l’experte sous 48 h ouvrées.</span>
                  </li>
                  <li>
                    <span className="lg-point-icon"><ShieldCheck size={16} /></span>
                    <span>Un espace réservé à votre structure.</span>
                  </li>
                </m.ul>
              </div>

              <m.p variants={fadeUp} className="lg-brand-foot">
                RH, gouvernance, finance et conformité des associations.
              </m.p>
            </m.div>
          </aside>

          {/* Zone formulaire */}
          <main className="lg-main">
            <div className="lg-topbar">
              <button type="button" className="lg-logo lg-logo-mobile" onClick={onBackToPublic}>
                <span className="lg-logo-mark"><Scale size={16} /></span>
                <span>AssoExpert</span>
              </button>
              <button type="button" className="ax-btn ax-btn-ghost ax-btn-sm" onClick={onBackToPublic}>
                <ArrowLeft size={15} />
                <span>Retour au site</span>
              </button>
            </div>

            <m.div className="lg-form-wrap" variants={stagger} initial="hidden" animate="show">
              <m.div variants={fadeUp} className="lg-head">
                <h1 className="lg-title">Connexion</h1>
                <p className="lg-sub">Accédez à votre espace AssoExpert.</p>
              </m.div>

              {/* Onglets Association / Experte */}
              <m.div variants={fadeUp}>
                <div className="ax-segmented lg-tabs" role="tablist" aria-label="Type d’espace">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === 'client'}
                    className={`ax-seg-btn lg-tab${activeTab === 'client' ? ' is-on' : ''}`}
                    onClick={() => {
                      setActiveTab('client');
                      setAuthError(null);
                    }}
                  >
                    {activeTab === 'client' && (
                      <m.span layoutId="lg-tab-pill" className="lg-tab-pill" transition={{ type: 'spring', stiffness: 420, damping: 36 }} />
                    )}
                    <Building2 size={15} />
                    <span>Espace association</span>
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === 'admin'}
                    className={`ax-seg-btn lg-tab${activeTab === 'admin' ? ' is-on' : ''}`}
                    onClick={() => {
                      setActiveTab('admin');
                      setAuthError(null);
                    }}
                  >
                    {activeTab === 'admin' && (
                      <m.span layoutId="lg-tab-pill" className="lg-tab-pill" transition={{ type: 'spring', stiffness: 420, damping: 36 }} />
                    )}
                    <UserCheck size={15} />
                    <span>Espace experte</span>
                  </button>
                </div>
              </m.div>

              <m.div variants={fadeUp} className="lg-panel">
                <AnimatePresence mode="wait" initial={false}>
                  {/* Onglet 1 : Espace association */}
                  {activeTab === 'client' && (
                    <m.div key="client" variants={panelSwap} initial="initial" animate="animate" exit="exit">
                      {authError && (
                        <div className="ax-alert ax-alert-danger lg-alert" role="alert">
                          <AlertCircle size={16} />
                          <span>{authError}</span>
                        </div>
                      )}

                      {resetSuccessMsg && (
                        <div className="ax-alert ax-alert-success lg-alert" role="status">
                          <CheckCircle2 size={16} />
                          <span>{resetSuccessMsg}</span>
                        </div>
                      )}

                      {forgotPasswordNotice && (
                        <div className="ax-card" style={{ padding: 14, marginBottom: 16, border: '1px solid var(--color-border)' }}>
                          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6, color: 'var(--color-navy)' }}>
                            Réinitialiser votre mot de passe
                          </div>
                          <p style={{ fontSize: 12, color: 'var(--color-navy-muted)', marginBottom: 10 }}>
                            Saisissez votre adresse email ci-dessous : nous vous enverrons un lien sécurisé pour définir un nouveau mot de passe.
                          </p>
                          <button
                            type="button"
                            className="ax-btn ax-btn-primary ax-btn-sm"
                            onClick={handleResetPassword}
                            disabled={isResetting}
                          >
                            {isResetting ? 'Envoi…' : 'Recevoir le lien par email'}
                          </button>
                        </div>
                      )}

                      <form onSubmit={handleClientLogin} className="lg-form">
                        <div className="ax-field">
                          <label className="ax-label" htmlFor="lg-email">Adresse email</label>
                          <div className="ax-input-wrap">
                            <Mail size={16} />
                            <input
                              id="lg-email"
                              type="email"
                              className="ax-input"
                              placeholder="contact@votre-association.org"
                              autoComplete="email"
                              value={emailInput}
                              onChange={(e) => {
                                setEmailInput(e.target.value);
                                if (authError) setAuthError(null);
                              }}
                              required
                            />
                          </div>
                        </div>

                        <div className="ax-field">
                          <div className="lg-label-row">
                            <label className="ax-label" htmlFor="lg-password">Mot de passe</label>
                            <button
                              type="button"
                              className="lg-link lg-link-sm"
                              onClick={() => setForgotPasswordNotice(true)}
                            >
                              Mot de passe oublié ?
                            </button>
                          </div>
                          <div className="ax-input-wrap">
                            <Lock size={16} />
                            <input
                              id="lg-password"
                              type={showPassword ? 'text' : 'password'}
                              className="ax-input lg-input-pass"
                              placeholder="Votre mot de passe"
                              autoComplete="current-password"
                              value={passwordInput}
                              onChange={(e) => {
                                setPasswordInput(e.target.value);
                                if (authError) setAuthError(null);
                              }}
                              required
                            />
                            <button
                              type="button"
                              className="ax-input-action"
                              onClick={() => setShowPassword(!showPassword)}
                              aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                              title={showPassword ? 'Masquer' : 'Afficher'}
                            >
                              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                        </div>

                        <label className="lg-check" htmlFor="rememberMe">
                          <input
                            type="checkbox"
                            id="rememberMe"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                          />
                          <span>Se souvenir de cet appareil</span>
                        </label>

                        <button
                          type="submit"
                          className="ax-btn ax-btn-primary ax-btn-lg ax-btn-block lg-submit"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <span className="lg-spinner" aria-hidden="true" />
                              <span>Vérification…</span>
                            </>
                          ) : (
                            <>
                              <span>Se connecter</span>
                              <ArrowRight size={16} />
                            </>
                          )}
                        </button>
                      </form>

                      <p className="lg-foot">
                        Pas encore de compte ?{' '}
                        <button type="button" className="lg-link" onClick={onStartOnboarding}>
                          Créer l’espace de votre association
                        </button>
                      </p>
                    </m.div>
                  )}

                  {/* Onglet 2 : Espace experte */}
                  {activeTab === 'admin' && (
                    <m.div key="admin" variants={panelSwap} initial="initial" animate="animate" exit="exit">
                      <div className="ax-alert ax-alert-info lg-alert">
                        <ShieldCheck size={16} />
                        <span>Réservé à l’équipe du Cabinet Maé. Connectez-vous avec votre adresse @cabinet-mae.fr.</span>
                      </div>

                      {adminError && (
                        <div className="ax-alert ax-alert-danger lg-alert" role="alert">
                          <AlertCircle size={16} />
                          <span>{adminError}</span>
                        </div>
                      )}

                      <form onSubmit={handleAdminLogin} className="lg-form">
                        <div className="ax-field">
                          <label className="ax-label" htmlFor="lg-admin-email">Adresse email professionnelle</label>
                          <div className="ax-input-wrap">
                            <Mail size={16} />
                            <input
                              id="lg-admin-email"
                              type="email"
                              className="ax-input"
                              placeholder="prenom.nom@cabinet-mae.fr"
                              autoComplete="email"
                              value={adminEmail}
                              onChange={(e) => setAdminEmail(e.target.value)}
                              required
                            />
                          </div>
                        </div>

                        <div className="ax-field">
                          <label className="ax-label" htmlFor="lg-admin-password">Mot de passe</label>
                          <div className="ax-input-wrap">
                            <Lock size={16} />
                            <input
                              id="lg-admin-password"
                              type={showAdminPassword ? 'text' : 'password'}
                              className="ax-input lg-input-pass"
                              placeholder="Votre mot de passe"
                              autoComplete="current-password"
                              value={adminPassword}
                              onChange={(e) => setAdminPassword(e.target.value)}
                              required
                            />
                            <button
                              type="button"
                              className="ax-input-action"
                              onClick={() => setShowAdminPassword(!showAdminPassword)}
                              aria-label={showAdminPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                              title={showAdminPassword ? 'Masquer' : 'Afficher'}
                            >
                              {showAdminPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                        </div>

                        <button type="submit" className="ax-btn ax-btn-primary ax-btn-lg ax-btn-block lg-submit lg-submit-navy">
                          <span>Accéder à l’espace experte</span>
                          <ArrowRight size={16} />
                        </button>
                      </form>
                    </m.div>
                  )}
                </AnimatePresence>
              </m.div>

            </m.div>
          </main>
        </div>
      </LazyMotion>
    </MotionConfig>
  );
};
