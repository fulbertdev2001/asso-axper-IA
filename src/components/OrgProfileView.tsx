import React, { useState } from 'react';
import { m, AnimatePresence } from 'motion/react';
import { Organization, OrgMember } from '../types';
import {
  Building2,
  CheckCircle2,
  Save,
  Trash2,
  Coins,
  Users,
  Plus,
  X,
  CreditCard,
  RotateCcw
} from 'lucide-react';
import './OrgProfileView.css';

const EASE = [0.22, 1, 0.36, 1] as const;

const cardMotion = (i: number) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: EASE, delay: 0.05 + i * 0.06 }
});

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


  const maskId = (value: string) =>
    value.length > 4 ? `•••• ${value.slice(-4)}` : value;

  return (
    <div>
      {/* En-tête */}
      <m.div
        className="ax-page-head"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: EASE }}
      >
        <div>
          <h1 className="ax-page-title">Mon association</h1>
          <p className="ax-page-sub">
            Ces informations permettent de personnaliser les réponses de l'assistant et de préremplir vos questions à l'experte.
          </p>
        </div>
        <div className="ax-page-actions">
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Voulez-vous réinitialiser le formulaire avec les valeurs actuelles ?')) {
                setFormData({ ...currentOrg });
              }
            }}
            className="ax-btn ax-btn-secondary"
          >
            <RotateCcw size={16} />
            <span>Réinitialiser</span>
          </button>
          <button type="submit" form="org-profile-form" className="ax-btn ax-btn-primary">
            <Save size={16} />
            <span>Enregistrer</span>
          </button>
        </div>
      </m.div>

      <form id="org-profile-form" onSubmit={handleSubmit} className="ax-stack-lg">
        {/* Identité */}
        <m.section className="ax-card" {...cardMotion(0)}>
          <div className="ax-card-head">
            <div>
              <div className="ax-card-title op-card-title">
                <Building2 size={18} />
                <span>Identité</span>
              </div>
              <div className="ax-card-sub">Informations légales de l'association.</div>
            </div>
          </div>
          <div className="ax-card-body">
            <div className="ax-form-grid">
              <div className="ax-field ax-span-2">
                <label className="ax-label" htmlFor="op-name">Nom officiel</label>
                <input
                  id="op-name"
                  type="text"
                  className="ax-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="ax-field">
                <label className="ax-label" htmlFor="op-siren">Numéro SIREN</label>
                <input
                  id="op-siren"
                  type="text"
                  className="ax-input"
                  value={formData.siren}
                  onChange={(e) => setFormData({ ...formData, siren: e.target.value })}
                  required
                />
                <span className="ax-hint">9 chiffres</span>
              </div>

              <div className="ax-field">
                <label className="ax-label" htmlFor="op-rna">Numéro RNA</label>
                <input
                  id="op-rna"
                  type="text"
                  className="ax-input"
                  value={formData.rna}
                  onChange={(e) => setFormData({ ...formData, rna: e.target.value })}
                  required
                />
                <span className="ax-hint">W suivi de 9 chiffres</span>
              </div>

              <div className="ax-field ax-span-2">
                <label className="ax-label" htmlFor="op-sector">Secteur d'activité</label>
                <input
                  id="op-sector"
                  type="text"
                  className="ax-input"
                  value={formData.sector}
                  onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>
        </m.section>

        {/* Activité et emploi */}
        <m.section className="ax-card" {...cardMotion(1)}>
          <div className="ax-card-head">
            <div>
              <div className="ax-card-title op-card-title">
                <Users size={18} />
                <span>Activité et emploi</span>
              </div>
              <div className="ax-card-sub">Convention collective et taille de la structure.</div>
            </div>
          </div>
          <div className="ax-card-body">
            <div className="ax-form-grid">
              <div className="ax-field ax-span-2">
                <label className="ax-label" htmlFor="op-ccn">Convention collective</label>
                <select
                  id="op-ccn"
                  className="ax-select"
                  value={formData.ccn}
                  onChange={(e) => setFormData({ ...formData, ccn: e.target.value })}
                >
                  {ccnOptions.map((c, idx) => (
                    <option key={idx} value={c}>{c}</option>
                  ))}
                </select>
                <span className="ax-hint">
                  Les réponses RH s'appuient sur les grilles et articles de cette convention.
                </span>
              </div>

              <div className="ax-field">
                <label className="ax-label" htmlFor="op-employees">Nombre de salariés</label>
                <input
                  id="op-employees"
                  type="number"
                  min={1}
                  max={100}
                  className="ax-input"
                  value={formData.employeesCount}
                  onChange={(e) => setFormData({ ...formData, employeesCount: parseInt(e.target.value) || 1 })}
                  required
                />
                <span className="ax-hint">De 1 à 100</span>
              </div>

              <div className="ax-field">
                <label className="ax-label" htmlFor="op-establishments">Nombre d'établissements</label>
                <input
                  id="op-establishments"
                  type="number"
                  min={1}
                  className="ax-input"
                  value={formData.establishmentsCount}
                  onChange={(e) => setFormData({ ...formData, establishmentsCount: parseInt(e.target.value) || 1 })}
                  required
                />
              </div>
            </div>
          </div>
        </m.section>

        {/* Gouvernance et financements */}
        <m.section className="ax-card" {...cardMotion(2)}>
          <div className="ax-card-head">
            <div>
              <div className="ax-card-title op-card-title">
                <Coins size={18} />
                <span>Gouvernance et financements</span>
              </div>
              <div className="ax-card-sub">Budget, calendrier annuel et financeurs.</div>
            </div>
          </div>
          <div className="ax-card-body">
            <div className="ax-form-grid">
              <div className="ax-field">
                <label className="ax-label" htmlFor="op-budget">Budget annuel (€)</label>
                <input
                  id="op-budget"
                  type="number"
                  step={5000}
                  className="ax-input"
                  value={formData.annualBudget}
                  onChange={(e) => setFormData({ ...formData, annualBudget: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>

              <div className="ax-field">
                <label className="ax-label" htmlFor="op-fye">Clôture de l'exercice</label>
                <input
                  id="op-fye"
                  type="text"
                  className="ax-input"
                  value={formData.fiscalYearEnd}
                  onChange={(e) => setFormData({ ...formData, fiscalYearEnd: e.target.value })}
                  placeholder="Ex. : 31 décembre"
                  required
                />
              </div>

              <div className="ax-field">
                <label className="ax-label" htmlFor="op-ag">Mois habituel de l'AG</label>
                <input
                  id="op-ag"
                  type="text"
                  className="ax-input"
                  value={formData.usualAgMonth}
                  onChange={(e) => setFormData({ ...formData, usualAgMonth: e.target.value })}
                  placeholder="Ex. : juin"
                  required
                />
              </div>

              <div className="ax-field ax-span-2">
                <label className="ax-label" htmlFor="op-funders">Principaux financeurs</label>
                <input
                  id="op-funders"
                  type="text"
                  className="ax-input"
                  value={formData.mainFunders.join(', ')}
                  onChange={(e) => setFormData({
                    ...formData,
                    mainFunders: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  })}
                  placeholder="Ex. : Conseil départemental, CAF, ARS"
                />
                <span className="ax-hint">Séparez-les par des virgules.</span>
                {formData.mainFunders.length > 0 && (
                  <div className="op-funders">
                    {formData.mainFunders.map((funder, idx) => (
                      <span key={idx} className="ax-badge ax-badge-blue">{funder}</span>
                    ))}
                  </div>
                )}
              </div>

              <div className="ax-field ax-span-2">
                <label className="ax-label" htmlFor="op-governance">Gouvernance en quelques mots</label>
                <textarea
                  id="op-governance"
                  className="ax-textarea"
                  value={formData.governanceSummary}
                  onChange={(e) => setFormData({ ...formData, governanceSummary: e.target.value })}
                  rows={3}
                  placeholder="Ex. : conseil d'administration de 9 membres, bureau avec présidente et trésorier"
                />
              </div>
            </div>
          </div>
        </m.section>

        {/* Membres */}
        <m.section className="ax-card" {...cardMotion(3)}>
          <div className="ax-card-head">
            <div>
              <div className="ax-card-title op-card-title">
                <Users size={18} />
                <span>Membres</span>
                {formData.members && formData.members.length > 0 && (
                  <span className="ax-count">{formData.members.length}</span>
                )}
              </div>
              <div className="ax-card-sub">Bureau, conseil d'administration et équipe.</div>
            </div>
            {formData.members && formData.members.length > 0 && (
              <button
                type="button"
                onClick={() => setIsAddMemberModalOpen(true)}
                className="ax-btn ax-btn-secondary ax-btn-sm"
              >
                <Plus size={15} />
                <span>Ajouter</span>
              </button>
            )}
          </div>

          {(!formData.members || formData.members.length === 0) ? (
            <div className="ax-empty">
              <div className="ax-empty-icon"><Users size={22} /></div>
              <div className="ax-empty-title">Aucun membre pour le moment</div>
              <p className="ax-small" style={{ marginBottom: 16 }}>
                Ajoutez les membres du bureau et vos interlocuteurs RH.
              </p>
              <button
                type="button"
                onClick={() => setIsAddMemberModalOpen(true)}
                className="ax-btn ax-btn-primary ax-btn-sm"
              >
                <Plus size={15} />
                <span>Ajouter un membre</span>
              </button>
            </div>
          ) : (
            <ul className="op-members">
              {formData.members.map((member) => (
                <li key={member.id} className="op-member">
                  <span className="ax-avatar ax-avatar-soft" aria-hidden="true">
                    {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <div className="ax-row">
                      <span className="op-member-name">{member.firstName} {member.lastName}</span>
                      <span className="ax-badge">{member.role}</span>
                    </div>
                    <div className="op-member-meta">
                      <span>{member.email}</span>
                      {member.phone && <span>{member.phone}</span>}
                      <span>Ajouté le {member.joinedDate}</span>
                    </div>
                  </div>
                  <div className="op-member-side">
                    <span
                      className="ax-xs ax-faint ax-row"
                      style={{ gap: 4 }}
                      title={member.idCardNumber ? "Pièce d'identité renseignée" : "Pièce d'identité non renseignée"}
                    >
                      <CreditCard size={13} />
                      <span>{member.idCardNumber ? maskId(member.idCardNumber) : 'Pièce non renseignée'}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteMember(member.id)}
                      className="ax-btn ax-btn-danger ax-btn-sm"
                      title="Retirer ce membre"
                      aria-label={`Retirer ${member.firstName} ${member.lastName}`}
                    >
                      <Trash2 size={14} />
                      <span className="ax-hide-sm">Retirer</span>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </m.section>

        {/* Actions bas de page */}
        <div className="op-bottom-actions">
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Voulez-vous réinitialiser le formulaire avec les valeurs actuelles ?')) {
                setFormData({ ...currentOrg });
              }
            }}
            className="ax-btn ax-btn-ghost"
          >
            Réinitialiser
          </button>
          <button type="submit" className="ax-btn ax-btn-primary">
            <Save size={16} />
            <span>Enregistrer les modifications</span>
          </button>
        </div>
      </form>

      {/* Confirmation */}
      <AnimatePresence>
        {saveSuccess && (
          <m.div
            key="op-toast"
            className="ax-toast op-toast"
            role="status"
            style={{ x: '-50%' }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.25, ease: EASE }}
          >
            <CheckCircle2 size={18} />
            <span>Modifications enregistrées. L'assistant en tiendra compte.</span>
          </m.div>
        )}
      </AnimatePresence>

      {/* Modale nouveau membre */}
      <AnimatePresence>
        {isAddMemberModalOpen && (
          <m.div
            key="op-overlay"
            className="ax-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <m.div
              className="ax-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="op-modal-title"
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.3, ease: EASE }}
            >
              <form onSubmit={handleAddMember}>
                <div className="op-modal-head">
                  <div>
                    <h2 id="op-modal-title" className="ax-h3">Ajouter un membre</h2>
                    <div className="ax-card-sub">Bureau, conseil d'administration ou équipe salariée.</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAddMemberModalOpen(false)}
                    className="ax-btn ax-btn-ghost ax-btn-icon"
                    aria-label="Fermer"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="op-modal-body">
                  <div className="ax-form-grid">
                    <div className="ax-field">
                      <label className="ax-label" htmlFor="op-m-first">Prénom</label>
                      <input
                        id="op-m-first"
                        type="text"
                        className="ax-input"
                        placeholder="Ex. : Hélène"
                        value={newMemberFirst}
                        onChange={(e) => setNewMemberFirst(e.target.value)}
                        required
                      />
                    </div>
                    <div className="ax-field">
                      <label className="ax-label" htmlFor="op-m-last">Nom</label>
                      <input
                        id="op-m-last"
                        type="text"
                        className="ax-input"
                        placeholder="Ex. : Dubois"
                        value={newMemberLast}
                        onChange={(e) => setNewMemberLast(e.target.value)}
                        required
                      />
                    </div>

                    <div className="ax-field ax-span-2">
                      <label className="ax-label" htmlFor="op-m-role">Rôle</label>
                      <select
                        id="op-m-role"
                        className="ax-select"
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

                    <div className="ax-field">
                      <label className="ax-label" htmlFor="op-m-email">E-mail</label>
                      <input
                        id="op-m-email"
                        type="email"
                        className="ax-input"
                        placeholder="contact@asso.org"
                        value={newMemberEmail}
                        onChange={(e) => setNewMemberEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="ax-field">
                      <label className="ax-label" htmlFor="op-m-phone">
                        Téléphone <span className="ax-faint" style={{ fontWeight: 400 }}>(facultatif)</span>
                      </label>
                      <input
                        id="op-m-phone"
                        type="tel"
                        className="ax-input"
                        placeholder="06 12 34 56 78"
                        value={newMemberPhone}
                        onChange={(e) => setNewMemberPhone(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="ax-field op-id-field">
                    <label className="ax-label" htmlFor="op-m-id">
                      Pièce d'identité <span className="ax-faint" style={{ fontWeight: 400 }}>(facultatif)</span>
                    </label>
                    <input
                      id="op-m-id"
                      type="text"
                      className="ax-input"
                      placeholder="Numéro de carte d'identité ou de passeport"
                      value={newMemberIdCard}
                      onChange={(e) => setNewMemberIdCard(e.target.value)}
                    />
                    <span className="ax-hint">
                      Utile pour les formalités en préfecture (statuts, bureau) et les délégations bancaires.
                    </span>
                  </div>
                </div>

                <div className="op-modal-foot">
                  <button
                    type="button"
                    onClick={() => setIsAddMemberModalOpen(false)}
                    className="ax-btn ax-btn-secondary"
                  >
                    Annuler
                  </button>
                  <button type="submit" className="ax-btn ax-btn-primary">
                    <Plus size={16} />
                    <span>Ajouter le membre</span>
                  </button>
                </div>
              </form>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
};
