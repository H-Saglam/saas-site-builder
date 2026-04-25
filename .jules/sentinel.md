## 2024-05-23 - [SSRF in File Download]
**Vulnerability:** Unrestricted file download via `fetch` allowing SSRF. The code only checked for `https://` prefix.
**Learning:** `startsWith("https://")` is insufficient protection against SSRF. Attackers can still access internal HTTPS services or use the server as a proxy to external sites. Redirects can also bypass initial checks.
**Prevention:** Always validate the hostname against a strict allowlist of trusted domains (e.g., Supabase storage). Disable redirects in `fetch` using `{ redirect: "error" }` when possible.

## 2024-05-24 - [Stored XSS in Offline Template]
**Vulnerability:** User-controlled URLs (e.g., `javascript:alert(1)`) injected into `src` attributes of downloaded HTML templates.
**Learning:** `z.string().url()` allows dangerous schemes like `javascript:`. Downloaded/offline HTML files execute scripts in a sensitive local context.
**Prevention:** Strictly validate URL schemes (allow only `http`/`https`) both at input validation (Zod) and output encoding (sanitize before interpolation).
## 2025-04-25 - Timing Attack Vulnerability in Authorization Headers
**Vulnerability:** The retention notification cron endpoint used a standard string comparison (`===`) to verify the Bearer token in the Authorization header. This leaks the secret length and characters via timing attacks because Node.js V8 exits the comparison early on the first mismatched character.
**Learning:** Even internal or cron endpoints that rely on static secrets are vulnerable to timing attacks if standard equality operators are used. The issue is exacerbated when comparing strings of unknown or varying lengths, as native constant-time functions (like `crypto.timingSafeEqual`) throw errors if lengths differ.
**Prevention:** Always use a secure string comparison function (e.g., `safeCompare` utilizing `crypto.timingSafeEqual` with pre-hashing using SHA-256) when validating authorization tokens, API keys, or any sensitive secrets to ensure the comparison executes in constant time regardless of input length or content.
