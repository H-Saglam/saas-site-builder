import crypto from "node:crypto";

const MAX_RATE_LIMIT_ENTRIES = 1000;
const attempts = new Map<string, { count: number; resetAt: number }>();

/**
 * Checks if a given IP has exceeded the rate limit.
 * Uses a bounded Map to prevent OOM Denial of Service attacks.
 * Limits to 5 attempts per minute.
 *
 * @param ip The IP address to check.
 * @returns true if the request is allowed, false if rate limited.
 */
export function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = attempts.get(ip);

  if (!record || now > record.resetAt) {
    if (attempts.size >= MAX_RATE_LIMIT_ENTRIES) {
      // O(1) eviction of oldest element
      const firstKey = attempts.keys().next().value;
      if (firstKey !== undefined) {
        attempts.delete(firstKey);
      }
    }
    attempts.set(ip, { count: 1, resetAt: now + 60_000 }); // 1 minute
    return true;
  }

  if (record.count >= 5) {
    return false; // 5 attempts/minute limit
  }

  record.count++;
  return true;
}

/**
 * Safely compares two strings using a constant-time algorithm to prevent timing attacks.
 *
 * @param a The first string.
 * @param b The second string.
 * @returns true if the strings are strictly equal, false otherwise.
 */
export function safeCompare(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') {
    return false;
  }
  const bufferA = Buffer.from(a, 'utf8');
  const bufferB = Buffer.from(b, 'utf8');

  if (bufferA.length !== bufferB.length) {
    return false;
  }
  return crypto.timingSafeEqual(bufferA, bufferB);
}

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
