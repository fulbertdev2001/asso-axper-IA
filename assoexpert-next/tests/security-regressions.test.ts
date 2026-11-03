/**
 * Tests de non-régression des failles corrigées lors de l'audit (novembre 2026).
 * Chaque test reproduit l'attaque d'origine et vérifie qu'elle échoue.
 */

import crypto from 'crypto';
import { describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as postAuthRoute } from '../src/app/api/auth/[...all]/route';
import { createContainer, container as globalContainer } from '../src/container';
import { MailProvider, SendMailInput } from '../src/lib/mail';
import { escapeHtml, expertTicketNotificationEmail } from '../src/lib/mail/templates';
import { serializeJsonLd } from '../src/lib/cms/serialize';
import { AuthContext } from '../src/domain/models';

function capturingMailProvider() {
  const sent: SendMailInput[] = [];
  const provider: MailProvider = {
    async sendMail(input) {
      sent.push(input);
      return { messageId: `test-${sent.length}` };
    }
  };
  return { sent, provider };
}

function extractToken(mail: SendMailInput): string {
  const match = mail.text.match(/token=([^\s&]+)/);
  if (!match) throw new Error('Aucun jeton trouvé dans l’email');
  return decodeURIComponent(match[1]);
}

function authPost(action: string, body: unknown, headers: Record<string, string> = {}): NextRequest {
  return new NextRequest(`http://localhost:3000/api/auth/${action}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body)
  });
}

const ADMIN_CONTEXT: AuthContext = {
  userId: 'user-admin',
  email: 'contact@cabinet-mae.fr',
  organizationId: null,
  isPlatformAdmin: true
};

describe('Sécurité — authentification', () => {
  beforeEach(() => {
    globalContainer.resetForTests();
  });

  it('la route /api/auth/demo-session n’existe plus (plus de session admin sans mot de passe)', async () => {
    const res = await postAuthRoute(authPost('demo-session', { isAdmin: true }));
    expect(res.status).toBe(404);
    expect(res.cookies.get('assoexpert_session')).toBeUndefined();
  });

  it('changer un mot de passe exige une session ET l’ancien mot de passe', async () => {
    const anonymous = await postAuthRoute(
      authPost('change-password', { email: 'contact@cabinet-mae.fr', newPassword: 'Piratage12345' })
    );
    expect(anonymous.status).toBe(401);

    const res = await postAuthRoute(
      authPost(
        'change-password',
        { currentPassword: 'faux-mot-de-passe', newPassword: 'Piratage12345' },
        { Authorization: 'Bearer session_org_1' }
      )
    );
    expect(res.status).toBe(401);
  });

  it('s’inscrire avec l’email d’un compte existant (ex. admin) est refusé (409) sans créer de session', async () => {
    const res = await postAuthRoute(
      authPost('register', {
        email: 'contact@cabinet-mae.fr',
        password: 'Piratage12345',
        organization: { name: 'Asso pirate' }
      })
    );
    expect(res.status).toBe(409);
    expect(res.cookies.get('assoexpert_session')).toBeUndefined();
  });

  it('la demande de magic link ne renvoie ni lien ni jeton, et ignore toute organisation fournie', async () => {
    const res = await postAuthRoute(
      authPost('magic-link', { email: 'direction@tremplin-solidarites.org', organizationId: 'org-2' })
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.verifyUrl).toBeUndefined();
    expect(JSON.stringify(body)).not.toMatch(/token|ml_/);
  });

  it('le magic link ouvre une session sur l’organisation du membership, jamais sur une autre', async () => {
    const { sent, provider } = capturingMailProvider();
    const c = createContainer({ useMemory: true, mailProvider: provider });

    await c.authService.requestMagicLink('president@mpt-lilas.fr');
    const verified = await c.authService.verifyMagicLink(extractToken(sent[0]));
    expect(verified.organizationId).toBe('org-2');

    await c.authService.requestMagicLink('inconnu@pirate.example');
    expect(sent).toHaveLength(1);
    expect(await c.repositories.user.findByEmail('inconnu@pirate.example')).toBeNull();
  });

  it('la réponse de connexion ne contient pas le jeton de session (cookie HttpOnly uniquement)', async () => {
    const user = (await globalContainer.repositories.user.findByEmail('direction@tremplin-solidarites.org'))!;
    await globalContainer.repositories.user.update(user.id, {
      passwordHash: await globalContainer.authService.hashPassword('MotDePasseSolide1')
    });

    const res = await postAuthRoute(
      authPost('login', { email: 'direction@tremplin-solidarites.org', password: 'MotDePasseSolide1' })
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.sessionToken).toBeUndefined();
    expect(res.cookies.get('assoexpert_session')?.value).toMatch(/^ae_sess_/);
  });

  it('réinitialisation : lien à usage unique, ancien mot de passe invalidé, sessions révoquées', async () => {
    const { sent, provider } = capturingMailProvider();
    const c = createContainer({ useMemory: true, mailProvider: provider });
    const user = (await c.repositories.user.findByEmail('direction@tremplin-solidarites.org'))!;
    await c.repositories.user.update(user.id, { passwordHash: await c.authService.hashPassword('AncienMotDePasse1') });
    const oldSession = await c.authService.createSession(user.id, 'org-1');

    await c.authService.requestPasswordReset(user.email);
    const token = extractToken(sent[0]);
    expect(sent[0].text).toContain('/login/reinitialisation?token=');

    await c.authService.resetPassword(token, 'NouveauMotDePasse2');
    await expect(c.authService.resetPassword(token, 'EncoreUnAutre3')).rejects.toThrow();

    expect(await c.authService.resolveContext(oldSession)).toBeNull();
    await expect(c.authService.loginWithPassword(user.email, 'AncienMotDePasse1')).rejects.toThrow();
    const logged = await c.authService.loginWithPassword(user.email, 'NouveauMotDePasse2');
    expect(logged.organizationId).toBe('org-1');
  });

  it('les empreintes héritées (SHA-256) restent valides puis sont migrées vers scrypt', async () => {
    const c = createContainer({ useMemory: true });
    const user = (await c.repositories.user.findByEmail('president@mpt-lilas.fr'))!;
    const legacy = crypto.createHash('sha256').update('MotDePasseHerite' + 'assoexpert_salt_2026').digest('hex');
    await c.repositories.user.update(user.id, { passwordHash: legacy });

    await c.authService.loginWithPassword(user.email, 'MotDePasseHerite');
    const migrated = await c.repositories.user.findById(user.id);
    expect(migrated?.passwordHash?.startsWith('scrypt$')).toBe(true);
  });

  it('bloque la force brute sur la connexion (rate limit par adresse)', async () => {
    const c = createContainer({ useMemory: true });
    const email = `brute-${Date.now()}@test.example`;
    for (let i = 0; i < 10; i++) {
      await expect(c.authService.loginWithPassword(email, `mauvais-${i}`)).rejects.toThrow('Identifiants incorrects');
    }
    await expect(c.authService.loginWithPassword(email, 'encore')).rejects.toThrow('Trop de tentatives');
  });
});

describe('Sécurité & fiabilité — tickets experts', () => {
  it('la réponse de l’experte est envoyée à l’auteur du ticket, pas à l’administratrice', async () => {
    const { sent, provider } = capturingMailProvider();
    const c = createContainer({ useMemory: true, mailProvider: provider });

    await c.ticketService.updateTicketAdmin(ADMIN_CONTEXT, 'AE-2026-00042', {
      status: 'answered',
      answer: 'Réponse officielle.'
    });

    const answerMail = sent[sent.length - 1];
    expect(answerMail.to).toBe('direction@tremplin-solidarites.org');
    expect(answerMail.to).not.toBe(ADMIN_CONTEXT.email);
  });

  it('les références sont calculées depuis la base et ne se répètent pas après un redémarrage', async () => {
    const c = createContainer({ useMemory: true });
    const orgContext: AuthContext = {
      userId: 'user-org-3',
      email: 'daf@passerelle-insertion.org',
      organizationId: 'org-3',
      isPlatformAdmin: false
    };
    const year = new Date().getFullYear();
    const maxBefore = await c.repositories.ticket.getMaxRefSequence(year);

    const first = await c.ticketService.createTicket(orgContext, {
      domain: 'rh',
      subject: 'Objet conservé',
      question: 'Question experte numéro un pour le test.'
    });
    expect(first.ticket.ref).toBe(`AE-${year}-${String(maxBefore + 1).padStart(5, '0')}`);
    expect(first.ticket.subject).toBe('Objet conservé');

    // « Redémarrage » : un nouveau service sur le même repository reprend la séquence
    const { TicketService } = await import('../src/services/ticket.service');
    const restarted = new TicketService(
      c.repositories.ticket,
      c.repositories.org,
      c.repositories.user,
      c.billingService,
      c.mailProvider
    );
    expect(await restarted.generateReference()).toBe(`AE-${year}-${String(maxBefore + 2).padStart(5, '0')}`);
  });

  it('les emails échappent le contenu saisi par l’utilisateur (pas d’injection HTML)', () => {
    const mail = expertTicketNotificationEmail({
      to: 'contact@cabinet-mae.fr',
      ref: 'AE-2026-00001',
      orgName: 'Asso',
      authorEmail: 'a@b.fr',
      domain: 'rh',
      urgency: 'normal_48h',
      subject: '<img src=x onerror=alert(1)>',
      question: '<a href="https://phishing.example">Cliquez ici</a>'
    });
    expect(mail.html).not.toContain('<img');
    expect(mail.html).not.toContain('<a href="https://phishing.example">');
    expect(escapeHtml('<b>"x"</b>')).toBe('&lt;b&gt;&quot;x&quot;&lt;/b&gt;');
  });
});

describe('Sécurité — CMS & SEO', () => {
  it('les brouillons ne sont pas publics et la redirection 301 renvoie un slug relatif valide', async () => {
    const c = createContainer({ useMemory: true });
    await c.cmsService.createPage(ADMIN_CONTEXT, {
      slug: 'brouillon-secret',
      title: 'Brouillon',
      metaDescription: 'Page en cours de rédaction',
      h1: 'Brouillon',
      chapo: '',
      content: '',
      faq: [],
      sources: [],
      author: 'Laetitia Badji',
      reviewer: 'Cabinet Maé',
      verifiedAt: '',
      status: 'draft',
      noindex: true,
      breadcrumbs: []
    });
    await expect(c.cmsService.getPageBySlug('brouillon-secret')).rejects.toThrow();
    const preview = await c.cmsService.getPageBySlug('brouillon-secret', { includeDrafts: true });
    expect(preview.type).toBe('page');

    const rhPage = (await c.repositories.cms.findBySlug('rh'))!;
    await c.cmsService.updatePage(ADMIN_CONTEXT, rhPage.id, { slug: 'ressources-humaines' });
    const res = await c.cmsService.getPageBySlug('rh');
    expect(res).toEqual({ type: 'redirect', targetSlug: 'ressources-humaines' });
  });

  it('le JSON-LD ne permet pas de fermer la balise <script>', () => {
    const html = serializeJsonLd({ name: '</script><script>alert(1)</script>' });
    expect(html).not.toContain('</script>');
    expect(JSON.parse(html).name).toBe('</script><script>alert(1)</script>');
  });
});
