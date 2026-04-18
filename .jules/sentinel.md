## 2024-05-23 - [SSRF in File Download]
**Vulnerability:** Unrestricted file download via `fetch` allowing SSRF. The code only checked for `https://` prefix.
**Learning:** `startsWith("https://")` is insufficient protection against SSRF. Attackers can still access internal HTTPS services or use the server as a proxy to external sites. Redirects can also bypass initial checks.
**Prevention:** Always validate the hostname against a strict allowlist of trusted domains (e.g., Supabase storage). Disable redirects in `fetch` using `{ redirect: "error" }` when possible.

## 2024-05-24 - [Stored XSS in Offline Template]
**Vulnerability:** User-controlled URLs (e.g., `javascript:alert(1)`) injected into `src` attributes of downloaded HTML templates.
**Learning:** `z.string().url()` allows dangerous schemes like `javascript:`. Downloaded/offline HTML files execute scripts in a sensitive local context.
**Prevention:** Strictly validate URL schemes (allow only `http`/`https`) both at input validation (Zod) and output encoding (sanitize before interpolation).

## 2024-05-24 - [Timing Attack in Authorization Header]
**Vulnerability:** Comparing the `Authorization` header directly using the `===` operator allows an attacker to guess the `CRON_SECRET` character by character using timing attacks (V8 string comparison exits early on mismatched characters).
**Learning:** Node.js V8's strict equality (`===`) is optimized for speed, inherently leaking string length and content through execution time variations. The `cron` routes used this insecure operator for verifying shared secrets.
**Prevention:** Always use `node:crypto`'s `timingSafeEqual` (via a safe wrapper that handles varying lengths, e.g., hashing before comparing) when verifying tokens, passwords, or secrets to ensure constant-time comparison.
