import crypto from "node:crypto";

/**
 * Securely compares two strings to prevent timing attacks.
 * It hashes the inputs first to ensure the comparison always takes a constant time,
 * avoiding the early exit behavior of V8's `===` operator.
 *
 * @param a First string to compare
 * @param b Second string to compare
 * @returns true if the strings match perfectly, false otherwise
 */
export function safeCompare(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string") {
    return false;
  }

  const hashA = crypto.createHash("sha256").update(a).digest();
  const hashB = crypto.createHash("sha256").update(b).digest();

  return crypto.timingSafeEqual(hashA, hashB);
}
