# Draft: Migrate All Legacy Code - Remove Legacy Editors

## Context
User requested: "plan migration of all legacy code"

Investigation findings:
- ✅ Phase 4 Web UI migration is MARKED COMPLETE in ROADMAP.md
- ✅ All 5 React editors exist and are working:
  - documenteditor-react (TypeScript, Vite, React 19)
  - spreadsheeteditor-react
  - presentationeditor-react
  - pdfeditor-react
  - visioeditor-react
- ⚠️ Legacy JS editors still exist alongside React versions:
  - documenteditor (vanilla JS, ~722 lines)
  - spreadsheeteditor (vanilla JS, ~12,528 lines)
  - presentationeditor (vanilla JS, ~??? lines)
  - pdfeditor (vanilla JS, ~??? lines)
  - visioeditor (vanilla JS, ~??? lines)
- Git history shows Phase 4 completion: `c109fb43 chore: mark phase 4 web UI migration plan as complete`

## User Decision
- **Scope**: Remove Legacy Editors
- Delete all legacy JS editors
- Keep only React versions
- Clean up and simplify codebase

## Open Questions
- [ ] Are there any integrations/dependencies that still reference legacy editors?
- [ ] Should we deprecate legacy editors gracefully or just delete?
- [ ] Need to update ROADMAP.md after removal?
- [ ] Any shared code (apps/web/apps/common) used only by legacy editors?

## Next Steps
- Investigate dependencies on legacy editors
- Check integration points (Nextcloud, OpenCloud, document-server)
- Verify React editors have full feature parity
- Create removal plan with cleanup strategy
