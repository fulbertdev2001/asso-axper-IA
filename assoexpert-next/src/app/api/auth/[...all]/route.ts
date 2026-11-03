/**
 * Contrôleur d'authentification (catch-all `/api/auth/*`).
 * Chaque action est un handler `createApiHandler` (validation Zod + traduction des DomainError) ;
 * la logique métier reste dans `AuthService` / `OrgService`.
 *
 * GET  /api/auth                      → session courante
 * GET  /api/auth/verify-magic-link    → consomme le lien, pose le cookie, redirige vers /app
 * GET  /api/auth/google               → informations OAuth Google
 * POST /api/auth/login                → connexion email + mot de passe
 * POST /api/auth/magic-link           → envoi d'un lien de connexion (compte existant)
 * POST /api/auth/register | signup    → inscription + création de l'organisation
 * POST /api/auth/password-reset/request → envoi du lien de réinitialisation
 * POST /api/auth/password-reset/confirm → nouveau mot de passe via le jeton reçu par email
 * POST /api/auth/change-password      → changement de mot de passe (connecté, ancien mot de passe requis)
 * POST /api/auth/logout               → déconnexion
 */

import { NextRequest, NextResponse } from 'next/server';
import { container } from '../../../../container';
import { createApiHandler, extractSessionToken } from '../../../../http/handler';
import {
  changePasswordSchema,
  loginSchema,
  magicLinkRequestSchema,
  passwordResetConfirmSchema,
  passwordResetRequestSchema
} from '../../../../http/validation';
import { appBaseUrl, clearSessionCookie, setSessionCookie } from '../../../../http/session-cookie';
import { registerOrganizationHandler } from '../../../../http/registration';
import { UnauthorizedError } from '../../../../domain/errors';

type RouteHandler = (req: NextRequest, routeContext?: unknown) => Promise<NextResponse>;

const GENERIC_EMAIL_MESSAGE =
  'Si un compte correspond à cette adresse, un email vient de vous être envoyé.';

function actionOf(req: NextRequest): string {
  return req.nextUrl.pathname.replace(/^\/api\/auth\/?/, '').replace(/\/+$/, '');
}

// --- GET ---------------------------------------------------------------------

const currentSession = createApiHandler({
  handler: async ({ authContext }) => {
    if (!authContext) {
      return NextResponse.json({ authenticated: false, session: null }, { status: 401 });
    }

    let orgName: string | null = null;
    if (authContext.organizationId) {
      const org = await container.repositories.org.findById(authContext.organizationId);
      orgName = org?.name ?? null;
    }

    return {
      authenticated: true,
      session: {
        userId: authContext.userId,
        email: authContext.email,
        organizationId: authContext.organizationId,
        orgName,
        isPlatformAdmin: authContext.isPlatformAdmin,
        appRole: authContext.isPlatformAdmin ? 'admin_platform' : 'owner'
      }
    };
  }
});

const verifyMagicLink: RouteHandler = async (req) => {
  const base = appBaseUrl(req);
  try {
    const token = req.nextUrl.searchParams.get('token') || '';
    const verified = await container.authService.verifyMagicLink(token);
    return setSessionCookie(NextResponse.redirect(`${base}/app`), verified.sessionToken);
  } catch {
    return NextResponse.redirect(`${base}/login?magic=invalid`);
  }
};

const googleInfo: RouteHandler = async () => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  return NextResponse.json({
    provider: 'google',
    configured: Boolean(clientId),
    redirectUrl: clientId
      ? `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(clientId)}&response_type=code&scope=openid%20email%20profile`
      : '/login?oauth=google_demo'
  });
};

const GET_ROUTES: Record<string, RouteHandler> = {
  '': currentSession,
  session: currentSession,
  'verify-magic-link': verifyMagicLink,
  google: googleInfo
};

// --- POST --------------------------------------------------------------------

const login = createApiHandler({
  bodySchema: loginSchema,
  handler: async ({ body }) => {
    const logged = await container.authService.loginWithPassword(body.email, body.password);

    let organization = null;
    if (logged.organizationId) {
      const org = await container.repositories.org.findById(logged.organizationId);
      const profile = await container.repositories.org.getProfile(logged.organizationId);
      if (org && profile) {
        organization = {
          id: org.id,
          name: org.name,
          siren: org.siren,
          rna: org.rna,
          sector: profile.sector,
          employeesCount: profile.employeesCount,
          annualBudget: profile.annualBudget,
          ccn: profile.ccn,
          fiscalYearEnd: profile.fiscalYearEnd,
          usualAgMonth: profile.usualAgMonth,
          governanceSummary: profile.governanceSummary,
          mainFunders: profile.mainFunders,
          establishmentsCount: profile.establishmentsCount,
          members: profile.members,
          accountEmail: logged.user.email
        };
      }
    }

    const response = NextResponse.json({
      ok: true,
      user: logged.user,
      organizationId: logged.organizationId,
      organization
    });
    return setSessionCookie(response, logged.sessionToken);
  }
});

const magicLink = createApiHandler({
  bodySchema: magicLinkRequestSchema,
  handler: async ({ body }) => {
    await container.authService.requestMagicLink(body.email);
    return { ok: true, message: GENERIC_EMAIL_MESSAGE };
  }
});

const passwordResetRequest = createApiHandler({
  bodySchema: passwordResetRequestSchema,
  handler: async ({ body }) => {
    await container.authService.requestPasswordReset(body.email);
    return { ok: true, message: GENERIC_EMAIL_MESSAGE };
  }
});

const passwordResetConfirm = createApiHandler({
  bodySchema: passwordResetConfirmSchema,
  handler: async ({ body }) => {
    await container.authService.resetPassword(body.token, body.newPassword);
    return clearSessionCookie(
      NextResponse.json({
        ok: true,
        message: 'Votre mot de passe a bien été modifié. Vous pouvez maintenant vous connecter.'
      })
    );
  }
});

const changePassword = createApiHandler({
  auth: true,
  bodySchema: changePasswordSchema,
  handler: async ({ authContext, body }) => {
    if (!authContext) throw new UnauthorizedError('Session requise.');
    await container.authService.changePassword(authContext, body.currentPassword, body.newPassword);
    return { ok: true, message: 'Votre mot de passe a bien été mis à jour.' };
  }
});

const logout: RouteHandler = async (req) => {
  const token = extractSessionToken(req);
  if (token) {
    await container.authService.logout(token).catch(() => undefined);
  }
  return clearSessionCookie(NextResponse.json({ ok: true, message: 'Déconnecté avec succès.' }));
};

const POST_ROUTES: Record<string, RouteHandler> = {
  login,
  'magic-link': magicLink,
  register: registerOrganizationHandler,
  signup: registerOrganizationHandler,
  'password-reset/request': passwordResetRequest,
  'password-reset/confirm': passwordResetConfirm,
  'change-password': changePassword,
  logout
};

function notSupported(): NextResponse {
  return NextResponse.json({ error: 'Action auth non supportée.', code: 'NOT_FOUND' }, { status: 404 });
}

export async function GET(req: NextRequest, routeContext?: unknown): Promise<NextResponse> {
  const handler = GET_ROUTES[actionOf(req)];
  return handler ? handler(req, routeContext) : notSupported();
}

export async function POST(req: NextRequest, routeContext?: unknown): Promise<NextResponse> {
  const handler = POST_ROUTES[actionOf(req)];
  return handler ? handler(req, routeContext) : notSupported();
}
