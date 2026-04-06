# Desktop-SDK CEF Replacement - Architecture Decisions

## Overview

This document records the architecture decisions made during the CEF replacement abstraction layer implementation (Phase 3 of the desktop-sdk FOSS rewrite).

## Decision 1: Abstraction Layer Pattern

**Date:** 2026-04-02  
**Status:** Approved  
**Context:** Need to decouple desktop-sdk from proprietary CEF dependency while maintaining backward compatibility.

**Decision:** Use abstract base class (`IWebEngine`) with factory pattern.

**Rationale:**
- Clean separation of interface from implementation
- Allows multiple backend implementations (CEF, Qt WebEngine, WebView2, WebKitGTK)
- Minimal changes to existing `desktop-apps` code
- ABI compatibility maintained through virtual interface

**Consequences:**
- Positive: Backends can be swapped at build time via `BUILD_BACKEND` variable
- Positive: Future backends can be added without modifying existing code
- Negative: Small runtime overhead from virtual function calls (negligible)
- Negative: Requires careful ABI management across compilation units

## Decision 2: Qt WebEngine as Primary FOSS Backend

**Date:** 2026-04-02  
**Status:** Approved  
**Context:** Need FOSS-compliant alternative to CEF for distribution.

**Decision:** Use Qt WebEngine as the primary FOSS backend.

**Rationale:**
- Mature, well-documented Qt module
- Cross-platform (Windows, Linux, macOS)
- Chromium-based (similar behavior to CEF)
- FOSS (LGPL/GPL) compatible with AGPL project
- Active maintenance by Qt Company

**Consequences:**
- Positive: Single backend for all platforms
- Positive: Reduces dependency on binary-only CEF
- Negative: Qt WebEngine dependency adds ~100MB to distribution size
- Negative: Requires Qt 6.x (may need upgrade from Qt 5.x)

## Decision 3: Preserve Existing CEF Backend

**Date:** 2026-04-02  
**Status:** Approved  
**Context:** Existing `desktop-apps` code depends heavily on CEF-specific APIs.

**Decision:** Keep CEF backend as default, wrap existing `CCefView` in `CEFWebEngine` class.

**Rationale:**
- Zero-breaking changes for existing users
- Gradual migration path
- Allows testing and validation of abstraction layer
- Maintains feature parity during transition

**Consequences:**
- Positive: Existing builds continue to work unchanged
- Positive: No immediate rework of `desktop-apps` code
- Negative: CEF dependency remains in codebase
- Negative: Dual maintenance until migration complete

## Decision 4: Factory Function Pattern

**Date:** 2026-04-02  
**Status:** Approved  
**Context:** Need to create `IWebEngine` instances without exposing implementation details.

**Decision:** Use `CreateWebEngine()` and `DestroyWebEngine()` factory functions.

**Rationale:**
- Handles backend-specific construction/destruction
- Allows runtime backend selection (future enhancement)
- Clean API for `CAscApplicationManager` integration
- Memory management centralized

**Consequences:**
- Positive: Simple integration point
- Positive: Easy to add logging/error handling
- Positive: Backend can return null on initialization failure

## Decision 5: Async Script Execution as Default

**Date:** 2026-04-02  
**Status:** Approved  
**Context:** JavaScript execution in web engines is inherently asynchronous.

**Decision:** Make `ExecuteScript()` async by default, provide `ExecuteScriptSync()` for synchronous cases.

**Rationale:**
- Matches Qt WebEngine native API (`runJavaScript`)
- Avoids blocking UI thread
- Callback-based pattern fits event-driven architecture
- Sync version available for critical paths

**Consequences:**
- Positive: Non-blocking UI during script execution
- Positive: Natural fit for Qt signals/slots
- Negative: Existing synchronous CEF code needs adaptation
- Negative: Callback hell potential (mitigated with lambdas)

## Decision 6: DOM Manipulation via JavaScript Bridge

**Date:** 2026-04-02  
**Status:** Approved  
**Context:** Need to manipulate DOM without direct access to DOM API.

**Decision:** Implement DOM methods (`QuerySelector`, `SetInnerHTML`, etc.) by executing JavaScript.

**Rationale:**
- Backend-agnostic (works with any web engine)
- No need for DOM-specific bindings
- Leverages existing JavaScript capabilities
- Simple to implement and test

**Consequences:**
- Positive: Universal approach across backends
- Positive: No additional dependencies
- Negative: Performance overhead from JS string parsing
- Negative: Limited to standard DOM API (no engine-specific features)

## Decision 7: Window Embedding via Native Handle

**Date:** 2026-04-02  
**Status:** Approved  
**Context:** Desktop apps need to embed web view in native window hierarchy.

**Decision:** Use `GetNativeHandle()` to retrieve platform-specific window handle.

**Rationale:**
- Standard approach for embedding
- Works on all platforms (Win32, X11, Cocoa)
- Qt provides `winId()` abstraction
- CEF uses same pattern

**Consequences:**
- Positive: Native look and feel
- Positive: Works with existing window management
- Negative: Platform-specific handle types
- Negative: Need careful lifetime management

## Decision 8: Build-Time Backend Selection

**Date:** 2026-04-02  
**Status:** Approved  
**Context:** Need to support multiple backends without runtime complexity.

**Decision:** Use `BUILD_BACKEND` qmake variable for build-time selection.

**Rationale:**
- Simple, explicit configuration
- No runtime overhead
- Easy CI/CD integration
- Clear build artifacts per backend

**Consequences:**
- Positive: Clean build separation
- Positive: Easy to test each backend
- Negative: Requires rebuild to switch backends
- Positive: Prevents accidental backend mixing

## Decision 9: Minimal Phase 1 Feature Set

**Date:** 2026-04-02  
**Status:** Approved  
**Context:** Need to deliver working implementation quickly.

**Decision:** Implement core functionality only in Phase 1 (navigation, basic script, simple DOM).

**Rationale:**
- Faster time to first working build
- Easier to test and validate
- Clear milestones for Phase 2+
- Reduces initial risk

**Consequences:**
- Positive: Working prototype in 1 iteration
- Positive: Early feedback opportunity
- Negative: Some features delayed (drag-drop, print, cookies)
- Positive: Scope creep controlled

## Decision 10: Event Handler Pattern for Callbacks

**Date:** 2026-04-02  
**Status:** Approved  
**Context:** Need to notify clients of web engine events (load, console, dialogs).

**Decision:** Use setter methods with `std::function` callbacks (`SetLoadEventHandler`, etc.).

**Rationale:**
- Flexible (clients choose which events to handle)
- Type-safe (compared to void pointers)
- Matches Qt signal/slot patterns
- Easy to implement with lambdas

**Consequences:**
- Positive: Clean separation of concerns
- Positive: Clients can opt-in to events
- Negative: Need to manage callback lifetime
- Positive: Can be extended with event filters later

## Open Questions

1. **Should we support runtime backend switching?**
   - Current design allows it via factory functions
   - Adds complexity (state management, resource cleanup)
   - Decision deferred to Phase 2

2. **How to handle platform-specific CEF features?**
   - Some CEF features have no Qt WebEngine equivalent
   - Need feature detection or fallback mechanisms
   - Decision deferred to Phase 2

3. **What about WebKitGTK for Linux-only deployments?**
   - Could reduce dependencies on Qt
   - Would require separate backend implementation
   - Decision: Evaluate after Qt WebEngine validation

## Related Documents

- [Design Document](design/abstraction-layer.md) - Full interface specification
- [3DPARTY-FOSS-AUDIT.md](../3DPARTY-FOSS-AUDIT.md) - Dependency analysis
- [plan.md](../plan.md) - Project phases and roadmap
