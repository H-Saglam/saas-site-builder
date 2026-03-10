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
 * Performs a timing-attack resistant comparison of two strings.
 * It hashes both inputs using SHA-256 before comparing them with `crypto.timingSafeEqual`
 * to avoid early return timing leaks on string length differences.
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
