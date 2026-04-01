import crypto from "node:crypto";

/**
 * Perform a constant-time comparison of two strings to mitigate timing attacks.
 * It hashes both strings first to ensure they are the same length before comparing
 * with timingSafeEqual, preventing early exits or length leaks.
 *
 * @param a The first string to compare.
 * @param b The second string to compare.
 * @returns true if the strings are equal, false otherwise.
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
