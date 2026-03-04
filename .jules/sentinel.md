## 2024-05-23 - [SSRF in File Download]
**Vulnerability:** Unrestricted file download via `fetch` allowing SSRF. The code only checked for `https://` prefix.
**Learning:** `startsWith("https://")` is insufficient protection against SSRF. Attackers can still access internal HTTPS services or use the server as a proxy to external sites. Redirects can also bypass initial checks.
**Prevention:** Always validate the hostname against a strict allowlist of trusted domains (e.g., Supabase storage). Disable redirects in `fetch` using `{ redirect: "error" }` when possible.

## 2024-05-24 - [Stored XSS in Offline Template]
**Vulnerability:** User-controlled URLs (e.g., `javascript:alert(1)`) injected into `src` attributes of downloaded HTML templates.
**Learning:** `z.string().url()` allows dangerous schemes like `javascript:`. Downloaded/offline HTML files execute scripts in a sensitive local context.
**Prevention:** Strictly validate URL schemes (allow only `http`/`https`) both at input validation (Zod) and output encoding (sanitize before interpolation).

## 2024-05-25 - [Timing Attack on Cron Endpoint]
**Vulnerability:** The retention cron endpoint validated the `authorization` header using strict equality (`===`), making it vulnerable to a timing attack where an attacker could theoretically brute-force the `CRON_SECRET` character by character.
**Learning:** Comparing sensitive secrets (like tokens or API keys) with non-constant-time equality operators (`===` or `==`) allows timing attacks to leak the string length or its contents over multiple requests.
**Prevention:** Always use `crypto.timingSafeEqual` (wrapped in a utility like `safeCompare` to handle different lengths and hashing) to compare sensitive strings.
