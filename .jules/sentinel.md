## 2024-05-23 - [SSRF in File Download]
**Vulnerability:** Unrestricted file download via `fetch` allowing SSRF. The code only checked for `https://` prefix.
**Learning:** `startsWith("https://")` is insufficient protection against SSRF. Attackers can still access internal HTTPS services or use the server as a proxy to external sites. Redirects can also bypass initial checks.
**Prevention:** Always validate the hostname against a strict allowlist of trusted domains (e.g., Supabase storage). Disable redirects in `fetch` using `{ redirect: "error" }` when possible.

## 2024-05-24 - [Stored XSS in Offline Template]
**Vulnerability:** User-controlled URLs (e.g., `javascript:alert(1)`) injected into `src` attributes of downloaded HTML templates.
**Learning:** `z.string().url()` allows dangerous schemes like `javascript:`. Downloaded/offline HTML files execute scripts in a sensitive local context.
**Prevention:** Strictly validate URL schemes (allow only `http`/`https`) both at input validation (Zod) and output encoding (sanitize before interpolation).

## 2024-05-25 - [Timing Attack in Authorization Headers]
**Vulnerability:** API routes verifying authorization tokens (like `CRON_SECRET`) used the standard `===` operator for string comparison.
**Learning:** Standard string equality checks return early when characters don't match, allowing an attacker to determine the correct secret character-by-character by measuring the response time (Timing Attack).
**Prevention:** Always use `crypto.timingSafeEqual` for comparing secrets, API keys, or tokens. For strings of potentially different lengths or unknown encodings, securely hash both strings with SHA-256 before comparison to prevent length-based early returns.
