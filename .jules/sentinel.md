## 2024-05-23 - [SSRF in File Download]
**Vulnerability:** Unrestricted file download via `fetch` allowing SSRF. The code only checked for `https://` prefix.
**Learning:** `startsWith("https://")` is insufficient protection against SSRF. Attackers can still access internal HTTPS services or use the server as a proxy to external sites. Redirects can also bypass initial checks.
**Prevention:** Always validate the hostname against a strict allowlist of trusted domains (e.g., Supabase storage). Disable redirects in `fetch` using `{ redirect: "error" }` when possible.

## 2024-05-24 - [Stored XSS in Offline Template]
**Vulnerability:** User-controlled URLs (e.g., `javascript:alert(1)`) injected into `src` attributes of downloaded HTML templates.
**Learning:** `z.string().url()` allows dangerous schemes like `javascript:`. Downloaded/offline HTML files execute scripts in a sensitive local context.
**Prevention:** Strictly validate URL schemes (allow only `http`/`https`) both at input validation (Zod) and output encoding (sanitize before interpolation).

## 2024-05-25 - [Timing Attack in CRON Authorization]
**Vulnerability:** The CRON endpoint used `===` to compare the `Authorization` header with the expected `CRON_SECRET`.
**Learning:** String comparisons using `===` fail early as soon as a mismatch is found. This allows an attacker to measure the time it takes for the response to return and guess the secret character by character (Timing Attack).
**Prevention:** Always use timing-safe comparison functions (like `crypto.timingSafeEqual` over hashes) when comparing sensitive strings such as API keys, tokens, or passwords.
