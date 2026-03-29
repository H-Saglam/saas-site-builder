## 2024-05-23 - [SSRF in File Download]
**Vulnerability:** Unrestricted file download via `fetch` allowing SSRF. The code only checked for `https://` prefix.
**Learning:** `startsWith("https://")` is insufficient protection against SSRF. Attackers can still access internal HTTPS services or use the server as a proxy to external sites. Redirects can also bypass initial checks.
**Prevention:** Always validate the hostname against a strict allowlist of trusted domains (e.g., Supabase storage). Disable redirects in `fetch` using `{ redirect: "error" }` when possible.

## 2024-05-24 - [Stored XSS in Offline Template]
**Vulnerability:** User-controlled URLs (e.g., `javascript:alert(1)`) injected into `src` attributes of downloaded HTML templates.
**Learning:** `z.string().url()` allows dangerous schemes like `javascript:`. Downloaded/offline HTML files execute scripts in a sensitive local context.
**Prevention:** Strictly validate URL schemes (allow only `http`/`https`) both at input validation (Zod) and output encoding (sanitize before interpolation).

## 2025-02-18 - [Timing Attack on Cron Authorization]
**Vulnerability:** Comparing the `Authorization` header directly against a secret environment variable using the standard equality operator (`===`), which exits early when characters do not match.
**Learning:** Node.js V8 string comparisons are vulnerable to timing attacks, leaking secret characters via early exits. Comparing security-sensitive secrets requires constant-time evaluation.
**Prevention:** Use a timing-safe string comparison function (e.g., `safeCompare` which hashes strings with SHA-256 before `crypto.timingSafeEqual`) for all sensitive string comparisons. Note that this logic must be server-side to prevent client-side build breakages from `node:crypto`.
