## 2024-05-23 - [SSRF in File Download]
**Vulnerability:** Unrestricted file download via `fetch` allowing SSRF. The code only checked for `https://` prefix.
**Learning:** `startsWith("https://")` is insufficient protection against SSRF. Attackers can still access internal HTTPS services or use the server as a proxy to external sites. Redirects can also bypass initial checks.
**Prevention:** Always validate the hostname against a strict allowlist of trusted domains (e.g., Supabase storage). Disable redirects in `fetch` using `{ redirect: "error" }` when possible.

## 2024-05-24 - [Stored XSS in Offline Template]
**Vulnerability:** User-controlled URLs (e.g., `javascript:alert(1)`) injected into `src` attributes of downloaded HTML templates.
**Learning:** `z.string().url()` allows dangerous schemes like `javascript:`. Downloaded/offline HTML files execute scripts in a sensitive local context.
**Prevention:** Strictly validate URL schemes (allow only `http`/`https`) both at input validation (Zod) and output encoding (sanitize before interpolation).

## 2024-05-24 - [Timing Attack in Secret Comparison]
**Vulnerability:** Comparing sensitive secrets (like `CRON_SECRET`) using V8's string comparison (`===`) creates a timing side channel. V8 optimizes this operation by exiting early on the first mismatched character. An attacker can iteratively guess the secret by measuring the time taken for each request.
**Learning:** `===` is inherently insecure for comparing authentication tokens or API keys. Native `crypto.timingSafeEqual` should be used. However, `timingSafeEqual` throws an error if strings are of different lengths, which itself leaks the secret length.
**Prevention:** Always pre-hash both strings (e.g., using `crypto.createHash('sha256')`) to a fixed length before using `crypto.timingSafeEqual`. This mitigates both the character-by-character timing leak and the length leak.
