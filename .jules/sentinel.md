## 2024-05-23 - [SSRF in File Download]
**Vulnerability:** Unrestricted file download via `fetch` allowing SSRF. The code only checked for `https://` prefix.
**Learning:** `startsWith("https://")` is insufficient protection against SSRF. Attackers can still access internal HTTPS services or use the server as a proxy to external sites. Redirects can also bypass initial checks.
**Prevention:** Always validate the hostname against a strict allowlist of trusted domains (e.g., Supabase storage). Disable redirects in `fetch` using `{ redirect: "error" }` when possible.

## 2024-05-24 - [Stored XSS in Offline Template]
**Vulnerability:** User-controlled URLs (e.g., `javascript:alert(1)`) injected into `src` attributes of downloaded HTML templates.
**Learning:** `z.string().url()` allows dangerous schemes like `javascript:`. Downloaded/offline HTML files execute scripts in a sensitive local context.
**Prevention:** Strictly validate URL schemes (allow only `http`/`https`) both at input validation (Zod) and output encoding (sanitize before interpolation).

## 2024-05-25 - [Timing Attack in Auth Check]
**Vulnerability:** String equality operator `===` was used to compare the Authorization header against the expected CRON_SECRET token. This allows an attacker to brute force the secret character by character by measuring the response time, which slightly increases when a character matches.
**Learning:** `===` or `==` comparison logic terminates as soon as a mismatch occurs, leaking time difference and exposing sensitive secrets. The length of the token can also be inferred if length checking is not decoupled from the comparison loop.
**Prevention:** Use a timing-safe equality check function (such as `crypto.timingSafeEqual`) for comparing any sensitive tokens, API keys, passwords, or signatures. Ensure that any length variations are handled in a manner that takes consistent time.
