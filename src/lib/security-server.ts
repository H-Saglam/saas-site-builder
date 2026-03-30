import crypto from "node:crypto";

/**
 * Timing-attack resistant string comparison.
 * Hashes inputs with SHA-256 before using crypto.timingSafeEqual to ensure
 * comparisons always take the same amount of time regardless of input length.
 */
export function safeCompare(a: string, b: string): boolean {
  const hashA = crypto.createHash("sha256").update(a).digest();
  const hashB = crypto.createHash("sha256").update(b).digest();

  return crypto.timingSafeEqual(hashA, hashB);
}
