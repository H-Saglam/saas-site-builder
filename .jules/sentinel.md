## 2024-05-23 - [SSRF in File Download]
**Vulnerability:** Unrestricted file download via `fetch` allowing SSRF. The code only checked for `https://` prefix.
**Learning:** `startsWith("https://")` is insufficient protection against SSRF. Attackers can still access internal HTTPS services or use the server as a proxy to external sites. Redirects can also bypass initial checks.
**Prevention:** Always validate the hostname against a strict allowlist of trusted domains (e.g., Supabase storage). Disable redirects in `fetch` using `{ redirect: "error" }` when possible.

## 2024-05-24 - [Stored XSS in Offline Template]
**Vulnerability:** User-controlled URLs (e.g., `javascript:alert(1)`) injected into `src` attributes of downloaded HTML templates.
**Learning:** `z.string().url()` allows dangerous schemes like `javascript:`. Downloaded/offline HTML files execute scripts in a sensitive local context.
**Prevention:** Strictly validate URL schemes (allow only `http`/`https`) both at input validation (Zod) and output encoding (sanitize before interpolation).

## 2026-03-05 - [Timing Attack in Secret Comparison]
**Vulnerability:** Comparing the `CRON_SECRET` using `===` in `isAuthorized` of `src/app/api/cron/retention-notifications/route.ts` exposes the secret to timing attacks, as `===` bails out early on mismatched characters.
**Learning:** Standard string comparison operators (`===`, `==`) leak length and content information through the time taken to evaluate the comparison.
**Prevention:** Always use a constant-time comparison function, like `crypto.timingSafeEqual`, when comparing sensitive data like passwords, tokens, or HMAC signatures. Hashing the strings first ensures they have the same length for `timingSafeEqual`.
