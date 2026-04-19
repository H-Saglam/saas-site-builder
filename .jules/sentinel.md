## 2024-05-23 - [SSRF in File Download]
**Vulnerability:** Unrestricted file download via `fetch` allowing SSRF. The code only checked for `https://` prefix.
**Learning:** `startsWith("https://")` is insufficient protection against SSRF. Attackers can still access internal HTTPS services or use the server as a proxy to external sites. Redirects can also bypass initial checks.
**Prevention:** Always validate the hostname against a strict allowlist of trusted domains (e.g., Supabase storage). Disable redirects in `fetch` using `{ redirect: "error" }` when possible.

## 2024-05-24 - [Stored XSS in Offline Template]
**Vulnerability:** User-controlled URLs (e.g., `javascript:alert(1)`) injected into `src` attributes of downloaded HTML templates.
**Learning:** `z.string().url()` allows dangerous schemes like `javascript:`. Downloaded/offline HTML files execute scripts in a sensitive local context.
**Prevention:** Strictly validate URL schemes (allow only `http`/`https`) both at input validation (Zod) and output encoding (sanitize before interpolation).
## 2024-05-19 - Fix Timing Attack Vulnerability in CRON Secret Verification
**Vulnerability:** The cron job endpoint (`src/app/api/cron/retention-notifications/route.ts`) verified the `CRON_SECRET` using a standard string equality check (`authorization === \`Bearer ${secret}\``). Node.js V8 optimizes string comparison by exiting early on mismatched characters, which leaks secret characters via timing attacks.
**Learning:** Standard strict equality `===` must never be used for comparing sensitive secrets, authorization headers, tokens, or hashes. Additionally, `crypto.timingSafeEqual` throws an exception if lengths differ, so comparing raw strings directly is dangerous as length could be easily discovered by an attacker, and could even crash the process if lengths don't match.
**Prevention:** Always use `node:crypto`'s `timingSafeEqual`. To securely compare strings of varying or unknown lengths without leaking length information, hash both strings (e.g., using `crypto.createHash('sha256')`) prior to comparison. A reusable `safeCompare` utility has been introduced in `src/lib/security.ts` to implement this pattern project-wide.
