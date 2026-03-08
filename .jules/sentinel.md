## 2024-05-23 - [SSRF in File Download]
**Vulnerability:** Unrestricted file download via `fetch` allowing SSRF. The code only checked for `https://` prefix.
**Learning:** `startsWith("https://")` is insufficient protection against SSRF. Attackers can still access internal HTTPS services or use the server as a proxy to external sites. Redirects can also bypass initial checks.
**Prevention:** Always validate the hostname against a strict allowlist of trusted domains (e.g., Supabase storage). Disable redirects in `fetch` using `{ redirect: "error" }` when possible.

## 2024-05-24 - [Stored XSS in Offline Template]
**Vulnerability:** User-controlled URLs (e.g., `javascript:alert(1)`) injected into `src` attributes of downloaded HTML templates.
**Learning:** `z.string().url()` allows dangerous schemes like `javascript:`. Downloaded/offline HTML files execute scripts in a sensitive local context.
**Prevention:** Strictly validate URL schemes (allow only `http`/`https`) both at input validation (Zod) and output encoding (sanitize before interpolation).

## 2024-05-25 - [Payment Spoofing via Unverified Callback Parameter]
**Vulnerability:** The Shopier callback API route did not validate the custom checkout token (`custom_field_3`) which binds the payment `orderId` to a specific `siteId` and `packageType`. Without this, an attacker could manipulate the `custom_field_1` (Site ID) during checkout session creation or callback processing to activate a different site than intended, or pay a cheaper amount to activate a premium site.
**Learning:** Checking the Shopier webhook signature is necessary but insufficient. The webhook signature only proves the payment was made and the payload came from Shopier. It does *not* prove that the parameters in the webhook (like the site being paid for) correspond to the parameters established during the initial checkout session.
**Prevention:** Always generate a server-side cryptographic token representing the checkout session state, pass it to the payment gateway (e.g., in a custom field), and verify it upon receiving the webhook callback to ensure the state hasn't been tampered with by the client.
