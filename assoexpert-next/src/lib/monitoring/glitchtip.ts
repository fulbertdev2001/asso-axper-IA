/**
 * §3.7 & §4 — Confidentialité & GlitchTip auto-hébergé (compatible SDK Sentry) :
 * "Le contenu des questions et réponses n'est jamais envoyé dans les logs techniques,
 * Sentry ou l'analytics. On ne journalise que des métadonnées (tokens, coût, modèle,
 * version de prompt). Scrubbing du contenu des messages obligatoire."
 */

const SCRUBBED_PLACEHOLDER = '[REDACTED_CONFIDENTIAL_CONTENT]';

const SENSITIVE_KEYS = new Set([
  'content',
  'question',
  'answer',
  'prompt',
  'messages',
  'message',
  'text',
  'body',
  'password',
  'secret',
  'token',
  'authorization',
  'cookie',
  'api_key',
  'apikey',
  'siren',
  'rna'
]);

/**
 * Nettoie récursivement tout objet ou payload d'erreur avant envoi à GlitchTip
 * ou journalisation technique.
 */
export function scrubSensitiveData<T>(input: T): T {
  if (input === null || input === undefined) {
    return input;
  }

  if (typeof input === 'string') {
    // Masque les clés API ou jetons Bearer éventuellement présents dans une chaîne brute
    return input
      .replace(/sk-ant-[A-Za-z0-9\-_]+/g, '[REDACTED_ANTHROPIC_KEY]')
      .replace(/sk_(live|test)_[A-Za-z0-9]+/g, '[REDACTED_STRIPE_KEY]')
      .replace(/Bearer\s+[A-Za-z0-9\-._~+/]+=*/gi, 'Bearer [REDACTED_TOKEN]') as unknown as T;
  }

  if (Array.isArray(input)) {
    return input.map((item) => scrubSensitiveData(item)) as unknown as T;
  }

  if (typeof input === 'object') {
    const scrubbed: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
      if (SENSITIVE_KEYS.has(key.toLowerCase())) {
        scrubbed[key] = SCRUBBED_PLACEHOLDER;
      } else {
        scrubbed[key] = scrubSensitiveData(value);
      }
    }
    return scrubbed as T;
  }

  return input;
}

export interface GlitchTipEventMetadata {
  organizationId?: string;
  userId?: string;
  model?: string;
  promptVersion?: string;
  inputTokens?: number;
  outputTokens?: number;
  costEstimate?: number;
  [key: string]: unknown;
}

export interface ScrubbedErrorReport {
  errorName: string;
  errorMessage: string;
  timestamp: string;
  metadata: GlitchTipEventMetadata;
}

/**
 * Prépare et envoie un rapport d'erreur assaini vers GlitchTip.
 * Aucun contenu de question ou de réponse n'est jamais transmis.
 */
export function captureExceptionScrubbed(
  error: unknown,
  rawMetadata: GlitchTipEventMetadata = {}
): ScrubbedErrorReport {
  const errObj = error instanceof Error ? error : new Error(String(error));
  const safeMetadata = scrubSensitiveData(rawMetadata);

  const report: ScrubbedErrorReport = {
    errorName: errObj.name,
    errorMessage: scrubSensitiveData(errObj.message),
    timestamp: new Date().toISOString(),
    metadata: safeMetadata
  };

  const dsn = process.env.GLITCHTIP_DSN || process.env.NEXT_PUBLIC_GLITCHTIP_DSN;
  if (dsn && typeof fetch === 'function') {
    // Envoi asynchrone non-bloquant vers l'instance GlitchTip auto-hébergée
    fetch(dsn, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(report)
    }).catch(() => {
      // Silence monitoring transport errors
    });
  }

  return report;
}

