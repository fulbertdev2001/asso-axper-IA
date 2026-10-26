import React, { useState, useEffect, useRef } from 'react';
import { m } from 'motion/react';
import { Domain, Organization, Plan, ChatMessage } from '../types';
import { generateAiResponse, getDomainLabel } from '../services/aiSimulator';
import {
  Users,
  Scale,
  FileText,
  ShieldCheck,
  Send,
  Sparkles,
  Lock,
  Trash2,
  ArrowUpRight,
  AlertTriangle,
  UserCheck,
  Copy,
  Check,
  LucideIcon
} from 'lucide-react';
import './AiChatView.css';

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

// Découpe l'analyse en blocs « titre + contenu » : un paragraphe dont la première ligne est
// courte et sans ponctuation finale (« Explication », « Actions recommandées »…) devient un titre.
const splitAnalysis = (text: string) =>
  text.split(/\n\s*\n/).map(par => {
    const [first, ...rest] = par.split('\n');
    const isTitle = rest.length > 0 && first.length <= 40 && !/[.:;!?)]$/.test(first.trim());
    return isTitle ? { title: first.trim(), body: rest.join('\n') } : { title: '', body: par };
  });

const DOMAIN_TABS: { key: Domain; label: string; icon: LucideIcon }[] = [
  { key: 'rh', label: 'RH et conventions', icon: Users },
  { key: 'gouvernance', label: 'Gouvernance', icon: Scale },
  { key: 'finance', label: 'Finance', icon: FileText },
  { key: 'conformite', label: 'Conformité', icon: ShieldCheck }
];

interface AiChatViewProps {
  currentOrg: Organization;
  currentPlan: Plan;
  onEscalateToExpert: (domain: Domain, question: string) => void;
  onUpgradePlan: () => void;
  onTrackUsage: (tokens: number, cost: number) => void;
}

export const AiChatView: React.FC<AiChatViewProps> = ({
  currentOrg,
  currentPlan,
  onEscalateToExpert,
  onUpgradePlan,
  onTrackUsage
}) => {
  const [selectedDomain, setSelectedDomain] = useState<Domain>('rh');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [streamProgress, setStreamProgress] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedPrompts: Record<Domain, string[]> = {
    rh: [
      `Quels sont les congés d ancienneté prévus par la convention ${currentOrg.ccn.split('(')[0]} ?`,
      `Comment calculer le préavis de rupture pour un salarié avec 3 ans d ancienneté ?`,
      `Quelles sont les obligations de maintien de salaire en cas d arrêt maladie ?`
    ],
    gouvernance: [
      `Quel est le quorum nécessaire en AG pour modifier les statuts de notre association 1901 ?`,
      `Le Président peut-il déléguer sa signature financière au Trésorier pour un acte à ${currentOrg.annualBudget > 500000 ? '50 000 €' : '10 000 €'} ?`,
      `Quelle est la responsabilité personnelle des dirigeants bénévoles en cas de déficit ?`
    ],
    finance: [
      `Comment devons-nous justifier les subventions reçues de ${currentOrg.mainFunders[0] || 'nos partenaires publics'} ?`,
      `Que faire des reliquats de subvention non consommés à la clôture du ${currentOrg.fiscalYearEnd} ?`,
      `Notre budget de ${currentOrg.annualBudget.toLocaleString('fr-FR')} € nous impose-t-il un Commissaire aux comptes ?`
    ],
    conformite: [
      `Pour un effectif de ${currentOrg.employeesCount} salariés, quelle est la fréquence obligatoire de révision du DUERP ?`,
      `Quels sont les affichages obligatoires dans nos locaux (${currentOrg.establishmentsCount} établissement(s)) ?`,
      `Comment tenir le registre RGPD pour les données des bénéficiaires et des salariés ?`
    ]
  };

  const isCurrentDomainUnlocked = (domain: Domain): boolean => {
    if (domain === 'rh') return currentPlan.features.briqueRh;
    if (domain === 'gouvernance') return currentPlan.features.briqueGouvernance;
    if (domain === 'finance') return currentPlan.features.briqueFinance;
    if (domain === 'conformite') return currentPlan.features.briqueConformite;
    return false;
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamProgress]);

  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query || isTyping) return;

    setInputQuery('');

    const userMessage: ChatMessage = {
      id: 'msg-' + Date.now(),
      domain: selectedDomain,
      role: 'user',
      content: query,
      createdAt: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    setStreamProgress('Analyse réglementaire en cours selon votre profil...');

    // Simulate modular prompt generation & streaming response
    setTimeout(() => {
      const response = generateAiResponse(query, selectedDomain, currentOrg, currentPlan.features);
      const fullText = response.shortSummary + '\n\n' + response.detailedAnalysis;
      let currentIndex = 0;

      const interval = setInterval(() => {
        currentIndex += 28;
        if (currentIndex < fullText.length) {
          setStreamProgress(fullText.substring(0, currentIndex));
        } else {
          clearInterval(interval);
          setStreamProgress('');
          setIsTyping(false);

          const estimatedTokens = Math.round(query.length / 4 + fullText.length / 4);
          const estimatedCost = (estimatedTokens / 1000) * 0.003;

          const assistantMessage: ChatMessage = {
            id: 'msg-' + (Date.now() + 1),
            domain: selectedDomain,
            role: 'assistant',
            structuredAnswer: response,
            createdAt: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            modelUsed: currentPlan.features.aiModel,
            tokensCount: estimatedTokens
          };

          setMessages(prev => [...prev, assistantMessage]);
          onTrackUsage(estimatedTokens, estimatedCost);
        }
      }, 30);
    }, 350);
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleClearHistory = () => {
    if (window.confirm('Confirmez-vous la suppression de l historique de vos conversations ? Cette action est irréversible (conformité RGPD & Lot 4).')) {
      setMessages([]);
    }
  };

  const orgShortName = currentOrg.name.split('(')[0].trim();
  const ccnShort = currentOrg.ccn.split('(')[0].trim();
  const domainUnlocked = isCurrentDomainUnlocked(selectedDomain);

  return (
    <div className="aic">
      {/* En-tête de page */}
      <div className="ax-page-head aic-head">
        <div>
          <h1 className="ax-page-title">Assistant</h1>
          <p className="ax-page-sub">
            Posez vos questions : les réponses tiennent compte de votre convention ({ccnShort}) et de votre profil.
          </p>
        </div>
        {messages.length > 0 && (
          <div className="ax-page-actions">
            <button onClick={handleClearHistory} className="ax-btn ax-btn-ghost ax-btn-sm">
              <Trash2 size={15} />
              <span>Effacer la conversation</span>
            </button>
          </div>
        )}
      </div>

      <section className="ax-card ax-chat aic-chat" aria-label="Conversation avec l'assistant">
        {/* Choix du domaine */}
        <div className="aic-chat-head">
          <div className="aic-domains">
            <div className="ax-segmented" role="tablist" aria-label="Domaine de la question">
              {DOMAIN_TABS.map(tab => {
                const Icon = tab.icon;
                const isActive = selectedDomain === tab.key;
                const unlocked = isCurrentDomainUnlocked(tab.key);
                return (
                  <button
                    key={tab.key}
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setSelectedDomain(tab.key)}
                    className={`ax-seg-btn${isActive ? ' is-active' : ''}`}
                    title={unlocked ? tab.label : `${tab.label} (non inclus dans votre formule)`}
                  >
                    <Icon size={15} />
                    <span>{tab.label}</span>
                    {!unlocked && <Lock size={12} className="aic-lock" aria-label="Non inclus" />}
                  </button>
                );
              })}
            </div>
          </div>
          <span className="ax-badge ax-hide-sm">{currentPlan.label.split(' ')[0]}</span>
        </div>

        {/* Domaine non inclus dans la formule */}
        {!domainUnlocked && (
          <div className="aic-notice">
            <span className="aic-notice-text">
              <Lock size={14} />
              <span>Le domaine « {getDomainLabel(selectedDomain)} » n'est pas inclus dans votre formule : l'assistant ne pourra pas analyser votre situation.</span>
            </span>
            <button onClick={onUpgradePlan} className="ax-btn ax-btn-secondary ax-btn-sm">
              Voir les formules
            </button>
          </div>
        )}

        {/* Conversation */}
        <div className="ax-chat-scroll" aria-live="polite">
          {messages.length === 0 && !isTyping && (
            <m.div
              className="aic-empty"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: EASE_OUT }}
            >
              <div className="aic-empty-icon"><Sparkles size={22} /></div>
              <h2 className="aic-empty-title">Que souhaitez-vous vérifier ?</h2>
              <p className="aic-empty-sub">
                Décrivez votre situation avec vos mots. Si possible, précisez le poste, les dates ou le financeur concerné : ces éléments peuvent changer la réponse.
              </p>

              <div className="aic-suggest-label">Pour commencer</div>
              <div className="aic-suggest">
                {suggestedPrompts[selectedDomain].map((p, idx) => (
                  <m.button
                    key={selectedDomain + idx}
                    onClick={() => handleSendMessage(p)}
                    className="ax-chip"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: 0.05 + idx * 0.05, ease: EASE_OUT }}
                  >
                    <span>{p}</span>
                    <ArrowUpRight size={14} />
                  </m.button>
                ))}
              </div>

              <div className="aic-context" aria-label="Profil pris en compte">
                <span className="ax-source">{orgShortName}</span>
                <span className="ax-source">{ccnShort}</span>
                <span className="ax-source">{currentOrg.employeesCount} salariés</span>
                <span className="ax-source">{currentOrg.annualBudget.toLocaleString('fr-FR')} € de budget</span>
              </div>
            </m.div>
          )}

          {messages.map((m_) => (
            <m.div
              key={m_.id}
              className={m_.role === 'user' ? 'aic-msg-user-wrap' : 'aic-msg-ai-wrap'}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, ease: EASE_OUT }}
            >
              {m_.role === 'user' ? (
                <>
                  <div className="ax-msg-user">{m_.content}</div>
                  <div className="ax-msg-meta">{m_.createdAt}</div>
                </>
              ) : (
                <article className="ax-msg-ai">
                  <div className="aic-ai-head">
                    <span className="aic-ai-name">
                      <span className="aic-ai-mark"><Sparkles size={13} /></span>
                      Assistant
                    </span>
                    <button
                      onClick={() => handleCopyText(m_.id, `${m_.structuredAnswer?.shortSummary}\n\n${m_.structuredAnswer?.detailedAnalysis}`)}
                      className="ax-btn ax-btn-ghost ax-btn-icon aic-copy"
                      title="Copier la réponse"
                      aria-label={copiedId === m_.id ? 'Réponse copiée' : 'Copier la réponse'}
                    >
                      {copiedId === m_.id ? <Check size={14} style={{ color: 'var(--color-lime-dark)' }} /> : <Copy size={14} />}
                    </button>
                  </div>

                  {/* Réponse directe */}
                  <div className="aic-section-title">Réponse directe</div>
                  <p className="aic-summary">{m_.structuredAnswer?.shortSummary}</p>

                  {/* Explication, application et actions */}
                  <div className="aic-section">
                    {splitAnalysis(m_.structuredAnswer?.detailedAnalysis || '').map((block, idx) => (
                      <div key={idx} className="aic-block">
                        {block.title && <div className="aic-block-title">{block.title}</div>}
                        <div className="aic-analysis">{block.body}</div>
                      </div>
                    ))}
                  </div>

                  {/* Sources */}
                  {m_.structuredAnswer?.references && m_.structuredAnswer.references.length > 0 && (
                    <div className="aic-section">
                      <div className="aic-section-title">Sources</div>
                      <div className="aic-sources">
                        {m_.structuredAnswer.references.map((ref, idx) => (
                          <span key={idx} className="ax-source">{ref}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Note de vérification */}
                  {m_.structuredAnswer?.verificationNote && (
                    <div className="ax-alert ax-alert-warning aic-note">
                      <AlertTriangle size={16} />
                      <span><strong>Limites et points à vérifier.</strong> {m_.structuredAnswer.verificationNote}</span>
                    </div>
                  )}

                  {/* Escalade vers l'experte */}
                  <div className="aic-escalate">
                    <span className="ax-small ax-muted">Situation à fort enjeu ? L'experte vous répond sous 48 h ouvrées.</span>
                    <button
                      onClick={() => onEscalateToExpert(
                        m_.structuredAnswer?.suggestedTicketDomain || selectedDomain,
                        m_.structuredAnswer?.suggestedTicketQuestion || 'Question issue de la conversation'
                      )}
                      className="ax-btn ax-btn-secondary ax-btn-sm"
                    >
                      <UserCheck size={15} />
                      <span>Demander à l'experte (Laetitia Badji)</span>
                    </button>
                  </div>

                  <div className="ax-msg-meta">
                    {m_.createdAt}
                  </div>
                </article>
              )}
            </m.div>
          ))}

          {/* Réponse en cours */}
          {isTyping && (
            <m.div
              className="aic-msg-ai-wrap"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, ease: EASE_OUT }}
            >
              <div className="ax-msg-ai">
                <div className="aic-stream-label">
                  <span className="ax-typing" aria-hidden="true"><span /><span /><span /></span>
                  <span>Rédaction de la réponse</span>
                </div>
                <div className="aic-stream">{streamProgress}</div>
              </div>
            </m.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Saisie */}
        <div className="ax-composer">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
          >
            <div className="ax-composer-box aic-composer-box">
              <input
                type="text"
                aria-label="Votre question"
                placeholder={`Votre question (${getDomainLabel(selectedDomain)})`}
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                disabled={isTyping}
              />
              <button
                type="submit"
                className="ax-btn ax-btn-primary ax-btn-icon"
                disabled={isTyping || !inputQuery.trim()}
                aria-label="Envoyer la question"
                title="Envoyer"
              >
                <Send size={16} />
              </button>
            </div>
          </form>
          <div className="aic-composer-foot">
            Échanges isolés à votre association ({orgShortName}), données protégées.
          </div>
        </div>
      </section>
    </div>
  );
};
