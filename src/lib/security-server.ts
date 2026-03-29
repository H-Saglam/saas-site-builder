import crypto from "node:crypto";

/**
 * Safely compares two strings to prevent timing attacks.
 * Uses SHA-256 hashing to ensure the strings are of equal length before
 * comparing them with crypto.timingSafeEqual.
 *
 * @param a First string to compare
 * @param b Second string to compare
 * @returns true if strings are exactly equal, false otherwise
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
