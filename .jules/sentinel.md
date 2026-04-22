## 2024-05-23 - [SSRF in File Download]
**Vulnerability:** Unrestricted file download via `fetch` allowing SSRF. The code only checked for `https://` prefix.
**Learning:** `startsWith("https://")` is insufficient protection against SSRF. Attackers can still access internal HTTPS services or use the server as a proxy to external sites. Redirects can also bypass initial checks.
**Prevention:** Always validate the hostname against a strict allowlist of trusted domains (e.g., Supabase storage). Disable redirects in `fetch` using `{ redirect: "error" }` when possible.

## 2024-05-24 - [Stored XSS in Offline Template]
**Vulnerability:** User-controlled URLs (e.g., `javascript:alert(1)`) injected into `src` attributes of downloaded HTML templates.
**Learning:** `z.string().url()` allows dangerous schemes like `javascript:`. Downloaded/offline HTML files execute scripts in a sensitive local context.
**Prevention:** Strictly validate URL schemes (allow only `http`/`https`) both at input validation (Zod) and output encoding (sanitize before interpolation).

## 2024-05-25 - [Parameter Tampering in Payment Webhook Callback]
**Vulnerability:** The Shopier payment callback endpoint (`/api/shopier-callback`) failed to validate the custom `checkoutToken` (passed in `custom_field_3`) against checkout parameters like `siteId` and `packageType`. While the webhook itself was authenticated via Shopier signature, an attacker could manipulate the initial checkout session redirect parameters, or potentially alter unsigned custom fields, causing the server to activate the wrong site or grant a higher tier package.
**Learning:** Payment gateway webhooks often sign their core parameters (order ID, amount, currency), but may not include custom passthrough fields in their signature. Relying on unverified custom fields for business logic state (like which account to upgrade) without an independent HMAC validation is a critical tampering risk.
**Prevention:** Always generate a secure server-side checkout token (HMAC over sensitive custom parameters + timestamp) when initiating payment sessions, pass it to the gateway, and strictly validate this token in the callback webhook before applying state changes.
