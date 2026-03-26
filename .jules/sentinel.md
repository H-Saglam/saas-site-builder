## 2024-05-23 - [SSRF in File Download]
**Vulnerability:** Unrestricted file download via `fetch` allowing SSRF. The code only checked for `https://` prefix.
**Learning:** `startsWith("https://")` is insufficient protection against SSRF. Attackers can still access internal HTTPS services or use the server as a proxy to external sites. Redirects can also bypass initial checks.
**Prevention:** Always validate the hostname against a strict allowlist of trusted domains (e.g., Supabase storage). Disable redirects in `fetch` using `{ redirect: "error" }` when possible.

## 2024-05-24 - [Stored XSS in Offline Template]
**Vulnerability:** User-controlled URLs (e.g., `javascript:alert(1)`) injected into `src` attributes of downloaded HTML templates.
**Learning:** `z.string().url()` allows dangerous schemes like `javascript:`. Downloaded/offline HTML files execute scripts in a sensitive local context.
**Prevention:** Strictly validate URL schemes (allow only `http`/`https`) both at input validation (Zod) and output encoding (sanitize before interpolation).

## 2025-02-18 - [Timing Attack in Authorization Header]
**Vulnerability:** Standard string comparison (`===`) was used to check the `authorization` header against the expected `Bearer ${secret}` token.
**Learning:** Node.js V8 string comparisons optimize aggressively by exiting early on mismatched characters, which leaks secret characters via timing attacks.
**Prevention:** Always use `crypto.timingSafeEqual` after hashing inputs with SHA-256 for comparing sensitive secrets (like authorization headers) to ensure both inputs have the same length and avoid leaking lengths or characters. Use `safeCompare` from `src/lib/security-server.ts`.
