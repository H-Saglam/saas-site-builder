## 2024-05-23 - [SSRF in File Download]
**Vulnerability:** Unrestricted file download via `fetch` allowing SSRF. The code only checked for `https://` prefix.
**Learning:** `startsWith("https://")` is insufficient protection against SSRF. Attackers can still access internal HTTPS services or use the server as a proxy to external sites. Redirects can also bypass initial checks.
**Prevention:** Always validate the hostname against a strict allowlist of trusted domains (e.g., Supabase storage). Disable redirects in `fetch` using `{ redirect: "error" }` when possible.

## 2024-05-24 - [Stored XSS in Offline Template]
**Vulnerability:** User-controlled URLs (e.g., `javascript:alert(1)`) injected into `src` attributes of downloaded HTML templates.
**Learning:** `z.string().url()` allows dangerous schemes like `javascript:`. Downloaded/offline HTML files execute scripts in a sensitive local context.
**Prevention:** Strictly validate URL schemes (allow only `http`/`https`) both at input validation (Zod) and output encoding (sanitize before interpolation).

## 2024-05-25 - [OOM DoS in In-Memory Rate Limiting]
**Vulnerability:** A `Map` was used to track IP requests for rate limiting without a maximum size limit. Attackers could send single requests from many unique (or spoofed) IP addresses to endlessly grow the map until the Node.js process crashed with an Out-of-Memory error.
**Learning:** Even simple in-memory data structures need hard limits in public-facing APIs. Additionally, implementing lazy cleanup by iterating over a large Map on every request causes massive performance degradation (`O(N)`) and blocks the event loop. Failing closed (returning false to reject) when the map is full introduces a DoS lock-out vector against legitimate users.
**Prevention:** Always enforce a hard `size` limit on caching maps. Once the limit is reached, it is safer and more performant to simply use `.clear()` (an `O(1)` operation) rather than iterating for cleanup or rejecting legitimate new requests.
