## 2024-05-23 - [SSRF in File Download]
**Vulnerability:** Unrestricted file download via `fetch` allowing SSRF. The code only checked for `https://` prefix.
**Learning:** `startsWith("https://")` is insufficient protection against SSRF. Attackers can still access internal HTTPS services or use the server as a proxy to external sites. Redirects can also bypass initial checks.
**Prevention:** Always validate the hostname against a strict allowlist of trusted domains (e.g., Supabase storage). Disable redirects in `fetch` using `{ redirect: "error" }` when possible.

## 2024-05-24 - [Stored XSS in Offline Template]
**Vulnerability:** User-controlled URLs (e.g., `javascript:alert(1)`) injected into `src` attributes of downloaded HTML templates.
**Learning:** `z.string().url()` allows dangerous schemes like `javascript:`. Downloaded/offline HTML files execute scripts in a sensitive local context.
**Prevention:** Strictly validate URL schemes (allow only `http`/`https`) both at input validation (Zod) and output encoding (sanitize before interpolation).

## 2025-02-27 - [Inactive Security Middleware]
**Vulnerability:** Critical authentication middleware (`clerkMiddleware`) was defined in `src/proxy.ts` but never executed because Next.js requires the filename to be `middleware.ts`.
**Learning:** Framework-specific conventions (like magic filenames) are critical for security controls. Static analysis tools or tests might miss this if they only check for syntax errors, not configuration validity.
**Prevention:** Always verify that security controls are active by testing the negative case (e.g., accessing a protected route without auth) rather than just assuming the code works because it exists. Add a regression test that verifies the presence and configuration of critical infrastructure files.
