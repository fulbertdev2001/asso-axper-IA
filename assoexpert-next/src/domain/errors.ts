/**
 * Erreurs de domaine.
 * Les services lèvent ces erreurs ; seule la couche HTTP (src/http/handler.ts)
 * les traduit en codes de statut. Aucun service ne connaît HTTP.
 */

export abstract class DomainError extends Error {
  abstract readonly status: number;
  abstract readonly code: string;

  constructor(message: string, public readonly details?: unknown) {
    super(message);
    this.name = new.target.name;
  }
}

export class ValidationError extends DomainError {
  readonly status = 400;
  readonly code = 'VALIDATION_ERROR';
}

export class UnauthorizedError extends DomainError {
  readonly status = 401;
  readonly code = 'UNAUTHORIZED';
}

export class ForbiddenError extends DomainError {
  readonly status = 403;
  readonly code = 'FORBIDDEN';
}

export class NotFoundError extends DomainError {
  readonly status = 404;
  readonly code = 'NOT_FOUND';
}

export class ConflictError extends DomainError {
  readonly status = 409;
  readonly code = 'CONFLICT';
}

export class QuotaExceededError extends DomainError {
  readonly status = 429;
  readonly code = 'QUOTA_EXCEEDED';
}

export class RateLimitedError extends DomainError {
  readonly status = 429;
  readonly code = 'RATE_LIMITED';
}

export class ServiceUnavailableError extends DomainError {
  readonly status = 503;
  readonly code = 'SERVICE_UNAVAILABLE';
}

