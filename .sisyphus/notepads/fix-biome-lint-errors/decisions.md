# Fix Biome Lint Errors - Decisions

## Why Change `<label>` to `<span>`?

**Context**: Biome's `noLabelWithoutControl` rule requires labels to be associated with form inputs.

**Decision**: Changed `<label>` elements to `<span>` for non-form contexts.

**Rationale**:
1. Labels are semantically for form inputs only
2. Using labels without inputs creates confusion for screen readers
3. Spans are appropriate for static text display
4. Maintains visual styling via CSS class

**Alternatives Considered**:
- Add `htmlFor` attribute: Not applicable - no corresponding input
- Wrap input inside label: Not applicable - these are display-only labels
- Disable the rule: Not appropriate - accessibility is important

## Why Change `<li>` to `<div>` for Menu Items?

**Context**: Biome's `noNoninteractiveElementToInteractiveRole` rule prevents non-interactive elements from having interactive roles.

**Decision**: Changed `<li role="menuitem">` to `<div role="menuitem">`.

**Rationale**:
1. `<li>` is a list item, not an interactive element
2. Using `role="menuitem"` on `<li>` violates ARIA semantics
3. `<div>` is neutral and can accept interactive roles
4. Maintains the same visual structure and styling

**Alternatives Considered**:
- Use `<button>` with role="menuitem": Valid, but requires removing `<ul>` wrapper which breaks semantic structure
- Use `<a>` with role="menuitem": Appropriate if linking to pages, but these trigger actions
- Disable the rule: Not appropriate - violates ARIA best practices

## Why Add `tabIndex={0}`?

**Context**: Biome's `useFocusableInteractive` rule requires interactive elements to be keyboard-focusable.

**Decision**: Added `tabIndex={0}` to all div-based interactive elements.

**Rationale**:
1. Keyboard users need to be able to navigate to interactive elements
2. `tabIndex={0}` makes an element part of the natural tab order
3. Works in conjunction with `onKeyDown` handlers
4. Follows ARIA authoring practices

## Why Add `onKeyDown` Handlers?

**Context**: Biome's `useKeyWithClickEvents` rule requires keyboard events for all click handlers.

**Decision**: Added `onKeyDown` handlers for Enter and Space keys.

**Rationale**:
1. Screen reader users typically activate with Enter key
2. Keyboard power users often use Space key to activate buttons
3. Prevents the default behavior to avoid page scrolling on Space
4. Triggers the same action as `onClick`

**Code Pattern**:
```tsx
onKeyDown={(e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault()
    handleAction()
  }
}}
```

## Why Not Change Recent Files to `<li>`?

**Context**: The `RecentFilesPanel.tsx` initially had `<div>` elements for recent files.

**Decision**: Changed to `<button>` elements instead of `<li>` with keyboard events.

**Rationale**:
1. Buttons are semantically appropriate for clickable items
2. Buttons naturally provide keyboard support (no need for custom handlers)
3. Screen readers announce buttons correctly
4. Reduces code complexity
5. Follows "use semantic HTML" principle

## Why Add `role="tab"` to Sheet Tabs?

**Context**: Sheet tabs in spreadsheet editor's status bar needed keyboard support.

**Decision**: Added `role="tab"` with `tabIndex={0}` and `onKeyDown`.

**Rationale**:
1. These are navigation tabs, not just buttons
2. `role="tab"` provides proper screen reader announcements
3. Follows WAI-ARIA tab panel pattern
4. Maintains semantic meaning while adding keyboard support

## Why Not Use `<button>` for Sheet Tabs?

**Decision**: Kept as `<div>` with `role="tab"`.

**Rationale**:
1. Tabs are navigation controls, not action buttons
2. The `role="tab"` semantic is important for screen readers
3. Tab interaction pattern is different from button pattern
4. Consistent with tab panel ARIA pattern

## Summary of ARIA Improvements

All fixes improve accessibility by:

1. **Proper semantics**: Using appropriate HTML elements and ARIA roles
2. **Keyboard navigation**: Making all interactive elements keyboard-accessible
3. **Screen reader support**: Using correct labels and roles
4. **Consistent patterns**: Following established ARIA patterns

No functionality was changed - all improvements are accessibility-only.
