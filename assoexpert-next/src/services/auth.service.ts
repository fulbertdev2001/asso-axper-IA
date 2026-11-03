/**
 * Service d'authentification et de gestion de session (Couche Métier).
 * Design Pattern : Dependency Injection & Clean Architecture.
 * - Ne dépend d'aucun framework HTTP ni de Drizzle directement (uniquement des ports).
 * - Le jeton brut est transmis au client ; seule son empreinte SHA-256 est persistée
 *   (sessions, magic links et jetons de réinitialisation).
 * - Empêche l'usurpation de tenant : l'organisation d'une session est toujours déduite
 *   des memberships en base, jamais d'une donnée fournie par le client.
 * - Les URLs envoyées par email sont construites depuis l'URL publique configurée
 *   (jamais depuis l'en-tête Host de la requête).
 */

import crypto from 'crypto';
import { User, AuthContext } from '../domain/models';
import { RateLimitedError, UnauthorizedError, ValidationError } from '../domain/errors';
import {
  IUserRepository,
  ISessionRepository,
  IMembershipRepository,
  IVerificationTokenRepository
} from '../repositories/interfaces';
import { MailProvider } from '../lib/mail';
import { magicLinkEmail, passwordResetEmail } from '../lib/mail/templates';
import { PasswordHasher } from '../lib/auth/password';
import { RateLimiter } from '../lib/rate-limit';

export const SESSION_TTL_MS = 30 * 24 * 3600 * 1000;
const MAGIC_LINK_TTL_MS = 15 * 60 * 1000;
const PASSWORD_RESET_TTL_MS = 30 * 60 * 1000;
export const MIN_PASSWORD_LENGTH = 8;

/** Tentatives de connexion autorisées par adresse email sur la fenêtre glissante. */
const LOGIN_ATTEMPTS_LIMIT = 10;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
/** Demandes d'email (magic link / réinitialisation) par adresse sur la fenêtre. */
const EMAIL_REQUESTS_LIMIT = 5;
const EMAIL_WINDOW_MS = 15 * 60 * 1000;

export interface AuthServiceOptions {
  /** URL publique de l'application, utilisée dans les emails. */
  appBaseUrl: string;
}

export class AuthService {
  private readonly appBaseUrl: string;

  constructor(
    private readonly userRepo: IUserRepository,
    private readonly sessionRepo: ISessionRepository,
    private readonly membershipRepo: IMembershipRepository,
    private readonly tokenRepo: IVerificationTokenRepository,
    private readonly mailProvider: MailProvider,
    private readonly passwordHasher: PasswordHasher,
    private readonly rateLimiter: RateLimiter,
    options: AuthServiceOptions
  ) {
    this.appBaseUrl = options.appBaseUrl.replace(/\/$/, '');
  }

  hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  async hashPassword(password: string): Promise<string> {
    this.assertPasswordStrength(password);
    return this.passwordHasher.hash(password);
  }

  private assertPasswordStrength(password: string): void {
    if (!password || password.length < MIN_PASSWORD_LENGTH) {
      throw new ValidationError(
        `Le mot de passe doit comporter au moins ${MIN_PASSWORD_LENGTH} caractères.`
      );
    }
  }

  private generateRawToken(prefix: string): string {
    return `${prefix}_${crypto.randomBytes(32).toString('hex')}`;
  }

  async createSession(userId: string, organizationId: string | null): Promise<string> {
    const rawToken = this.generateRawToken('ae_sess');
    await this.sessionRepo.create({
      id: this.hashToken(rawToken),
      userId,
      organizationId,
      expiresAt: new Date(Date.now() + SESSION_TTL_MS),
      createdAt: new Date()
    });
    return rawToken;
  }

  async resolveContext(token: string): Promise<AuthContext | null> {
    if (!token) return null;
    const tokenHash = this.hashToken(token);
    const session = await this.sessionRepo.findById(tokenHash);
    if (!session) return null;

    if (session.expiresAt.getTime() <= Date.now()) {
      await this.sessionRepo.delete(tokenHash);
      return null;
    }

    const user = await this.userRepo.findById(session.userId);
    if (!user) return null;

    return {
      userId: user.id,
      email: user.email,
      organizationId: session.organizationId,
      isPlatformAdmin: user.isPlatformAdmin
    };
  }

  private async primaryOrganizationId(userId: string): Promise<string | null> {
    const memberships = await this.membershipRepo.findByUser(userId);
    return memberships.length > 0 ? memberships[0].organizationId : null;
  }

  private toPublicUser(user: User): User {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      isPlatformAdmin: user.isPlatformAdmin,
      createdAt: user.createdAt
    };
  }

  async loginWithPassword(
    email: string,
    password: string
  ): Promise<{ sessionToken: string; user: User; organizationId: string | null }> {
    const cleanEmail = email.toLowerCase().trim();

    const rl = await this.rateLimiter.consume(`login:${cleanEmail}`, LOGIN_ATTEMPTS_LIMIT, LOGIN_WINDOW_MS);
    if (!rl.allowed) {
      throw new RateLimitedError('Trop de tentatives de connexion. Veuillez réessayer dans quelques minutes.');
    }

    const user = await this.userRepo.findByEmail(cleanEmail);
    const valid = Boolean(user?.passwordHash) && (await this.passwordHasher.verify(password, user!.passwordHash!));
    if (!user || !valid) {
      throw new UnauthorizedError('Identifiants incorrects.');
    }

    // Migration transparente des anciennes empreintes vers scrypt
    if (this.passwordHasher.needsRehash(user.passwordHash!)) {
      await this.userRepo.update(user.id, { passwordHash: await this.passwordHasher.hash(password) });
    }

    const organizationId = await this.primaryOrganizationId(user.id);
    const sessionToken = await this.createSession(user.id, organizationId);

    return { sessionToken, user: this.toPublicUser(user), organizationId };
  }

  /**
   * Envoie un lien de connexion à un compte EXISTANT.
   * L'organisation est déduite des memberships : le client ne peut pas la choisir.
   * Réponse identique que le compte existe ou non (pas d'énumération des comptes).
   */
  async requestMagicLink(email: string): Promise<void> {
    const cleanEmail = email.toLowerCase().trim();
    const rl = await this.rateLimiter.consume(`email:${cleanEmail}`, EMAIL_REQUESTS_LIMIT, EMAIL_WINDOW_MS);
    if (!rl.allowed) return;

    const user = await this.userRepo.findByEmail(cleanEmail);
    if (!user) return;

    const rawToken = this.generateRawToken('ml');
    await this.tokenRepo.create({
      id: this.hashToken(rawToken),
      purpose: 'magic_link',
      userId: user.id,
      organizationId: await this.primaryOrganizationId(user.id),
      expiresAt: new Date(Date.now() + MAGIC_LINK_TTL_MS),
      createdAt: new Date()
    });

    const verifyUrl = `${this.appBaseUrl}/api/auth/verify-magic-link?token=${encodeURIComponent(rawToken)}`;
    await this.mailProvider.sendMail(magicLinkEmail(user.email, verifyUrl));
  }

  async verifyMagicLink(
    token: string
  ): Promise<{ sessionToken: string; user: User; organizationId: string | null }> {
    const record = token ? await this.tokenRepo.consume(this.hashToken(token), 'magic_link') : null;
    if (!record) {
      throw new UnauthorizedError('Lien de connexion introuvable ou déjà utilisé.');
    }
    if (Date.now() > record.expiresAt.getTime()) {
      throw new UnauthorizedError('Ce lien de connexion a expiré.');
    }

    const user = await this.userRepo.findById(record.userId);
    if (!user) {
      throw new UnauthorizedError('Compte introuvable.');
    }

    // Le membership doit toujours exister au moment de la connexion
    let organizationId = record.organizationId;
    if (organizationId && !(await this.membershipRepo.findByUserAndOrg(user.id, organizationId))) {
      organizationId = await this.primaryOrganizationId(user.id);
    }

    const sessionToken = await this.createSession(user.id, organizationId);
    return { sessionToken, user: this.toPublicUser(user), organizationId };
  }

  /**
   * Étape 1 de la réinitialisation : envoie un lien à usage unique par email.
   * Réponse identique que le compte existe ou non.
   */
  async requestPasswordReset(email: string): Promise<void> {
    const cleanEmail = email.toLowerCase().trim();
    const rl = await this.rateLimiter.consume(`email:${cleanEmail}`, EMAIL_REQUESTS_LIMIT, EMAIL_WINDOW_MS);
    if (!rl.allowed) return;

    const user = await this.userRepo.findByEmail(cleanEmail);
    if (!user) return;

    const rawToken = this.generateRawToken('pr');
    await this.tokenRepo.create({
      id: this.hashToken(rawToken),
      purpose: 'password_reset',
      userId: user.id,
      organizationId: null,
      expiresAt: new Date(Date.now() + PASSWORD_RESET_TTL_MS),
      createdAt: new Date()
    });

    const resetUrl = `${this.appBaseUrl}/login/reinitialisation?token=${encodeURIComponent(rawToken)}`;
    await this.mailProvider.sendMail(passwordResetEmail(user.email, resetUrl));
  }

  /**
   * Étape 2 : définit le nouveau mot de passe grâce au jeton reçu par email,
   * puis révoque toutes les sessions existantes du compte.
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    this.assertPasswordStrength(newPassword);
    const record = token ? await this.tokenRepo.consume(this.hashToken(token), 'password_reset') : null;
    if (!record || Date.now() > record.expiresAt.getTime()) {
      throw new UnauthorizedError('Lien de réinitialisation invalide ou expiré.');
    }

    await this.userRepo.update(record.userId, { passwordHash: await this.passwordHasher.hash(newPassword) });
    await this.sessionRepo.deleteByUser(record.userId);
  }

  /** Changement de mot de passe par un utilisateur connecté (ancien mot de passe requis). */
  async changePassword(authContext: AuthContext, currentPassword: string, newPassword: string): Promise<void> {
    this.assertPasswordStrength(newPassword);
    const user = await this.userRepo.findById(authContext.userId);
    const valid =
      Boolean(user?.passwordHash) && (await this.passwordHasher.verify(currentPassword, user!.passwordHash!));
    if (!user || !valid) {
      throw new UnauthorizedError('Mot de passe actuel incorrect.');
    }
    await this.userRepo.update(user.id, { passwordHash: await this.passwordHasher.hash(newPassword) });
  }

  async logout(token: string): Promise<void> {
    if (!token) return;
    await this.sessionRepo.delete(this.hashToken(token));
  }
}
