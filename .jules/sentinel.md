## 2024-05-23 - [SSRF in File Download]
**Vulnerability:** Unrestricted file download via `fetch` allowing SSRF. The code only checked for `https://` prefix.
**Learning:** `startsWith("https://")` is insufficient protection against SSRF. Attackers can still access internal HTTPS services or use the server as a proxy to external sites. Redirects can also bypass initial checks.
**Prevention:** Always validate the hostname against a strict allowlist of trusted domains (e.g., Supabase storage). Disable redirects in `fetch` using `{ redirect: "error" }` when possible.

## 2024-05-24 - [Stored XSS in Offline Template]
**Vulnerability:** User-controlled URLs (e.g., `javascript:alert(1)`) injected into `src` attributes of downloaded HTML templates.
**Learning:** `z.string().url()` allows dangerous schemes like `javascript:`. Downloaded/offline HTML files execute scripts in a sensitive local context.
**Prevention:** Strictly validate URL schemes (allow only `http`/`https`) both at input validation (Zod) and output encoding (sanitize before interpolation).

## 2024-05-25 - [Client-Side Parameter Tampering in Payment Gateway]
**Vulnerability:** The Shopier checkout URL was generated entirely on the client, exposing parameters like `amount` and `custom_field_1` (siteId). Shopier's webhook signature only covers standard fields, leaving custom fields unsigned and vulnerable to tampering in the callback.
**Learning:** Payment gateway flows that rely on webhook callbacks must either cryptographically sign custom fields or map transactions via a secure internal session. Leaving URL generation client-side allows an attacker to pay a legitimate amount but manipulate the associated item ID (`siteId`).
**Prevention:** Always generate payment URLs and custom tokens server-side. Pass a secure HMAC token via custom fields and validate it strictly in the webhook callback against the returned custom fields.
