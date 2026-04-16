## 2024-05-23 - [SSRF in File Download]
**Vulnerability:** Unrestricted file download via `fetch` allowing SSRF. The code only checked for `https://` prefix.
**Learning:** `startsWith("https://")` is insufficient protection against SSRF. Attackers can still access internal HTTPS services or use the server as a proxy to external sites. Redirects can also bypass initial checks.
**Prevention:** Always validate the hostname against a strict allowlist of trusted domains (e.g., Supabase storage). Disable redirects in `fetch` using `{ redirect: "error" }` when possible.

## 2024-05-24 - [Stored XSS in Offline Template]
**Vulnerability:** User-controlled URLs (e.g., `javascript:alert(1)`) injected into `src` attributes of downloaded HTML templates.
**Learning:** `z.string().url()` allows dangerous schemes like `javascript:`. Downloaded/offline HTML files execute scripts in a sensitive local context.
**Prevention:** Strictly validate URL schemes (allow only `http`/`https`) both at input validation (Zod) and output encoding (sanitize before interpolation).
## 2025-04-16 - Prevent OOM DoS in Verification Rate Limiting
**Vulnerability:** A local, unbounded `Map` was being used for rate limiting in the verify-password endpoint based on the `x-forwarded-for` IP header.
**Learning:** Since the `Map` had no eviction policy when reaching a large size, an attacker sending requests with thousands of spoofed IPs could cause the memory to grow indefinitely, leading to a Memory Exhaustion DoS (OOM).
**Prevention:** Implement a centralized, bounded data structure (e.g., a `Map` that evicts its first entry at a maximum threshold like 1000) or use a robust caching library (`lru-cache`) for in-memory rate limiting across the app.

## 2025-04-16 - Timing Attack vulnerability in API Header Check
**Vulnerability:** Comparing the `authorization` header token with the internal environment secret (`CRON_SECRET`) using strict equality (`===`).
**Learning:** V8 engine's string comparison exits on the first mismatched character. By measuring the response time, attackers can deduce the secret character by character.
**Prevention:** Always use Node's `crypto.timingSafeEqual` (via a safe wrapper that handles undefined and length checks) when comparing user-provided tokens against secrets.
