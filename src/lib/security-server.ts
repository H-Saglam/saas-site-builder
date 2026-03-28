import crypto from "node:crypto";

/**
 * Safely compares two strings in a timing-safe manner to prevent timing attacks.
 * It hashes the strings using SHA-256 before comparing, which ensures both strings
 * are of equal length for `crypto.timingSafeEqual` and avoids length-leakage.
 *
 * @param a The first string to compare.
 * @param b The second string to compare.
 * @returns true if the strings are identical, false otherwise.
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
