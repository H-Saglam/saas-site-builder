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
 * Safely compares two strings to prevent timing attacks.
 * @param a First string
 * @param b Second string
 * @returns true if the strings are strictly equal, false otherwise.
 */
export function safeCompare(a: string | null | undefined, b: string | null | undefined): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') {
    return false;
  }

  if (a.length !== b.length) {
    return false;
  }

  try {
    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
  } catch {
    return false;
  }
}

const MAX_RATE_LIMIT_ENTRIES = 1000;
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

/**
 * A centralized, bounded in-memory rate limiter to prevent OOM DOS attacks.
 * Limits to 5 requests per minute per IP.
 * @param ip The IP address or identifier to rate limit.
 * @returns true if the request is allowed, false if rate limited.
 */
export function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetAt) {
    // If the map is full, evict the oldest entry to prevent memory exhaustion
    if (rateLimitMap.size >= MAX_RATE_LIMIT_ENTRIES) {
      const firstKey = rateLimitMap.keys().next().value;
      if (firstKey) {
        rateLimitMap.delete(firstKey);
      }
    }

    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 }); // 1 minute
    return true;
  }

  if (record.count >= 5) {
    return false; // 5 attempts per minute limit
  }

  record.count++;
  return true;
}
