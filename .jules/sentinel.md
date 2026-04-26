## 2024-05-23 - [SSRF in File Download]
**Vulnerability:** Unrestricted file download via `fetch` allowing SSRF. The code only checked for `https://` prefix.
**Learning:** `startsWith("https://")` is insufficient protection against SSRF. Attackers can still access internal HTTPS services or use the server as a proxy to external sites. Redirects can also bypass initial checks.
**Prevention:** Always validate the hostname against a strict allowlist of trusted domains (e.g., Supabase storage). Disable redirects in `fetch` using `{ redirect: "error" }` when possible.

## 2024-05-24 - [Stored XSS in Offline Template]
**Vulnerability:** User-controlled URLs (e.g., `javascript:alert(1)`) injected into `src` attributes of downloaded HTML templates.
**Learning:** `z.string().url()` allows dangerous schemes like `javascript:`. Downloaded/offline HTML files execute scripts in a sensitive local context.
**Prevention:** Strictly validate URL schemes (allow only `http`/`https`) both at input validation (Zod) and output encoding (sanitize before interpolation).
## 2024-05-18 - Timing Attack Vulnerability in Secret Comparison
**Vulnerability:** String comparison (`===`) was used for checking a secret in the `Authorization` header for a cron endpoint (`src/app/api/cron/retention-notifications/route.ts`).
**Learning:** V8 engine optimizes standard string comparisons by returning immediately upon the first mismatched character. This early exit leaks the length of the secret and makes the application vulnerable to timing attacks, where an attacker can brute-force the secret one character at a time. Node `crypto.timingSafeEqual` prevents this by taking constant time, but it natively throws if strings have different lengths.
**Prevention:** Always use a constant-time comparison function for sensitive data. Implemented a `safeCompare` utility in `src/lib/security.ts` that hashes both strings first (to safely handle varying lengths without leaking length information) and then uses `crypto.timingSafeEqual` to securely compare the hashes in constant time.
