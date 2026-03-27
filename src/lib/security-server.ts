import crypto from "node:crypto";

/**
 * Safely compares two strings using a timing-safe equality check.
 * This function hashes both inputs with SHA-256 before comparison
 * to prevent leaking the length of the secret or early exit timing.
 *
 * @param a The first string to compare (e.g. user input)
 * @param b The second string to compare (e.g. expected secret)
 * @returns true if strings are equal, false otherwise
 */
export function safeCompare(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') {
    return false;
  }

  try {
    const hashA = crypto.createHash('sha256').update(a).digest();
    const hashB = crypto.createHash('sha256').update(b).digest();

    return crypto.timingSafeEqual(hashA, hashB);
  } catch {
    return false;
  }
}
