import crypto from "node:crypto";

/**
 * A timing-safe comparison function for strings.
 * Hashes both strings using SHA-256 before comparing them with crypto.timingSafeEqual.
 * This ensures that strings of different lengths or formats can be safely compared.
 */
export function safeCompare(a: string, b: string): boolean {
  try {
    const aHash = crypto.createHash('sha256').update(a).digest();
    const bHash = crypto.createHash('sha256').update(b).digest();
    return crypto.timingSafeEqual(aHash, bHash);
  } catch {
    return false;
  }
}
