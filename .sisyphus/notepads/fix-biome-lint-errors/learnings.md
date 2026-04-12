# Fix Biome Lint Errors - Learnings

## Overview
Fixed all 95 Biome lint errors in documenteditor-react and spreadsheeteditor-react apps.

## Error Categories

### 1. Import Organization (`organizeImports`)
- **Count**: ~10 errors
- **Fix**: Auto-fixed with `npx @biomejs/biome check --write`
- **Pattern**: Biome reorganizes imports alphabetically within groups

### 2. Formatting Issues
- **Count**: ~30 errors
- **Fix**: Auto-fixed with `npx @biomejs/biome check --write`
- **Pattern**: Consistent formatting for JSX attributes and function parameters

### 3. Label Without Control (`noLabelWithoutControl`)
- **Count**: 9 errors
- **Files Affected**:
  - `SettingsPanel.tsx` (6 errors): Settings labels not associated with inputs
  - `StatusBar.tsx` (document editor) (3 errors): Zoom, page, and word count labels
  - `StatusBar.tsx` (spreadsheet editor) (2 errors): Zoom and filtered count labels
- **Fix Strategy**: Changed `<label>` to `<span>` for non-form contexts
- **Key Insight**: Labels should only be used when wrapping inputs or using `htmlFor` to associate with inputs

### 4. Use Focusable Interactive (`useFocusableInteractive`)
- **Count**: 4 errors
- **Files Affected**:
  - `FileMenuItems.tsx` (both editors): `<li role="menuitem">` elements
- **Fix Strategy**:
  - Changed `<li>` to `<div role="menuitem" tabIndex={0}>`
  - Made elements keyboard-focusable with `tabIndex={0}`

### 5. Use Key With Click Events (`useKeyWithClickEvents`)
- **Count**: 5 errors
- **Files Affected**:
  - `FileMenuItems.tsx` (both editors): onClick without keyboard events
  - `StatusBar.tsx` (spreadsheet editor): Sheet tabs with onClick
  - `RecentFilesPanel.tsx` (document editor): Recent file items
- **Fix Strategy**: Added `onKeyDown` handlers for Enter and Space keys
```tsx
onKeyDown={(e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault()
    // trigger action
  }
}}
```

### 6. Non-Interactive Element to Interactive Role (`noNoninteractiveElementToInteractiveRole`)
- **Count**: 4 errors
- **Files Affected**:
  - `FileMenuItems.tsx` (both editors): `<li>` elements with `role="menuitem"`
- **Fix Strategy**: Changed `<li>` to `<div>` elements
- **Key Insight**: Non-interactive elements (li, span, div) should not have interactive roles unless made interactive

## Successful Patterns

### Menu Items Pattern
```tsx
// Before (a11y errors)
<li role="menuitem" onClick={handleAction}>

// After (a11y compliant)
<div
  role="menuitem"
  tabIndex={0}
  onClick={handleAction}
  onKeyDown={(e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      handleAction()
    }
  }}
>
```

### Static Labels Pattern
```tsx
// Before (a11y error)
<label className="label">Static Text</label>

// After (a11y compliant)
<span className="label">Static Text</span>
```

### Interactive Tabs Pattern
```tsx
// Before (a11y error)
<div onClick={handleSelect}>Tab Name</div>

// After (a11y compliant)
<div
  role="tab"
  tabIndex={0}
  onClick={handleSelect}
  onKeyDown={(e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      handleSelect()
    }
  }}
>
  Tab Name
</div>
```

## Commands Used

```bash
# Check for errors
npx @biomejs/biome check apps/web/apps/documenteditor-react/src/ apps/web/apps/spreadsheeteditor-react/src/

# Auto-fix safe issues
npx @biomejs/biome check --write apps/web/apps/documenteditor-react/src/ apps/web/apps/spreadsheeteditor-react/src/

# Verify zero errors
npx @biomejs/biome check apps/web/apps/documenteditor-react/src/ apps/web/apps/spreadsheeteditor-react/src/

# Typecheck
cd apps/web/apps/documenteditor-react && npx tsc --noEmit
cd apps/web/apps/spreadsheeteditor-react && npx tsc --noEmit

# Build
cd apps/web/apps/documenteditor-react && npx vite build
cd apps/web/apps/spreadsheeteditor-react && npx vite build
```

## Verification Results

### Biome Check
- **Initial**: 95 errors
- **After auto-fix**: 25 errors
- **After manual fixes**: 0 errors ✅

### Typecheck
- documenteditor-react: ✅ Passed
- spreadsheeteditor-react: ✅ Passed

### Build
- documenteditor-react: ✅ Built in 905ms
- spreadsheeteditor-react: ✅ Built in 1.35s

## Key Takeaways

1. **Biome auto-fix is powerful**: Fixed 70/95 errors automatically (imports, formatting)
2. **A11y rules are strict but reasonable**: All fixes improved keyboard accessibility
3. **Label vs. Span**: Only use `<label>` for form inputs; use `<span>` for static text
4. **Interactive elements**: Any element with onClick should have keyboard support
5. **Role semantics**: Interactive roles require interactive elements (button, a, div with tabindex)
