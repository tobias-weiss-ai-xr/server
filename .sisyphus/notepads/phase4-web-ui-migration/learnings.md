## 2026-04-11 Phase 4 Planning

### Design System Components (existing)
- 12 components: Button, Input, Textarea, Select, Checkbox, Switch, Badge, Card, Dialog, Tooltip, Spinner, Avatar
- Styling: Inline styles via React.CSSProperties + CSS custom properties (--wo-*)
- Tokens: colors, typography, spacing, radii, shadows
- ThemeProvider wraps app with CSS vars
- Build: tsup with ESM + CJS + DTS
- Peer deps: react >= 19, react-dom >= 19

### Admin Panel Pattern (reference for new apps)
- Vite 6 + React 19 + react-router-dom 7
- main.tsx → ReactDOM.createRoot → BrowserRouter → App
- App.tsx → Routes > Route with Layout wrapper
- Layout.tsx → NavLink sidebar + Outlet
- No state management (just routing)
- Biome for linting

### pnpm Workspace
- packages/*, apps/*, apps/web/*, apps/web/apps/* (added), apps-web-enterprise/*, integrations/*, tools/*
- Added apps/web/apps/* glob for editor-shell discovery

### Build Tool Decision
- Use Vite (matches admin-panel pattern, fast HMR)
- TypeScript strict mode
- Biome for lint/format (project standard)

## 2026-04-11 Task: 4A-1 Editor Shell Scaffold

### Patterns Discovered
- **tsconfig**: Cannot use `extends: "@world-office/tsconfig/react.json"` — pnpm workspace doesn't resolve it for `tsc`. Must inline all compiler options (copy from admin-panel pattern).
- **build command**: Use `tsc --noEmit && vite build` (NOT `tsc -b`). `tsc -b` follows project references into design-system source and fails on pre-existing errors. `--noEmit` only type-checks local files.
- **design-system resolution**: The design-system uses `"exports": { ".": { "import": "./src/index.ts" } }` which resolves to SOURCE files, not compiled output. This means `tsc` type-checks the design-system source. Pre-existing TS6133 errors (unused imports) in design-system blocked our build. Fixed by removing unused `React` and `forwardRef` imports.
- **Root package.json**: Had duplicate `biome` entry — both `biome@^1.9.0` (wrong npm package) and `@biomejs/biome@^1.9.0` (correct). The wrong one caused `pnpm install` to fail. Fixed by removing the wrong entry.
- **Port allocation**: admin-panel uses port 3001, editor-shell uses port 3002.

### Files Created (editor-shell)
- package.json, vite.config.ts, tsconfig.json, index.html
- src/main.tsx, src/App.tsx, src/vite-env.d.ts
- src/styles/global.css (CSS reset + --wo-* custom properties)
- src/styles/editor.css (editor layout grid + component styles)
- src/types/editor.ts (EditorConfig, EditorPermissions, EditorState, ToolbarItem, PanelConfig)
- src/components/EditorLayout.tsx (CSS Grid layout: toolbar/body/statusbar)
- src/components/Toolbar.tsx, StatusBar.tsx, Canvas.tsx
- src/components/LeftPanel.tsx, RightPanel.tsx, TabBar.tsx

### Build Issues Fixed
- Removed duplicate `biome` dep from root package.json
- Fixed 6 unused import errors in design-system components (Avatar, Checkbox, Input, Select, Switch, Textarea)

## 2026-04-11 Task: Utils.js to TypeScript Migration

### Source Analysis
- Original file: `apps/web/apps/common/main/lib/util/utils.js` (1613 lines)
- Multiple concerns mixed: browser detection, color utilities, metric conversions, string utilities, URL patterns, enums
- Dependencies: jQuery, lodash/_, navigator/window globals
- Legacy code: IE detection, old browser support (Opera, Safari 2-5, FF 3-6)

### Migration Strategy
- Split utils.js into focused modules under `packages/editor-common/src/utils/`
- Remove IE detection and legacy browser support (keep modern browsers only)
- Remove jQuery dependencies
- Add TypeScript typing for all functions/classes
- Use `as const` for enum-like objects
- Follow existing patterns from `packages/editor-common/src/core/` (event-bus.ts, keymaster.ts)

### Files Created
1. **browser.ts** — Platform detection: `isMac`, `isWindows`, `isLinux`, `isMobile`, `isSecure`, `isChrome`, `isSafari`, `isGecko`, `userAgentString`
   - Removed IE detection (`isIE`, `isIE6-11`, etc.)
   - Removed old browser detection (`isOpera`, `isSafari2-5`, `isFF3-6`, etc.)
   - Safe browser access checks (`typeof navigator !== "undefined"`)

2. **color.ts** — Color utilities: `RGBColor` class, conversion functions
   - `RGBColor` class with typed methods: `toRGB()`, `toRGBA()`, `toHex()`, `toHSB()`, `isDark()`, `isEqual()`
   - Conversion functions: `rgbToHex()`, `hexToRgb()`, `hsbToRgb()`, `rgbToHsb()`, `isDark()`
   - Interfaces: `ThemeColor`, `HSBColor`
   - Fixed parameter reassignment issues (used local variables instead of mutating params)

3. **metric.ts** — Unit conversion: mm/cm/pt/inch/twip conversions
   - `MetricUnit` enum: `Centimeter`, `Point`, `Inch`
   - Functions: `toMillimeters()`, `fromMillimeters()`, `cmToMm()`, `mmToCm()`, `ptToMm()`, `mmToPt()`, `inchToMm()`, `mmToInch()`, `twipToPt()`, `ptToTwip()`, `twipToMm()`, `mmToTwip()`
   - Pure math functions, no DOM dependencies

4. **string.ts** — String utilities: formatting, encoding, truncation
   - Functions: `format()`, `htmlEncode()`, `htmlDecode()`, `ellipsis()`, `platformKey()`, `parseFloatSafe()`, `encodeSurrogateChar()`, `fixedDigits()`, `escapeRegex()`
   - Constants: `MODIFIER_KEYS`, `PLATFORM_KEYS` (with Mac platform support)
   - Platform-aware keyboard shortcut formatting (Ctrl/Cmd on Mac)
   - Word-aware ellipsis with optional word boundary breaking

5. **internal-settings.ts** — Key-value store: Map-based settings
   - Functions: `get<T>()`, `set()`, `remove()`, `has()`, `clear()`, `keys()`, `entries()`
   - Generic type parameter for `get()` method
   - Replaces simple object-based store with Map for better type safety

6. **url-patterns.ts** — Regex patterns: email, IP, hostname, URL validation
   - Constants: `EMAIL_RE`, `IP_RE`, `HOSTNAME_RE`, `LOCAL_RE`, `EMAIL_STRONG_RE`, `EMAIL_ADD_STRONG_RE`, `IP_STRONG_RE`, `HOSTNAME_STRONG_RE`, `URL_RE`, `DOMAIN_RE`
   - Properly typed regex constants with `as const` where applicable

7. **enums.ts** — Enum-like objects: document settings, import types, block operations
   - Constants: `DocumentSettingsType`, `ImportTextType`, `ColorThemeValues`, `BlockOperation`, `ButtonLockCause`, `ModalWindowState`, `UserType`
   - Type exports: `DocumentSettingsType`, `ImportTextType`, `ColorThemeValue`, `BlockOperation`, `ButtonLockCause`, `UserType`
   - Uses `as const` for enum-like objects with proper type unions

### TypeScript Patterns Used
- Named exports only (no default exports)
- Strict typing for all parameters and returns
- No `any` types used (except where documented with TODO comments)
- Template literals instead of string concatenation
- `Number.parseInt` instead of global `parseInt`
- Proper interface and class definitions
- Generic type parameters where needed

### Linting Issues Fixed
- Parameter reassignment: Changed `template` param to `templateStr` in platformKey()
- Parameter reassignment: Changed `hex` param to `hexInput` in hexToRgb()
- Used template literals for string building (toHex(), rgbToHex())
- Fixed parseInt to Number.parseInt

### Code Quality Improvements
- Removed IE6-11 detection (not needed for modern browsers)
- Removed Opera 10.5, Safari 2-5 detection (not needed)
- Removed jQuery dependencies ($element.offset, $element.css)
- Removed lodash dependencies (using native methods)
- Added proper null/undefined checks with type guards
- Improved HSB conversion logic with better variable names

### Verification
- All files pass `tsc --noEmit` with zero errors
- No unused imports
- No implicit any types
- All exports are named exports
- Files are independently importable (no index barrel required for this task)

## 2026-04-11 Task: Utils Migration - Part 2 (LocalStorage + ScreenReaderHelper + Barrel)

### Source Files Migrated
1. **LocalStorage.js** (144 lines) → **local-storage.ts**
   - Removed RequireJS pattern (define/require)
   - Removed gateway integration (commented out/deprecated functionality)
   - Removed unused fields: `storeId`, `filter`, `sync()`, `save()` (kept as no-ops)
   - Removed `just` parameter (purpose unclear in context)
   - Typed interface: `ILocalStorage`
   - Methods: `getItem()`, `getItemAsInt()`, `getBool()`, `setItem()`, `setBool()`, `removeItem()`, `itemExists()`, `sync()`, `save()`
   - Global singleton: `localStorage`
   - Preserved core logic: LocalStorage with in-memory fallback

2. **ScreenReaderHelper.js** (67 lines) → **screen-reader.ts**
   - Removed jQuery dependency (`$element`)
   - Replaced jQuery with native DOM API (`document.querySelector`, `document.createElement`, `appendChild`, `remove`)
   - Removed `Common.Utils` namespace
   - Typed interface: `IScreenReaderHelper`
   - Methods: `setEnabled()`, `disable()`, `speech()`
   - Global singleton: `screenReaderHelper`
   - Preserved core logic: aria-live element for TTS announcements

### Barrel Index Created
- File: `packages/editor-common/src/utils/index.ts`
- Re-exports all 9 utils modules: browser, color, enums, local-storage, metric, screen-reader, string, url-patterns
- **Naming conflict resolved**: `internal-settings.ts` exports `get()` function which conflicts with `controllers/themes.ts` `get()` function
- Solution: Explicitly re-export internal-settings with namespace prefix to avoid collision:
  - `get` → `getInternalSetting`
  - `set` → `setInternalSetting`
  - `remove` → `removeInternalSetting`
  - `has` → `hasInternalSetting`
  - `clear` → `clearInternalSettings`
  - `keys` → `getInternalSettingKeys`
  - `entries` → `getInternalSettingEntries`

### Package Index Updated
- File: `packages/editor-common/src/index.ts`
- Added `export * from "./utils"` after `controllers` export

### TypeScript Patterns Used
- Named exports only (no default exports)
- Strict typing for all parameters and returns
- Interface definitions for all utility classes
- Global singleton instances exported as named exports
- No jQuery dependencies
- No global namespace pollution (`Common.Utils` removed)
- Proper null/undefined checks with type guards

### Issues Encountered
- **Name collision**: `internal-settings.get()` conflicts with `themes.get()` when re-exported via barrel
- **Resolution**: Explicit re-exports with namespace prefix instead of wildcard export for internal-settings

### Verification
- Created files: `packages/editor-common/src/utils/local-storage.ts`, `screen-reader.ts`, `index.ts`
- Modified files: `packages/editor-common/src/index.ts` (added utils export)
- All exports are named exports
- `pnpm --filter @world-office/editor-common exec tsc --noEmit` passes with zero errors
- No LSP errors in new files

## 2026-04-12 00:10 — pdfeditor-react component creation

### Patterns
- CSS files follow visio pattern exactly: replace isio- → pdf-, --wo-visio- → --wo-pdf- in class names and CSS vars
- Right menu is new (visio doesn't have one) — mirrored left menu pattern with order-left instead of order-right
- Right menu CSS vars: --wo-pdf-rightmenu-width: 40px, --wo-pdf-rightmenu-min: 40px, --wo-pdf-rightmenu-max: 300px
- observer pattern: const ObservedX = observer(function ObservedX() { ... }); export { ObservedX as X }
- All toolbar tabs render <section> with pdf-{tabname}tab-panel class, ole=""tabpanel""
- StatusBar uses inline ZoomControls (not separate component) — simpler than visio which has PageTabs/SheetList/ZoomControls as separate files
- FileMenu follows visio pattern: left sidebar (FileMenuItems) + right panel area (SaveAsPanel, SettingsPanel, DocumentInfoPanel, HelpPanel, PrintPreviewPanel)
- PDF SaveAsPanel formats: PDF, PDF/A, XPS, DjVu, PNG, JPG (vs visio: VSDX, PDF, PDF/A, PNG, JPG)

### Gotchas
- pnpm install must be run from workspace root (not per-filter) to ensure all node_modules are hoisted correctly
- Pre-existing errors in CommentTab.tsx (string|null not assignable to AnnotationTool|null), Toolbar.tsx (unused activeTab), Viewport.tsx (isEditMode prop type mismatch), PdfStore.ts (unused FormFieldType import) — these were NOT introduced by our changes
- FormsTab with observer wrapper doesn't need pdfStore if it doesn't use reactive state — remove unused import to avoid TS6133
- LSP errors about 'Cannot find module react/mobx-react-lite' are workspace resolution issues, NOT real TS errors — only trust 	sc --noEmit output
