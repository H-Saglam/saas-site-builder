## 2024-05-23 - [SSRF in File Download]
**Vulnerability:** Unrestricted file download via `fetch` allowing SSRF. The code only checked for `https://` prefix.
**Learning:** `startsWith("https://")` is insufficient protection against SSRF. Attackers can still access internal HTTPS services or use the server as a proxy to external sites. Redirects can also bypass initial checks.
**Prevention:** Always validate the hostname against a strict allowlist of trusted domains (e.g., Supabase storage). Disable redirects in `fetch` using `{ redirect: "error" }` when possible.

## 2024-05-24 - [Stored XSS in Offline Template]
**Vulnerability:** User-controlled URLs (e.g., `javascript:alert(1)`) injected into `src` attributes of downloaded HTML templates.
**Learning:** `z.string().url()` allows dangerous schemes like `javascript:`. Downloaded/offline HTML files execute scripts in a sensitive local context.
**Prevention:** Strictly validate URL schemes (allow only `http`/`https`) both at input validation (Zod) and output encoding (sanitize before interpolation).

## 2024-05-25 - [Timing Attack in Authorization Check]
**Vulnerability:** Direct string comparison (`===`) used for verifying the `Authorization` header against `CRON_SECRET` in `src/app/api/cron/retention-notifications/route.ts`.
**Learning:** String comparison using `===` exits early on the first mismatch, allowing an attacker to guess the secret character by character by measuring response times.
**Prevention:** Use a timing-safe comparison function (e.g., `safeCompare` utilizing `crypto.timingSafeEqual` over SHA-256 hashes) for all sensitive string matching, including API keys and webhook signatures.
