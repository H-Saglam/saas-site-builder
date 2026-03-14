import crypto from 'node:crypto';

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
 * Safely compares two strings in constant time to prevent timing attacks.
 * It hashes both inputs with SHA-256 before comparison to ensure they
 * are the same length, avoiding the need to pad them.
 *
 * @param a The first string to compare.
 * @param b The second string to compare.
 * @returns true if the strings are strictly equal, false otherwise.
 */
export function safeCompare(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') {
    return false;
  }

  try {
    const hashA = crypto.createHash('sha256').update(a).digest();
    const hashB = crypto.createHash('sha256').update(b).digest();

    return crypto.timingSafeEqual(hashA, hashB);
  } catch {
    return false;
  }
}
