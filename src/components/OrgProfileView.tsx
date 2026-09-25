import React, { useState } from 'react';
import { Organization } from '../types';
import { 
  Building2, 
  CheckCircle2, 
  Save, 
  Trash2, 
  Info, 
  ShieldCheck, 
  Calendar, 
  Coins, 
  Users, 
  Landmark 
} from 'lucide-react';

interface OrgProfileViewProps {
  currentOrg: Organization;
  onUpdateOrg: (updatedOrg: Organization) => void;
}

export const OrgProfileView: React.FC<OrgProfileViewProps> = ({
  currentOrg,
  onUpdateOrg
}) => {
  const [formData, setFormData] = useState<Organization>({ ...currentOrg });
  const [saveSuccess, setSaveSuccess] = useState(false);

  const ccnOptions = [
    'CCN 66 (Convention Collective Nationale de 1966)',
    'CCN 51 (FEHAP - Établissements privés d hospitalisation et de soins)',
    'Convention collective ÉCLAT (ex-Animation)',
    'ALISFA (Acteurs du lien social et familial)',
    'CCN de la Branche de l aide, de l accompagnement et des soins à domicile (BAD)',
    'CCN du Sport (IDCC 2511)',
    'Autre convention ou convention spécifique'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateOrg(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4000);
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: 1000, margin: '0 auto', padding: 'var(--space-6)' }}>
      {/* Header */}
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: 'var(--space-2)' }}>
          <span className="badge badge-blue">Lot 2 — Multi-tenant & Profil</span>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-navy-muted)' }}>
            Isolation stricte par organization_id
          </span>
        </div>
        <h1 style={{ fontSize: 'var(--text-3xl)', color: 'var(--color-navy)', marginBottom: 'var(--space-2)' }}>
          Profil de l'association employeuse
        </h1>
        <p style={{ color: 'var(--color-navy-muted)', fontSize: 'var(--text-base)' }}>
          Ces informations alimentent automatiquement le prompt de l'assistant IA et le préremplissage des questions expertes adressées à Laetitia Badji.
        </p>
      </div>

      {saveSuccess && (
        <div className="card animate-fade-in" style={{
          backgroundColor: 'var(--color-lime-glow)',
          borderColor: 'var(--color-lime)',
          marginBottom: 'var(--space-6)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <CheckCircle2 size={24} style={{ color: 'var(--color-lime-dark)' }} />
          <div>
            <div style={{ fontWeight: 700, color: 'var(--color-navy)' }}>
              Profil mis à jour avec succès !
            </div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-navy-muted)' }}>
              Les nouvelles données sont désormais immédiatement appliquées à vos futures requêtes IA.
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        {/* Identité Légale */}
        <div className="card">
          <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building2 size={20} style={{ color: 'var(--color-blue)' }} />
            <span>Identité légale et déclarative</span>
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
            <div>
              <label className="form-label">Nom officiel de l'association :</label>
              <input
                type="text"
                className="input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="form-label">Numéro SIREN (9 chiffres) :</label>
              <input
                type="text"
                className="input"
                value={formData.siren}
                onChange={(e) => setFormData({ ...formData, siren: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="form-label">Numéro RNA (W + 9 chiffres) :</label>
              <input
                type="text"
                className="input"
                value={formData.rna}
                onChange={(e) => setFormData({ ...formData, rna: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="form-label">Secteur d'activité principal :</label>
              <input
                type="text"
                className="input"
                value={formData.sector}
                onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                required
              />
            </div>
          </div>
        </div>

        {/* Cadre Social & RH */}
        <div className="card">
          <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={20} style={{ color: 'var(--color-blue)' }} />
            <span>Cadre social et convention collective</span>
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Convention collective applicable :</label>
              <select
                className="select"
                value={formData.ccn}
                onChange={(e) => setFormData({ ...formData, ccn: e.target.value })}
              >
                {ccnOptions.map((c, idx) => (
                  <option key={idx} value={c}>{c}</option>
                ))}
              </select>
              <div className="form-hint">
                L'IA utilisera exclusivement les grilles et articles de cette convention pour vos réponses RH.
              </div>
            </div>

            <div>
              <label className="form-label">Nombre de salariés (1 à 100) :</label>
              <input
                type="number"
                min={1}
                max={100}
                className="input"
                value={formData.employeesCount}
                onChange={(e) => setFormData({ ...formData, employeesCount: parseInt(e.target.value) || 1 })}
                required
              />
            </div>

            <div>
              <label className="form-label">Nombre d'établissements gérés :</label>
              <input
                type="number"
                min={1}
                className="input"
                value={formData.establishmentsCount}
                onChange={(e) => setFormData({ ...formData, establishmentsCount: parseInt(e.target.value) || 1 })}
                required
              />
            </div>
          </div>
        </div>

        {/* Cadre Financier & Gouvernance */}
        <div className="card">
          <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Coins size={20} style={{ color: 'var(--color-blue)' }} />
            <span>Finances, calendrier et gouvernance</span>
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
            <div>
              <label className="form-label">Budget annuel global (€) :</label>
              <input
                type="number"
                step={5000}
                className="input"
                value={formData.annualBudget}
                onChange={(e) => setFormData({ ...formData, annualBudget: parseInt(e.target.value) || 0 })}
                required
              />
            </div>

            <div>
              <label className="form-label">Date de clôture d'exercice :</label>
              <input
                type="text"
                className="input"
                value={formData.fiscalYearEnd}
                onChange={(e) => setFormData({ ...formData, fiscalYearEnd: e.target.value })}
                placeholder="Ex: 31 décembre"
                required
              />
            </div>

            <div>
              <label className="form-label">Mois habituel de l'AG d'approbation :</label>
              <input
                type="text"
                className="input"
                value={formData.usualAgMonth}
                onChange={(e) => setFormData({ ...formData, usualAgMonth: e.target.value })}
                placeholder="Ex: Juin"
                required
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Principaux financeurs publics (séparés par des virgules) :</label>
              <input
                type="text"
                className="input"
                value={formData.mainFunders.join(', ')}
                onChange={(e) => setFormData({
                  ...formData,
                  mainFunders: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                })}
                placeholder="Ex: Conseil Départemental 75, CAF, ARS"
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Description synthétique de la gouvernance :</label>
              <textarea
                className="textarea"
                value={formData.governanceSummary}
                onChange={(e) => setFormData({ ...formData, governanceSummary: e.target.value })}
                rows={3}
                placeholder="Ex: Conseil d'administration de 9 membres, bureau exécutif avec Présidente et Trésorier..."
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <button type="submit" className="btn btn-primary" style={{ minWidth: 200 }}>
            <Save size={18} />
            <span>Enregistrer les modifications</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (window.confirm('Voulez-vous réinitialiser le formulaire avec les valeurs actuelles ?')) {
                setFormData({ ...currentOrg });
              }
            }}
            className="btn btn-secondary"
          >
            Réinitialiser
          </button>
        </div>
      </form>
    </div>
  );
};
