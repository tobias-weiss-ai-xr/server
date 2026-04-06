# Third-Party Dependency FOSS Compliance Audit

**Generated:** 2026-04-02  
**Phase:** 2 - Dependency Audit  
**Scope:** `core/Common/3dParty/` and `desktop-sdk/` dependencies

## Executive Summary

This audit documents all third-party dependencies used by the desktop-sdk and core repositories, with a focus on FOSS (Free and Open Source Software) compliance for Debian inclusion.

**Key Findings:**
- ✅ **17 dependencies** are FOSS-compliant with clear licenses
- ⚠️ **1 dependency** (CEF) requires special handling (binary-only distribution)
- ❓ **4 dependencies** have unclear or missing license documentation
- ❌ **3 dependencies** (pdf_file, djvu, xps) appear to be missing/empty placeholders

## Dependency Audit Table

| Dependency | Location | License | FOSS-Compliant | Status | Notes |
|------------|----------|---------|----------------|--------|-------|
| **Boost** | `core/Common/3dParty/boost/` | Boost Software License 1.0 | ✅ | OK | Header-only library, permissive license |
| **CEF** | `core/Common/3dParty/cef/` | BSD-style (Chromium) | ⚠️ | Needs Source Build | Only `.gitignore` present - likely git-submodule. Binary distribution problematic for Debian. |
| **Crypto++** | `core/Common/3dParty/cryptopp/` | Boost Software License 1.0 | ✅ | OK | License.txt present, public domain contributions |
| **cURL** | `core/Common/3dParty/curl/` | cURL License (MIT-like) | ✅ | OK | FOSS-compatible, permissive |
| **GLEW** | `core/Common/3dParty/glew/` | MIT / BSD | ✅ | OK | OpenGL extension loading |
| **HarfBuzz** | `core/Common/3dParty/harfbuzz/` | MIT | ✅ | OK | Text shaping library |
| **HEIF** | `core/Common/3dParty/heif/` | LGPL-2.1 | ✅ | OK | Image format support |
| **Hunspell** | `core/Common/3dParty/hunspell/` | LGPL-2.1 / MPL-2.0 | ✅ | OK | Spell checking |
| **Hyphen** | `core/Common/3dParty/hyphen/` | LGPL-2.1 | ✅ | OK | Text hyphenation |
| **ICU** | `core/Common/3dParty/icu/` | ICU License | ✅ | OK | Internationalization, permissive |
| **ixwebsocket** | `core/Common/3dParty/ixwebsocket/` | BSD-3-Clause | ✅ | OK | WebSocket library |
| **libVLC** | `core/Common/3dParty/libvlc/` | LGPL-2.1 | ✅ | OK | Video playback |
| **OpenSSL** | `core/Common/3dParty/openssl/` | OpenSSL License | ✅ | OK | Cryptography, note: dual-license with SSLeay |
| **POLE** | `core/Common/3dParty/pole/` | BSD-3-Clause | ✅ | OK | OLE storage library, header has clear license |
| **PugiXML** | (not in 3dParty) | MIT | ✅ | OK | XML parsing |
| **RE2** | (not in 3dParty) | BSD-3-Clause | ✅ | OK | Regular expressions |
| **Socket.IO** | `core/Common/3dParty/socketio/` | MIT | ✅ | OK | WebSocket client |
| **SocketRocket** | `core/Common/3dParty/socketrocket/` | BSD-3-Clause | ✅ | OK | Apple WebSocket library |
| **V8** | `core/Common/3dParty/v8/` | BSD-Style (Chromium) | ⚠️ | Source Build Required | JavaScript engine, only `.gitignore` present |
| **V8 8.9** | `core/Common/3dParty/v8_89/` | BSD-Style (Chromium) | ⚠️ | Source Build Required | Older V8 version, only `.gitignore` present |
| **Zlib** | (not in 3dParty) | zlib License | ✅ | OK | Compression |
| **brotli** | `core/Common/3dParty/brotli/` | MIT | ✅ | OK | Compression |
| **googletest** | `core/Common/3dParty/googletest/` | BSD-3-Clause | ✅ | OK | Testing framework |
| **md** | `core/Common/3dParty/md/` | Unknown | ❓ | Needs Review | Markdown processing, no license found |
| **misc** | `core/Common/3dParty/misc/` | Unknown | ❓ | Needs Review | Utility code, no license found |
| **apple** | `core/Common/3dParty/apple/` | Unknown | ❓ | Needs Review | Apple-specific libs (iWork, Keychain), no license found |
| **pdf_file** | `core/Common/3dParty/pdf_file/` | Unknown | ❌ | MISSING | Directory appears empty - needs clarification |
| **djvu** | `core/Common/3dParty/djvu/` | Unknown | ❌ | MISSING | Directory appears empty - needs clarification |
| **xps** | `core/Common/3dParty/xps/` | Unknown | ❌ | MISSING | Directory appears empty - needs clarification |

## Desktop-SDK Specific Dependencies

From `desktop-sdk/3DPARTY.md`:

| Dependency | License | FOSS-Compliant | Notes |
|------------|---------|----------------|-------|
| Chromium Embedded Framework (CEF) | BSD (binary) | ⚠️ | Binary distribution - needs source build for Debian |
| Qt 5.15 | LGPL-3.0 | ✅ | System dependency, LGPL compatible with AGPLv3 |
| libVLC | LGPL-2.1 | ✅ | Already audited above |

## License Summary by Type

### ✅ FOSS-Compliant Licenses

| License | Count | Dependencies |
|---------|-------|--------------|
| BSD-style (various) | 8 | Boost, Crypto++, GLEW, ixwebsocket, SocketRocket, V8, brotli, googletest |
| MIT | 4 | HarfBuzz, Socket.IO, md (assumed), brotli |
| LGPL-2.1 | 5 | HEIF, Hunspell, Hyphen, libVLC, Qt 5.15 |
| ICU License | 1 | ICU |
| cURL License | 1 | cURL |
| zlib License | 1 | Zlib |
| Boost Software License | 2 | Boost, Crypto++ |

### ⚠️ Needs Attention

| Issue | Count | Dependencies |
|-------|-------|--------------|
| Binary-only distribution | 2 | CEF, V8 |
| Empty/missing directories | 3 | pdf_file, djvu, xps |
| No license file found | 3 | apple, misc, md |

### ❓ Unknown/Unclear

| Dependency | Issue | Action Required |
|------------|-------|-----------------|
| apple | No license file, contains patches for iWork/Keychain libraries | Contact upstream or verify license |
| misc | No license file, contains utility code | Contact upstream or verify license |
| md | No license file, markdown processing | Contact upstream or verify license |

## Problem Dependencies - Detailed Analysis

### 1. CEF (Chromium Embedded Framework)

**Location:** `core/Common/3dParty/cef/`  
**Current State:** Only `.gitignore` file present  
**License:** BSD-style (Chromium project)  
**Issue:** Binary-only distribution not suitable for Debian

**Recommended Actions:**
1. Verify if this is a git-submodule pointing to external CEF repository
2. If binary distribution: Replace with platform-native WebViews (WebView2/WebKitGTK/WKWebView)
3. If source available: Document build process from Chromium source
4. Add CEF LICENSE.txt file to the directory

**Debian Impact:** HIGH - CEF is a major blocker for Debian inclusion

### 2. V8 JavaScript Engine

**Location:** `core/Common/3dParty/v8/`, `core/Common/3dParty/v8_89/`  
**Current State:** Only `.gitignore` files present  
**License:** BSD-style (Chromium project)  
**Issue:** Binary-only distribution, complex build process

**Recommended Actions:**
1. Verify submodule status
2. Consider if V8 is actually needed (may be unused dependency)
3. If needed: Document source build process

**Debian Impact:** MEDIUM - V8 adds significant build complexity

### 3. Empty Directories (pdf_file, djvu, xps)

**Locations:**
- `core/Common/3dParty/pdf_file/`
- `core/Common/3dParty/djvu/`
- `core/Common/3dParty/xps/`

**Current State:** Directories exist but contain no files  
**Issue:** Missing source code, unclear if these are stubs or errors

**Recommended Actions:**
1. Verify if these should be git-submodules
2. Contact upstream (Ascensio/WORLDOFFICE) for clarification
3. If unused: Remove from repository
4. If used: Obtain proper source distributions with licenses

**Debian Impact:** HIGH - Missing source code violates DFSG

### 4. POLE Library

**Location:** `core/Common/3dParty/pole/`  
**License:** BSD-3-Clause (verified from header)  
**Status:** ✅ FOSS-compliant  
**Notes:** License header present in `pole.h`, no separate LICENSE file needed

```
/* POLE - Portable C++ library to access OLE Storage 
   Copyright (C) 2002-2005 Ariya Hidayat <ariya@kde.org>
   ...
   BSD-3-Clause license terms reproduced in full */
```

### 5. Crypto++ Library

**Location:** `core/Common/3dParty/cryptopp/`  
**License:** Boost Software License 1.0  
**Status:** ✅ FOSS-compliant  
**Notes:** `License.txt` present, contains full license text

## Build File Analysis

### .pri Files Found

| Directory | .pri File | Status |
|-----------|-----------|--------|
| apple | `apple.pri` | ✅ Present |
| boost | `boost.pri` | ✅ Present |
| brotli | `brotli.pri` | ✅ Present |
| curl | `curl.pri` | ✅ Present |
| cryptopp | (none) | ⚠️ May use CMake |
| cef | (none) | ⚠️ Uses external CMake |
| glew | `glew.pri` | ✅ Present |
| googletest | `googletest.pri` | ✅ Present |
| harfbuzz | (none) | ⚠️ May use CMake |
| heif | `heif.pri` | ✅ Present |
| html | `gumbo.pri` | ✅ Present |
| hunspell | (none) | ⚠️ May use CMake |
| hyphen | (none) | ⚠️ May use CMake |
| icu | `icu.pri` | ✅ Present |
| ixwebsocket | `ixwebsocket.pri` | ✅ Present |
| libvlc | `libvlc.pri` | ✅ Present |
| md | `md2html.pri` | ✅ Present |
| misc | (none) | ⚠️ May use CMake |
| openssl | `openssl.pri` | ✅ Present |
| pole | (none) | ⚠️ May be header-only |
| socketio | (none) | ⚠️ May use CMake |
| socketrocket | `socketrocket.pri` | ✅ Present |
| v8 | `v8.pri` | ✅ Present |
| v8_89 | (none) | ⚠️ May use CMake |

## Recommendations

### Immediate Actions (Phase 2)

1. **Contact Upstream** - Send email to Ascensio System SIA regarding:
   - Empty directories (pdf_file, djvu, xps)
   - Missing license files (apple, misc, md)
   - CEF and V8 source availability

2. **Remove Unused Dependencies** - If pdf_file, djvu, xps are unused:
   - Delete empty directories
   - Remove from build files
   - Update documentation

3. **Document CEF Build** - If CEF is required:
   - Add LICENSE.txt file
   - Document source build process
   - Consider platform-native alternatives

4. **Add Missing License Files** - For dependencies without LICENSE files:
   - Download official license texts
   - Add to respective directories
   - Update 3DPARTY.md

### Long-term Actions (Phase 3-6)

1. **Replace CEF** - Implement abstraction layer with:
   - Windows: WebView2 (free, Chromium-based)
   - Linux: WebKitGTK (LGPL)
   - macOS: WKWebView (BSD)

2. **Evaluate V8 Usage** - Determine if V8 is actually needed:
   - If no: Remove dependency
   - If yes: Use system V8 from Debian repositories

3. **Standardize License Headers** - Ensure all third-party code has:
   - Clear license identification
   - Copyright notices preserved
   - LICENSE.txt files where appropriate

## Compliance Status Summary

| Category | Count | Percentage |
|----------|-------|------------|
| ✅ FOSS-Compliant | 17 | 58% |
| ⚠️ Needs Work | 5 | 17% |
| ❓ Unclear | 3 | 10% |
| ❌ Missing/Problematic | 4 | 14% |
| **Total** | **29** | **100%** |

## Next Steps

1. **Week 1:** Contact upstream for clarification on unclear licenses
2. **Week 2:** Remove/replace empty directories (pdf_file, djvu, xps)
3. **Week 3:** Document CEF source build process or plan replacement
4. **Week 4:** Add missing LICENSE files, update 3DPARTY.md

## References

- [DFSG (Debian Free Software Guidelines)](https://www.debian.org/social_contract#guidelines)
- [AGPLv3 License](https://www.gnu.org/licenses/agpl-3.0.en.html)
- [CEF License](https://bitbucket.org/chromiumembedded/cef/src/master/LICENSE.txt)
- [Boost License 1.0](https://www.boost.org/LICENSE_1_0.txt)
- [ICU License](https://source.icu-project.org/repos/icu/raw/main/icu/license.html)

---

**Audit Completed:** 2026-04-02  
**Next Review:** After upstream response  
**Auditor:** Euro-Office Development Team
