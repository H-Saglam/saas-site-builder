## 2024-05-23 - [SSRF in File Download]
**Vulnerability:** Unrestricted file download via `fetch` allowing SSRF. The code only checked for `https://` prefix.
**Learning:** `startsWith("https://")` is insufficient protection against SSRF. Attackers can still access internal HTTPS services or use the server as a proxy to external sites. Redirects can also bypass initial checks.
**Prevention:** Always validate the hostname against a strict allowlist of trusted domains (e.g., Supabase storage). Disable redirects in `fetch` using `{ redirect: "error" }` when possible.

## 2024-05-24 - [Stored XSS in Offline Template]
**Vulnerability:** User-controlled URLs (e.g., `javascript:alert(1)`) injected into `src` attributes of downloaded HTML templates.
**Learning:** `z.string().url()` allows dangerous schemes like `javascript:`. Downloaded/offline HTML files execute scripts in a sensitive local context.
**Prevention:** Strictly validate URL schemes (allow only `http`/`https`) both at input validation (Zod) and output encoding (sanitize before interpolation).

## 2025-02-18 - [Timing Attack in Auth Header Validation]
**Vulnerability:** The cron authorization header was compared using `===`, a V8 optimized fast-exit comparison. This leaked the length and contents of the valid `CRON_SECRET` through timing differences.
**Learning:** Node's standard string comparison operations are not safe for comparing secrets because they exit early on mismatched characters, which creates measurable differences in execution time.
**Prevention:** For comparing authorization headers or other secrets of potentially differing lengths, hash both strings (e.g., `sha256`) before passing to `crypto.timingSafeEqual` as seen in `safeCompare`.
