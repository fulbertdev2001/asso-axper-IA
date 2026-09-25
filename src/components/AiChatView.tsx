import React, { useState, useEffect, useRef } from 'react';
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
  Info, 
  UserCheck, 
  RefreshCw,
  Cpu,
  CornerDownLeft,
  Copy,
  Check
} from 'lucide-react';

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

  return (
    <div style={{
      maxWidth: 1400,
      margin: '0 auto',
      padding: 'var(--space-6)',
      display: 'grid',
      gridTemplateColumns: '300px 1fr',
      gap: 'var(--space-6)',
      minHeight: 'calc(100vh - 140px)'
    }}>
      {/* Sidebar Briques Thématiques */}
      <aside style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div className="card" style={{ padding: 'var(--space-4)' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 'var(--space-3)',
            paddingBottom: 'var(--space-2)',
            borderBottom: '1px solid var(--color-border)'
          }}>
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-navy-muted)', letterSpacing: '0.05em' }}>
              Briques d'expertise
            </span>
            <span className="badge badge-blue" style={{ fontSize: '10px', padding: '1px 6px' }}>
              {currentPlan.label.split(' ')[0]}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {/* Brique RH */}
            <button
              onClick={() => setSelectedDomain('rh')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                background: selectedDomain === 'rh' ? 'linear-gradient(135deg, var(--color-blue) 0%, #003680 100%)' : 'transparent',
                color: selectedDomain === 'rh' ? '#ffffff' : 'var(--color-navy)',
                boxShadow: selectedDomain === 'rh' ? '0 4px 12px rgba(0, 74, 173, 0.25)' : 'none',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Users size={18} />
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700 }}>RH & Conventions</span>
              </div>
              <span className="badge badge-lime" style={{ fontSize: '10px', padding: '1px 6px' }}>Active</span>
            </button>

            {/* Brique Gouvernance */}
            <button
              onClick={() => setSelectedDomain('gouvernance')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                background: selectedDomain === 'gouvernance' ? 'linear-gradient(135deg, var(--color-blue) 0%, #003680 100%)' : 'transparent',
                color: selectedDomain === 'gouvernance' ? '#ffffff' : 'var(--color-navy)',
                boxShadow: selectedDomain === 'gouvernance' ? '0 4px 12px rgba(0, 74, 173, 0.25)' : 'none',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Scale size={18} />
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700 }}>Gouvernance 1901</span>
              </div>
              <span className="badge badge-lime" style={{ fontSize: '10px', padding: '1px 6px' }}>Active</span>
            </button>

            {/* Brique Finance */}
            <button
              onClick={() => setSelectedDomain('finance')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                background: selectedDomain === 'finance' ? 'linear-gradient(135deg, var(--color-blue) 0%, #003680 100%)' : 'transparent',
                color: selectedDomain === 'finance' ? '#ffffff' : 'var(--color-navy)',
                boxShadow: selectedDomain === 'finance' ? '0 4px 12px rgba(0, 74, 173, 0.25)' : 'none',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FileText size={18} />
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700 }}>Finance & Subventions</span>
              </div>
              {currentPlan.features.briqueFinance ? (
                <span className="badge badge-lime" style={{ fontSize: '10px', padding: '1px 6px' }}>Active</span>
              ) : (
                <Lock size={14} style={{ color: 'var(--color-orange)' }} />
              )}
            </button>

            {/* Brique Conformité */}
            <button
              onClick={() => setSelectedDomain('conformite')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                background: selectedDomain === 'conformite' ? 'linear-gradient(135deg, var(--color-blue) 0%, #003680 100%)' : 'transparent',
                color: selectedDomain === 'conformite' ? '#ffffff' : 'var(--color-navy)',
                boxShadow: selectedDomain === 'conformite' ? '0 4px 12px rgba(0, 74, 173, 0.25)' : 'none',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldCheck size={18} />
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700 }}>Conformité DUERP</span>
              </div>
              {currentPlan.features.briqueConformite ? (
                <span className="badge badge-lime" style={{ fontSize: '10px', padding: '1px 6px' }}>Active</span>
              ) : (
                <Lock size={14} style={{ color: 'var(--color-orange)' }} />
              )}
            </button>
          </div>
        </div>

        {/* Association Context Box */}
        <div className="card" style={{ padding: 'var(--space-4)', fontSize: 'var(--text-xs)', lineHeight: 1.55 }}>
          <div style={{ fontWeight: 800, color: 'var(--color-navy)', marginBottom: 'var(--space-2)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Cpu size={14} style={{ color: 'var(--color-blue)' }} />
            <span>Profil injecté dans le prompt :</span>
          </div>
          <div style={{ color: 'var(--color-navy-muted)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div><strong>Structure :</strong> {currentOrg.name.split('(')[0]}</div>
            <div><strong>Convention :</strong> {currentOrg.ccn.split('(')[0]}</div>
            <div><strong>Effectif :</strong> {currentOrg.employeesCount} salariés</div>
            <div><strong>Budget :</strong> {currentOrg.annualBudget.toLocaleString('fr-FR')} €</div>
          </div>
          <div style={{ marginTop: 'var(--space-3)', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-2)', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-blue)', fontWeight: 600 }}>
            <span>Moteur : {currentPlan.features.aiModel}</span>
          </div>
        </div>

        {/* History actions */}
        {messages.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="btn btn-sm btn-secondary"
            style={{ width: '100%', color: 'var(--color-red)' }}
          >
            <Trash2 size={14} />
            <span>Effacer la conversation</span>
          </button>
        )}
      </aside>

      {/* Main Chat Interface */}
      <main style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Chat Header Bar */}
        <div className="card" style={{
          marginBottom: 'var(--space-4)',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-blue-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-blue)'
            }}>
              <Sparkles size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 800, color: 'var(--color-navy)', fontSize: 'var(--text-base)' }}>
                Brique : {getDomainLabel(selectedDomain)}
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-navy-muted)' }}>
                {isCurrentDomainUnlocked(selectedDomain) ? (
                  <span>Contextualisé à la convention {currentOrg.ccn.split('(')[0]} &bull; {currentPlan.features.aiModel}</span>
                ) : (
                  <span style={{ color: 'var(--color-orange-dark)', fontWeight: 600 }}>
                    Brique réservée &bull; Réponse socle active
                  </span>
                )}
              </div>
            </div>
          </div>

          {!isCurrentDomainUnlocked(selectedDomain) && (
            <button onClick={onUpgradePlan} className="btn btn-sm btn-primary">
              <Sparkles size={14} />
              <span>Débloquer avec la formule Pro</span>
            </button>
          )}
        </div>

        {/* Messages Scroll Area */}
        <div className="card" style={{
          flexGrow: 1,
          overflowY: 'auto',
          minHeight: '440px',
          maxHeight: '580px',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-6)',
          padding: 'var(--space-6)',
          backgroundColor: '#ffffff'
        }}>
          {messages.length === 0 && !isTyping && (
            <div style={{ margin: 'auto', textAlign: 'center', maxWidth: 640, padding: 'var(--space-6)' }}>
              <div style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(0, 74, 173, 0.15) 0%, rgba(193, 255, 114, 0.3) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto var(--space-4)',
                color: 'var(--color-blue)',
                boxShadow: 'var(--shadow-card)'
              }}>
                <Sparkles size={32} />
              </div>
              <h3 style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-2)' }}>
                Que souhaitez-vous vérifier pour votre association ?
              </h3>
              <p style={{ color: 'var(--color-navy-muted)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-6)', lineHeight: 1.5 }}>
                Posez votre question réglementaire ou sociale. L'assistant appliquera les règles de votre convention ({currentOrg.ccn.split('(')[0]}) et vos déclarations d'effectif.
              </p>

              {/* Suggestions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
                <span style={{ fontSize: 'var(--text-xs)', fontWeight: 800, color: 'var(--color-navy-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Questions fréquentes recommandées :
                </span>
                {suggestedPrompts[selectedDomain].map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(p)}
                    className="card card-hover"
                    style={{
                      padding: '12px 16px',
                      fontSize: '13px',
                      color: 'var(--color-navy)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: 'var(--color-surface-hover)'
                    }}
                  >
                    <span style={{ fontWeight: 500 }}>{p}</span>
                    <ArrowUpRight size={16} style={{ color: 'var(--color-blue)', minWidth: 16 }} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Rendered Messages */}
          {messages.map((m) => (
            <div key={m.id} className="animate-fade-in">
              {m.role === 'user' ? (
                <div className="chat-bubble-user">
                  <div style={{ fontSize: 'var(--text-base)', lineHeight: 1.55 }}>{m.content}</div>
                  <div style={{ fontSize: '11px', color: '#cbd5e1', textAlign: 'right', marginTop: '6px' }}>
                    {m.createdAt}
                  </div>
                </div>
              ) : (
                <div className="chat-bubble-ai">
                  {/* Assistant response header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="badge badge-lime" style={{ fontSize: '10px' }}>
                        Assistant AssoExpert
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--color-navy-muted)', fontWeight: 500 }}>
                        {m.modelUsed}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--color-navy-muted)' }}>
                        {m.createdAt} &bull; {m.tokensCount} tokens
                      </span>
                      <button
                        onClick={() => handleCopyText(m.id, `${m.structuredAnswer?.shortSummary}\n\n${m.structuredAnswer?.detailedAnalysis}`)}
                        style={{ background: 'none', color: 'var(--color-navy-muted)', padding: '2px 4px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}
                        title="Copier la réponse"
                      >
                        {copiedId === m.id ? <Check size={13} style={{ color: 'var(--color-lime-dark)' }} /> : <Copy size={13} />}
                      </button>
                    </div>
                  </div>

                  {/* 1. Synthèse directe */}
                  <div style={{
                    fontSize: 'var(--text-base)',
                    fontWeight: 600,
                    color: 'var(--color-navy)',
                    backgroundColor: 'var(--color-surface-subtle)',
                    padding: '14px 18px',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: 'var(--space-4)',
                    borderLeft: '4px solid var(--color-blue)',
                    lineHeight: 1.5
                  }}>
                    {m.structuredAnswer?.shortSummary}
                  </div>

                  {/* 2. Analyse détaillée */}
                  <div style={{
                    fontSize: 'var(--text-base)',
                    lineHeight: 1.65,
                    color: 'var(--color-navy)',
                    whiteSpace: 'pre-line',
                    marginBottom: 'var(--space-4)'
                  }}>
                    {m.structuredAnswer?.detailedAnalysis}
                  </div>

                  {/* 3. Références légales & conventionnelles (exigence stricte CDC) */}
                  {m.structuredAnswer?.references && m.structuredAnswer.references.length > 0 && (
                    <div style={{ marginTop: 'var(--space-4)', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-3)' }}>
                      <div className="ai-section-title">
                        <Info size={16} style={{ color: 'var(--color-blue)' }} />
                        <span>Références légales & conventionnelles citées</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {m.structuredAnswer.references.map((ref, idx) => (
                          <div key={idx} className="ai-legal-reference">
                            &bull; {ref}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 4. Avertissement de vérification datée */}
                  {m.structuredAnswer?.verificationNote && (
                    <div className="ai-verification-warning">
                      <AlertTriangle size={18} style={{ minWidth: 18 }} />
                      <span>{m.structuredAnswer.verificationNote}</span>
                    </div>
                  )}

                  {/* 5. Bouton obligatoire : Poser à l'experte */}
                  <div style={{
                    marginTop: 'var(--space-6)',
                    paddingTop: 'var(--space-4)',
                    borderTop: '1px solid var(--color-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-navy-muted)', fontWeight: 500 }}>
                      Situation litigieuse ou besoin d'une attestation formelle ?
                    </span>
                    <button
                      onClick={() => onEscalateToExpert(
                        m.structuredAnswer?.suggestedTicketDomain || selectedDomain,
                        m.structuredAnswer?.suggestedTicketQuestion || 'Question issue de la conversation'
                      )}
                      className="btn btn-sm btn-lime"
                      style={{ padding: '0 16px' }}
                    >
                      <UserCheck size={16} />
                      <span>Poser cette question à l'experte (Laetitia Badji)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Typing Stream Indicator */}
          {isTyping && (
            <div className="chat-bubble-ai animate-fade-in">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-2)' }}>
                <RefreshCw size={14} className="spin" style={{ color: 'var(--color-blue)' }} />
                <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-blue)' }}>
                  Génération en streaming ({currentPlan.features.aiModel})...
                </span>
              </div>
              <div style={{ fontSize: 'var(--text-base)', lineHeight: 1.55, color: 'var(--color-navy)', whiteSpace: 'pre-line' }}>
                {streamProgress}
                <span style={{ display: 'inline-block', width: 6, height: 18, backgroundColor: 'var(--color-blue)', marginLeft: 4, verticalAlign: 'middle', animation: 'pulseDot 0.8s infinite' }}></span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div style={{ marginTop: 'var(--space-4)' }}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            style={{ display: 'flex', gap: '12px', alignItems: 'center' }}
          >
            <input
              type="text"
              className="input"
              placeholder={`Interroger l'assistant en ${getDomainLabel(selectedDomain)} (${currentOrg.ccn.split('(')[0]})...`}
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              disabled={isTyping}
              style={{ height: 52 }}
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isTyping || !inputQuery.trim()}
              style={{ minWidth: 120, height: 52 }}
            >
              <span>Envoyer</span>
              <Send size={16} />
            </button>
          </form>
          <div style={{ fontSize: '11px', color: 'var(--color-navy-muted)', marginTop: '8px', textAlign: 'center' }}>
            Isolation stricte par organisation ({currentOrg.name.split('(')[0]}). Données protégées et non envoyées aux outils d'analytics.
          </div>
        </div>
      </main>
    </div>
  );
};
