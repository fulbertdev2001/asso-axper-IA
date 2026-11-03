'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import '../../../styles/app.css';

const MIN_PASSWORD_LENGTH = 8;

function PasswordResetForm() {
  const router = useRouter();
  const token = useSearchParams().get('token') || '';
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setError(`Le mot de passe doit comporter au moins ${MIN_PASSWORD_LENGTH} caractères.`);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Les deux mots de passe ne correspondent pas.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/password-reset/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Lien de réinitialisation invalide ou expiré.');
        return;
      }
      setSuccess(data.message || 'Votre mot de passe a bien été modifié.');
      setTimeout(() => router.push('/login'), 2500);
    } catch {
      setError('Impossible de joindre le serveur.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="ax-alert ax-alert-danger" role="alert">
        Lien incomplet. Refaites une demande depuis la page <Link href="/login">de connexion</Link>.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
      {error && (
        <div className="ax-alert ax-alert-danger" role="alert">
          {error}
        </div>
      )}
      {success && (
        <div className="ax-alert ax-alert-success" role="status">
          {success}
        </div>
      )}

      <div className="ax-field">
        <label className="ax-label" htmlFor="reset-password">
          Nouveau mot de passe
        </label>
        <input
          id="reset-password"
          type="password"
          className="ax-input"
          autoComplete="new-password"
          placeholder={`Minimum ${MIN_PASSWORD_LENGTH} caractères`}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
      </div>

      <div className="ax-field">
        <label className="ax-label" htmlFor="reset-password-confirm">
          Confirmer le mot de passe
        </label>
        <input
          id="reset-password-confirm"
          type="password"
          className="ax-input"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </div>

      <button type="submit" className="ax-btn ax-btn-primary" disabled={isSubmitting || Boolean(success)}>
        {isSubmitting ? 'Enregistrement…' : 'Enregistrer le nouveau mot de passe'}
      </button>
    </form>
  );
}

export default function PasswordResetPage() {
  return (
    <main className="ax" style={{ maxWidth: 440, margin: '0 auto', padding: '64px 16px' }}>
      <div className="ax-card" style={{ padding: 24 }}>
        <h1 style={{ fontSize: 24, marginBottom: 8 }}>Nouveau mot de passe</h1>
        <p style={{ fontSize: 14, color: 'var(--color-navy-muted)', marginBottom: 20 }}>
          Choisissez un nouveau mot de passe pour votre espace AssoExpert IA.
        </p>
        <Suspense fallback={null}>
          <PasswordResetForm />
        </Suspense>
      </div>
    </main>
  );
}
