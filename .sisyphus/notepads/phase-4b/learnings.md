## 2026-04-11 Initial Patterns

### Controller Migration Patterns
- Import `notificationCenter` from `../core/event-bus` for event communication
- Use module-scoped state (NOT classes) — functional style
- Named exports for public API functions
- `ControllerEvents` interface in event-bus.ts for type-safe events
- No Backbone dependency — pure TypeScript
- JSDoc on all public exports
- Events: `notificationCenter.emit("event:name", data)`, `notificationCenter.on("event:name", handler)`

### Package Structure
- `packages/editor-common/src/` — source root
- `packages/editor-common/src/index.ts` — barrel export (must update when adding new modules)
- `packages/editor-common/src/controllers/` — controller modules
- `packages/editor-common/src/core/` — core (event-bus, keymaster, application-context)
- `packages/editor-common/src/components/` — React components (14 files)
- Build: `pnpm --filter @world-office/editor-common build` (tsup)
- Lint: `pnpm --filter @world-office/editor-common lint` (biome)

### Existing Controllers
- `scaling.ts` (70 lines) — pixel ratio MutationObserver, exports getCurrentRatio/getCurrentRatioSelector
- `tab-styler.ts` (190 lines) — tab style/background with localStorage, exports initTabStyler/setTabStyle/setTabBackground/refreshTabStyle/refreshTabBackground

### Key Decision: mods/ is ALL VENDORED
- Bootstrap 3.4.1 plugins (transition, tooltip, dropdown, modal)
- perfect-scrollbar + 5 patch files
- These are NOT custom code — replace with npm packages in React
- 4B-5 can be marked complete (vendored deps → npm replacements)

### Util Files Analysis
- 13 files, ~5,619 lines total
- Side-effect scripts (no exports): themeinit.js, htmlutils.js, desktopinit.js, fix-ie-compat.js, docserviceworker.js
- Main utilities: utils.js (1613), character.js (1327), define.js (1014), LanguageInfo.js (531), Tip.js (310)
- Small utilities: LocalStorage.js (144), Shortcuts.js (155), ScreenReaderHelper.js (67)

### Themes.js Migration (themes.ts)
- 806-line source → ~560 lines of clean TypeScript
- `window.uitheme` is a global injected by the server/build — defined as `UiThemeWindow` interface
- `Common.localStorage` → direct `localStorage` calls
- `Common.Controllers.Desktop` → import from `./desktop`
- `Common.NotificationCenter.trigger('uitheme:changed', id, caller)` was typed as `undefined` but actually passes `[themeId: string, caller?: string]` — fixed in event-bus.ts
- Added `"document:ready": undefined` to ControllerEvents (was missing)
- Biome linter: no `delete` operator, no parameter reassignment, no `as any` needed
- `createColorsCss` returns `string | undefined` — must guard before passing to `writeThemeCss`
- `e.newValue` in StorageEvent is `string | null` — needs cast for typed params
- Destructuring with rest (`const { "theme-system": _, ...rest } = obj`) avoids `delete`
