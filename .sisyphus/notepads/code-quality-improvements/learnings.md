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

## 2026-04-13 Java Spring EditorController Fix
- Task 4 (unsafe enum parsing + parseInt) was already done in a prior session — try/catch blocks were present for Action.valueOf, Type.valueOf, Integer.parseInt
- Missing: `logger` field declaration. The try/catch blocks used `logger.warn()` but no `private static final Logger logger` field existed. Added it at line 64.
- The file already had SLF4J Logger/LoggerFactory imports (lines 42-43), so only the field was missing
- LSP shows pre-existing errors (unresolved imports) due to missing Maven/Gradle dependency resolution in workspace — not related to this change

## 2026-04-13 Node.js app.js Fix (Task 3)
- String.prototype.hashCode and String.prototype.format were already removed from app.js in a prior session — no definitions, no call sites
- TLS verifyPeerOff warning was already present (line 54): `console.warn('WARNING: TLS peer verification is DISABLED...')`
- CORS middleware at lines 65-68 read `corsOrigin` from config but was dead code — never set any headers
- Fixed: CORS middleware now actually sets Access-Control-Allow-Origin, Access-Control-Allow-Methods, Access-Control-Allow-Headers
- `node -c app.js` passes for syntax verification

## 2026-04-13 PPTDocumentInfoOneUser.cpp DecryptStream Memory Leak Fix
- The `data_stream` had `delete[]` present (line 203), but the fix was still warranted for exception safety — if `pStream->read()`, `m_pDecryptor->Decrypt()`, or `pStreamTmp->write()` throw, the raw pointer would leak
- Replaced `unsigned char* data_stream = new unsigned char[size]` with `std::vector<unsigned char> data_stream(size)` and used `.data()` for raw pointer access
- `<vector>` is not directly included but comes transitively (file already uses std::vector extensively) — consistent with existing pattern
- LSP errors are all pre-existing (missing boost headers, unresolved transitive includes) — not caused by this change
