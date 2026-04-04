## 2024-05-23 - [SSRF in File Download]
**Vulnerability:** Unrestricted file download via `fetch` allowing SSRF. The code only checked for `https://` prefix.
**Learning:** `startsWith("https://")` is insufficient protection against SSRF. Attackers can still access internal HTTPS services or use the server as a proxy to external sites. Redirects can also bypass initial checks.
**Prevention:** Always validate the hostname against a strict allowlist of trusted domains (e.g., Supabase storage). Disable redirects in `fetch` using `{ redirect: "error" }` when possible.

## 2024-05-24 - [Stored XSS in Offline Template]
**Vulnerability:** User-controlled URLs (e.g., `javascript:alert(1)`) injected into `src` attributes of downloaded HTML templates.
**Learning:** `z.string().url()` allows dangerous schemes like `javascript:`. Downloaded/offline HTML files execute scripts in a sensitive local context.
**Prevention:** Strictly validate URL schemes (allow only `http`/`https`) both at input validation (Zod) and output encoding (sanitize before interpolation).

## 2026-04-04 - [Timing Attack in Authorization Header]
**Vulnerability:** Comparing an authorization header token to a secret using the standard `===` operator.
**Learning:** The V8 engine implements string comparison with early exit optimizations, breaking the constant time guarantee. An attacker could brute force the secret by observing the time taken to check invalid characters.
**Prevention:** Always use `crypto.timingSafeEqual` for comparing secrets, authorization headers or tokens. A wrapper function that hashes both inputs first can be used to compare strings safely.
