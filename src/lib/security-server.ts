import crypto from "node:crypto";

/**
 * Performs a timing-safe string comparison.
 * Hashes both strings with SHA-256 before comparing to ensure they are the same length
 * and to prevent V8's early exit optimization on mismatched characters.
 *
 * @param a The first string to compare.
 * @param b The second string to compare.
 * @returns true if the strings are identical, false otherwise.
 */
export function safeCompare(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string") {
    return false;
  }

  try {
    const hashA = crypto.createHash("sha256").update(a).digest();
    const hashB = crypto.createHash("sha256").update(b).digest();
    return crypto.timingSafeEqual(hashA, hashB);
  } catch {
    return false;
  }
}
