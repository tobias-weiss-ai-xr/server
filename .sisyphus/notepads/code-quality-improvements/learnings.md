# Code Quality Improvements — Learnings

## 2026-04-04 document-server-integration Audit
- Node.js app.js: Prototype augmentation (String.prototype.hashCode/format), CORS wildcard, TLS verify-off mode
- Java Spring: Unsafe enum parsing (valueOf without guards), NumberFormatException on parseInt(uid)
- Python Django: Missing try/except around HTTP calls in docManager.py, potential XSS via directUrl template injection
- PHP Laravel: JWT middleware lacks try/catch around decode(), uses non-standard HTTP codes 498/499
- C#: Large handler file, inconsistent logging (Debug.Print vs structured logging)
- Cross-cutting: No CI/linting pipelines, minimal test coverage across all languages

## 2026-04-04 PHP Example Fixes (PR #6 merged)
- preg_replace missing delimiters: `preg_replace("[^0-9a-zA-Z.=]", ...)` → `preg_replace("/[^0-9a-zA-Z.=]/", ...)` — PHP 8.x warns, 7.x silently fails
- guid() used md5(uniqid(rand(), true)) — replaced with random_bytes(16) for RFC 4122 UUID v4
- getClientIp() trusted HTTP_CLIENT_IP, X-Forwarded-For headers — replaced with REMOTE_ADDR only
- downloadFile() had Access-Control-Allow-Origin: * — removed (wildcard CORS)
- @header() suppression removed, Content-Type format fixed (comma → colon)
- document-server-integration uses `main` as default branch (not `master`)
- Forgejo merge API: POST /repos/{owner}/{repo}/pulls/{id}/merge with {"Do":"merge"}
