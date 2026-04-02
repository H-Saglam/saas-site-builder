import crypto from "node:crypto";

/**
 * Securely compares two strings to prevent timing attacks.
 * It hashes both strings using SHA-256 before comparing them with timingSafeEqual,
 * which ensures that strings of different lengths can be compared safely without leaking length.
 *
 * @param a The first string
 * @param b The second string
 * @returns true if the strings are strictly equal, false otherwise
 */
export function safeCompare(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string") {
    return false;
  }

  const hashA = crypto.createHash("sha256").update(a).digest();
  const hashB = crypto.createHash("sha256").update(b).digest();

  return crypto.timingSafeEqual(hashA, hashB);
}
