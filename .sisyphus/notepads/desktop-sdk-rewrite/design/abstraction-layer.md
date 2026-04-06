# CEF Replacement Abstraction Layer Design

## Overview

This document describes the design for an abstraction layer (`IWebEngine`) that decouples the desktop-sdk from the proprietary CEF (Chromium Embedded Framework) dependency, enabling FOSS-compliant backends (Qt WebEngine, WebView2, WebKitGTK).

## Problem Statement

- **CEF is binary-only**: Cannot be distributed as FOSS
- **Current code tightly coupled**: `CCefView`, `CApplicationCEF` classes directly used throughout `desktop-apps`
- **ABI compatibility required**: `desktop-apps` must continue to work without breaking changes

## Architecture

```
┌─────────────────────────────────────────┐
│          desktop-apps (C++)             │
│  (existing code, NO CHANGES)            │
└──────────────┬──────────────────────────┘
               │ uses abstract interface
┌──────────────▼──────────────────────────┐
│      IWebEngine (abstract base)         │
│  - Initialize() / Shutdown()            │
│  - LoadURL() / LoadHTML()               │
│  - ExecuteScript()                      │
│  - DOM manipulation methods             │
│  - Event handling (callbacks)           │
└────┬──────────────────────────────┬─────┘
     │                              │
┌────▼──────────┐        ┌─────────▼──────────┐
│ CEFWebEngine  │        │  QtWebEngine       │
│ (existing CEF│        │  (Qt WebEngine)    │
│  backend)    │        │  (FOSS backend)    │
└──────────────┘        └────────────────────┘
```

## Interface Design: `IWebEngine`

### Core Lifecycle Methods

```cpp
class IWebEngine {
public:
    virtual ~IWebEngine() = default;
    
    // Initialize the web engine (must be called before any other method)
    // Returns true on success, false on failure
    virtual bool Initialize(const WebEngineOptions& options) = 0;
    
    // Shutdown the web engine and release resources
    virtual void Shutdown() = 0;
    
    // Check if the engine is initialized and ready
    virtual bool IsReady() const = 0;
};
```

### Navigation Methods

```cpp
    // Load a URL (http://, https://, file://, about:)
    virtual void LoadURL(const std::wstring& url) = 0;
    
    // Load HTML content directly (for inline rendering)
    virtual void LoadHTML(const std::wstring& html, 
                         const std::wstring& base_url = L"") = 0;
    
    // Reload the current page
    virtual void Reload() = 0;
    
    // Navigate back/forward in history
    virtual void GoBack() = 0;
    virtual void GoForward() = 0;
    
    // Get current URL
    virtual std::wstring GetCurrentURL() const = 0;
```

### Script Execution

```cpp
    // Execute JavaScript in the main frame
    // Returns result via callback (async)
    using ScriptCallback = std::function<void(const std::wstring& result)>;
    virtual void ExecuteScript(const std::wstring& script, 
                              ScriptCallback callback = nullptr) = 0;
    
    // Execute script and wait for result (sync - use sparingly)
    virtual std::wstring ExecuteScriptSync(const std::wstring& script) = 0;
```

### DOM Manipulation

```cpp
    // Evaluate DOM and return element by selector
    virtual std::wstring QuerySelector(const std::wstring& selector) = 0;
    
    // Set innerHTML of element
    virtual void SetInnerHTML(const std::wstring& element_id, 
                             const std::wstring& html) = 0;
    
    // Get innerHTML of element
    virtual std::wstring GetInnerHTML(const std::wstring& element_id) = 0;
    
    // Set text content of element
    virtual void SetInnerText(const std::wstring& element_id, 
                             const std::wstring& text) = 0;
    
    // Get text content of element
    virtual std::wstring GetInnerText(const std::wstring& element_id) = 0;
    
    // Set attribute of element
    virtual void SetAttribute(const std::wstring& element_id,
                             const std::wstring& attr_name,
                             const std::wstring& attr_value) = 0;
```

### Event Handling

```cpp
    // Register callback for page load events
    using LoadEventHandler = std::function<void(LoadEventType type)>;
    virtual void SetLoadEventHandler(LoadEventHandler handler) = 0;
    
    // Register callback for console messages
    using ConsoleEventHandler = std::function<void(ConsoleLevel level, 
                                                   const std::wstring& message)>;
    virtual void SetConsoleEventHandler(ConsoleEventHandler handler) = 0;
    
    // Register callback for JavaScript dialogs
    using DialogHandler = std::function<bool(DialogType type, 
                                             const std::wstring& message,
                                             std::wstring& default_prompt)>;
    virtual void SetDialogHandler(DialogHandler handler) = 0;
```

### Platform-Specific Features

```cpp
    // Get native window handle (for embedding)
    virtual WindowHandle GetNativeHandle() const = 0;
    
    // Resize the web view
    virtual void Resize(int width, int height) = 0;
    
    // Focus/blur the web view
    virtual void Focus() = 0;
    virtual void Blur() = 0;
    
    // Handle keyboard/mouse events (for native event filtering)
    virtual bool HandleKeyEvent(const NativeKeyEvent& event) = 0;
    virtual bool HandleMouseEvent(const NativeMouseEvent& event) = 0;
```

## Configuration Options

```cpp
struct WebEngineOptions {
    // User agent string
    std::wstring user_agent;
    
    // Enable/disable JavaScript
    bool enable_javascript = true;
    
    // Enable/disable local storage
    bool enable_local_storage = true;
    
    // Cache directory (empty = no cache)
    std::wstring cache_dir;
    
    // Initial viewport size
    int viewport_width = 1024;
    int viewport_height = 768;
    
    // Enable developer tools
    bool enable_devtools = false;
    
    // DevTools port (0 = disabled)
    int devtools_port = 0;
    
    // Enable hardware acceleration
    bool enable_hardware_acceleration = true;
    
    // Enable GPU compositing
    bool enable_gpu = true;
};
```

## Implementation Strategy

### Phase 1: Core Abstraction (Current Phase)
1. Create `IWebEngine` abstract interface header
2. Create `CEFWebEngine` wrapper around existing `CCefView`
3. Create basic `QtWebEngine` implementation using Qt WebEngine
4. Update build system to support `BUILD_BACKEND` selection
5. Update `CAscApplicationManager` to use `IWebEngine*` instead of `CApplicationCEF*`

### Phase 2: Feature Parity
1. Implement full DOM manipulation in `QtWebEngine`
2. Add JavaScript bridge for native function calls
3. Implement drag-and-drop support
4. Add print-to-PDF functionality
5. Implement cookie management

### Phase 3: Platform Support
1. Windows: Qt WebEngine + WebView2 fallback
2. Linux: Qt WebEngine + WebKitGTK fallback
3. macOS: WKWebView backend

### Phase 4: Migration
1. Update `desktop-apps` to use new abstraction
2. Remove direct CEF dependencies from `desktop-apps`
3. Test all platforms with Qt WebEngine backend
4. Document migration guide for existing users

## Build System Changes

### Qt Pro Files

```qmake
# In desktop-sdk/ChromiumBasedEditors/ChromiumBasedEditors.pro
BUILD_BACKEND ?= cef  # or: qt, webview2, webkit

contains(BUILD_BACKEND, cef) {
    DEFINES += USE_CEF_BACKEND
    INCLUDEPATH += lib/include/cef_107
    SOURCES += lib/src/cef_107/*.cpp
} else:contains(BUILD_BACKEND, qt) {
    DEFINES += USE_QT_BACKEND
    QT += webengine
    INCLUDEPATH += lib/qt_wrapper/include
    SOURCES += lib/qt_wrapper/src/*.cpp
}
```

### Header Organization

```
desktop-sdk/ChromiumBasedEditors/lib/
├── include/
│   ├── iwebengine.h          # Abstract interface (NEW)
│   ├── cefview.h             # Existing CEF view (keep for CEF backend)
│   └── cefapplication.h      # Existing CEF app (keep for CEF backend)
├── src/
│   ├── cef_107/              # CEF-specific code (CEF backend only)
│   │   └── ...
│   ├── cefwebengine.cpp      # CEF implementation of IWebEngine (NEW)
│   └── qtwebengine/          # Qt implementation (NEW)
│       ├── qtwebengine.h
│       └── qtwebengine.cpp
└── qt_wrapper/               # Qt-specific wrappers (NEW)
    └── ...
```

## Backward Compatibility

### Existing API Preservation

The following existing classes/methods will be **preserved** for backward compatibility:

- `CCefView` → Wrapped inside `CEFWebEngine` (no API changes)
- `CApplicationCEF` → Wrapped inside `CEFWebEngine::Initialize()`
- `CAscApplicationManager::CreateCefView()` → Now returns `IWebEngine*`

### Migration Path for desktop-apps

```cpp
// OLD CODE (still works with CEF backend):
CAscApplicationManager* pManager = new CAscApplicationManager();
CCefView* pView = pManager->CreateCefView(parent);
pView->load(L"https://example.com");

// NEW CODE (works with any backend):
CAscApplicationManager* pManager = new CAscApplicationManager();
IWebEngine* pEngine = pManager->CreateWebEngine(parent);
pEngine->LoadURL(L"https://example.com");
```

## Testing Strategy

1. **Unit Tests**: Test each `IWebEngine` method with mock implementations
2. **Integration Tests**: Run same test suite with CEF and Qt backends
3. **Regression Tests**: Verify existing desktop-apps functionality unchanged
4. **Platform Tests**: Test on Windows, Linux, macOS with both backends

## Known Limitations (Phase 1)

1. Qt WebEngine backend: Basic navigation and script execution only
2. DOM manipulation: Limited to simple queries (full implementation in Phase 2)
3. Event handling: Basic load/console events only (Phase 2 for advanced events)
4. Platform-specific features: Window embedding working, advanced input handling in Phase 2

## Future Considerations

1. **WebView2 backend**: For Windows-only deployments (smaller footprint than Qt)
2. **WebKitGTK backend**: For Linux distributions without Qt WebEngine
3. **Headless mode**: For server-side rendering/testing
4. **Multi-process support**: Ensure backend process isolation matches CEF security model

## References

- [CEF API Documentation](https://magpcss.org/ceforum/apidocs3/)
- [Qt WebEngine Documentation](https://doc.qt.io/qt-6/qtwebengine-index.html)
- [WebView2 Documentation](https://docs.microsoft.com/en-us/microsoft-edge/webview2/)
- [WebKitGTK Documentation](https://webkitgtk.org/reference/webkit2gtk/stable/index.html)
