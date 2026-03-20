## 2024-05-23 - [SSRF in File Download]
**Vulnerability:** Unrestricted file download via `fetch` allowing SSRF. The code only checked for `https://` prefix.
**Learning:** `startsWith("https://")` is insufficient protection against SSRF. Attackers can still access internal HTTPS services or use the server as a proxy to external sites. Redirects can also bypass initial checks.
**Prevention:** Always validate the hostname against a strict allowlist of trusted domains (e.g., Supabase storage). Disable redirects in `fetch` using `{ redirect: "error" }` when possible.

## 2024-05-24 - [Stored XSS in Offline Template]
**Vulnerability:** User-controlled URLs (e.g., `javascript:alert(1)`) injected into `src` attributes of downloaded HTML templates.
**Learning:** `z.string().url()` allows dangerous schemes like `javascript:`. Downloaded/offline HTML files execute scripts in a sensitive local context.
**Prevention:** Strictly validate URL schemes (allow only `http`/`https`) both at input validation (Zod) and output encoding (sanitize before interpolation).

## 2024-05-25 - [Timing Attack in Cron Route Authorization]
**Vulnerability:** The cron job authorization in `src/app/api/cron/retention-notifications/route.ts` used standard string equality (`===`) to compare the provided `Authorization` header against the expected `CRON_SECRET`.
**Learning:** Standard string equality checks evaluate character by character and return early upon the first mismatch, allowing attackers to incrementally brute-force the secret by measuring response times (timing attack).
**Prevention:** Always use a timing-safe string comparison function (like `crypto.timingSafeEqual`) for sensitive string comparisons, such as verifying authorization tokens or webhook signatures. Hashing both strings before comparison ensures they are of equal length, avoiding length-based timing leaks.
