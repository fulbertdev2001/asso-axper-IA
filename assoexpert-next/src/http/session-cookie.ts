/**
 * Helpers HTTP de session (couche Adapter).
 * Le jeton de session ne circule QUE dans un cookie HttpOnly : il n'est jamais renvoyé
 * dans le corps JSON, afin qu'aucun script côté navigateur ne puisse le lire.
 */

import { NextRequest, NextResponse } from 'next/server';
import { SESSION_TTL_MS } from '../services/auth.service';

export const SESSION_COOKIE_NAME = 'assoexpert_session';

export function setSessionCookie(response: NextResponse, sessionToken: string): NextResponse {
  response.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: Math.floor(SESSION_TTL_MS / 1000)
  });
  return response;
}

export function clearSessionCookie(response: NextResponse): NextResponse {
  response.cookies.delete(SESSION_COOKIE_NAME);
  return response;
}

/** URL publique configurée (jamais dérivée de l'en-tête Host en production). */
export function configuredAppBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '');
}

export function appBaseUrl(req: NextRequest): string {
  return process.env.NEXT_PUBLIC_APP_URL ? configuredAppBaseUrl() : req.nextUrl.origin;
}
