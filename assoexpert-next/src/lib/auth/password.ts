/**
 * Port & adaptateur de hachage des mots de passe (Design Pattern Strategy / Port-Adapter).
 * - Implémentation par défaut : scrypt (natif Node.js, sans dépendance) avec sel aléatoire par mot de passe.
 * - Comparaison en temps constant (`timingSafeEqual`).
 * - Compatibilité ascendante : les anciennes empreintes SHA-256 à sel fixe sont encore vérifiées
 *   puis signalées comme « à re-hacher » afin d'être migrées de façon transparente à la connexion.
 */

import crypto from 'crypto';

export interface PasswordHasher {
  hash(password: string): Promise<string>;
  verify(password: string, storedHash: string): Promise<boolean>;
  needsRehash(storedHash: string): boolean;
}

const SCRYPT_PREFIX = 'scrypt';
const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const KEY_LENGTH = 64;
const LEGACY_STATIC_SALT = 'assoexpert_salt_2026';

function scryptAsync(password: string, salt: Buffer, n: number, r: number, p: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, KEY_LENGTH, { N: n, r, p, maxmem: 64 * 1024 * 1024 }, (err, key) => {
      if (err) reject(err);
      else resolve(key);
    });
  });
}

function safeEqual(a: Buffer, b: Buffer): boolean {
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export class ScryptPasswordHasher implements PasswordHasher {
  async hash(password: string): Promise<string> {
    const salt = crypto.randomBytes(16);
    const key = await scryptAsync(password, salt, SCRYPT_N, SCRYPT_R, SCRYPT_P);
    return [SCRYPT_PREFIX, SCRYPT_N, SCRYPT_R, SCRYPT_P, salt.toString('base64'), key.toString('base64')].join('$');
  }

  async verify(password: string, storedHash: string): Promise<boolean> {
    if (!storedHash) return false;

    if (storedHash.startsWith(`${SCRYPT_PREFIX}$`)) {
      const [, n, r, p, saltB64, keyB64] = storedHash.split('$');
      if (!n || !r || !p || !saltB64 || !keyB64) return false;
      const expected = Buffer.from(keyB64, 'base64');
      const actual = await scryptAsync(password, Buffer.from(saltB64, 'base64'), Number(n), Number(r), Number(p));
      return safeEqual(actual, expected);
    }

    // Empreinte héritée (SHA-256 + sel statique) : vérifiée en temps constant, puis migrée
    const legacy = crypto.createHash('sha256').update(password + LEGACY_STATIC_SALT).digest();
    return /^[0-9a-f]{64}$/i.test(storedHash) && safeEqual(legacy, Buffer.from(storedHash, 'hex'));
  }

  needsRehash(storedHash: string): boolean {
    return !storedHash.startsWith(`${SCRYPT_PREFIX}$${SCRYPT_N}$${SCRYPT_R}$${SCRYPT_P}$`);
  }
}
