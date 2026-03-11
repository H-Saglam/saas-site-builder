## 2024-05-23 - [SSRF in File Download]
**Vulnerability:** Unrestricted file download via `fetch` allowing SSRF. The code only checked for `https://` prefix.
**Learning:** `startsWith("https://")` is insufficient protection against SSRF. Attackers can still access internal HTTPS services or use the server as a proxy to external sites. Redirects can also bypass initial checks.
**Prevention:** Always validate the hostname against a strict allowlist of trusted domains (e.g., Supabase storage). Disable redirects in `fetch` using `{ redirect: "error" }` when possible.

## 2024-05-24 - [Stored XSS in Offline Template]
**Vulnerability:** User-controlled URLs (e.g., `javascript:alert(1)`) injected into `src` attributes of downloaded HTML templates.
**Learning:** `z.string().url()` allows dangerous schemes like `javascript:`. Downloaded/offline HTML files execute scripts in a sensitive local context.
**Prevention:** Strictly validate URL schemes (allow only `http`/`https`) both at input validation (Zod) and output encoding (sanitize before interpolation).

## 2024-05-25 - [Mass Assignment in API Route]
**Vulnerability:** The PUT endpoint for updating sites extracted values from the request body using a manual loop over an allowed fields array, but allowed the extraction of unchecked or unvalidated values by not utilizing Zod schema validation securely.
**Learning:** Even if an allowlist is provided, manual field extraction leaves a risk of missing validation for extracted types and bypassing complex validation logic.
**Prevention:** API route updates (PUT/PATCH) should always utilize strict Zod schema validation (e.g. `schema.safeParse(body)`) rather than manual field extraction or simple allowlists to prevent mass assignment and ensure structural data integrity.
