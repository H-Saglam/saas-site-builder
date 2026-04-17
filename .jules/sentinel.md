## 2024-05-23 - [SSRF in File Download]
**Vulnerability:** Unrestricted file download via `fetch` allowing SSRF. The code only checked for `https://` prefix.
**Learning:** `startsWith("https://")` is insufficient protection against SSRF. Attackers can still access internal HTTPS services or use the server as a proxy to external sites. Redirects can also bypass initial checks.
**Prevention:** Always validate the hostname against a strict allowlist of trusted domains (e.g., Supabase storage). Disable redirects in `fetch` using `{ redirect: "error" }` when possible.

## 2024-05-24 - [Stored XSS in Offline Template]
**Vulnerability:** User-controlled URLs (e.g., `javascript:alert(1)`) injected into `src` attributes of downloaded HTML templates.
**Learning:** `z.string().url()` allows dangerous schemes like `javascript:`. Downloaded/offline HTML files execute scripts in a sensitive local context.
**Prevention:** Strictly validate URL schemes (allow only `http`/`https`) both at input validation (Zod) and output encoding (sanitize before interpolation).
## 2024-05-24 - Prevent Timing Attacks on Secrets
**Vulnerability:** Node.js standard string comparison (`===`) exits early upon finding a mismatched character, leaking the length of matching characters. This allows an attacker to guess a secret character by character by measuring response times (timing attack).
**Learning:** Security-sensitive strings such as API keys, authorization tokens, or bypass passwords were compared using `===`. Because V8 string comparisons are heavily optimized, they are vulnerable to timing attacks.
**Prevention:** Always use a constant-time comparison algorithm, such as `crypto.timingSafeEqual`, when comparing sensitive strings or hashes. A `safeCompare` utility function was implemented in `src/lib/security.ts` to abstract this and ensure robustness even when strings are of different lengths or null.
