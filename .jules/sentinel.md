## 2024-05-23 - [SSRF in File Download]
**Vulnerability:** Unrestricted file download via `fetch` allowing SSRF. The code only checked for `https://` prefix.
**Learning:** `startsWith("https://")` is insufficient protection against SSRF. Attackers can still access internal HTTPS services or use the server as a proxy to external sites. Redirects can also bypass initial checks.
**Prevention:** Always validate the hostname against a strict allowlist of trusted domains (e.g., Supabase storage). Disable redirects in `fetch` using `{ redirect: "error" }` when possible.

## 2024-05-24 - [Stored XSS in Offline Template]
**Vulnerability:** User-controlled URLs (e.g., `javascript:alert(1)`) injected into `src` attributes of downloaded HTML templates.
**Learning:** `z.string().url()` allows dangerous schemes like `javascript:`. Downloaded/offline HTML files execute scripts in a sensitive local context.
**Prevention:** Strictly validate URL schemes (allow only `http`/`https`) both at input validation (Zod) and output encoding (sanitize before interpolation).

## 2024-05-25 - [Timing Attack in Authorization Headers]
**Vulnerability:** Comparing `authorization` headers against secrets using the strict equality operator (`===`) allows timing attacks, exposing the secret character-by-character based on response time differences.
**Learning:** Standard string equality (`===`) fails fast on the first mismatching character. When checking sensitive secrets (like `CRON_SECRET`), this gives attackers a way to guess the secret.
**Prevention:** Always use a constant-time comparison algorithm, such as `crypto.timingSafeEqual`. A reusable pattern is to hash both input and expected strings with SHA-256 before comparison to safely handle strings of differing lengths. I've added a `safeCompare` utility function for this in `@/lib/security`.
