import { NextRequest, NextResponse } from 'next/server';
import { container } from '../../../../container';
import { extractSessionToken } from '../../../../http/handler';
import { loginSchema, magicLinkRequestSchema, registerOrgSchema } from '../../../../http/validation';
import { DomainError } from '../../../../domain/errors';

export async function GET(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  try {
    // 1. Vérification du Magic Link
    if (pathname.endsWith('/verify-magic-link')) {
      const token = searchParams.get('token') || '';
      const verified = await container.authService.verifyMagicLink(token);

      const response = NextResponse.json({
        ok: true,
        sessionToken: verified.sessionToken,
        user: verified.user,
        organizationId: verified.organizationId
      });

      // Cookie de session sécurisé HttpOnly
      response.cookies.set('assoexpert_session', verified.sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 30 * 24 * 3600
      });

      return response;
    }

    // 2. Info Google OAuth
    if (pathname.endsWith('/google')) {
      const clientId = process.env.GOOGLE_CLIENT_ID;
      return NextResponse.json({
        provider: 'google',
        configured: Boolean(clientId),
        redirectUrl: clientId
          ? `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(clientId)}&response_type=code&scope=openid%20email%20profile`
          : '/login?oauth=google_demo'
      });
    }

    // 3. Consultation de la session courante
    const token = extractSessionToken(request);
    if (!token) {
      return NextResponse.json({ authenticated: false, session: null }, { status: 401 });
    }

    const authContext = await container.authService.resolveContext(token);
    if (!authContext) {
      return NextResponse.json({ authenticated: false, session: null }, { status: 401 });
    }

    // Récupérer le nom de l'organisation si rattachée
    let orgName = authContext.organizationId;
    if (authContext.organizationId) {
      const org = await container.repositories.org.findById(authContext.organizationId);
      if (org) orgName = org.name;
    }

    return NextResponse.json({
      authenticated: true,
      session: {
        userId: authContext.userId,
        email: authContext.email,
        organizationId: authContext.organizationId,
        orgName,
        isPlatformAdmin: authContext.isPlatformAdmin,
        appRole: authContext.isPlatformAdmin ? 'admin_platform' : 'owner'
      }
    });
  } catch (err: unknown) {
    if (err instanceof DomainError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: err.status });
    }
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { pathname } = request.nextUrl;

  try {
    // 1. Demande de Magic Link
    if (pathname.endsWith('/magic-link')) {
      const body = await request.json();
      const parsed = magicLinkRequestSchema.parse(body);

      const result = await container.authService.requestMagicLink(
        parsed.email,
        parsed.organizationId,
        request.nextUrl.origin
      );

      return NextResponse.json({
        ok: true,
        message: 'Lien magique envoyé par email.',
        verifyUrl: result.verifyUrl
      });
    }

    // 2. Connexion par mot de passe
    if (pathname.endsWith('/login')) {
      const body = await request.json();
      const parsed = loginSchema.parse(body);

      const logged = await container.authService.loginWithPassword(parsed.email, parsed.password);

      let fullOrganization = null;
      if (logged.organizationId) {
        const org = await container.repositories.org.findById(logged.organizationId);
        const profile = await container.repositories.org.getProfile(logged.organizationId);
        if (org && profile) {
          fullOrganization = {
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
        sessionToken: logged.sessionToken,
        user: logged.user,
        organizationId: logged.organizationId,
        organization: fullOrganization
      });

      response.cookies.set('assoexpert_session', logged.sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 30 * 24 * 3600
      });

      return response;
    }

    // 3. Inscription & onboarding organisation
    if (pathname.endsWith('/register') || pathname.endsWith('/signup')) {
      const body = await request.json();
      const parsed = registerOrgSchema.parse(body);

      let passwordHash: string | undefined;
      if (parsed.password) {
        passwordHash = container.authService.hashPassword(parsed.password);
      }

      const registered = await container.orgService.registerOrganization({
        email: parsed.email,
        name: parsed.name || 'Direction',
        roleInOrg: parsed.roleInOrg,
        passwordHash,
        organization: parsed.organization as any
      });

      // Créer la session pour le nouvel utilisateur
      const sessionToken = await container.authService.createSession(
        registered.userId,
        registered.organization.id
      );

      const response = NextResponse.json({
        ok: true,
        sessionToken,
        organization: registered.organization,
        profile: registered.profile
      });

      response.cookies.set('assoexpert_session', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 30 * 24 * 3600
      });

      return response;
    }

    // 4. Synchronisation de session de démonstration / changement de persona
    if (pathname.endsWith('/demo-session')) {
      const body = (await request.json().catch(() => ({}))) as {
        organizationId?: string;
        isAdmin?: boolean;
        email?: string;
      };

      let targetOrgId: string | null = body.organizationId || 'org-1';
      let lookupEmail = body.email || 'direction@tremplin-solidarites.org';

      if (body.isAdmin) {
        lookupEmail = 'laetitia.badji@cabinet-mae.fr';
        targetOrgId = 'org-1';
      } else if (!body.email) {
        if (targetOrgId === 'org-2' || targetOrgId === '22222222-2222-4222-8222-222222222222') {
          lookupEmail = 'contact@mpt-lilas.fr';
        } else if (targetOrgId === 'org-3' || targetOrgId === '33333333-3333-4333-8333-333333333333') {
          lookupEmail = 'direction@passerelle-lyon.org';
        }
      }

      const foundUser =
        (await container.repositories.user.findByEmail(lookupEmail)) ||
        (await container.repositories.user.findByEmail('direction@tremplin-solidarites.org'));
      const userId = foundUser?.id || (body.isAdmin ? 'usr_admin_laetitia' : 'usr_tremplin_dir');

      const sessionToken = await container.authService.createSession(userId, targetOrgId);
      const response = NextResponse.json({
        ok: true,
        sessionToken,
        userId,
        organizationId: targetOrgId
      });

      response.cookies.set('assoexpert_session', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 30 * 24 * 3600
      });

      return response;
    }

    // 5. Changement / Réinitialisation de mot de passe en base de données
    if (pathname.endsWith('/change-password')) {
      const body = (await request.json().catch(() => ({}))) as {
        email?: string;
        newPassword?: string;
      };
      if (!body.email || !body.newPassword || body.newPassword.length < 6) {
        return NextResponse.json(
          { error: 'Veuillez fournir une adresse email valide et un mot de passe d’au moins 6 caractères.' },
          { status: 400 }
        );
      }

      await container.authService.changePassword(body.email, body.newPassword);
      return NextResponse.json({
        ok: true,
        message: 'Votre mot de passe a bien été mis à jour dans la base de données.'
      });
    }

    // 6. Déconnexion
    if (pathname.endsWith('/logout')) {
      const token = extractSessionToken(request);
      if (token) {
        await container.authService.logout(token);
      }

      const response = NextResponse.json({ ok: true, message: 'Déconnecté avec succès.' });
      response.cookies.delete('assoexpert_session');
      return response;
    }

    return NextResponse.json({ error: 'Action auth non supportée.' }, { status: 404 });
  } catch (err: any) {
    console.error('[Auth POST Error]:', err, 'CAUSE:', err?.cause);
    if (err instanceof DomainError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: err.status });
    }
    const rawMsg = err instanceof Error ? err.message : '';
    const safeMsg = rawMsg.startsWith('Failed query:')
      ? 'La base de données se réveille, veuillez réessayer dans une seconde.'
      : rawMsg || 'Données invalides.';
    return NextResponse.json({ error: safeMsg }, { status: 400 });
  }
}
