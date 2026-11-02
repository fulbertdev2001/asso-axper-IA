/**
 * Service d'authentification et de gestion de session (Couche Métier).
 * Design Pattern : Dependency Injection & Clean Architecture.
 * - Ne dépend d'aucun framework HTTP ni de Drizzle directement.
 * - Le jeton brut est transmis au client ; seule son empreinte SHA-256 est persistée.
 * - Empêche l'usurpation de tenant : le contexte est reconstruit depuis la session en base.
 */

import crypto from 'crypto';
import { User, AuthContext, Session } from '../domain/models';
import { UnauthorizedError } from '../domain/errors';
import { IUserRepository, ISessionRepository, IMembershipRepository } from '../repositories/interfaces';
import { MailProvider } from '../lib/mail';

export interface MagicLinkRecord {
  token: string;
  email: string;
  organizationId: string;
  expiresAt: Date;
}

export class AuthService {
  private magicLinks = new Map<string, MagicLinkRecord>();

  constructor(
    private readonly userRepo: IUserRepository,
    private readonly sessionRepo: ISessionRepository,
    private readonly membershipRepo: IMembershipRepository,
    private readonly mailProvider: MailProvider
  ) {}

  hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password + 'assoexpert_salt_2026').digest('hex');
  }

  async createSession(userId: string, organizationId: string | null): Promise<string> {
    const rawToken = `ae_sess_${crypto.randomBytes(32).toString('hex')}`;
    const tokenHash = this.hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 30 * 24 * 3600 * 1000); // 30 jours

    await this.sessionRepo.create({
      id: tokenHash,
      userId,
      organizationId,
      expiresAt,
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

  async loginWithPassword(
    email: string,
    password: string
  ): Promise<{ sessionToken: string; user: User; organizationId: string | null }> {
    const cleanEmail = email.toLowerCase().trim();
    const user = await this.userRepo.findByEmail(cleanEmail);

    if (!user || !user.passwordHash) {
      throw new UnauthorizedError('Identifiants incorrects.');
    }

    const computedHash = this.hashPassword(password);
    if (user.passwordHash !== computedHash) {
      throw new UnauthorizedError('Identifiants incorrects.');
    }

    // Récupérer l'organisation principale rattachée à cet utilisateur
    const memberships = await this.membershipRepo.findByUser(user.id);
    const primaryOrgId = memberships.length > 0 ? memberships[0].organizationId : null;

    const sessionToken = await this.createSession(user.id, primaryOrgId);

    return {
      sessionToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isPlatformAdmin: user.isPlatformAdmin,
        createdAt: user.createdAt
      },
      organizationId: primaryOrgId
    };
  }

  async requestMagicLink(
    email: string,
    organizationId: string,
    baseUrl?: string
  ): Promise<{ token: string; verifyUrl: string }> {
    const cleanEmail = email.toLowerCase().trim();
    const token = `ml_${organizationId}_${crypto.randomBytes(16).toString('hex')}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    this.magicLinks.set(token, {
      token,
      email: cleanEmail,
      organizationId,
      expiresAt
    });

    const host = (baseUrl || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '');
    const verifyUrl = `${host}/api/auth/verify-magic-link?token=${encodeURIComponent(token)}`;

    await this.mailProvider.sendMail({
      to: cleanEmail,
      subject: 'Votre lien de connexion sécurisé — AssoExpert IA',
      text: `Bonjour,\n\nCliquez sur ce lien valable 15 minutes pour vous connecter à votre espace AssoExpert IA :\n${verifyUrl}\n\nCabinet Maé — AssoExpert IA`,
      html: `<p>Bonjour,</p><p>Cliquez sur le lien ci-dessous (valable 15 minutes) pour accéder à votre espace <strong>AssoExpert IA</strong> :</p><p><a href="${verifyUrl}">Se connecter à AssoExpert IA</a></p>`
    });

    return { token, verifyUrl };
  }

  async verifyMagicLink(
    token: string
  ): Promise<{ sessionToken: string; user: User; organizationId: string }> {
    const record = this.magicLinks.get(token);
    if (!record) {
      throw new UnauthorizedError('Lien de connexion introuvable ou déjà utilisé.');
    }

    this.magicLinks.delete(token);

    if (Date.now() > record.expiresAt.getTime()) {
      throw new UnauthorizedError('Ce lien de connexion a expiré.');
    }

    // Trouver ou créer l'utilisateur
    let user = await this.userRepo.findByEmail(record.email);
    if (!user) {
      user = await this.userRepo.create({
        id: `user-${record.organizationId}`,
        email: record.email,
        name: record.email.split('@')[0],
        isPlatformAdmin: false,
        createdAt: new Date()
      });
    }

    // S'assurer de la présence du membership
    const membership = await this.membershipRepo.findByUserAndOrg(user.id, record.organizationId);
    if (!membership) {
      await this.membershipRepo.create({
        userId: user.id,
        organizationId: record.organizationId,
        roleInOrg: 'Direction',
        appRole: 'owner'
      });
    }

    const sessionToken = await this.createSession(user.id, record.organizationId);

    return {
      sessionToken,
      user,
      organizationId: record.organizationId
    };
  }

  async changePassword(email: string, newPassword: string): Promise<User> {
    const cleanEmail = email.toLowerCase().trim();
    const user = await this.userRepo.findByEmail(cleanEmail);
    if (!user) {
      throw new UnauthorizedError(`Aucun compte n'est associé à l'adresse ${cleanEmail}.`);
    }
    const newHash = this.hashPassword(newPassword);
    return await this.userRepo.update(user.id, { passwordHash: newHash });
  }

  async logout(token: string): Promise<void> {
    if (!token) return;
    const tokenHash = this.hashToken(token);
    await this.sessionRepo.delete(tokenHash);
  }
}

