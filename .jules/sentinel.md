## 2024-05-23 - [SSRF in File Download]
**Vulnerability:** Unrestricted file download via `fetch` allowing SSRF. The code only checked for `https://` prefix.
**Learning:** `startsWith("https://")` is insufficient protection against SSRF. Attackers can still access internal HTTPS services or use the server as a proxy to external sites. Redirects can also bypass initial checks.
**Prevention:** Always validate the hostname against a strict allowlist of trusted domains (e.g., Supabase storage). Disable redirects in `fetch` using `{ redirect: "error" }` when possible.

## 2024-05-24 - [Stored XSS in Offline Template]
**Vulnerability:** User-controlled URLs (e.g., `javascript:alert(1)`) injected into `src` attributes of downloaded HTML templates.
**Learning:** `z.string().url()` allows dangerous schemes like `javascript:`. Downloaded/offline HTML files execute scripts in a sensitive local context.
**Prevention:** Strictly validate URL schemes (allow only `http`/`https`) both at input validation (Zod) and output encoding (sanitize before interpolation).

## 2024-05-25 - [Client-Side Payment Tampering]
**Vulnerability:** Constructing Shopier payment URLs in client-side code (`window.open(url)`) exposed the `NEXT_PUBLIC_SHOPIER_API_KEY` and allowed users to easily modify parameters like `amount` or `packageType` before redirecting to the payment gateway. Furthermore, the callback did not verify that the incoming checkout session parameters matched what was originally requested by a trusted server source.
**Learning:** Payment gateways that allow arbitrary amounts (like `money_transfer` product types) are highly susceptible to parameter manipulation if the checkout session is not securely signed or generated on the backend.
**Prevention:** Always generate payment checkout URLs on the backend, ideally generating a cryptographically secure token (HMAC) containing the session details. Pass this token to the gateway (e.g., via `custom_field_3`) and verify it strictly within the payment callback.
