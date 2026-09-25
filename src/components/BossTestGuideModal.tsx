import React from 'react';
import { PersonaRole } from './PersonaSwitcher';
import { 
  CheckCircle2, 
  X, 
  ArrowRight, 
  Building2, 
  Shield, 
  Globe2, 
  HelpCircle,
  FileCheck
} from 'lucide-react';

interface BossTestGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRole: (role: PersonaRole) => void;
}

export const BossTestGuideModal: React.FC<BossTestGuideModalProps> = ({
  isOpen,
  onClose,
  onSelectRole
}) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(7, 22, 38, 0.8)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 200,
      padding: '24px'
    }}>
      <div className="card animate-fade-in" style={{
        maxWidth: 780,
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        backgroundColor: '#ffffff',
        borderRadius: '24px',
        padding: '32px',
        boxShadow: 'var(--shadow-float)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', borderBottom: '1px solid var(--color-border)', paddingBottom: '16px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--color-blue-light)', color: 'var(--color-blue)', padding: '3px 10px', borderRadius: 'var(--radius-pill)', fontSize: '11px', fontWeight: 800, marginBottom: '8px' }}>
              GUIDE DE DÉMONSTRATION & VALIDATION DU TICKET CADRE
            </div>
            <h2 style={{ fontSize: '24px', color: 'var(--color-navy)', margin: 0 }}>
              Les 3 Espaces & Scénarios de Test
            </h2>
            <p style={{ color: 'var(--color-navy-muted)', fontSize: '13px', marginTop: '4px' }}>
              Prévu pour tester immédiatement les critères d'acceptation des 6 lots avec Glenn et le Lead Dev.
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-navy-muted)', padding: '4px' }}>
            <X size={22} />
          </button>
        </div>

        {/* 3 Scenarios */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Espace 1 : Client Association */}
          <div style={{
            border: '1.5px solid var(--color-border)',
            borderRadius: '16px',
            padding: '20px',
            backgroundColor: 'var(--color-surface-hover)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: 34, height: 34, borderRadius: '8px', backgroundColor: 'var(--color-blue)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Building2 size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', color: 'var(--color-navy)' }}>Acteur 1 : L'Association Employeuse (`/app`)</h3>
                  <div style={{ fontSize: '12px', color: 'var(--color-navy-muted)' }}>Le Président, Trésorier ou Directeur salarié</div>
                </div>
              </div>
              <button
                onClick={() => {
                  onSelectRole('client_asso');
                  onClose();
                }}
                className="btn btn-sm btn-primary"
              >
                <span>Tester cet espace</span>
                <ArrowRight size={14} />
              </button>
            </div>
            <ul style={{ fontSize: '13px', color: 'var(--color-navy)', display: 'flex', flexDirection: 'column', gap: '6px', paddingLeft: '18px' }}>
              <li><strong>Test Chat IA :</strong> Poser une question sur les congés ou le préavis. Vérifier la réponse en 5 sections (Synthèse → Analyse → Références CCN → Alerte datée → Bouton escalade).</li>
              <li><strong>Test Escalade 48h :</strong> Cliquer sur « Poser à l'experte » : le ticket est prérempli, le quota est décompté et une référence <code>AE-2026-XXXXX</code> est générée.</li>
              <li><strong>Test Profil :</strong> Modifier la convention ou l'effectif : l'IA adapte immédiatement ses futures réponses.</li>
            </ul>
          </div>

          {/* Espace 2 : Admin Laetitia Badji */}
          <div style={{
            border: '1.5px solid var(--color-border)',
            borderRadius: '16px',
            padding: '20px',
            backgroundColor: 'var(--color-surface-hover)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: 34, height: 34, borderRadius: '8px', backgroundColor: 'var(--color-lime)', color: 'var(--color-navy)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Shield size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', color: 'var(--color-navy)' }}>Acteur 2 : L'Experte Laetitia Badji (`/admin` Payload CMS)</h3>
                  <div style={{ fontSize: '12px', color: 'var(--color-navy-muted)' }}>Cabinet Maé &bull; Porteuse de projet et juriste</div>
                </div>
              </div>
              <button
                onClick={() => {
                  onSelectRole('admin_laetitia');
                  onClose();
                }}
                className="btn btn-sm btn-lime"
              >
                <span>Tester cet espace</span>
                <ArrowRight size={14} />
              </button>
            </div>
            <ul style={{ fontSize: '13px', color: 'var(--color-navy)', display: 'flex', flexDirection: 'column', gap: '6px', paddingLeft: '18px' }}>
              <li><strong>Traitement des tickets :</strong> Ouvrir la file des questions des assos, rédiger la réponse experte et passer le statut à « Réponse transmise ».</li>
              <li><strong>Zéro code en dur (CDC §3) :</strong> Modifier le prix ou le quota de la formule Pro (ex: 67 € &rarr; 69 €). Constater que le tarif se met à jour instantanément sans redéploiement !</li>
              <li><strong>Télémétrie :</strong> Visualiser le tableau <code>ai_usage</code> avec tokens et coûts réels, sans aucun stockage du contenu des messages (RGPD).</li>
            </ul>
          </div>

          {/* Espace 3 : Public Vitrine */}
          <div style={{
            border: '1.5px solid var(--color-border)',
            borderRadius: '16px',
            padding: '20px',
            backgroundColor: 'var(--color-surface-hover)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: 34, height: 34, borderRadius: '8px', backgroundColor: 'var(--color-navy)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Globe2 size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', color: 'var(--color-navy)' }}>Acteur 3 : Le Prospect / Public (`/` et `/tarifs`)</h3>
                  <div style={{ fontSize: '12px', color: 'var(--color-navy-muted)' }}>Visiteur arrivant via Google SEO sur les 4 domaines</div>
                </div>
              </div>
              <button
                onClick={() => {
                  onSelectRole('public');
                  onClose();
                }}
                className="btn btn-sm btn-secondary"
              >
                <span>Voir le site public</span>
                <ArrowRight size={14} />
              </button>
            </div>
            <ul style={{ fontSize: '13px', color: 'var(--color-navy)', display: 'flex', flexDirection: 'column', gap: '6px', paddingLeft: '18px' }}>
              <li>Présentation des 4 domaines clés (RH & CCN, Gouvernance, Finance, Conformité).</li>
              <li>Inspecteur JSON-LD Schema.org (Organization, SoftwareApplication, FAQPage) conforme Lot 6.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
