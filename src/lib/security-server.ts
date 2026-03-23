import crypto from "node:crypto";

/**
 * Securely compares two strings to prevent timing attacks.
 * It hashes both strings using SHA-256 before comparing them with crypto.timingSafeEqual.
 * This ensures that the comparison always takes a constant amount of time, regardless of
 * the length of the inputs or where the first difference occurs.
 *
 * @param a The first string to compare.
 * @param b The second string to compare.
 * @returns True if the strings are strictly equal, false otherwise.
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
