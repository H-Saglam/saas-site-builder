## 2024-05-23 - [SSRF in File Download]
**Vulnerability:** Unrestricted file download via `fetch` allowing SSRF. The code only checked for `https://` prefix.
**Learning:** `startsWith("https://")` is insufficient protection against SSRF. Attackers can still access internal HTTPS services or use the server as a proxy to external sites. Redirects can also bypass initial checks.
**Prevention:** Always validate the hostname against a strict allowlist of trusted domains (e.g., Supabase storage). Disable redirects in `fetch` using `{ redirect: "error" }` when possible.

## 2024-05-24 - [Stored XSS in Offline Template]
**Vulnerability:** User-controlled URLs (e.g., `javascript:alert(1)`) injected into `src` attributes of downloaded HTML templates.
**Learning:** `z.string().url()` allows dangerous schemes like `javascript:`. Downloaded/offline HTML files execute scripts in a sensitive local context.
**Prevention:** Strictly validate URL schemes (allow only `http`/`https`) both at input validation (Zod) and output encoding (sanitize before interpolation).

## 2024-05-25 - [Timing Attack in Authorization Headers]
**Vulnerability:** Comparing sensitive secrets, such as authorization headers, using standard V8 string comparison (`===`) leaks secret characters via timing attacks because the comparison exits early on mismatched characters.
**Learning:** `===` should never be used for comparing sensitive data like tokens or secrets. Attackers can statistically guess the secret by measuring the time the server takes to respond.
**Prevention:** Always use `safeCompare` (which utilizes `crypto.timingSafeEqual`) for comparing sensitive strings. It hashes inputs with SHA-256 before using `crypto.timingSafeEqual` to prevent both early-exit and length-leakage timing attacks.
