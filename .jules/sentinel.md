## 2024-05-23 - [SSRF in File Download]
**Vulnerability:** Unrestricted file download via `fetch` allowing SSRF. The code only checked for `https://` prefix.
**Learning:** `startsWith("https://")` is insufficient protection against SSRF. Attackers can still access internal HTTPS services or use the server as a proxy to external sites. Redirects can also bypass initial checks.
**Prevention:** Always validate the hostname against a strict allowlist of trusted domains (e.g., Supabase storage). Disable redirects in `fetch` using `{ redirect: "error" }` when possible.

## 2024-05-24 - [Stored XSS in Offline Template]
**Vulnerability:** User-controlled URLs (e.g., `javascript:alert(1)`) injected into `src` attributes of downloaded HTML templates.
**Learning:** `z.string().url()` allows dangerous schemes like `javascript:`. Downloaded/offline HTML files execute scripts in a sensitive local context.
**Prevention:** Strictly validate URL schemes (allow only `http`/`https`) both at input validation (Zod) and output encoding (sanitize before interpolation).

## 2024-05-25 - [Timing Attack in Cron Authorization]
**Vulnerability:** The cron job authorization endpoint `src/app/api/cron/retention-notifications/route.ts` used standard strict equality (`===`) to compare the expected secret with the user-provided `Authorization` header.
**Learning:** Standard string comparison operators leak timing information because they return early as soon as a mismatch is found. This can be exploited to guess secrets character by character.
**Prevention:** Always use constant-time comparison functions like `crypto.timingSafeEqual` for sensitive secrets. Furthermore, to avoid timing leaks based on string length, first hash the inputs to a fixed length (e.g., using SHA-256) before comparing them.
