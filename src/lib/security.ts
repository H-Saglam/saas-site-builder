/**
 * Validates if a URL is safe to fetch (e.g. from allowed domains).
 * Currently only allows URLs from the configured Supabase project.
 *
 * @param url The URL to validate.
 * @returns true if the URL is safe, false otherwise.
 */
const MAX_RATE_LIMIT_ENTRIES = 1000;
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

/**
 * Validates and updates the rate limit for a given key (e.g. IP address).
 * Uses a bounded Map to prevent Out-Of-Memory (OOM) attacks.
 *
 * @param key The identifier to rate limit (e.g., IP address).
 * @param maxAttempts Maximum allowed attempts within the time window.
 * @param windowMs Time window in milliseconds.
 * @returns true if allowed, false if rate limited.
 */
export function checkRateLimit(key: string, maxAttempts: number = 5, windowMs: number = 60_000): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetAt) {
    // If map is full, delete the first entry (oldest insertion) to prevent OOM
    if (rateLimitMap.size >= MAX_RATE_LIMIT_ENTRIES) {
      const firstKey = rateLimitMap.keys().next().value;
      if (firstKey) rateLimitMap.delete(firstKey);
    }
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (record.count >= maxAttempts) {
    return false;
  }

  record.count++;
  return true;
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
