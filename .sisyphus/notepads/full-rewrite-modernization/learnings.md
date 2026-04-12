## 2026-04-11 Phase Analysis

### Plan Document vs Reality
- Plan references `web-apps/` with 28k files — ACTUAL path is `apps/web/apps/`
- Each editor app has BOTH Backbone desktop (main/) AND React mobile (mobile/)
- 7 editor apps: documenteditor, spreadsheeteditor, presentationeditor, pdfeditor, visioeditor, + common + api
- Backbone desktop uses RequireJS + Backbone + jQuery + Underscore
- React mobile uses React 19 + Framework7 + MobX + i18next
- Existing React infrastructure: packages/design-system/, services/admin-panel/

### Backbone Architecture
- app.js uses require.config() with baseUrl: '../../' and shim config
- BaseView extends Backbone.View in common/main/lib/component/BaseView.js
- Views in app/view/, Controllers in app/controller/
- ~118 JS files per editor app (desktop)

### React Mobile Architecture  
- Entry: app.js imports React, Framework7, MobX stores, renders <App />
- Stores: mainStore.js, toolbar.js, textSettings.js (MobX observable)
- ~73 JSX files per editor app (mobile)

### Build System
- Root has turbo.json, pnpm-workspace.yaml, biome.json, tsconfig.json, Cargo.toml
- No Gruntfile.js found
- pnpm + Turborepo for JS/TS, Cargo for Rust

### Completed Work
- Phase 2 (Rust Core): 21 crates, 331 tests, committed e719fb93
- Build: MSYS2 UCRT64 with cargo test --workspace
