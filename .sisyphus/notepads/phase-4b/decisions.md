## 2026-04-11 Architecture Decisions

### 1. Controllers: Functional modules, NOT classes
- Original Backbone controllers used class-based inheritance
- Migrated to functional modules with module-scoped state
- Rationale: Simpler, tree-shakeable, matches modern TS patterns

### 2. EventBus replaces NotificationCenter
- Single `notificationCenter` singleton from `core/event-bus.ts`
- Typed events via `ControllerEvents` and `AppEvents` interfaces

### 3. mods/ — Vendored, not migrated
- Bootstrap 3 plugins → React-native solutions (Radix UI, etc.)
- perfect-scrollbar → CSS overflow-auto or modern scrollbar lib
- Mark 4B-5 complete without file migration

### 4. Util side-effect scripts
- themeinit.js, htmlutils.js, desktopinit.js → likely handled by React initialization
- fix-ie-compat.js → unnecessary for modern browsers
- docserviceworker.js → evaluate separately if needed
