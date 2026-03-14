## 2024-05-23 - [SSRF in File Download]
**Vulnerability:** Unrestricted file download via `fetch` allowing SSRF. The code only checked for `https://` prefix.
**Learning:** `startsWith("https://")` is insufficient protection against SSRF. Attackers can still access internal HTTPS services or use the server as a proxy to external sites. Redirects can also bypass initial checks.
**Prevention:** Always validate the hostname against a strict allowlist of trusted domains (e.g., Supabase storage). Disable redirects in `fetch` using `{ redirect: "error" }` when possible.

## 2024-05-24 - [Stored XSS in Offline Template]
**Vulnerability:** User-controlled URLs (e.g., `javascript:alert(1)`) injected into `src` attributes of downloaded HTML templates.
**Learning:** `z.string().url()` allows dangerous schemes like `javascript:`. Downloaded/offline HTML files execute scripts in a sensitive local context.
**Prevention:** Strictly validate URL schemes (allow only `http`/`https`) both at input validation (Zod) and output encoding (sanitize before interpolation).

## 2026-03-14 - [Timing Attack in Authorization Checks]
**Vulnerability:** Direct string comparison (`===`) used for verifying authorization tokens and secrets (e.g., `authorization === "Bearer " + secret`).
**Learning:** Standard string comparisons in JavaScript short-circuit upon finding the first non-matching character. This exposes the application to timing attacks, allowing attackers to guess secrets character by character by measuring response times.
**Prevention:** Always use a constant-time comparison utility for secrets, passwords, tokens, and signatures. In Node.js environments, use `crypto.timingSafeEqual` after ensuring inputs are the same length (e.g., by hashing them first).
