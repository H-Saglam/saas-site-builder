import crypto from "node:crypto";

/**
 * Safely compares two strings using a timing-attack resistant algorithm.
 * By hashing the inputs first with SHA-256, we ensure both strings have the
 * same length and avoid leaking the length of the secret via early exits.
 *
 * Note: Only for use in server environments since it relies on node:crypto.
 */
export function safeCompare(a: string, b: string): boolean {
  try {
    const aHash = crypto.createHash("sha256").update(a).digest();
    const bHash = crypto.createHash("sha256").update(b).digest();
    return crypto.timingSafeEqual(aHash, bHash);
  } catch {
    return false;
  }
}
