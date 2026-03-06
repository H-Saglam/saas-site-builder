## 2024-05-23 - [SSRF in File Download]
**Vulnerability:** Unrestricted file download via `fetch` allowing SSRF. The code only checked for `https://` prefix.
**Learning:** `startsWith("https://")` is insufficient protection against SSRF. Attackers can still access internal HTTPS services or use the server as a proxy to external sites. Redirects can also bypass initial checks.
**Prevention:** Always validate the hostname against a strict allowlist of trusted domains (e.g., Supabase storage). Disable redirects in `fetch` using `{ redirect: "error" }` when possible.

## 2024-05-24 - [Stored XSS in Offline Template]
**Vulnerability:** User-controlled URLs (e.g., `javascript:alert(1)`) injected into `src` attributes of downloaded HTML templates.
**Learning:** `z.string().url()` allows dangerous schemes like `javascript:`. Downloaded/offline HTML files execute scripts in a sensitive local context.
**Prevention:** Strictly validate URL schemes (allow only `http`/`https`) both at input validation (Zod) and output encoding (sanitize before interpolation).

## 2024-05-25 - [Timing Attack in Authorization Headers]
**Vulnerability:** Timing attack via standard string comparison (`===`) when validating secrets like `CRON_SECRET` in HTTP headers.
**Learning:** Comparing sensitive secrets with `===` fails fast, revealing the first non-matching character's position through response latency. This allows attackers to brute-force the secret character by character.
**Prevention:** Always use timing-safe string comparison. When comparing standard strings, hash both strings first (e.g., using SHA-256) and then compare the hashes using `crypto.timingSafeEqual`. This ensures the comparison time is constant regardless of the string content.
