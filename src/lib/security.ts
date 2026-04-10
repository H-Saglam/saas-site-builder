/**
 * Validates if a URL is safe to fetch (e.g. from allowed domains).
 * Currently only allows URLs from the configured Supabase project.
 *
 * @param url The URL to validate.
 * @returns true if the URL is safe, false otherwise.
 */
import crypto from "node:crypto";

/**
 * Performs a timing-safe string comparison to prevent timing attacks.
 *
 * @param a The first string.
 * @param b The second string.
 * @returns true if the strings are exactly equal, false otherwise.
 */
export function safeCompare(a: string | null | undefined, b: string | null | undefined): boolean {
  if (typeof a !== "string" || typeof b !== "string") {
    return false;
  }

  if (a.length !== b.length) {
    return false;
  }

  try {
    const bufferA = Buffer.from(a);
    const bufferB = Buffer.from(b);
    return crypto.timingSafeEqual(bufferA, bufferB);
  } catch {
    return false;
  }
}

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
