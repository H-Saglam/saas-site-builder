## 2024-05-23 - [SSRF in File Download]
**Vulnerability:** Unrestricted file download via `fetch` allowing SSRF. The code only checked for `https://` prefix.
**Learning:** `startsWith("https://")` is insufficient protection against SSRF. Attackers can still access internal HTTPS services or use the server as a proxy to external sites. Redirects can also bypass initial checks.
**Prevention:** Always validate the hostname against a strict allowlist of trusted domains (e.g., Supabase storage). Disable redirects in `fetch` using `{ redirect: "error" }` when possible.

## 2024-05-24 - [Stored XSS in Offline Template]
**Vulnerability:** User-controlled URLs (e.g., `javascript:alert(1)`) injected into `src` attributes of downloaded HTML templates.
**Learning:** `z.string().url()` allows dangerous schemes like `javascript:`. Downloaded/offline HTML files execute scripts in a sensitive local context.
**Prevention:** Strictly validate URL schemes (allow only `http`/`https`) both at input validation (Zod) and output encoding (sanitize before interpolation).

## 2024-05-24 - [Timing Attack in Auth Header Validation]
**Vulnerability:** Node.js V8 string comparisons (`===`) were used to validate the `CRON_SECRET` authorization header.
**Learning:** Node.js V8 optimizes string comparisons by exiting early on mismatched characters, which leaks secret characters via timing attacks. Standard strict equality (`===`) should never be used for comparing sensitive secrets.
**Prevention:** Always use a timing-safe comparison utility (e.g., `safeCompare` which hashes inputs with SHA-256 before using `crypto.timingSafeEqual`) for comparing sensitive secrets, such as authorization headers or API tokens.
