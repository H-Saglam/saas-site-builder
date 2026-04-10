## 2024-05-23 - [SSRF in File Download]
**Vulnerability:** Unrestricted file download via `fetch` allowing SSRF. The code only checked for `https://` prefix.
**Learning:** `startsWith("https://")` is insufficient protection against SSRF. Attackers can still access internal HTTPS services or use the server as a proxy to external sites. Redirects can also bypass initial checks.
**Prevention:** Always validate the hostname against a strict allowlist of trusted domains (e.g., Supabase storage). Disable redirects in `fetch` using `{ redirect: "error" }` when possible.

## 2024-05-24 - [Stored XSS in Offline Template]
**Vulnerability:** User-controlled URLs (e.g., `javascript:alert(1)`) injected into `src` attributes of downloaded HTML templates.
**Learning:** `z.string().url()` allows dangerous schemes like `javascript:`. Downloaded/offline HTML files execute scripts in a sensitive local context.
**Prevention:** Strictly validate URL schemes (allow only `http`/`https`) both at input validation (Zod) and output encoding (sanitize before interpolation).

## 2024-05-25 - [Timing Attack in Authorization Header Comparison]
**Vulnerability:** Comparing sensitive strings (like `authorization === \`Bearer ${secret}\``) using standard equality (`===`) allows an attacker to deduce the secret byte-by-byte via timing attacks, because V8 string comparison optimizations exit early upon the first mismatched character.
**Learning:** Authentication endpoints and webhooks that manually verify tokens, signatures, or shared secrets must always use constant-time string comparison algorithms. Standard string equality operators leak timing information.
**Prevention:** Always use `safeCompare` (which wraps `crypto.timingSafeEqual` with type checking and length validation) for comparing API keys, webhook signatures, auth tokens, or any other sensitive secrets.
