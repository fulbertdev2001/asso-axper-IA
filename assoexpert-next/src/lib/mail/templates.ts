/**
 * §4 — Templates d'emails transactionnels versionnés dans le repo.
 * Toute donnée variable est échappée avant insertion dans le HTML (anti-injection HTML / phishing).
 */

import { SendMailInput } from './index';

export const MAIL_TEMPLATES_VERSION = '2026.11.v1';

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function multiline(value: string): string {
  return escapeHtml(value).replace(/\r?\n/g, '<br/>');
}

const SIGNATURE = 'Cabinet Maé — AssoExpert IA';

export function magicLinkEmail(to: string, verifyUrl: string): SendMailInput {
  return {
    to,
    subject: 'Votre lien de connexion sécurisé — AssoExpert IA',
    text: `Bonjour,\n\nCliquez sur ce lien valable 15 minutes pour vous connecter à votre espace AssoExpert IA :\n${verifyUrl}\n\nSi vous n'êtes pas à l'origine de cette demande, ignorez cet email.\n\n${SIGNATURE}`,
    html: `<p>Bonjour,</p><p>Cliquez sur le lien ci-dessous (valable 15 minutes) pour accéder à votre espace <strong>AssoExpert IA</strong> :</p><p><a href="${escapeHtml(verifyUrl)}">Se connecter à AssoExpert IA</a></p><p>Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>`
  };
}

export function passwordResetEmail(to: string, resetUrl: string): SendMailInput {
  return {
    to,
    subject: 'Réinitialisation de votre mot de passe — AssoExpert IA',
    text: `Bonjour,\n\nPour définir un nouveau mot de passe, ouvrez ce lien valable 30 minutes :\n${resetUrl}\n\nSi vous n'êtes pas à l'origine de cette demande, ignorez cet email : votre mot de passe actuel reste inchangé.\n\n${SIGNATURE}`,
    html: `<p>Bonjour,</p><p>Pour définir un nouveau mot de passe, cliquez sur le lien ci-dessous (valable 30 minutes) :</p><p><a href="${escapeHtml(resetUrl)}">Réinitialiser mon mot de passe</a></p><p>Si vous n'êtes pas à l'origine de cette demande, ignorez cet email : votre mot de passe actuel reste inchangé.</p>`
  };
}

export function expertTicketNotificationEmail(params: {
  to: string;
  ref: string;
  orgName: string;
  authorEmail: string;
  domain: string;
  urgency: string;
  subject: string;
  question: string;
}): SendMailInput {
  const { ref, orgName, authorEmail, domain, urgency, subject, question } = params;
  return {
    to: params.to,
    replyTo: authorEmail,
    subject: `[${ref}] Nouvelle question experte — ${domain.toUpperCase()} (${urgency})`,
    text: `Une nouvelle question a été posée par ${authorEmail} pour l'organisation ${orgName}.\n\nObjet : ${subject}\n\nQuestion :\n${question}`,
    html: `<h3>Nouvelle question experte AssoExpert</h3><p><strong>Réf :</strong> ${escapeHtml(ref)}</p><p><strong>Organisation :</strong> ${escapeHtml(orgName)}</p><p><strong>Auteur :</strong> ${escapeHtml(authorEmail)}</p><p><strong>Domaine :</strong> ${escapeHtml(domain)}</p><p><strong>Urgence :</strong> ${escapeHtml(urgency)}</p><p><strong>Objet :</strong> ${escapeHtml(subject)}</p><hr/><p>${multiline(question)}</p>`
  };
}

export function expertTicketAckEmail(to: string, ref: string): SendMailInput {
  return {
    to,
    subject: `[${ref}] Confirmation de votre question à l'experte — AssoExpert IA`,
    text: `Bonjour,\n\nVotre question a bien été transmise à Laetitia Badji (Cabinet Maé). Référence : ${ref}.\nUne réponse écrite et vérifiée vous sera apportée sous 48h ouvrées.\n\n${SIGNATURE}`,
    html: `<p>Bonjour,</p><p>Votre question a bien été transmise à <strong>Laetitia Badji (Cabinet Maé)</strong>.</p><p><strong>Référence :</strong> ${escapeHtml(ref)}</p><p>Une réponse écrite vous sera apportée sous 48h ouvrées.</p>`
  };
}

export function expertTicketAnsweredEmail(to: string, ref: string, answer: string): SendMailInput {
  return {
    to,
    subject: `[${ref}] Réponse de l'experte à votre question — AssoExpert IA`,
    text: `Bonjour,\n\nLaetitia Badji a apporté une réponse à votre question (${ref}) :\n\n${answer}\n\n${SIGNATURE}`,
    html: `<p>Bonjour,</p><p>Laetitia Badji a répondu à votre question (<strong>${escapeHtml(ref)}</strong>) :</p><div style="background:#f4f4f5;padding:12px;border-radius:6px;"><p>${multiline(answer)}</p></div>`
  };
}
