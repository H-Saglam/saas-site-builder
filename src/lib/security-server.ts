import crypto from "node:crypto";

/**
 * Safely compares two strings using crypto.timingSafeEqual to prevent timing attacks.
 * It first hashes the strings using SHA-256 to ensure they have the same length before comparison.
 *
 * @param a The first string to compare.
 * @param b The second string to compare.
 * @returns true if the strings are equal, false otherwise.
 */
export function safeCompare(a: string, b: string): boolean {
  try {
    const hashA = crypto.createHash("sha256").update(a).digest();
    const hashB = crypto.createHash("sha256").update(b).digest();
    return crypto.timingSafeEqual(hashA, hashB);
  } catch {
    return false;
  }
}
