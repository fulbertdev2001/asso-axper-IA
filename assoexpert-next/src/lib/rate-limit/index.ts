/**
 * §4 — Rate limit :
 * "Valkey/Redis en conteneur, ou table Postgres.
 * 10 requêtes/min/utilisateur (valeur en configuration)."
 */

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAtMs: number;
}

const memoryBuckets = new Map<string, { count: number; resetAtMs: number }>();

export function checkRateLimit(
  userId: string,
  maxRequestsPerMinute = Number(process.env.RATE_LIMIT_REQUESTS_PER_MINUTE || 10),
  windowMs = 60_000,
  nowMs = Date.now()
): RateLimitResult {
  const key = `rl:${userId}`;
  const existing = memoryBuckets.get(key);

  if (!existing || nowMs >= existing.resetAtMs) {
    const resetAtMs = nowMs + windowMs;
    memoryBuckets.set(key, { count: 1, resetAtMs });
    return {
      allowed: true,
      limit: maxRequestsPerMinute,
      remaining: Math.max(0, maxRequestsPerMinute - 1),
      resetAtMs
    };
  }

  if (existing.count >= maxRequestsPerMinute) {
    return {
      allowed: false,
      limit: maxRequestsPerMinute,
      remaining: 0,
      resetAtMs: existing.resetAtMs
    };
  }

  existing.count += 1;
  return {
    allowed: true,
    limit: maxRequestsPerMinute,
    remaining: Math.max(0, maxRequestsPerMinute - existing.count),
    resetAtMs: existing.resetAtMs
  };
}

export function resetRateLimitBuckets(): void {
  memoryBuckets.clear();
}

