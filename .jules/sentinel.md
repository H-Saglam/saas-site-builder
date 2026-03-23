## 2024-05-23 - [SSRF in File Download]
**Vulnerability:** Unrestricted file download via `fetch` allowing SSRF. The code only checked for `https://` prefix.
**Learning:** `startsWith("https://")` is insufficient protection against SSRF. Attackers can still access internal HTTPS services or use the server as a proxy to external sites. Redirects can also bypass initial checks.
**Prevention:** Always validate the hostname against a strict allowlist of trusted domains (e.g., Supabase storage). Disable redirects in `fetch` using `{ redirect: "error" }` when possible.

## 2024-05-24 - [Stored XSS in Offline Template]
**Vulnerability:** User-controlled URLs (e.g., `javascript:alert(1)`) injected into `src` attributes of downloaded HTML templates.
**Learning:** `z.string().url()` allows dangerous schemes like `javascript:`. Downloaded/offline HTML files execute scripts in a sensitive local context.
**Prevention:** Strictly validate URL schemes (allow only `http`/`https`) both at input validation (Zod) and output encoding (sanitize before interpolation).

## 2024-05-25 - [Timing Attack in Authorization Headers]
**Vulnerability:** String equality (`===`) used to compare `Authorization` headers with `CRON_SECRET` leaks secret characters via timing attacks due to V8's early exit optimization.
**Learning:** Node.js V8 string comparison exits early on mismatched characters, which can allow an attacker to brute force secrets by observing response times.
**Prevention:** Always use a constant-time comparison (e.g., `crypto.timingSafeEqual`) for sensitive secrets like authorization tokens or passwords. Implement a `safeCompare` utility that hashes inputs with SHA-256 before comparison to prevent length mismatch errors and time-based length leaks.
