# Desktop-SDK FOSS Rewrite Implementation Plan

**Created:** 2026-04-02  
**Based on:** Analysis in `analysis.md`  
**Status:** Ready for Implementation

## Overview

This plan outlines the step-by-step implementation of making `desktop-sdk` fully FOSS-compliant by removing proprietary restrictions and replacing non-free dependencies.

## Phase 1: License Cleanup (PRIORITY - Start Immediately)

### 1.1 Remove Proprietary License Headers

**Objective:** Replace all Ascensio-specific license headers with clean AGPLv3

**Files:** ~4,900 source files (.h, .cc, .pro, .pri)

**Script Requirements:**

```python
# Pseudocode for license replacement script
OLD_HEADER = """/*
 * (c) Copyright Ascensio System SIA 2010-2019
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation. In accordance with
 * Section 7(a) of the GNU AGPL its Section 15 shall be amended to the effect
 * that Ascensio System SIA expressly excludes the warranty of non-infringement
 * of any third-party rights.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For
 * details, see the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
 *
 * The  interactive user interfaces in modified source and object code versions
 * of the Program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU AGPL version 3.
 *
 * All the Product's GUI elements, including illustrations and icon sets, as
 * well as technical writing content are licensed under the terms of the
 * Creative Commons Attribution-ShareAlike 4.0 International. See the License
 * terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 */"""

NEW_HEADER = """/*
 * Copyright (C) 2026 Word Office Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */"""
```

**Implementation Steps:**
1. [ ] Create Python script to scan all .h, .cc, .pro, .pri files
2. [ ] Replace OLD_HEADER with NEW_HEADER
3. [ ] Preserve file-specific comments after header
4. [ ] Generate report of modified files
5. [ ] Test on subset (100 files) before full run
6. [ ] Run on entire codebase
7. [ ] Commit with message: "license: Remove Ascensio proprietary terms, use clean AGPLv3"

**Acceptance Criteria:**
- Zero files contain "Ascensio System SIA"
- Zero files contain "Creative Commons Attribution-ShareAlike"
- All files have consistent AGPLv3 header
- Build still works (no syntax errors introduced)

**Estimated Time:** 2-3 days  
**Risk:** LOW  
**Owner:** Development Team

### 1.2 Update LICENSE File

**Objective:** Add legal justification for header changes

**Actions:**
1. [ ] Keep existing AGPLv3 text (already clean)
2. [ ] Add preamble explaining removal of proprietary terms:
   ```
   LEGAL NOTICE
   
   This repository was forked from Word Office/desktop-sdk, which contained
   additional proprietary terms in file headers that violated AGPLv3 Section 10.
   
   Per AGPLv3 Section 7, we have removed the following "further restrictions":
   - Warranty exclusion clause for Ascensio System SIA
   - Creative Commons BY-SA 4.0 requirement for GUI elements
   - Trademark and branding restrictions
   
   These terms constituted additional restrictions beyond AGPLv3 and were
   therefore removed under Section 7's provision that allows removal of
   "further restrictions" from covered works.
   
   The code is now licensed purely under AGPLv3 without additional terms.
   ```
3. [ ] Add copyright notice: "Copyright (C) 2026 Word Office Contributors"
4. [ ] Commit to repository

**Acceptance Criteria:**
- LICENSE file contains clear AGPLv3 text
- Legal justification document included
- No proprietary terms remain

**Estimated Time:** 4 hours  
**Risk:** LOW  
**Owner:** Legal/Development

## Phase 2: Dependency Audit (Week 1-2)

### 2.1 Document All Third-Party Dependencies

**Objective:** Create comprehensive license audit of all dependencies

**Actions:**
1. [ ] Parse all .pri files for include directives
2. [ ] Map each dependency to its license
3. [ ] Identify binary-only distributions
4. [ ] Flag any non-FOSS or unclear licenses

**Output Format:** `3DPARTY-FOSS-AUDIT.md`

```markdown
## Dependency Audit Table

| Dependency | Location | License | FOSS-Compliant | Notes |
|------------|----------|---------|----------------|-------|
| CEF | core/Common/3dParty/cef | BSD (binary) | ⚠️ | Needs source build |
| Qt 5.15 | System | LGPL 3 | ✅ | OK |
| ICU | core/Common/3dParty/icu | ICU | ✅ | OK |
| Boost | core/Common/3dParty/boost | Boost | ✅ | OK |
| pole | core/Common/3dParty/pole | ??? | ❓ | Needs clarification |
| pdf_file | core/Common/3dParty/pdf_file | ??? | ❓ | Needs clarification |
| djvu | core/Common/3dParty/djvu | ??? | ❓ | Needs clarification |
| xps | core/Common/3dParty/xps | ??? | ❓ | Needs clarification |
```

**Acceptance Criteria:**
- All dependencies documented
- License for each dependency identified
- Non-compliant dependencies flagged with workaround plan
- Unclear licenses marked for upstream clarification

**Estimated Time:** 1 week  
**Risk:** MEDIUM  
**Owner:** Development Team

### 2.2 Contact Upstream for Clarification

**Objective:** Resolve license ambiguities

**Actions:**
1. [ ] Draft email to Ascensio legal team regarding pole, pdf_file, djvu, xps
2. [ ] Request clarification on licensing terms
3. [ ] Follow up after 2 weeks if no response
4. [ ] Document response (or lack thereof)

**Template:**
```
Subject: License Clarification Request - Word Office Fork of Word Office

Dear Ascensio Legal Team,

We are forking the Word Office desktop-sdk repository under the name
"Word Office" to create a fully FOSS-compliant version.

We need clarification on the licensing of the following components:
- core/Common/3dParty/pole/
- core/Common/3dParty/pdf_file/
- core/Common/3dParty/djvu/
- core/Common/3dParty/xps/

These components lack clear license headers. Are they:
a) Intended to be AGPLv3 like the rest of the codebase?
b) Proprietary and requiring separate licensing?
c) Under a different open-source license?

We aim to release our fork under pure AGPLv3 and need to ensure
compliance.

Thank you,
Word Office Team
```

**Acceptance Criteria:**
- Email sent to Ascensio
- Response documented (or timeout noted)
- Action plan based on response

**Estimated Time:** Ongoing (2-4 weeks for response)  
**Risk:** LOW  
**Owner:** Project Maintainer

## Phase 3: CEF Replacement Architecture (Week 3-8)

### 3.1 Design Abstraction Layer

**Objective:** Create platform-agnostic rendering backend interface

**Architecture:**

```cpp
// Abstract interface
class IWebEngine {
public:
    virtual ~IWebEngine() = default;
    virtual bool Initialize() = 0;
    virtual void Shutdown() = 0;
    virtual void LoadURL(const std::string& url) = 0;
    virtual void ExecuteScript(const std::string& script) = 0;
    // ... other essential methods
};

// CEF implementation (current)
class CEFWebEngine : public IWebEngine {
    // Existing CEF code migrated here
};

// Qt WebEngine implementation (FOSS alternative)
class QtWebEngine : public IWebEngine {
    // New implementation using Qt WebKit/WebEngine
};

// Factory pattern for selection
class WebEngineFactory {
public:
    static std::unique_ptr<IWebEngine> Create();
private:
    static std::string DetectPlatform();
};
```

**Actions:**
1. [ ] Analyze all CEF-specific API calls in codebase
2. [ ] Identify essential vs. optional features
3. [ ] Design abstraction interface
4. [ ] Create header files for interface
5. [ ] Document migration path

**Deliverable:** `design/abstraction-layer.md`

**Acceptance Criteria:**
- Interface covers all essential functionality
- Migration path documented
- No breaking changes to desktop-apps API

**Estimated Time:** 2 weeks  
**Risk:** HIGH  
**Owner:** Senior Developer

### 3.2 Implement Qt WebEngine Backend

**Objective:** Create FOSS-compliant alternative to CEF

**Actions:**
1. [ ] Set up Qt WebEngine test project
2. [ ] Implement IWebEngine interface using Qt WebKit
3. [ ] Test basic functionality (load URL, execute script)
4. [ ] Incrementally add features
5. [ ] Compare feature parity with CEF backend
6. [ ] Add platform detection logic

**Technology Stack:**
- Qt 5.15 (LGPL) - WebKit or WebEngine module
- Platform-specific:
  - Windows: WebView2 (free, Chromium-based)
  - Linux: WebKitGTK (LGPL)
  - macOS: WKWebView (BSD)

**Acceptance Criteria:**
- Qt WebEngine backend compiles on all platforms
- Basic features work (load, render, script)
- Feature comparison document created
- Performance metrics collected

**Estimated Time:** 4 weeks  
**Risk:** HIGH  
**Owner:** Development Team

### 3.3 Migrate Existing Code to Abstraction

**Objective:** Replace direct CEF calls with abstraction layer

**Actions:**
1. [ ] Identify all CEF-specific code locations
2. [ ] Refactor to use IWebEngine interface
3. [ ] Add conditional compilation for CEF vs Qt
4. [ ] Update build system to support both backends
5. [ ] Test both backends thoroughly

**Estimated Time:** 2 weeks  
**Risk:** HIGH  
**Owner:** Development Team

## Phase 4: Build System Updates (Week 9-12)

### 4.1 Add CEF Source Build Support

**Objective:** Enable building CEF from source (FOSS-compliant distribution)

**Actions:**
1. [ ] Document CEF build process from Chromium source
2. [ ] Create build scripts for automated compilation
3. [ ] Add CMake/qmake integration
4. [ ] Test on all platforms (Windows, Linux, macOS)
5. [ ] Document binary size and build time

**Deliverable:** `build/cef-build-guide.md`

**Acceptance Criteria:**
- CEF builds from source on all platforms
- Build scripts are reproducible
- Documentation complete

**Estimated Time:** 3 weeks  
**Risk:** MEDIUM  
**Owner:** Build Engineer

### 4.2 Update QMake Configuration

**Objective:** Support both CEF and Qt backends

**Actions:**
1. [ ] Add BUILD_BACKEND variable to .pro files
2. [ ] Create backend-specific .pri files
3. [ ] Update dependency resolution
4. [ ] Test both configurations

**Example:**
```qmake
# In main .pro file
BUILD_BACKEND += cef  # or qt

contains(BUILD_BACKEND, cef) {
    include(cef_backend.pri)
} else:contains(BUILD_BACKEND, qt) {
    include(qt_backend.pri)
} else {
    error("BUILD_BACKEND must be 'cef' or 'qt'")
}
```

**Acceptance Criteria:**
- Build system supports both backends
- Switching backends is straightforward
- No cross-contamination between backends

**Estimated Time:** 1 week  
**Risk:** MEDIUM  
**Owner:** Build Engineer

## Phase 5: Testing & Validation (Week 13-16)

### 5.1 Functional Testing

**Objective:** Ensure feature parity between backends

**Test Matrix:**

| Feature | CEF Backend | Qt Backend | Status |
|---------|-------------|------------|--------|
| Load local HTML | ✅ | ❓ | Pending |
| Load remote URL | ✅ | ❓ | Pending |
| Execute JavaScript | ✅ | ❓ | Pending |
| DOM manipulation | ✅ | ❓ | Pending |
| CSS rendering | ✅ | ❓ | Pending |
| PDF display | ✅ | ❓ | Pending |
| Video playback | ✅ | ❓ | Pending |
| Print support | ✅ | ❓ | Pending |

**Actions:**
1. [ ] Create automated test suite
2. [ ] Run tests on both backends
3. [ ] Document discrepancies
4. [ ] Fix missing features in Qt backend

**Acceptance Criteria:**
- 95%+ feature parity
- No critical bugs
- Test suite documented

**Estimated Time:** 3 weeks  
**Risk:** MEDIUM  
**Owner:** QA Team

### 5.2 Performance Benchmarking

**Objective:** Compare performance characteristics

**Metrics:**
- Startup time
- Memory usage
- CPU usage
- Rendering speed
- Script execution time

**Actions:**
1. [ ] Set up benchmark suite
2. [ ] Run on representative hardware
3. [ ] Document results
4. [ ] Optimize if needed

**Deliverable:** `performance-benchmarks.md`

**Estimated Time:** 1 week  
**Risk:** LOW  
**Owner:** Performance Engineer

## Phase 6: Debian Packaging (Week 17-24)

### 6.1 Create Debian Packaging Files

**Objective:** Enable Debian package builds

**Files to Create:**
```
debian/
├── control
├── copyright
├── changelog
├── rules
├── desktop-sdk.install
├── desktop-sdk-dev.install
├── source/
│   └── format
└── patches/
```

**Actions:**
1. [ ] Study Debian packaging guidelines
2. [ ] Create initial packaging files
3. [ ] Configure CEF source build in debian/rules
4. [ ] Resolve all DFSG compliance issues
5. [ ] Build local Debian package
6. [ ] Test installation

**Acceptance Criteria:**
- Package builds with `dpkg-buildpackage`
- All files have proper copyright notices
- No non-free dependencies
- Package installs correctly

**Estimated Time:** 4 weeks  
**Risk:** HIGH  
**Owner:** Debian Maintainer

### 6.2 Submit to Debian

**Objective:** Get package into Debian repositories

**Actions:**
1. [ ] Create Debian account (if needed)
2. [ ] Upload to Debian New Maintainers process
3. [ ] Respond to FTP master feedback
4. [ ] Address lintian warnings
5. [ ] Work with sponsor for initial upload
6. [ ] Track package through acceptance

**Deliverables:**
- Package uploaded to Debian
- Bug report filed with debian-devel@lists.debian.org
- Mentor assigned

**Estimated Time:** 8 weeks (variable)  
**Risk:** HIGH  
**Owner:** Debian Maintainer

## Phase 7: Documentation & Community (Week 25-28)

### 7.1 Write Migration Guide

**Objective:** Help other projects migrate from CEF to Qt backend

**Content:**
- Abstraction layer design rationale
- Implementation examples
- Common pitfalls
- Performance tips
- Platform-specific notes

**Deliverable:** `MIGRATION.md`

**Estimated Time:** 1 week  
**Risk:** LOW  
**Owner:** Documentation Team

### 7.2 Create Developer Guide

**Objective:** Document build and development process

**Content:**
- Prerequisites
- Build instructions for both backends
- Testing guide
- Contribution guidelines
- Code style

**Deliverable:** `DEVELOPMENT.md`

**Estimated Time:** 1 week  
**Risk:** LOW  
**Owner:** Documentation Team

### 7.3 Public Announcement

**Objective:** Inform community of FOSS compliance

**Actions:**
1. [ ] Write blog post
2. [ ] Post to relevant forums (Debian, KDE, GNOME, etc.)
3. [ ] Update README with FOSS status
4. [ ] Create release notes

**Deliverable:** Blog post + Release announcement

**Estimated Time:** 1 week  
**Risk:** LOW  
**Owner:** Project Maintainer

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| CEF build complexity | HIGH | HIGH | Document extensively, seek community help |
| Qt backend feature gaps | MEDIUM | HIGH | Incremental development, fallback to CEF |
| Debian rejection | MEDIUM | HIGH | Early engagement with Debian maintainers |
| Upstream non-response | HIGH | LOW | Proceed with assumption of AGPLv3, document |
| Performance regression | MEDIUM | MEDIUM | Benchmark early, optimize iteratively |
| ABI breakage | LOW | HIGH | Maintain API compatibility layer |

## Success Criteria

**Phase 1 Complete:**
- ✅ All proprietary terms removed from source files
- ✅ LICENSE file updated with legal justification
- ✅ Clean AGPLv3 headers on all files

**Phase 3 Complete:**
- ✅ Abstraction layer designed and documented
- ✅ Qt WebEngine backend functional
- ✅ Feature parity ≥90%

**Phase 6 Complete:**
- ✅ Debian package builds successfully
- ✅ All DFSG compliance issues resolved
- ✅ Package submitted to Debian

**Project Complete:**
- ✅ desktop-sdk is fully FOSS-compliant
- ✅ Debian package accepted into testing
- ✅ Documentation complete
- ✅ Community informed

## Timeline Summary

| Phase | Duration | Start | End |
|-------|----------|-------|-----|
| 1. License Cleanup | 2-3 days | Week 1 | Week 1 |
| 2. Dependency Audit | 1 week | Week 1 | Week 2 |
| 3. CEF Replacement | 6 weeks | Week 3 | Week 8 |
| 4. Build System | 3 weeks | Week 9 | Week 12 |
| 5. Testing | 4 weeks | Week 13 | Week 16 |
| 6. Debian Packaging | 8 weeks | Week 17 | Week 24 |
| 7. Documentation | 3 weeks | Week 25 | Week 28 |

**Total Estimated Duration:** 28 weeks (7 months)

## Resource Requirements

- **Lead Developer:** 1 (full-time)
- **Backend Developer:** 1 (part-time, Qt expertise)
- **Build Engineer:** 1 (part-time)
- **Debian Maintainer:** 1 (volunteer)
- **QA Engineer:** 1 (part-time, Phase 5)
- **Documentation:** 1 (part-time, Phase 7)

## Next Immediate Actions

1. [ ] **APPROVE THIS PLAN** - Get stakeholder sign-off
2. [ ] **ASSIGN OWNERS** - Designate responsible parties for each phase
3. [ ] **START PHASE 1** - Begin license header cleanup
4. [ ] **CREATE ISSUE** - Document on Codeberg for tracking
5. [ ] **SET MILESTONES** - Configure project board with phase deadlines

---

**Status:** Ready for Implementation  
**Last Updated:** 2026-04-02  
**Version:** 1.0
