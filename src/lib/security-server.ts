import crypto from "node:crypto";

/**
 * Safely compares two strings in a timing-attack resistant manner.
 * Both strings are first hashed with SHA-256 to ensure equal length before comparison.
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
