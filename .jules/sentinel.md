## 2024-05-23 - [SSRF in File Download]
**Vulnerability:** Unrestricted file download via `fetch` allowing SSRF. The code only checked for `https://` prefix.
**Learning:** `startsWith("https://")` is insufficient protection against SSRF. Attackers can still access internal HTTPS services or use the server as a proxy to external sites. Redirects can also bypass initial checks.
**Prevention:** Always validate the hostname against a strict allowlist of trusted domains (e.g., Supabase storage). Disable redirects in `fetch` using `{ redirect: "error" }` when possible.

## 2024-05-24 - [Stored XSS in Offline Template]
**Vulnerability:** User-controlled URLs (e.g., `javascript:alert(1)`) injected into `src` attributes of downloaded HTML templates.
**Learning:** `z.string().url()` allows dangerous schemes like `javascript:`. Downloaded/offline HTML files execute scripts in a sensitive local context.
**Prevention:** Strictly validate URL schemes (allow only `http`/`https`) both at input validation (Zod) and output encoding (sanitize before interpolation).
## 2024-05-18 - Fix OOM DoS in in-memory rate limiting map
**Vulnerability:** In-memory rate-limiting maps (like `attempts = new Map()`) can grow unbounded as an attacker sends requests from spoofed or distributed IP addresses, leading to an Out-Of-Memory (OOM) exception that crashes the Node.js process (Denial of Service).
**Learning:** Using `attempts.clear()` when the map gets too large introduces a rate-limit bypass vulnerability for all IPs because it wipes legitimate historical rate-limiting data along with malicious ones.
**Prevention:** Always cap the size of in-memory structures and iterate over them safely to delete ONLY expired elements (`now > record.resetAt`) to prevent OOM without creating bypass loopholes.
