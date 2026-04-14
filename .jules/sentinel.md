## 2024-05-23 - [SSRF in File Download]
**Vulnerability:** Unrestricted file download via `fetch` allowing SSRF. The code only checked for `https://` prefix.
**Learning:** `startsWith("https://")` is insufficient protection against SSRF. Attackers can still access internal HTTPS services or use the server as a proxy to external sites. Redirects can also bypass initial checks.
**Prevention:** Always validate the hostname against a strict allowlist of trusted domains (e.g., Supabase storage). Disable redirects in `fetch` using `{ redirect: "error" }` when possible.

## 2024-05-24 - [Stored XSS in Offline Template]
**Vulnerability:** User-controlled URLs (e.g., `javascript:alert(1)`) injected into `src` attributes of downloaded HTML templates.
**Learning:** `z.string().url()` allows dangerous schemes like `javascript:`. Downloaded/offline HTML files execute scripts in a sensitive local context.
**Prevention:** Strictly validate URL schemes (allow only `http`/`https`) both at input validation (Zod) and output encoding (sanitize before interpolation).

## 2024-05-25 - [Memory Exhaustion / CPU Denial of Service]
**Vulnerability:** In-memory rate limiting using an unbounded `Map` without TTL auto-cleanup. Attackers could continuously spoof IP addresses (e.g., via `X-Forwarded-For`), continuously appending new keys to the Map.
**Learning:** `Map` objects in V8 can consume extensive memory. Iterating to manually clean them up during a flood can cause severe CPU exhaustion.
**Prevention:** Implement a bounded data structure (e.g., limit to 1000 items). When the limit is reached, use an O(1) eviction policy such as deleting the first entry (`map.keys().next().value`) to maintain bounded memory and constant time complexity, neutralizing both OOM and CPU attacks.
