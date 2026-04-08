## 2024-05-23 - [SSRF in File Download]
**Vulnerability:** Unrestricted file download via `fetch` allowing SSRF. The code only checked for `https://` prefix.
**Learning:** `startsWith("https://")` is insufficient protection against SSRF. Attackers can still access internal HTTPS services or use the server as a proxy to external sites. Redirects can also bypass initial checks.
**Prevention:** Always validate the hostname against a strict allowlist of trusted domains (e.g., Supabase storage). Disable redirects in `fetch` using `{ redirect: "error" }` when possible.

## 2024-05-24 - [Stored XSS in Offline Template]
**Vulnerability:** User-controlled URLs (e.g., `javascript:alert(1)`) injected into `src` attributes of downloaded HTML templates.
**Learning:** `z.string().url()` allows dangerous schemes like `javascript:`. Downloaded/offline HTML files execute scripts in a sensitive local context.
**Prevention:** Strictly validate URL schemes (allow only `http`/`https`) both at input validation (Zod) and output encoding (sanitize before interpolation).

## 2024-05-25 - [Timing Attack in Authorization Header Validation]
**Vulnerability:** Node.js V8 string comparisons (`===`) exit early on mismatched characters, which leaks secret characters via timing attacks. The `CRON_SECRET` was being checked using `===`.
**Learning:** Checking sensitive secrets with standard equality operators exposes the system to timing attacks, allowing an attacker to brute force the secret character by character by measuring response times.
**Prevention:** Always use a constant-time comparison function, like `crypto.timingSafeEqual` (via `safeCompare`), when comparing sensitive secrets such as authorization headers or API keys.
