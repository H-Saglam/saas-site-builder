import crypto from "node:crypto";

/**
 * Perform a constant-time comparison of two strings to mitigate timing attacks.
 * This function handles strings of potentially different lengths by hashing them
 * before comparison, which normalizes their length and prevents early-exit
 * timing leakage.
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
