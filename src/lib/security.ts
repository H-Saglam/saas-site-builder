import crypto from "node:crypto";

/**
 * Validates if a URL is safe to fetch (e.g. from allowed domains).
 * Currently only allows URLs from the configured Supabase project.
 *
 * @param url The URL to validate.
 * @returns true if the URL is safe, false otherwise.
 */
export function isSafeUrl(url: string): boolean {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) return false;

    const allowedHostname = new URL(supabaseUrl).hostname;
    const u = new URL(url);

    return u.protocol === "https:" && u.hostname === allowedHostname;
  } catch {
    return false;
  }
}

/**
 * Compares two strings using a constant-time algorithm to prevent timing attacks.
 * By hashing the inputs first with SHA-256, it ensures both buffers are the same
 * length (32 bytes), which is required by `crypto.timingSafeEqual`, preventing
 * early exits based on length differences.
 *
 * @param a First string to compare
 * @param b Second string to compare
 * @returns true if the strings are exactly equal, false otherwise
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
