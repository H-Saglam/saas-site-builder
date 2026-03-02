## 2024-05-23 - [SSRF in File Download]
**Vulnerability:** Unrestricted file download via `fetch` allowing SSRF. The code only checked for `https://` prefix.
**Learning:** `startsWith("https://")` is insufficient protection against SSRF. Attackers can still access internal HTTPS services or use the server as a proxy to external sites. Redirects can also bypass initial checks.
**Prevention:** Always validate the hostname against a strict allowlist of trusted domains (e.g., Supabase storage). Disable redirects in `fetch` using `{ redirect: "error" }` when possible.

## 2024-05-24 - [Stored XSS in Offline Template]
**Vulnerability:** User-controlled URLs (e.g., `javascript:alert(1)`) injected into `src` attributes of downloaded HTML templates.
**Learning:** `z.string().url()` allows dangerous schemes like `javascript:`. Downloaded/offline HTML files execute scripts in a sensitive local context.
**Prevention:** Strictly validate URL schemes (allow only `http`/`https`) both at input validation (Zod) and output encoding (sanitize before interpolation).

## 2025-03-02 - [Authorization Bypass in Webhook]
**Vulnerability:** The Shopier callback endpoint (`src/app/api/shopier-callback/route.ts`) accepted payment notifications based on Shopier's signature but did not verify the `custom_field_3` (the checkout token), allowing an attacker to replay a payload with a different `siteId` (`custom_field_1`) and activate arbitrary sites.
**Learning:** External webhook signatures only prove the webhook payload hasn't been tampered with in transit. They do not validate that the custom parameters (like `siteId`) passed back match the actual original session created by the user.
**Prevention:** Always verify custom state/tokens generated at checkout time inside the webhook callback to ensure the custom fields haven't been modified by the client before being sent to the payment gateway.
