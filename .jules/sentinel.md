## 2024-05-23 - [SSRF in File Download]
**Vulnerability:** Unrestricted file download via `fetch` allowing SSRF. The code only checked for `https://` prefix.
**Learning:** `startsWith("https://")` is insufficient protection against SSRF. Attackers can still access internal HTTPS services or use the server as a proxy to external sites. Redirects can also bypass initial checks.
**Prevention:** Always validate the hostname against a strict allowlist of trusted domains (e.g., Supabase storage). Disable redirects in `fetch` using `{ redirect: "error" }` when possible.

## 2024-05-24 - [Stored XSS in Offline Template]
**Vulnerability:** User-controlled URLs (e.g., `javascript:alert(1)`) injected into `src` attributes of downloaded HTML templates.
**Learning:** `z.string().url()` allows dangerous schemes like `javascript:`. Downloaded/offline HTML files execute scripts in a sensitive local context.
**Prevention:** Strictly validate URL schemes (allow only `http`/`https`) both at input validation (Zod) and output encoding (sanitize before interpolation).

## 2025-02-18 - [Authorization Bypass via Environment Variable Check]
**Vulnerability:** The `/api/activate` endpoint allowed activating sites (bypassing payment) based on `process.env.NODE_ENV === "development"`.
**Learning:** Environment-based checks (`NODE_ENV`) for sensitive operations are dangerous. If a production environment is misconfigured or accidentally starts in "development" mode, the bypass becomes available to all users.
**Prevention:** Always use identity-based authorization checks (e.g., `await isCurrentUserAdmin()`) for sensitive administrative actions or developer bypasses, ensuring only authorized identities can perform the action regardless of the environment setting.
