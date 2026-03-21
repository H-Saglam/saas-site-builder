import crypto from 'node:crypto';

/**
 * Performs a timing-safe string comparison by hashing inputs with SHA-256
 * before comparing. This prevents timing attacks and handles strings of
 * different lengths safely.
 */
export function safeCompare(a: string, b: string): boolean {
  try {
    const hashA = crypto.createHash('sha256').update(a).digest();
    const hashB = crypto.createHash('sha256').update(b).digest();
    return crypto.timingSafeEqual(hashA, hashB);
  } catch {
    return false;
  }
}
