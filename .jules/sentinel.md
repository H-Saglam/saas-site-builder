## 2024-05-23 - [SSRF in File Download]
**Vulnerability:** Unrestricted file download via `fetch` allowing SSRF. The code only checked for `https://` prefix.
**Learning:** `startsWith("https://")` is insufficient protection against SSRF. Attackers can still access internal HTTPS services or use the server as a proxy to external sites. Redirects can also bypass initial checks.
**Prevention:** Always validate the hostname against a strict allowlist of trusted domains (e.g., Supabase storage). Disable redirects in `fetch` using `{ redirect: "error" }` when possible.

## 2024-05-24 - [Stored XSS in Offline Template]
**Vulnerability:** User-controlled URLs (e.g., `javascript:alert(1)`) injected into `src` attributes of downloaded HTML templates.
**Learning:** `z.string().url()` allows dangerous schemes like `javascript:`. Downloaded/offline HTML files execute scripts in a sensitive local context.
**Prevention:** Strictly validate URL schemes (allow only `http`/`https`) both at input validation (Zod) and output encoding (sanitize before interpolation).

## 2024-05-25 - [Timing Attack in Secret Comparison]
**Vulnerability:** Comparing sensitive secrets (like `CRON_SECRET` in `Authorization` headers) using the basic `===` operator.
**Learning:** Basic string comparison operators exit early as soon as a character mismatch is found. This leaks the length and partial content of the expected secret via timing side-channels, allowing an attacker to brute-force the secret character by character. `crypto.timingSafeEqual` alone is not enough if strings have different lengths, as it will throw or leak the length.
**Prevention:** Implement and use a `safeCompare` utility that first hashes both inputs (e.g., using SHA-256) to ensure constant length buffers, then compares the hashes using `crypto.timingSafeEqual`.
