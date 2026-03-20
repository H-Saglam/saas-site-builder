import crypto from "node:crypto";

/**
 * Safely compares two strings using a timing-safe algorithm to prevent timing attacks.
 * It hashes the inputs first to ensure they are the same length before comparison.
 *
 * @param a The first string
 * @param b The second string
 * @returns true if the strings are strictly equal, false otherwise
 */
export function safeCompare(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string") {
    return false;
  }

  try {
    const aHash = crypto.createHash("sha256").update(a).digest();
    const bHash = crypto.createHash("sha256").update(b).digest();
    return crypto.timingSafeEqual(aHash, bHash);
  } catch {
    return false;
  }
}
