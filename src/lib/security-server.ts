import crypto from "node:crypto";

/**
 * Compares two strings using a timing-safe equality check.
 * Hashes both strings with SHA-256 before comparing to prevent timing attacks
 * and handle strings of different lengths securely.
 *
 * @param a First string to compare
 * @param b Second string to compare
 * @returns true if strings are exactly equal, false otherwise
 */
export function safeCompare(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') {
    return false;
  }

  const hashA = crypto.createHash('sha256').update(a).digest();
  const hashB = crypto.createHash('sha256').update(b).digest();

  return crypto.timingSafeEqual(hashA, hashB);
}
