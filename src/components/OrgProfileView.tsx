import React, { useState } from 'react';
import { Organization, OrgMember } from '../types';
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
  Landmark,
  Plus,
  X,
  CreditCard,
  UserCheck
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
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);

  // New Member Form State
  const [newMemberFirst, setNewMemberFirst] = useState('');
  const [newMemberLast, setNewMemberLast] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('Présidente / Président');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberPhone, setNewMemberPhone] = useState('');
  const [newMemberIdCard, setNewMemberIdCard] = useState(''); // Champ optionnel CNI

  const ccnOptions = [
    'CCN 66 (Convention Collective Nationale de 1966)',
    'CCN 51 (FEHAP - Établissements privés d hospitalisation et de soins)',
    'Convention collective ÉCLAT (ex-Animation)',
    'ALISFA (Acteurs du lien social et familial)',
    'CCN de la Branche de l aide, de l accompagnement et des soins à domicile (BAD)',
    'CCN du Sport (IDCC 2511)',
    'Autre convention ou convention spécifique'
  ];

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberFirst.trim() || !newMemberLast.trim() || !newMemberEmail.trim()) return;

    const newMember: OrgMember = {
      id: 'mem-' + Date.now(),
      firstName: newMemberFirst.trim(),
      lastName: newMemberLast.trim(),
      role: newMemberRole,
      email: newMemberEmail.trim(),
      phone: newMemberPhone.trim() || undefined,
      idCardNumber: newMemberIdCard.trim() || undefined,
      joinedDate: new Date().toLocaleDateString('fr-FR')
    };

    const updatedMembers = [...(formData.members || []), newMember];
    const updated = {
      ...formData,
      members: updatedMembers
    };
    setFormData(updated);
    onUpdateOrg(updated);

    // Reset and close
    setNewMemberFirst('');
    setNewMemberLast('');
    setNewMemberEmail('');
    setNewMemberPhone('');
    setNewMemberIdCard('');
    setIsAddMemberModalOpen(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleDeleteMember = (memberId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir retirer ce membre ?')) return;
    const updatedMembers = (formData.members || []).filter(m => m.id !== memberId);
    const updated = {
      ...formData,
      members: updatedMembers
    };
    setFormData(updated);
    onUpdateOrg(updated);
  };

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

        {/* Membres & Gouvernance (Bureau, CA, Salariés) */}
        <div className="card">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 'var(--space-4)',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div>
              <h2 style={{ fontSize: 'var(--text-xl)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <Users size={20} style={{ color: 'var(--color-blue)' }} />
                <span>Membres du bureau, gouvernance & équipe</span>
              </h2>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-navy-muted)', margin: 0 }}>
                Habilitations déclaratives, signataires légaux et correspondants RH de l'association.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsAddMemberModalOpen(true)}
              className="btn btn-sm btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={16} />
              <span>Nouveau membre</span>
            </button>
          </div>

          {/* Members List */}
          {(!formData.members || formData.members.length === 0) ? (
            <div style={{
              textAlign: 'center',
              padding: '32px 16px',
              backgroundColor: 'var(--color-bg-app)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-navy-muted)'
            }}>
              <Users size={32} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
              <p style={{ fontSize: 'var(--text-sm)', marginBottom: '12px' }}>
                Aucun membre déclaré pour le moment dans le bureau.
              </p>
              <button
                type="button"
                onClick={() => setIsAddMemberModalOpen(true)}
                className="btn btn-sm btn-outline-blue"
              >
                + Ajouter le premier membre
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {formData.members.map((member) => (
                <div
                  key={member.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: '#ffffff',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: 'var(--radius-pill)',
                      backgroundColor: 'var(--color-blue-light)',
                      color: 'var(--color-blue)',
                      fontWeight: 800,
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--color-navy)' }}>
                          {member.firstName} {member.lastName}
                        </span>
                        <span className="badge badge-blue" style={{ fontSize: '10px' }}>
                          {member.role}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--color-navy-muted)', display: 'flex', alignItems: 'center', gap: '10px', marginTop: '2px', flexWrap: 'wrap' }}>
                        <span>{member.email}</span>
                        {member.phone && <span>&bull; {member.phone}</span>}
                        <span>&bull; Ajouté le {member.joinedDate}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    {/* CNI Optional badge */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-pill)',
                      fontSize: '11px',
                      backgroundColor: member.idCardNumber ? 'var(--color-lime-glow)' : 'var(--color-bg-app)',
                      border: `1px solid ${member.idCardNumber ? 'var(--color-lime)' : 'var(--color-border)'}`,
                      color: member.idCardNumber ? 'var(--color-navy)' : 'var(--color-navy-muted)'
                    }}>
                      <CreditCard size={12} style={{ color: member.idCardNumber ? 'var(--color-lime-dark)' : 'var(--color-navy-muted)' }} />
                      <span>
                        {member.idCardNumber ? `CNI : ${member.idCardNumber}` : 'CNI non renseignée'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteMember(member.id)}
                      className="btn btn-sm"
                      style={{
                        padding: '6px',
                        color: 'var(--color-red)',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                      title="Supprimer ce membre"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
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

      {/* Modal Nouveau Membre */}
      {isAddMemberModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(10, 37, 64, 0.6)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 150,
          padding: '20px'
        }}>
          <div
            className="card animate-fade-in"
            style={{
              maxWidth: 540,
              width: '100%',
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              padding: '28px',
              boxShadow: 'var(--shadow-float)'
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
              paddingBottom: '14px',
              borderBottom: '1px solid var(--color-border)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: '10px',
                  backgroundColor: 'var(--color-blue-light)',
                  color: 'var(--color-blue)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <UserCheck size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-navy)', margin: 0 }}>
                    Ajouter un nouveau membre
                  </h3>
                  <div style={{ fontSize: '12px', color: 'var(--color-navy-muted)' }}>
                    Bureau, Conseil d'Administration ou équipe salariée
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAddMemberModalOpen(false)}
                className="btn btn-sm"
                style={{ padding: '6px', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddMember} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label">Prénom * :</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Ex: Hélène"
                    value={newMemberFirst}
                    onChange={(e) => setNewMemberFirst(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Nom * :</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Ex: Dubois"
                    value={newMemberLast}
                    onChange={(e) => setNewMemberLast(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Rôle / Fonction dans l'association * :</label>
                <select
                  className="select"
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value)}
                  required
                >
                  <option value="Présidente / Président">Présidente / Président</option>
                  <option value="Vice-Présidente / Vice-Président">Vice-Présidente / Vice-Président</option>
                  <option value="Trésorière / Trésorier">Trésorière / Trésorier</option>
                  <option value="Secrétaire générale / Secrétaire général">Secrétaire générale / Secrétaire général</option>
                  <option value="Membre du Conseil d'Administration">Membre du Conseil d'Administration</option>
                  <option value="Directrice générale salariée / Directeur">Directrice générale salariée / Directeur</option>
                  <option value="Responsable RH / Paie">Responsable RH / Paie</option>
                  <option value="Salarié(e)">Salarié(e)</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label">Email professionnel * :</label>
                  <input
                    type="email"
                    className="input"
                    placeholder="contact@asso.org"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Téléphone (Optionnel) :</label>
                  <input
                    type="tel"
                    className="input"
                    placeholder="06 12 34 56 78"
                    value={newMemberPhone}
                    onChange={(e) => setNewMemberPhone(e.target.value)}
                  />
                </div>
              </div>

              {/* Champ optionnel CNI exigé par l'utilisateur */}
              <div style={{
                backgroundColor: 'var(--color-bg-app)',
                padding: '14px',
                borderRadius: '12px',
                border: '1.5px dashed var(--color-border)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label className="form-label" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CreditCard size={15} style={{ color: 'var(--color-blue)' }} />
                    <span>Numéro de carte d'identité ou passeport :</span>
                  </label>
                  <span className="badge badge-blue" style={{ fontSize: '10px' }}>
                    Optionnel
                  </span>
                </div>
                <input
                  type="text"
                  className="input"
                  placeholder="Ex: 240875102934 ou 19AB12345"
                  value={newMemberIdCard}
                  onChange={(e) => setNewMemberIdCard(e.target.value)}
                  style={{ backgroundColor: '#ffffff' }}
                />
                <div className="form-hint" style={{ marginTop: '4px', fontSize: '11px' }}>
                  Facultatif. Utile pour les formalités officielles en préfecture (modification des statuts/bureau) et les délégations bancaires.
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsAddMemberModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  <Plus size={16} />
                  <span>Enregistrer le membre</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
