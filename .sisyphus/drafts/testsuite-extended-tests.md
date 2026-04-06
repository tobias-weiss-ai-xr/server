# Draft: Extended Test Scenarios for testsuite

## Requirements (User Stated)
- Plan more test scenarios for the World-Office testsuite
- Current coverage: health checks, WOPI discovery, API endpoints
- Need to add: document operations, security tests, edge cases

## Current Test Coverage
- **Health Tests**: DS, OCIS, Companion, Stack (4 files)
- **WOPI Tests**: Discovery XML validation
- **API Tests**: Companion endpoints (/api/health, /api/config, /api/health/wopi)

## Potential Additional Test Categories

### 1. WOPI Protocol Operations (NOT YET TESTED)
- **CheckFileInfo**: Validate file info response from WOPI host
- **Lock/Unlock**: File locking mechanism tests
- **GetFile/PutFile**: File content operations
- **ExecuteCommand**: WOPI action execution

### 2. Document Operations (NOT YET TESTED)
- **File Open**: Open document via WOPI editor URL
- **File Edit**: Edit document content
- **File Save**: Save document changes
- **File Close**: Close document session
- **Co-editing**: Multiple users editing same document

### 3. Security Tests (NOT YET TESTED)
- **Invalid JWT**: Token validation failures
- **Expired Tokens**: Token expiration handling
- **Malformed Requests**: Invalid request body/format
- **XSS Prevention**: Script injection in document content
- **CSRF Protection**: Cross-site request forgery

### 4. Edge Cases (NOT YET TESTED)
- **Empty File**: Zero-byte file handling
- **Large File**: Max file size limits
- **Concurrent Access**: Multiple simultaneous operations
- **Network Failures**: Timeout and retry handling
- **Invalid File Types**: Non-office file extensions

### 5. Integration Scenarios (NOT YET TESTED)
- **Full Document Lifecycle**: Create → Edit → Save → Close
- **OCIS ↔ DS Communication**: WOPI protocol end-to-end
- **Companion Orchestration**: Setup wizard → Docker generation → Deploy

## Decisions Made
- **Test Coverage**: Full WOPI protocol + Document editing + Security + edge cases
- **Testing Tool**: Playwright for browser-based document operations
- **Priority**: Security validation first
- **Test Approach**: Real Document Server (not mocked)

## Test Categories (Confirmed)

### Priority 1: Security Validation
1. Invalid JWT token handling
2. Expired token handling
3. Malformed request bodies
4. XSS prevention in document content
5. CSRF protection
6. Input validation on all endpoints

### Priority 2: WOPI Protocol Operations
1. CheckFileInfo - validate response structure
2. Lock/Unlock - file locking mechanism
3. GetFile/PutFile - file content operations
4. ExecuteCommand - action execution
5. File versioning

### Priority 3: Document Editing (Playwright)
1. Open document in editor
2. Edit document content
3. Save changes
4. Close document
5. Co-editing (multiple users)

### Priority 4: Edge Cases
1. Empty files (zero-byte)
2. Large files (size limits)
3. Concurrent access
4. Network failures/timeouts
5. Invalid file types

## Scope Boundaries
- INCLUDE: WOPI protocol, security, edge cases, Playwright document editing
- EXCLUDE: Performance/load testing, accessibility testing
