/**
 * §4 — Rate limit :
 * "Valkey/Redis en conteneur, ou table Postgres.
 * 10 requêtes/min/utilisateur (valeur en configuration)."
 *
 * Design Pattern Port/Adapter : les services dépendent de l'interface `RateLimiter`.
 * - `ValkeyRateLimiter` : compteur partagé entre toutes les instances (production).
 * - `MemoryRateLimiter` : repli local (tests / développement sans Valkey).
 */

import Redis from 'ioredis';

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAtMs: number;
}

export interface RateLimiter {
  consume(key: string, limit?: number, windowMs?: number): Promise<RateLimitResult>;
}

export function defaultRequestsPerMinute(): number {
  return Number(process.env.RATE_LIMIT_REQUESTS_PER_MINUTE || 10);
}

const memoryBuckets = new Map<string, { count: number; resetAtMs: number }>();

function consumeMemory(key: string, limit: number, windowMs: number, nowMs: number): RateLimitResult {
  const existing = memoryBuckets.get(key);

  if (!existing || nowMs >= existing.resetAtMs) {
    const resetAtMs = nowMs + windowMs;
    memoryBuckets.set(key, { count: 1, resetAtMs });
    return { allowed: true, limit, remaining: Math.max(0, limit - 1), resetAtMs };
  }

  if (existing.count >= limit) {
    return { allowed: false, limit, remaining: 0, resetAtMs: existing.resetAtMs };
  }

  existing.count += 1;
  return {
    allowed: true,
    limit,
    remaining: Math.max(0, limit - existing.count),
    resetAtMs: existing.resetAtMs
  };
}

/** API synchrone historique (conservée pour compatibilité). */
export function checkRateLimit(
  userId: string,
  maxRequestsPerMinute = defaultRequestsPerMinute(),
  windowMs = 60_000,
  nowMs = Date.now()
): RateLimitResult {
  return consumeMemory(`rl:${userId}`, maxRequestsPerMinute, windowMs, nowMs);
}

export function resetRateLimitBuckets(): void {
  memoryBuckets.clear();
}

export class MemoryRateLimiter implements RateLimiter {
  async consume(key: string, limit = defaultRequestsPerMinute(), windowMs = 60_000): Promise<RateLimitResult> {
    return consumeMemory(`rl:${key}`, limit, windowMs, Date.now());
  }
}

export class ValkeyRateLimiter implements RateLimiter {
  private readonly client: Redis;
  private readonly fallback = new MemoryRateLimiter();

  constructor(url: string) {
    this.client = new Redis(url, { lazyConnect: true, maxRetriesPerRequest: 1, enableOfflineQueue: false });
    this.client.on('error', () => {
      // Erreurs de connexion gérées dans consume() (repli mémoire) — aucun contenu journalisé.
    });
  }

  async consume(key: string, limit = defaultRequestsPerMinute(), windowMs = 60_000): Promise<RateLimitResult> {
    const redisKey = `rl:${key}`;
    try {
      if (this.client.status === 'wait') await this.client.connect();
      const results = await this.client.multi().incr(redisKey).pttl(redisKey).exec();
      const count = Number(results?.[0]?.[1] ?? 1);
      let ttl = Number(results?.[1]?.[1] ?? -1);
      if (ttl < 0) {
        await this.client.pexpire(redisKey, windowMs);
        ttl = windowMs;
      }
      return {
        allowed: count <= limit,
        limit,
        remaining: Math.max(0, limit - count),
        resetAtMs: Date.now() + ttl
      };
    } catch {
      console.error('[RateLimiter] Valkey indisponible, repli sur le compteur local.');
      return this.fallback.consume(key, limit, windowMs);
    }
  }
}

export function createRateLimiter(): RateLimiter {
  const url = process.env.VALKEY_URL;
  if (url && process.env.NODE_ENV !== 'test') {
    return new ValkeyRateLimiter(url);
  }
  return new MemoryRateLimiter();
}
