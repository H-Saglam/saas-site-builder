## 2024-05-23 - [SSRF in File Download]
**Vulnerability:** Unrestricted file download via `fetch` allowing SSRF. The code only checked for `https://` prefix.
**Learning:** `startsWith("https://")` is insufficient protection against SSRF. Attackers can still access internal HTTPS services or use the server as a proxy to external sites. Redirects can also bypass initial checks.
**Prevention:** Always validate the hostname against a strict allowlist of trusted domains (e.g., Supabase storage). Disable redirects in `fetch` using `{ redirect: "error" }` when possible.

## 2024-05-24 - [Stored XSS in Offline Template]
**Vulnerability:** User-controlled URLs (e.g., `javascript:alert(1)`) injected into `src` attributes of downloaded HTML templates.
**Learning:** `z.string().url()` allows dangerous schemes like `javascript:`. Downloaded/offline HTML files execute scripts in a sensitive local context.
**Prevention:** Strictly validate URL schemes (allow only `http`/`https`) both at input validation (Zod) and output encoding (sanitize before interpolation).

## 2024-05-25 - [Timing Attack on Authorization Header]
**Vulnerability:** Comparing the `Authorization` header against a secret using the standard strict equality operator (`===`) allows timing attacks, leaking secret tokens character by character.
**Learning:** `crypto.timingSafeEqual` throws an error if strings are of different lengths. Directly using `timingSafeEqual` with varying length user input reveals the length of the secret and leads to potential 500 errors.
**Prevention:** Always use a constant-time comparison function. For strings of variable lengths, hash both strings (e.g., using `crypto.createHash("sha256")`) before passing them to `crypto.timingSafeEqual()`.
