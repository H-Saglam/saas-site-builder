## 2024-05-23 - [SSRF in File Download]
**Vulnerability:** Unrestricted file download via `fetch` allowing SSRF. The code only checked for `https://` prefix.
**Learning:** `startsWith("https://")` is insufficient protection against SSRF. Attackers can still access internal HTTPS services or use the server as a proxy to external sites. Redirects can also bypass initial checks.
**Prevention:** Always validate the hostname against a strict allowlist of trusted domains (e.g., Supabase storage). Disable redirects in `fetch` using `{ redirect: "error" }` when possible.

## 2024-05-24 - [Stored XSS in Offline Template]
**Vulnerability:** User-controlled URLs (e.g., `javascript:alert(1)`) injected into `src` attributes of downloaded HTML templates.
**Learning:** `z.string().url()` allows dangerous schemes like `javascript:`. Downloaded/offline HTML files execute scripts in a sensitive local context.
**Prevention:** Strictly validate URL schemes (allow only `http`/`https`) both at input validation (Zod) and output encoding (sanitize before interpolation).

## 2024-05-24 - [Memory Exhaustion (OOM DoS) in Rate Limiting]
**Vulnerability:** Unbounded growth of in-memory rate-limiting `Map`. The map stored IP addresses as keys without an eviction policy or maximum size, allowing attackers to exhaust server memory by sending requests with random `X-Forwarded-For` IPs.
**Learning:** Simple `Map` data structures are dangerous for rate-limiting if untrusted/user-controlled inputs (like IPs) are used as keys. A malicious actor can easily spoof IPs to fill the map until the process crashes (OOM). Manual eviction loops inside request handlers (e.g., checking `size >= max`) introduce CPU DoS vulnerabilities because O(N) iteration blocks the Node.js event loop under attack.
**Prevention:** Always enforce a hard size limit on in-memory caches or rate limiters using established libraries like `lru-cache`. This provides both `max` size caps and automatic O(1) eviction policies (TTL/LRU) without blocking the thread.
