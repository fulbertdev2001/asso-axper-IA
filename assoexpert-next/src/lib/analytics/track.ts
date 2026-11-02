/**
 * §4 & §7 Transverse — Analytics produit (Umami auto-hébergé, sans cookie) :
 * "Un helper unique `track()` alimente l'outil choisi, avec consentement.
 * Événements du MVP : `landing_view`, `seo_cta_click`, `signup_start`,
 * `signup_complete`, `question_sent`, `subscription_started`,
 * `subscription_upgraded`, `expert_ticket_created`.
 * Les paramètres UTM sont conservés jusqu'à l'inscription."
 *
 * Règle §3.7 : Jamais de contenu de question ou de réponse dans l'analytics.
 */

import { scrubSensitiveData } from '../monitoring/glitchtip';

export type MvpAnalyticsEvent =
  | 'landing_view'
  | 'seo_cta_click'
  | 'signup_start'
  | 'signup_complete'
  | 'question_sent'
  | 'subscription_started'
  | 'subscription_upgraded'
  | 'expert_ticket_created';

export interface UtmParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
}

const UTM_STORAGE_KEY = 'assoexpert_utm_params';

/**
 * Capture et conserve les paramètres UTM de l'URL courante jusqu'à l'inscription.
 */
export function captureUtmFromUrl(searchString: string): UtmParams {
  const params = new URLSearchParams(searchString);
  const utm: UtmParams = {};

  const keys: (keyof UtmParams)[] = [
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_term',
    'utm_content'
  ];

  for (const key of keys) {
    const val = params.get(key);
    if (val) {
      utm[key] = val;
    }
  }

  if (typeof window !== 'undefined' && Object.keys(utm).length > 0) {
    try {
      sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(utm));
    } catch {
      // Ignore storage restrictions
    }
  }

  return utm;
}

export function getStoredUtmParams(): UtmParams {
  if (typeof window === 'undefined') return {};
  try {
    const raw = sessionStorage.getItem(UTM_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as UtmParams) : {};
  } catch {
    return {};
  }
}

export interface TrackedPayload {
  event: MvpAnalyticsEvent;
  properties: Record<string, unknown>;
  utm: UtmParams;
  timestamp: string;
}

/**
 * Helper unique `track()` pour tout le produit.
 * Filtre automatiquement toute propriété sensible (question, content, answer) avant envoi.
 */
export function track(
  event: MvpAnalyticsEvent,
  properties: Record<string, unknown> = {}
): TrackedPayload {
  const safeProperties = scrubSensitiveData(properties);
  const utm = getStoredUtmParams();

  const payload: TrackedPayload = {
    event,
    properties: safeProperties,
    utm,
    timestamp: new Date().toISOString()
  };

  if (typeof window !== 'undefined') {
    const win = window as unknown as {
      umami?: { track: (eventName: string, data?: Record<string, unknown>) => void };
    };
    if (win.umami && typeof win.umami.track === 'function') {
      win.umami.track(event, { ...safeProperties, ...utm });
    }
  }

  return payload;
}

