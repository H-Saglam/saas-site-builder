## 2024-05-23 - [SSRF in File Download]
**Vulnerability:** Unrestricted file download via `fetch` allowing SSRF. The code only checked for `https://` prefix.
**Learning:** `startsWith("https://")` is insufficient protection against SSRF. Attackers can still access internal HTTPS services or use the server as a proxy to external sites. Redirects can also bypass initial checks.
**Prevention:** Always validate the hostname against a strict allowlist of trusted domains (e.g., Supabase storage). Disable redirects in `fetch` using `{ redirect: "error" }` when possible.

## 2024-05-24 - [Stored XSS in Offline Template]
**Vulnerability:** User-controlled URLs (e.g., `javascript:alert(1)`) injected into `src` attributes of downloaded HTML templates.
**Learning:** `z.string().url()` allows dangerous schemes like `javascript:`. Downloaded/offline HTML files execute scripts in a sensitive local context.
**Prevention:** Strictly validate URL schemes (allow only `http`/`https`) both at input validation (Zod) and output encoding (sanitize before interpolation).

## 2024-05-25 - [Timing Attack in Authorization Header]
**Vulnerability:** The retention cron job endpoint (`src/app/api/cron/retention-notifications/route.ts`) was using `===` to compare the `authorization` header against the expected `Bearer ${CRON_SECRET}` value. This allows a timing attack where an attacker can incrementally guess the secret because `===` exits early on the first mismatched character.
**Learning:** V8 engine's string comparison (`===`) optimizes aggressively and leaks length and character matches via execution time, especially when dealing with variable-length secrets or secrets of an unknown length.
**Prevention:** Always use a constant-time comparison algorithm (e.g. `crypto.timingSafeEqual`) for comparing sensitive secrets. To avoid leaking the length of the expected secret (as `timingSafeEqual` natively throws on length mismatch), pre-hash both strings (e.g., using `crypto.createHash('sha256')`) before comparison.
