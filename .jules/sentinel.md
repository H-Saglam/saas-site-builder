## 2024-05-23 - [SSRF in File Download]
**Vulnerability:** Unrestricted file download via `fetch` allowing SSRF. The code only checked for `https://` prefix.
**Learning:** `startsWith("https://")` is insufficient protection against SSRF. Attackers can still access internal HTTPS services or use the server as a proxy to external sites. Redirects can also bypass initial checks.
**Prevention:** Always validate the hostname against a strict allowlist of trusted domains (e.g., Supabase storage). Disable redirects in `fetch` using `{ redirect: "error" }` when possible.

## 2024-05-24 - [Stored XSS in Offline Template]
**Vulnerability:** User-controlled URLs (e.g., `javascript:alert(1)`) injected into `src` attributes of downloaded HTML templates.
**Learning:** `z.string().url()` allows dangerous schemes like `javascript:`. Downloaded/offline HTML files execute scripts in a sensitive local context.
**Prevention:** Strictly validate URL schemes (allow only `http`/`https`) both at input validation (Zod) and output encoding (sanitize before interpolation).

## 2024-05-25 - [Rate Limit Bypass & Map Memory Leak DoS]
**Vulnerability:** A basic in-memory rate limiter using a Map was tracking attempts per IP but lacked a cleanup mechanism. Over time, the Map would grow indefinitely (memory leak leading to DoS) and if we use setInterval it could hang serverless environments. Additionally, IP extraction solely relied on the easily spoofable `x-forwarded-for` header.
**Learning:** `Map` objects don't automatically garbage collect their keys. Long-lived maps used for rate limiting must have explicit, lazy cleanup logic instead of intervals that cause memory leaks in dev/serverless. Also, `x-forwarded-for` can be set by the client. In Next.js App Router, `request.ip` should be prioritized. If falling back to `x-forwarded-for`, only use the first IP in the list.
**Prevention:** Always implement lazy cleanup logic when using `Map` for rate limiting in serverless environments. Use `request.ip` as the primary IP source to prevent spoofing.
