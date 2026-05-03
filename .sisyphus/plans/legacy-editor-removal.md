# Legacy Editor Removal

> **Quick Summary**: Remove 5 legacy vanilla JavaScript editors (~22,000 files) while preserving modern React equivalents and third-party embed integration API.

> **Deliverables**:
> - Legacy editor directories deleted (documenteditor, spreadsheeteditor, presentationeditor, pdfeditor, visioeditor)
> - Documentation updated to reflect modern React-only architecture
> - Build verification confirms workspace integrity

> **Estimated Effort**: Medium
> **Parallel Execution**: NO (sequential deletions with verification)
> **Critical Path**: Task 1 → Task 2 → Task 3 → Task 4 → Task 5 → Task 6

---

## Context

### Original Request

User requested: "Remove Legacy Editors" — delete all vanilla JavaScript editors from the World-Office codebase while keeping modern React equivalents.

### Interview Summary

**Key Discussions**:
- User confirmed scope: Remove legacy editors only (not MCP Server, not Desktop SDK)
- User confirmed approach: "Remove Legacy Editors" from three options presented
- User's goal: Complete Phase 4 cleanup (Web UI migration marked as "complete" in ROADMAP.md but legacy code remained)

### Research Findings

**Current State**:
- Legacy editors: 5 directories (documenteditor, spreadsheeteditor, presentationeditor, pdfeditor, visioeditor)
- Legacy size: ~22,000 files total (includes resources, help docs, vendor code)
- Modern React equivalents: All 5 exist and are functional (Vite-based, TypeScript)
- ROADMAP.md status: Phase 4 (Web UI migration) marked COMPLETE

**Git History Evidence**:
- Commit c109fb43: "mark phase 4 web UI migration plan as complete"
- Recent commits show React editor fixes (Biome lint errors in *-react directories)
- No recent commits to legacy editors

### Metis Review

**Critical Findings** (Metis consultation):
- **Discovery 1**: `apps/web/apps/api/documents/api.js` is NOT a React app — it's a DocsAPI embed library used by ALL third-party integrations (Nextcloud, OpenCloud, all document-server-integration examples). Deleting it **breaks every integration** that embeds World-Office via iframe.
- **Discovery 2**: `apps/web/apps/common/` uses AMD/RequireJS — legacy-only shared code loaded by legacy editors. NOT imported by React editors.
- **Discovery 3**: `apps/web/vendor/` is exclusively legacy infrastructure — vendored libraries (requirejs, backbone, jquery, etc.) used only by legacy system.
- **Discovery 4**: React editors registered with same package names as legacy directories (e.g., `@world-office/documenteditor` vs `documenteditor/` directory) — no naming conflict since legacy has no package.json.
- **Discovery 5**: React editors are fully independent — only import from `@world-office/*` packages in `packages/`. ZERO imports from legacy code.
- **Discovery 6**: Rust backend (`wo-docserver`) serves a static directory (`EDITOR_UI_DIR`) — doesn't care about legacy vs React. No hardcoded paths.
- **Discovery 7**: CI workflows are generic — use workspace-wide commands, no hardcoded legacy editor references.

**Critical Blocker**:
The `api/documents/api.js` + `common/` + `vendor/` + `theme/` + `translation/` form a **cohesive legacy embed system**. Deleting these directories is a **breaking change for all third-party integrations** that use the DocsAPI embed pattern.

---

## Work Objectives

### Core Objective

Remove legacy vanilla JavaScript editors from the codebase while preserving modern React equivalents and identifying impact on third-party integration infrastructure.

### Concrete Deliverables

- Delete 5 legacy editor directories: `documenteditor/`, `spreadsheeteditor/`, `presentationeditor/`, `pdfeditor/`, `visioeditor/`
- Update documentation: AGENTS.md, README.md, apps/web/AGENTS.md, apps/web/Readme.md, ROADMAP.md
- Verify workspace integrity: pnpm build/typecheck/lint pass, Rust tests pass
- Identify and document impact on `api/documents/api.js` embed integration API

### Definition of Done

- [ ] All 5 legacy editor directories deleted
- [ ] Documentation updated to reflect React-only architecture
- [ ] pnpm install/typecheck/build/lint all pass
- [ ] Rust backend tests pass (unaffected)
- [ ] No orphan references to legacy code in React editors
- [ ] Embed integration API impact documented

### Must Have

- Delete exactly the 5 legacy editor directories (documenteditor, spreadsheeteditor, presentationeditor, pdfeditor, visioeditor)
- Delete all subdirectories: `main/`, `mobile/`, `embed/`, `forms/` with each editor
- Delete 21 HTML entry points: `index.html` variants per editor
- Run full workspace verification after each deletion
- Update all documentation that references legacy editors

### Must NOT Have (Guardrails)

- DO NOT delete `api/documents/` — embed API used by all third-party integrations (blocking issue)
- DO NOT delete `apps/web/apps/common/` — shared legacy code used by embed API
- DO NOT delete `apps/web/vendor/` — vendored libs used by embed API
- DO NOT delete `apps/web/theme/` — legacy themes used by embed API
- DO NOT delete `apps/web/translation/` — legacy translations used by embed API
- DO NOT delete `apps/web/packages/` — shared packages used by React editors
- DO NOT modify any React editor code (`*-react/` directories or `editor-shell/`)
- DO NOT modify any `packages/` code
- DO NOT modify Rust backend code
- DO NOT touch `integrations/` directory
- DO NOT rename any packages
- DO NOT combine deletions into single commit — each deletion must be independently reviewable
- DO NOT create acceptance criteria requiring "user manually tests..."

---

## Verification Strategy (MANDATORY)

> **ZERO HUMAN INTERVENTION** - ALL verification is agent-executed. No exceptions.

### Test Decision

- **Infrastructure exists**: YES (pnpm workspace, CI/CD workflows)
- **Automated tests**: NO (legacy editors have no tests — deletions verified by build success)
- **Framework**: None (verification via pnpm commands and Rust tests)

### QA Policy

Every deletion task MUST include agent-executed QA scenarios (see TODO template below).
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Build verification**: Use Bash (pnpm commands) - verify pnpm install/typecheck/build/lint pass
- **File deletion verification**: Use Bash (ls/commands) - verify directories are gone
- **No orphan references**: Use Bash (grep) - verify React editors don't reference legacy paths
- **Workspace integrity**: Use Bash (pnpm ls) - verify workspace is valid
- **Rust backend**: Use Bash (cargo test) - verify Rust services unaffected

---

## Execution Strategy

### Single Sequential Path

All tasks execute sequentially. Each deletion is atomic and independently reviewable.

```
Task 1: Delete legacy documenteditor
Task 2: Delete legacy spreadsheeteditor
Task 3: Delete legacy presentationeditor
Task 4: Delete legacy pdfeditor + visioeditor (combined, smallest editors)
Task 5: Update documentation
Task 6: Final verification
```

### Dependency Matrix

- **1**: - - 2, 3, 4, 5, 6
- **2**: - 3, 4, 5, 6
- **3**: - 4, 5, 6
- **4**: - 5, 6
- **5**: - 6
- **6**: -

### Agent Dispatch Summary

- **1**: **1** - T1 → `quick`
- **2**: **1** - T2 → `quick`
- **3**: **1** - T3 → `quick`
- **4**: **1** - T4 → `quick`
- **5**: **1** - T5 → `writing`
- **6**: **1** - T6 → `quick`

---

## TODOs

> Implementation + Test = ONE Task. Never separate.
> EVERY task MUST have: Recommended Agent Profile + Parallelization info + QA Scenarios.
> **A task WITHOUT QA Scenarios is INCOMPLETE. No exceptions.**

- [ ] 1. Delete Legacy Document Editor

  **What to do**:
  - Delete `apps/web/apps/documenteditor/` directory entirely
  - This removes: main/, mobile/, embed/, forms/ subdirectories (~5,033 files total)
  - Delete all HTML entry points: index.html, index_loader.html, index.html.deploy variants
  - Delete all JS code, resources, help docs

  **Must NOT do**:
  - DO NOT delete `apps/web/apps/documenteditor-react/` — modern React editor, stays
  - DO NOT delete `apps/web/apps/api/documents/` — embed API used by integrations
  - DO NOT delete `apps/web/apps/common/` — shared legacy code used by embed API
  - DO NOT delete `apps/web/packages/` — shared packages

  **Recommended Agent Profile**:
  > Select category + skills based on task domain. Justify each choice.
  - **Category**: `quick`
    - Reason: Straightforward directory deletion, no code complexity, requires verification
  - **Skills**: None required
  - **Skills Evaluated but Omitted**:
    - `using-git-worktrees`: Not needed - single deletion, no feature work
    - `test-driven-development`: No tests exist for legacy code, verification via build commands

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential
  - **Blocks**: Task 2, 3, 4, 5, 6
  - **Blocked By**: None (can start immediately)

  **References** (CRITICAL - Be Exhaustive):

  > The executor has NO context from your interview. References are their ONLY guide.
  > Each reference must answer: "What should I look at and WHY?"

  **Pattern References** (existing code to follow):
  - None applicable - this is deletion task

  **File Paths** (directories to delete):
  - `apps/web/apps/documenteditor/` - Legacy document editor directory

  **WHY Each Reference Matters** (explain the relevance):
  - This is the directory to delete — contains all legacy vanilla JavaScript code for the document editor
  - Do not delete documenteditor-react/ or any other directories

  **Acceptance Criteria**:

  > **AGENT-EXECUTABLE VERIFICATION ONLY** - No human action permitted.
  > Every criterion MUST be verifiable by running a command or using a tool.

  **Build Verification**:
  - [ ] pnpm install --frozen-lockfile → PASS (no errors)
  - [ ] pnpm typecheck → PASS (0 errors, 0 warnings)
  - [ ] pnpm build → PASS (all packages build successfully)

  **File Deletion Verification**:
  - [ ] Directory deleted: `ls apps/web/apps/documenteditor/` → "No such file or directory"
  - [ ] No orphan files: `find apps/web/apps/ -name "documenteditor" -type d` → 0 matches

  **Reference Check Verification**:
  - [ ] React editors don't reference legacy: `grep -r "documenteditor/" apps/web/apps/*-react/` → 0 matches
  - [ ] No vendor references: `grep -r "documenteditor/vendor" apps/web/apps/*-react/` → 0 matches

  **QA Scenarios (MANDATORY - task is INCOMPLETE without these):**

  > **This is NOT optional. A task without QA scenarios WILL BE REJECTED.**
  >
  > **The executing agent MUST run these scenarios after implementation.**
  > **The orchestrator WILL verify evidence files exist before marking task complete.**

  \`\`\`
  Scenario: Verify legacy documenteditor directory is deleted and workspace intact
    Tool: Bash
    Preconditions: Legacy editor exists at apps/web/apps/documenteditor/
    Steps:
      1. Verify directory exists before deletion: `test -d apps/web/apps/documenteditor/`
      2. Execute deletion: `rm -rf apps/web/apps/documenteditor/`
      3. Verify directory is gone: `! test -d apps/web/apps/documenteditor/`
      4. Run pnpm install to verify workspace integrity: `pnpm install --frozen-lockfile 2>&1`
      5. Run pnpm typecheck to verify TypeScript passes: `pnpm typecheck 2>&1`
      6. Run pnpm build to verify all packages build: `pnpm build 2>&1`
      7. Grep for orphan references: `grep -r "documenteditor/" apps/web/apps/*-react/ 2>&1`
    Expected Result: Directory deleted, workspace builds pass, no orphan references
    Failure Indicators: Build errors, typecheck errors, grep finds references to legacy
    Evidence: .sisyphus/evidence/task-1-delete-documenteditor.txt

  Scenario: Verify React document editor still functional after legacy deletion
    Tool: Bash
    Preconditions: Legacy editor deleted, React editor exists
    Steps:
      1. Check React editor package exists: `test -f apps/web/apps/documenteditor-react/package.json`
      2. Verify React editor still typechecks: `cd apps/web/apps/documenteditor-react && pnpm typecheck 2>&1`
      3. Verify React editor still builds: `cd apps/web/apps/documenteditor-react && pnpm build 2>&1`
    Expected Result: React documenteditor-react package remains functional, builds and typechecks successfully
    Failure Indicators: Build errors, type errors, missing dependencies
    Evidence: .sisyphus/evidence/task-1-react-functional.txt

  Scenario: Verify no legacy documenteditor references in workspace
    Tool: Bash
    Preconditions: Legacy editor deleted
    Steps:
      1. Search for any references to documenteditor path: `grep -r "documenteditor/main" apps/web/ 2>&1 | grep -v "documenteditor-react"`
      2. Search for any references to documenteditor vendor: `grep -r "documenteditor/vendor" apps/web/ 2>&1`
    Expected Result: Zero matches to legacy documenteditor paths (excluding documenteditor-react)
    Failure Indicators: Grep finds references to legacy paths
    Evidence: .sisyphus/evidence/task-1-no-orphan-references.txt
  \`\`\`

  **Evidence to Capture**:
  - [ ] Each evidence file named: task-{N}-{scenario-slug}.{ext}
  - [ ] Build verification saved
  - [ ] Grep verification output saved

  **Commit**: YES (groups with 2, 3, 4)
  - Message: `refactor(web): remove legacy documenteditor (vanilla JS)`
  - Files: `apps/web/apps/documenteditor/`
  - Pre-commit: `pnpm install && pnpm typecheck && pnpm build`

---

- [ ] 2. Delete Legacy Spreadsheet Editor

  **What to do**:
  - Delete `apps/web/apps/spreadsheeteditor/` directory entirely
  - This removes: main/, mobile/, embed/, forms/ subdirectories (~12,528 files total)
  - Delete all HTML entry points and JS code

  **Must NOT do**:
  - DO NOT delete `apps/web/apps/spreadsheeteditor-react/` — modern React editor, stays
  - DO NOT delete `apps/web/apps/api/documents/` — embed API used by integrations
  - DO NOT delete `apps/web/apps/common/` — shared legacy code used by embed API
  - DO NOT delete `apps/web/packages/` — shared packages

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Straightforward directory deletion, same pattern as documenteditor
  - **Skills**: None required
  - **Skills Evaluated but Omitted**:
    - `using-git-worktrees`: Not needed - single deletion, no feature work
    - `test-driven-development`: No tests exist for legacy code, verification via build commands

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential
  - **Blocks**: Task 3, 4, 5, 6
  - **Blocked By**: Task 1

  **References** (CRITICAL - Be Exhaustive):

  > The executor has NO context from your interview. References are their ONLY guide.
  > Each reference must answer: "What should I look at and WHY?"

  **File Paths** (directories to delete):
  - `apps/web/apps/spreadsheeteditor/` - Legacy spreadsheet editor directory

  **WHY Each Reference Matters** (explain the relevance):
  - This is the directory to delete — contains all legacy vanilla JavaScript code for the spreadsheet editor
  - Do not delete spreadsheeteditor-react/ or any other directories

  **Acceptance Criteria**:

  > **AGENT-EXECUTABLE VERIFICATION ONLY** - No human action permitted.
  > Every criterion MUST be verifiable by running a command or using a tool.

  **Build Verification**:
  - [ ] pnpm install --frozen-lockfile → PASS (no errors)
  - [ ] pnpm typecheck → PASS (0 errors, 0 warnings)
  - [ ] pnpm build → PASS (all packages build successfully)

  **File Deletion Verification**:
  - [ ] Directory deleted: `ls apps/web/apps/spreadsheeteditor/` → "No such file or directory"
  - [ ] No orphan files: `find apps/web/apps/ -name "spreadsheeteditor" -type d` → 0 matches

  **Reference Check Verification**:
  - [ ] React editors don't reference legacy: `grep -r "spreadsheeteditor/" apps/web/apps/*-react/` → 0 matches
  - [ ] No vendor references: `grep -r "spreadsheeteditor/vendor" apps/web/apps/*-react/` → 0 matches

  **QA Scenarios (MANDATORY - task is INCOMPLETE without these):**

  > **This is NOT optional. A task without QA scenarios WILL BE REJECTED.**
  >
  > **The executing agent MUST run these scenarios after implementation.**
  > **The orchestrator WILL verify evidence files exist before marking task complete.**

  \`\`\`
  Scenario: Verify legacy spreadsheeteditor directory is deleted and workspace intact
    Tool: Bash
    Preconditions: Legacy editor exists at apps/web/apps/spreadsheeteditor/
    Steps:
      1. Verify directory exists before deletion: `test -d apps/web/apps/spreadsheeteditor/`
      2. Execute deletion: `rm -rf apps/web/apps/spreadsheeteditor/`
      3. Verify directory is gone: `! test -d apps/web/apps/spreadsheeteditor/`
      4. Run pnpm install to verify workspace integrity: `pnpm install --frozen-lockfile 2>&1`
      5. Run pnpm typecheck to verify TypeScript passes: `pnpm typecheck 2>&1`
      6. Run pnpm build to verify all packages build: `pnpm build 2>&1`
      7. Grep for orphan references: `grep -r "spreadsheeteditor/" apps/web/apps/*-react/ 2>&1`
    Expected Result: Directory deleted, workspace builds pass, no orphan references
    Failure Indicators: Build errors, typecheck errors, grep finds references to legacy
    Evidence: .sisyphus/evidence/task-2-delete-spreadsheeteditor.txt

  Scenario: Verify React spreadsheet editor still functional after legacy deletion
    Tool: Bash
    Preconditions: Legacy editor deleted, React editor exists
    Steps:
      1. Check React editor package exists: `test -f apps/web/apps/spreadsheeteditor-react/package.json`
      2. Verify React editor still typechecks: `cd apps/web/apps/spreadsheeteditor-react && pnpm typecheck 2>&1`
      3. Verify React editor still builds: `cd apps/web/apps/spreadsheeteditor-react && pnpm build 2>&1`
    Expected Result: React spreadsheeteditor-react package remains functional, builds and typechecks successfully
    Failure Indicators: Build errors, type errors, missing dependencies
    Evidence: .sisyphus/evidence/task-2-react-functional.txt

  Scenario: Verify no legacy spreadsheeteditor references in workspace
    Tool: Bash
    Preconditions: Legacy editor deleted
    Steps:
      1. Search for any references to spreadsheeteditor path: `grep -r "spreadsheeteditor/main" apps/web/ 2>&1 | grep -v "spreadsheeteditor-react"`
      2. Search for any references to spreadsheeteditor vendor: `grep -r "spreadsheeteditor/vendor" apps/web/ 2>&1`
    Expected Result: Zero matches to legacy spreadsheeteditor paths (excluding spreadsheeteditor-react)
    Failure Indicators: Grep finds references to legacy paths
    Evidence: .sisyphus/evidence/task-2-no-orphan-references.txt
  \`\`\`

  **Evidence to Capture**:
  - [ ] Each evidence file named: task-{N}-{scenario-slug}.{ext}
  - [ ] Build verification saved
  - [ ] Grep verification output saved

  **Commit**: YES (groups with 3, 4)
  - Message: `refactor(web): remove legacy spreadsheeteditor (vanilla JS)`
  - Files: `apps/web/apps/spreadsheeteditor/`
  - Pre-commit: `pnpm install && pnpm typecheck && pnpm build`

---

- [ ] 3. Delete Legacy Presentation Editor

  **What to do**:
  - Delete `apps/web/apps/presentationeditor/` directory entirely
  - This removes: main/, mobile/, embed/, forms/ subdirectories (~4,477 files total)
  - Delete all HTML entry points and JS code

  **Must NOT do**:
  - DO NOT delete `apps/web/apps/presentationeditor-react/` — modern React editor, stays
  - DO NOT delete `apps/web/apps/api/documents/` — embed API used by integrations
  - DO NOT delete `apps/web/apps/common/` — shared legacy code used by embed API
  - DO NOT delete `apps/web/packages/` — shared packages

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Straightforward directory deletion, same pattern as previous tasks
  - **Skills**: None required
  - **Skills Evaluated but Omitted**:
    - `using-git-worktrees`: Not needed - single deletion, no feature work
    - `test-driven-development`: No tests exist for legacy code, verification via build commands

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential
  - **Blocks**: Task 4, 5, 6
  - **Blocked By**: Task 2

  **References** (CRITICAL - Be Exhaustive):

  > The executor has NO context from your interview. References are their ONLY guide.
  > Each reference must answer: "What should I look at and WHY?"

  **File Paths** (directories to delete):
  - `apps/web/apps/presentationeditor/` - Legacy presentation editor directory

  **WHY Each Reference Matters** (explain the relevance):
  - This is the directory to delete — contains all legacy vanilla JavaScript code for the presentation editor
  - Do not delete presentationeditor-react/ or any other directories

  **Acceptance Criteria**:

  > **AGENT-EXECUTABLE VERIFICATION ONLY** - No human action permitted.
  > Every criterion MUST be verifiable by running a command or using a tool.

  **Build Verification**:
  - [ ] pnpm install --frozen-lockfile → PASS (no errors)
  - [ ] pnpm typecheck → PASS (0 errors, 0 warnings)
  - [ ] pnpm build → PASS (all packages build successfully)

  **File Deletion Verification**:
  - [ ] Directory deleted: `ls apps/web/apps/presentationeditor/` → "No such file or directory"
  - [ ] No orphan files: `find apps/web/apps/ -name "presentationeditor" -type d` → 0 matches

  **Reference Check Verification**:
  - [ ] React editors don't reference legacy: `grep -r "presentationeditor/" apps/web/apps/*-react/` → 0 matches
  - [ ] No vendor references: `grep -r "presentationeditor/vendor" apps/web/apps/*-react/` → 0 matches

  **QA Scenarios (MANDATORY - task is INCOMPLETE without these):**

  > **This is NOT optional. A task without QA scenarios WILL BE REJECTED.**
  >
  > **The executing agent MUST run these scenarios after implementation.**
  > **The orchestrator WILL verify evidence files exist before marking task complete.**

  \`\`\`
  Scenario: Verify legacy presentationeditor directory is deleted and workspace intact
    Tool: Bash
    Preconditions: Legacy editor exists at apps/web/apps/presentationeditor/
    Steps:
      1. Verify directory exists before deletion: `test -d apps/web/apps/presentationeditor/`
      2. Execute deletion: `rm -rf apps/web/apps/presentationeditor/`
      3. Verify directory is gone: `! test -d apps/web/apps/presentationeditor/`
      4. Run pnpm install to verify workspace integrity: `pnpm install --frozen-lockfile 2>&1`
      5. Run pnpm typecheck to verify TypeScript passes: `pnpm typecheck 2>&1`
      6. Run pnpm build to verify all packages build: `pnpm build 2>&1`
      7. Grep for orphan references: `grep -r "presentationeditor/" apps/web/apps/*-react/ 2>&1`
    Expected Result: Directory deleted, workspace builds pass, no orphan references
    Failure Indicators: Build errors, typecheck errors, grep finds references to legacy
    Evidence: .sisyphus/evidence/task-3-delete-presentationeditor.txt

  Scenario: Verify React presentation editor still functional after legacy deletion
    Tool: Bash
    Preconditions: Legacy editor deleted, React editor exists
    Steps:
      1. Check React editor package exists: `test -f apps/web/apps/presentationeditor-react/package.json`
      2. Verify React editor still typechecks: `cd apps/web/apps/presentationeditor-react && pnpm typecheck 2>&1`
      3. Verify React editor still builds: `cd apps/web/apps/presentationeditor-react && pnpm build 2>&1`
    Expected Result: React presentationeditor-react package remains functional, builds and typechecks successfully
    Failure Indicators: Build errors, type errors, missing dependencies
    Evidence: .sisyphus/evidence/task-3-react-functional.txt

  Scenario: Verify no legacy presentationeditor references in workspace
    Tool: Bash
    Preconditions: Legacy editor deleted
    Steps:
      1. Search for any references to presentationeditor path: `grep -r "presentationeditor/main" apps/web/ 2>&1 | grep -v "presentationeditor-react"`
      2. Search for any references to presentationeditor vendor: `grep -r "presentationeditor/vendor" apps/web/ 2>&1`
    Expected Result: Zero matches to legacy presentationeditor paths (excluding presentationeditor-react)
    Failure Indicators: Grep finds references to legacy paths
    Evidence: .sisyphus/evidence/task-3-no-orphan-references.txt
  \`\`\`

  **Evidence to Capture**:
  - [ ] Each evidence file named: task-{N}-{scenario-slug}.{ext}
  - [ ] Build verification saved
  - [ ] Grep verification output saved

  **Commit**: YES (groups with 4)
  - Message: `refactor(web): remove legacy presentationeditor (vanilla JS)`
  - Files: `apps/web/apps/presentationeditor/`
  - Pre-commit: `pnpm install && pnpm typecheck && pnpm build`

---

- [ ] 4. Delete Legacy PDF Editor + Visio Editor

  **What to do**:
  - Delete `apps/web/apps/pdfeditor/` directory entirely (~??? files total)
  - Delete `apps/web/apps/visioeditor/` directory entirely (~??? files total)
  - Delete all HTML entry points and JS code from both editors
  - Combined deletion because these are the smallest editors

  **Must NOT do**:
  - DO NOT delete `apps/web/apps/pdfeditor-react/` — modern React editor, stays
  - DO NOT delete `apps/web/apps/visioeditor-react/` — modern React editor, stays
  - DO NOT delete `apps/web/apps/api/documents/` — embed API used by integrations
  - DO NOT delete `apps/web/apps/common/` — shared legacy code used by embed API
  - DO NOT delete `apps/web/packages/` — shared packages

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Combined deletion of two smallest editors, same pattern as previous tasks
  - **Skills**: None required
  - **Skills Evaluated but Omitted**:
    - `using-git-worktrees`: Not needed - single deletion, no feature work
    - `test-driven-development`: No tests exist for legacy code, verification via build commands

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential
  - **Blocks**: Task 5, 6
  - **Blocked By**: Task 3

  **References** (CRITICAL - Be Exhaustive):

  > The executor has NO context from your interview. References are their ONLY guide.
  > Each reference must answer: "What should I look at and WHY?"

  **File Paths** (directories to delete):
  - `apps/web/apps/pdfeditor/` - Legacy PDF editor directory
  - `apps/web/apps/visioeditor/` - Legacy Visio editor directory

  **WHY Each Reference Matters** (explain the relevance):
  - These are the directories to delete — contain all legacy vanilla JavaScript code for the PDF and Visio editors
  - Do not delete pdfeditor-react/ or visioeditor-react/ or any other directories

  **Acceptance Criteria**:

  > **AGENT-EXECUTABLE VERIFICATION ONLY** - No human action permitted.
  > Every criterion MUST be verifiable by running a command or using a tool.

  **Build Verification**:
  - [ ] pnpm install --frozen-lockfile → PASS (no errors)
  - [ ] pnpm typecheck → PASS (0 errors, 0 warnings)
  - [ ] pnpm build → PASS (all packages build successfully)

  **File Deletion Verification**:
  - [ ] PDF directory deleted: `ls apps/web/apps/pdfeditor/` → "No such file or directory"
  - [ ] Visio directory deleted: `ls apps/web/apps/visioeditor/` → "No such file or directory"
  - [ ] No orphan files: `find apps/web/apps/ -name "pdfeditor" -o -name "visioeditor" -type d` → 0 matches

  **Reference Check Verification**:
  - [ ] React editors don't reference legacy: `grep -r "pdfeditor/\|visioeditor/" apps/web/apps/*-react/` → 0 matches
  - [ ] No vendor references: `grep -r "pdfeditor/vendor\|visioeditor/vendor" apps/web/apps/*-react/` → 0 matches

  **QA Scenarios (MANDATORY - task is INCOMPLETE without these):**

  > **This is NOT optional. A task without QA scenarios WILL BE REJECTED.**
  >
  > **The executing agent MUST run these scenarios after implementation.**
  > **The orchestrator WILL verify evidence files exist before marking task complete.**

  \`\`\`
  Scenario: Verify legacy pdfeditor and visioeditor directories are deleted and workspace intact
    Tool: Bash
    Preconditions: Legacy editors exist at apps/web/apps/pdfeditor/ and apps/web/apps/visioeditor/
    Steps:
      1. Verify directories exist before deletion: `test -d apps/web/apps/pdfeditor/ && test -d apps/web/apps/visioeditor/`
      2. Execute deletion: `rm -rf apps/web/apps/pdfeditor/ apps/web/apps/visioeditor/`
      3. Verify directories are gone: `! test -d apps/web/apps/pdfeditor/ && ! test -d apps/web/apps/visioeditor/`
      4. Run pnpm install to verify workspace integrity: `pnpm install --frozen-lockfile 2>&1`
      5. Run pnpm typecheck to verify TypeScript passes: `pnpm typecheck 2>&1`
      6. Run pnpm build to verify all packages build: `pnpm build 2>&1`
      7. Grep for orphan references: `grep -r "pdfeditor/\|visioeditor/" apps/web/apps/*-react/ 2>&1`
    Expected Result: Both directories deleted, workspace builds pass, no orphan references
    Failure Indicators: Build errors, typecheck errors, grep finds references to legacy
    Evidence: .sisyphus/evidence/task-4-delete-pdf-visioeditors.txt

  Scenario: Verify React PDF and Visio editors still functional after legacy deletion
    Tool: Bash
    Preconditions: Legacy editors deleted, React editors exist
    Steps:
      1. Check React PDF editor package exists: `test -f apps/web/apps/pdfeditor-react/package.json`
      2. Check React Visio editor package exists: `test -f apps/web/apps/visioeditor-react/package.json`
      3. Verify React PDF editor still typechecks: `cd apps/web/apps/pdfeditor-react && pnpm typecheck 2>&1`
      4. Verify React Visio editor still typechecks: `cd apps/web/apps/visioeditor-react && pnpm typecheck 2>&1`
      5. Verify React PDF editor still builds: `cd apps/web/apps/pdfeditor-react && pnpm build 2>&1`
      6. Verify React Visio editor still builds: `cd apps/web/apps/visioeditor-react && pnpm build 2>&1`
    Expected Result: Both React editor packages remain functional, build and typecheck successfully
    Failure Indicators: Build errors, type errors, missing dependencies
    Evidence: .sisyphus/evidence/task-4-react-functional.txt

  Scenario: Verify no legacy PDF/Visio editor references in workspace
    Tool: Bash
    Preconditions: Legacy editors deleted
    Steps:
      1. Search for any references to pdfeditor path: `grep -r "pdfeditor/main" apps/web/ 2>&1 | grep -v "pdfeditor-react"`
      2. Search for any references to visioeditor path: `grep -r "visioeditor/main" apps/web/ 2>&1 | grep -v "visioeditor-react"`
      3. Search for any references to pdfeditor vendor: `grep -r "pdfeditor/vendor" apps/web/ 2>&1`
      4. Search for any references to visioeditor vendor: `grep -r "visioeditor/vendor" apps/web/ 2>&1`
    Expected Result: Zero matches to legacy PDF/Visio editor paths (excluding *-react versions)
    Failure Indicators: Grep finds references to legacy paths
    Evidence: .sisyphus/evidence/task-4-no-orphan-references.txt
  \`\`\`

  **Evidence to Capture**:
  - [ ] Each evidence file named: task-{N}-{scenario-slug}.{ext}
  - [ ] Build verification saved
  - [ ] Grep verification output saved

  **Commit**: YES (groups with 5)
  - Message: `refactor(web): remove legacy pdfeditor and visioeditor (vanilla JS)`
  - Files: `apps/web/apps/pdfeditor/`, `apps/web/apps/visioeditor/`
  - Pre-commit: `pnpm install && pnpm typecheck && pnpm build`

---

- [ ] 5. Update Documentation

  **What to do**:
  - Update `AGENTS.md` at root: Remove references to legacy editor directories, update file counts
  - Update `README.md` at root: Remove references to legacy editors in Quick Start and Architecture sections
  - Update `apps/web/AGENTS.md`: Remove legacy editor entries, update structure to reflect React-only architecture
  - Update `apps/web/Readme.md`: Update to reflect React editors as the primary interface
  - Update `ROADMAP.md`: Add note about legacy editor removal completion, mark Phase 4 as truly complete
  - Remove any references to documenteditor/, spreadsheeteditor/, presentationeditor/, pdfeditor/, visioeditor/ directories (non-React)
  - Update any file count mentions: legacy editors had ~22K files, now React-only

  **Must NOT do**:
  - DO NOT modify any React editor code (`*-react/` directories or `editor-shell/`)
  - DO NOT modify any `packages/` code
  - DO NOT modify Rust backend code
  - DO NOT delete `apps/web/apps/api/documents/` — embed API used by integrations
  - DO NOT delete `apps/web/apps/common/` — shared legacy code used by embed API
  - DO NOT delete `apps/web/vendor/` — vendored libs used by embed API
  - DO NOT delete `apps/web/theme/` — legacy themes used by embed API
  - DO NOT delete `apps/web/translation/` — legacy translations used by embed API

  **Recommended Agent Profile**:
  - **Category**: `writing`
    - Reason: Documentation updates require careful editing of multiple markdown files, preserving existing structure while removing references
  - **Skills**: None required
  - **Skills Evaluated but Omitted**:
    - `using-git-worktrees`: Not needed - documentation edits, no feature work
    - `test-driven-development`: No tests for documentation, verification via file reads

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential
  - **Blocks**: Task 6
  - **Blocked By**: Task 4

  **References** (CRITICAL - Be Exhaustive):

  > The executor has NO context from your interview. References are their ONLY guide.
  > Each reference must answer: "What should I look at and WHY?"

  **File Paths** (documentation to update):
  - `README.md` - Root documentation, references legacy editors in Quick Start and Architecture
  - `AGENTS.md` - Root agents documentation, references legacy editors
  - `ROADMAP.md` - Project roadmap, marks Phase 4 complete
  - `apps/web/AGENTS.md` - Web editor agents documentation
  - `apps/web/Readme.md` - Web-specific readme

  **WHY Each Reference Matters** (explain the relevance):
  - These files contain references to the legacy editors being deleted. Must update to reflect React-only architecture and remove all legacy paths.

  **Acceptance Criteria**:

  > **AGENT-EXECUTABLE VERIFICATION ONLY** - No human action permitted.
  > Every criterion MUST be verifiable by running a command or using a tool.

  **Documentation Updates**:
  - [ ] README.md updated: No references to legacy editors (documenteditor, spreadsheeteditor, presentationeditor, pdfeditor, visioeditor without -react suffix)
  - [ ] AGENTS.md updated: Legacy editor section removed or marked as obsolete
  - [ ] apps/web/AGENTS.md updated: Structure reflects React-only, all legacy directory entries removed
  - [ ] apps/web/Readme.md updated: References React editors as primary interface
  - [ ] ROADMAP.md updated: Phase 4 marked as complete with note about legacy removal
  - [ ] Grep verification: No legacy references remain in documentation
  - [ ] File counts updated: Legacy ~22K files removed, React-only

  **QA Scenarios (MANDATORY - task is INCOMPLETE without these):**

  > **This is NOT optional. A task without QA scenarios WILL BE REJECTED.**
  >
  > **The executing agent MUST run these scenarios after implementation.**
  > **The orchestrator WILL verify evidence files exist before marking task complete.**

  \`\`\`
  Scenario: Verify README.md has no legacy editor references
    Tool: Bash
    Preconditions: Documentation updates complete
    Steps:
      1. Search for legacy editor references: `grep -n "documenteditor/\|spreadsheeteditor/\|presentationeditor/" README.md 2>&1 | grep -v "-react"`
      2. Verify count of references: Count the matches from step 1
    Expected Result: Zero matches to legacy editor paths (excluding -react suffixes)
    Failure Indicators: Grep finds references to non-React legacy paths
    Evidence: .sisyphus/evidence/task-5-readme-cleanup.txt

  Scenario: Verify AGENTS.md has no legacy editor references
    Tool: Bash
    Preconditions: Documentation updates complete
    Steps:
      1. Search for legacy editor directory entries: `grep -n "documenteditor/\|spreadsheeteditor/\|presentationeditor/" AGENTS.md 2>&1 | grep -v "-react"`
      2. Verify legacy editor section is removed or marked obsolete
    Expected Result: Legacy editor section removed or marked as obsolete, no active references to non-React paths
    Failure Indicators: Grep finds references to non-React legacy paths in active sections
    Evidence: .sisyphus/evidence/task-5-agents-cleanup.txt

  Scenario: Verify apps/web/AGENTS.md reflects React-only architecture
    Tool: Bash
    Preconditions: Documentation updates complete
    Steps:
      1. Check structure section lists React editors only: `grep -A20 "STRUCTURE" apps/web/AGENTS.md 2>&1`
      2. Verify no legacy editor entries: `grep -E "documenteditor[^-]|spreadsheeteditor[^-]|presentationeditor[^-]|pdfeditor[^-]|visioeditor[^-]" apps/web/AGENTS.md 2>&1`
    Expected Result: Structure lists only React editors (*-react), no legacy directories
    Failure Indicators: Grep finds legacy editor directory entries
    Evidence: .sisyphus/evidence/task-5-web-agents-cleanup.txt

  Scenario: Verify ROADMAP.md reflects legacy removal completion
    Tool: Bash
    Preconditions: Documentation updates complete
    Steps:
      1. Check Phase 4 status: `grep -A2 "Phase 4" ROADMAP.md 2>&1`
      2. Verify legacy removal note exists: `grep -i "legacy.*remov" ROADMAP.md 2>&1`
    Expected Result: Phase 4 marked complete with note about legacy editor removal
    Failure Indicators: Phase 4 still mentions migration in progress, no removal note
    Evidence: .sisyphus/evidence/task-5-roadmap-cleanup.txt
  \`\`\`

  **Evidence to Capture**:
  - [ ] Each evidence file named: task-{N}-{scenario-slug}.{ext}
  - [ ] Grep verification output saved for all documentation files

  **Commit**: YES
  - Message: `docs: update documentation to reflect React-only architecture`

---

- [ ] 6. Final Verification

  **What to do**:
  - Run full workspace build verification (pnpm install, typecheck, build, lint)
  - Verify all 5 legacy editor directories are deleted
  - Verify React editors still build and typecheck successfully
  - Verify no orphan references to legacy code in workspace
  - Verify Rust backend unaffected (cargo test -p wo-docserver)
  - Verify pnpm-lock.yaml has no references to deleted packages

  **Must NOT do**:
  - DO NOT modify any code (this is verification only)
  - DO NOT delete any React editor or shared package code

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Verification task runs commands and checks outputs, no code changes
  - **Skills**: None required
  - **Skills Evaluated but Omitted**:
    - `using-git-worktrees`: Not needed - verification only
    - `test-driven-development`: No tests to write, just command execution

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential
  - **Blocks**: Final completion
  - **Blocked By**: Task 5

  **References** (CRITICAL - Be Exhaustive):

  > The executor has NO context from your interview. References are their ONLY guide.
  > Each reference must answer: "What should I look at and WHY?"

  **Acceptance Criteria**:

  > **AGENT-EXECUTABLE VERIFICATION ONLY** - No human action permitted.
  > Every criterion MUST be verifiable by running a command or using a tool.

  **Final Workspace Build**:
  - [ ] pnpm install --frozen-lockfile → PASS (no errors)
  - [ ] pnpm typecheck → PASS (0 errors, 0 warnings)
  - [ ] pnpm build → PASS (all packages build successfully)
  - [ ] pnpm lint → PASS (0 errors, 0 warnings)

  **Legacy Deletion Verification**:
  - [ ] documenteditor deleted: `ls apps/web/apps/documenteditor/ 2>&1 | grep "No such file or directory"`
  - [ ] spreadsheeteditor deleted: `ls apps/web/apps/spreadsheeteditor/ 2>&1 | grep "No such file or directory"`
  - [ ] presentationeditor deleted: `ls apps/web/apps/presentationeditor/ 2>&1 | grep "No such file or directory"`
  - [ ] pdfeditor deleted: `ls apps/web/apps/pdfeditor/ 2>&1 | grep "No such file or directory"`
  - [ ] visioeditor deleted: `ls apps/web/apps/visioeditor/ 2>&1 | grep "No such file or directory"`

  **React Editors Functional**:
  - [ ] documenteditor-react builds: `cd apps/web/apps/documenteditor-react && pnpm build 2>&1 | tail -5`
  - [ ] spreadsheeteditor-react builds: `cd apps/web/apps/spreadsheeteditor-react && pnpm build 2>&1 | tail -5`
  - [ ] presentationeditor-react builds: `cd apps/web/apps/presentationeditor-react && pnpm build 2>&1 | tail -5`
  - [ ] pdfeditor-react builds: `cd apps/web/apps/pdfeditor-react && pnpm build 2>&1 | tail -5`
  - [ ] visioeditor-react builds: `cd apps/web/apps/visioeditor-react && pnpm build 2>&1 | tail -5`

  **No Orphan References**:
  - [ ] No legacy paths in React editors: `grep -r "documenteditor/\|spreadsheeteditor/\|presentationeditor/\|pdfeditor/\|visioeditor/" apps/web/apps/*-react/ 2>&1 | wc -l`
  - [ ] Expected: 0 matches

  **Rust Backend Unaffected**:
  - [ ] wo-docserver tests pass: `cargo test -p wo-docserver --lib 2>&1 | tail -10`

  **Documentation Updated**:
  - [ ] All documentation files updated and verified

  **QA Scenarios (MANDATORY - task is INCOMPLETE without these):**

  > **This is NOT optional. A task without QA scenarios WILL BE REJECTED.**
  >
  > **The executing agent MUST run these scenarios after implementation.**
  > **The orchestrator WILL verify evidence files exist before marking task complete.**

  \`\`\`
  Scenario: Complete final workspace verification
    Tool: Bash
    Preconditions: All legacy editors deleted, documentation updated
    Steps:
      1. Clean install: `rm -rf node_modules .pnpm-store && pnpm install --frozen-lockfile 2>&1 | tail -20`
      2. Full typecheck: `pnpm typecheck 2>&1 | tail -20`
      3. Full build: `pnpm build 2>&1 | tail -20`
      4. Lint check: `pnpm lint 2>&1 | tail -10`
      5. Verify all legacy directories gone: `for dir in documenteditor spreadsheeteditor presentationeditor pdfeditor visioeditor; do ls apps/web/apps/$dir 2>&1 | grep "No such file"; done`
      6. Check React editors build: `for dir in documenteditor spreadsheeteditor presentationeditor pdfeditor visioeditor; do cd apps/web/apps/${dir}-react && pnpm build 2>&1 | grep -E "built|error" | head -2; done`
      7. Check orphan references: `grep -r "documenteditor/\|spreadsheeteditor/\|presentationeditor/\|pdfeditor/\|visioeditor/" apps/web/apps/*-react/ 2>&1 | wc -l`
      8. Check Rust backend: `cargo test -p wo-docserver --lib 2>&1 | tail -10`
    Expected Result: All commands pass, legacy directories deleted, React editors build successfully, no orphan references, Rust backend unaffected
    Failure Indicators: Any command fails, build errors, orphan references found, Rust tests fail
    Evidence: .sisyphus/evidence/task-6-final-verification.txt

  Scenario: Verify React editors are the only editors remaining
    Tool: Bash
    Preconditions: Legacy editors deleted
    Steps:
      1. List all editor directories: `ls -d apps/web/apps/ 2>&1 | grep -E "editor|api|common|editor-shell"`
      2. Count legacy editors: `echo "Legacy: 0 (documenteditor spreadsheeteditor presentationeditor pdfeditor visioeditor all deleted)"`
      3. Count React editors: `echo "React: 5 (documenteditor-react spreadsheeteditor-react presentationeditor-react pdfeditor-react visioeditor-react all functional)"`
      4. Verify no mixed legacy/React references exist
    Expected Result: Only React editors remain, all legacy editors deleted
    Failure Indicators: Any legacy editor directory still exists
    Evidence: .sisyphus/evidence/task-6-react-only-architecture.txt
  \`\`\`

  **Evidence to Capture**:
  - [ ] Each evidence file named: task-{N}-{scenario-slug}.{ext}
  - [ ] All verification commands output saved

  **Commit**: NO (verification only, no code changes)

---

- [ ] 5. Update Documentation

  **What to do**:
  - Update `AGENTS.md` at root: Remove references to legacy editor directories, update file counts
  - Update `README.md` at root: Remove references to legacy editors in Quick Start and Architecture sections
  - Update `apps/web/AGENTS.md`: Remove legacy editor entries, update structure to reflect React-only architecture
  - Update `apps/web/Readme.md`: Update to reflect React editors as primary interface
  - Update `ROADMAP.md`: Add note about legacy editor removal completion, mark Phase 4 as truly complete
  - Remove any references to documenteditor/, spreadsheeteditor/, presentationeditor/, pdfeditor/, visioeditor/ directories (non-React)
  - Update any file count mentions: legacy editors had ~22K files, now React-only

  **Must NOT do**:
  - DO NOT modify any React editor code (`*-react/` directories or `editor-shell/`)
  - DO NOT modify any `packages/` code
  - DO NOT modify Rust backend code
  - DO NOT delete `apps/web/apps/api/documents/` — embed API used by integrations
  - DO NOT delete `apps/web/apps/common/` — shared legacy code used by embed API
  - DO NOT delete `apps/web/packages/` — shared packages
  - DO NOT delete `apps/web/vendor/` — vendored libs used by embed API
  - DO NOT delete `apps/web/theme/` — legacy themes used by embed API
  - DO NOT delete `apps/web/translation/` — legacy translations used by embed API

  **Recommended Agent Profile**:
  - **Category**: `writing`
    - Reason: Documentation updates require careful editing of multiple markdown files, preserving existing structure while removing references
  - **Skills**: None required
  - **Skills Evaluated but Omitted**:
    - `using-git-worktrees`: Not needed - documentation edits, no feature work
    - `test-driven-development`: No tests for documentation, verification via file reads

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential
  - **Blocks**: Task 6
  - **Blocked By**: Task 4

  **References** (CRITICAL - Be Exhaustive):

  > The executor has NO context from your interview. References are their ONLY guide.
  > Each reference must answer: "What should I look at and WHY?"

  **File Paths** (documentation to update):
  - `README.md` - Root documentation, references legacy editors in Quick Start and Architecture
  - `AGENTS.md` - Root agents documentation, references legacy editors
  - `ROADMAP.md` - Project roadmap, marks Phase 4 complete
  - `apps/web/AGENTS.md` - Web editor agents documentation
  - `apps/web/Readme.md` - Web-specific readme

  **WHY Each Reference Matters** (explain the relevance):
  - These files contain references to legacy editors being deleted. Must update to reflect React-only architecture and remove all legacy paths.

  **Acceptance Criteria**:

  > **AGENT-EXECUTABLE VERIFICATION ONLY** - No human action permitted.
  > Every criterion MUST be verifiable by running a command or using a tool.

  **Documentation Updates**:
  - [ ] README.md updated: No references to legacy editors (documenteditor, spreadsheeteditor, presentationeditor, pdfeditor, visioeditor without -react suffix)
  - [ ] AGENTS.md updated: Legacy editor section removed or marked as obsolete
  - [ ] apps/web/AGENTS.md updated: Structure reflects React-only, all legacy directory entries removed
  - [ ] apps/web/Readme.md updated: References React editors as primary interface
  - [ ] ROADMAP.md updated: Phase 4 marked as complete with note about legacy removal
  - [ ] Grep verification: No legacy references remain in documentation
  - [ ] File counts updated: Legacy ~22K files removed, React-only

  **QA Scenarios (MANDATORY - task is INCOMPLETE without these):**

  > **This is NOT optional. A task without QA scenarios WILL BE REJECTED.**
  >
  > **The executing agent MUST run these scenarios after implementation.**
  > **The orchestrator WILL verify evidence files exist before marking task complete.**

  \`\`\`
  Scenario: Verify README.md has no legacy editor references
    Tool: Bash
    Preconditions: Documentation updates complete
    Steps:
      1. Search for legacy editor references: `grep -n "documenteditor/\|spreadsheeteditor/\|presentationeditor/" README.md 2>&1 | grep -v "-react"`
      2. Verify count of references: Count matches from step 1
    Expected Result: Zero matches to legacy editor paths (excluding -react suffixes)
    Failure Indicators: Grep finds references to non-React legacy paths
    Evidence: .sisyphus/evidence/task-5-readme-cleanup.txt

  Scenario: Verify AGENTS.md has no legacy editor references
    Tool: Bash
    Preconditions: Documentation updates complete
    Steps:
      1. Search for legacy editor directory entries: `grep -n "documenteditor/\|spreadsheeteditor/\|presentationeditor/" AGENTS.md 2>&1 | grep -v "-react"`
      2. Verify legacy editor section is removed or marked obsolete
    Expected Result: Legacy editor section removed or marked as obsolete, no active references to non-React paths
    Failure Indicators: Grep finds references to non-React legacy paths in active sections
    Evidence: .sisyphus/evidence/task-5-agents-cleanup.txt

  Scenario: Verify apps/web/AGENTS.md reflects React-only architecture
    Tool: Bash
    Preconditions: Documentation updates complete
    Steps:
      1. Check structure section lists React editors only: `grep -A20 "STRUCTURE" apps/web/AGENTS.md 2>&1`
      2. Verify no legacy editor entries: `grep -E "documenteditor[^-]|spreadsheeteditor[^-]|presentationeditor[^-]|pdfeditor[^-]|visioeditor[^-]" apps/web/AGENTS.md 2>&1`
    Expected Result: Structure lists only React editors (*-react), no legacy directories
    Failure Indicators: Grep finds legacy editor directory entries
    Evidence: .sisyphus/evidence/task-5-web-agents-cleanup.txt

  Scenario: Verify ROADMAP.md reflects legacy removal completion
    Tool: Bash
    Preconditions: Documentation updates complete
    Steps:
      1. Check Phase 4 status: `grep -A2 "Phase 4" ROADMAP.md 2>&1`
      2. Verify legacy removal note exists: `grep -i "legacy.*remov" ROADMAP.md 2>&1`
    Expected Result: Phase 4 marked as complete with note about legacy editor removal
    Failure Indicators: Phase 4 still mentions migration in progress, no removal note
    Evidence: .sisyphus/evidence/task-5-roadmap-cleanup.txt
  \`\`\`

  **Evidence to Capture**:
  - [ ] Each evidence file named: task-{N}-{scenario-slug}.{ext}
  - [ ] Grep verification output saved for all documentation files

  **Commit**: YES
  - Message: `docs: update documentation to reflect React-only architecture`

---

- [ ] 6. Delete Shared Legacy Infrastructure (BREAKS INTEGRATIONS)

  **What to do**:
  - Delete `apps/web/apps/api/` directory entirely (DocsAPI embed library, 1,430 lines)
  - Delete `apps/web/apps/common/` directory entirely (217 files, AMD/RequireJS shared code)
  - Delete `apps/web/vendor/` directory entirely (15 vendored libraries)
  - Delete `apps/web/theme/` directory entirely (legacy theme files)
  - Delete `apps/web/translation/` directory entirely (legacy translations)
  - Document in ROADMAP.md or issues file: All third-party integrations broken by this deletion

  **Must NOT do**:
  - DO NOT modify any React editor code (`*-react/` directories or `editor-shell/`)
  - DO NOT modify any `packages/` code
  - DO NOT modify Rust backend code
  - DO NOT delete `apps/web/packages/` — shared packages used by React editors

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Directory deletions of shared legacy infrastructure. All are dead code with no dependents (except integrations).
  - **Skills**: None required
  - **Skills Evaluated but Omitted**:
    - `using-git-worktrees`: Not needed - single deletion per commit
    - `test-driven-development`: No tests exist, verification via grep

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential
  - **Blocks**: Final verification (Task 6)
  - **Blocked By**: Task 5

  **References** (CRITICAL - Be Exhaustive):

  > The executor has NO context from your interview. References are their ONLY guide.
  > Each reference must answer: "What should I look at and WHY?"

  **File Paths** (directories to delete):
  - `apps/web/apps/api/` - DocsAPI embed library (used by all integrations)
  - `apps/web/apps/common/` - AMD/RequireJS shared code
  - `apps/web/vendor/` - Vendored libraries (requirejs, backbone, jquery, etc.)
  - `apps/web/theme/` - Legacy theme files
  - `apps/web/translation/` - Legacy translations

  **WHY Each Reference Matters** (explain the relevance):
  - These directories form the legacy embed system. Deleting them BREAKS ALL third-party integrations that embed World-Office via iframe. This is documented impact.

  **Acceptance Criteria**:

  > **AGENT-EXECUTABLE VERIFICATION ONLY** - No human action permitted.
  > Every criterion MUST be verifiable by running a command or using a tool.

  **Deletion Verification**:
  - [ ] pnpm install --frozen-lockfile → PASS (no errors)
  - [ ] pnpm typecheck → PASS (0 errors, 0 warnings)
  - [ ] pnpm build → PASS (all packages build successfully)

  **Directory Deletion Verification**:
  - [ ] api/ deleted: `ls apps/web/apps/api/` → "No such file or directory"
  - [ ] common/ deleted: `ls apps/web/apps/common/` → "No such file or directory"
  - [ ] vendor/ deleted: `ls apps/web/vendor/` → "No such file or directory"
  - [ ] theme/ deleted: `ls apps/web/theme/` → "No such file or directory"
  - [ ] translation/ deleted: `ls apps/web/translation/` → "No such file or directory"

  **Reference Check Verification**:
  - [ ] No orphan references: `find apps/web/apps/api -name "documenteditor/main\|spreadsheeteditor/main\|presentationeditor/main\|pdfeditor/main\|visioeditor/main" 2>&1 | wc -l`
    Expected: 0 matches (api/ used integrations that pointed to legacy, now broken)

  **Documentation Impact Verification**:
  - [ ] Document update completed in Task 5

  **QA Scenarios (MANDATORY - task is INCOMPLETE without these):**

  > **This is NOT optional. A task without QA scenarios WILL BE REJECTED.**
  >
  > **The executing agent MUST run these scenarios after implementation.**
  > **The orchestrator WILL verify evidence files exist before marking task complete.**

  \`\`\`
  Scenario: Verify all shared legacy infrastructure is deleted and workspace intact
    Tool: Bash
    Preconditions: Legacy infrastructure exists at apps/web/apps/api/, common/, vendor/, theme/, translation/
    Steps:
      1. Verify all directories exist before deletion: `test -d apps/web/apps/api/ && test -d apps/web/apps/common/ && test -d apps/web/vendor/ && test -d apps/web/theme/ && test -d apps/web/translation/`
      2. Execute deletion: `rm -rf apps/web/apps/api/ apps/web/apps/common/ apps/web/vendor/ apps/web/theme/ apps/web/translation/`
      3. Verify all directories are gone: `! test -d apps/web/apps/api/ && ! test -d apps/web/apps/common/ && ! test -d apps/web/vendor/ && ! test -d apps/web/theme/ && ! test -d apps/web/translation/`
      4. Run pnpm install to verify workspace integrity: `pnpm install --frozen-lockfile 2>&1`
      5. Run pnpm typecheck to verify TypeScript passes: `pnpm typecheck 2>&1`
      6. Run pnpm build to verify all packages build: `pnpm build 2>&1`
    Expected Result: All shared legacy infrastructure deleted, workspace builds pass, no orphan references to legacy paths
    Failure Indicators: Build errors, typecheck errors, any directory remains
    Evidence: .sisyphus/evidence/task-6-delete-shared-infrastructure.txt

  Scenario: Verify React editors still functional after shared infrastructure deletion
    Tool: Bash
    Preconditions: Legacy infrastructure deleted, React editors exist
    Steps:
      1. Check React editor package exists: `test -f apps/web/apps/documenteditor-react/package.json`
      2. Verify React editor still typechecks: `cd apps/web/apps/documenteditor-react && pnpm typecheck 2>&1`
      3. Verify React editor still builds: `cd apps/web/apps/documenteditor-react && pnpm build 2>&1`
    Expected Result: All React editor packages remain functional, typecheck and build successfully
    Failure Indicators: Build errors, type errors, missing dependencies
    Evidence: .sisyphus/evidence/task-6-react-functional.txt

  Scenario: Verify no shared infrastructure references in React editors
    Tool: Bash
    Preconditions: Legacy infrastructure deleted
    Steps:
      1. Search for any references to api/, common/, vendor/, theme/, translation/: `grep -r "apps/web/apps/api/\|apps/web/apps/common/\|apps/web/vendor/\|apps/web/theme/\|apps/web/translation/" apps/web/apps/*-react/ 2>&1`
    Expected Result: Zero matches to shared legacy infrastructure paths
    Failure Indicators: Grep finds references to deleted paths
    Evidence: .sisyphus/evidence/task-6-no-orphan-references.txt
  \`\`\`

  **Evidence to Capture**:
  - [ ] Each evidence file named: task-{N}-{scenario-slug}.{ext}
  - [ ] Build verification saved
  - [ ] Grep verification output saved

  **Commit**: YES (groups with 5)
  - Message: `refactor(web): remove shared legacy infrastructure (breaks integrations)`
  - Files: `apps/web/apps/api/`, `apps/web/apps/common/`, `apps/web/vendor/`, `apps/web/theme/`, `apps/web/translation/`
  - Pre-commit: `pnpm install && pnpm typecheck && pnpm build`

---

## Final Verification Wave

> Run after ALL implementation tasks complete. All verification agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.
>
> **Do NOT auto-proceed after verification. Wait for user's explicit approval before marking work complete.**
> **Never mark F1-F4 as checked before getting user's okay.** Rejection or user feedback -> fix -> re-run -> present again -> wait for okay.

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists (read file, curl endpoint, run command). For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files exist in .sisyphus/evidence/. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Run `pnpm typecheck`, `pnpm build`, `pnpm lint`. Review all changed files for: type errors, build errors, lint warnings. Check for broken imports, missing dependencies.
  Output: `Typecheck [PASS/FAIL] | Build [PASS/FAIL] | Lint [PASS/FAIL] | Files [N clean/N issues] | VERDICT`

- [ ] F3. **Real Manual QA** — `unspecified-high`
  Start from clean state. Execute EVERY QA scenario from EVERY task — follow exact steps, capture evidence. Verify workspace builds successfully after all deletions.
  Output: `Scenarios [N/N pass] | Build Verification [PASS/FAIL] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", verify directory is deleted (ls commands). Verify 1:1 — everything in spec was deleted (no missing), nothing beyond spec was built (no extra directories deleted). Check "Must NOT do" compliance.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

- **1**: `refactor(web): remove legacy documenteditor (vanilla JS)` - apps/web/apps/documenteditor/, pnpm install && pnpm typecheck && pnpm build
- **2**: `refactor(web): remove legacy spreadsheeteditor (vanilla JS)` - apps/web/apps/spreadsheeteditor/, pnpm install && pnpm typecheck && pnpm build
- **3**: `refactor(web): remove legacy presentationeditor (vanilla JS)` - apps/web/apps/presentationeditor/, pnpm install && pnpm typecheck && pnpm build
- **4**: `refactor(web): remove legacy pdfeditor and visioeditor (vanilla JS)` - apps/web/apps/pdfeditor/, apps/web/apps/visioeditor/, pnpm install && pnpm typecheck && pnpm build
- **5**: `docs: update documentation to reflect React-only architecture` - AGENTS.md, README.md, apps/web/AGENTS.md, apps/web/Readme.md, ROADMAP.md
- **6**: `docs: final verification and plan completion` - evidence files, verification results

---

## Success Criteria

### Verification Commands
```bash
# Verify all legacy editors are deleted
ls apps/web/apps/documenteditor/ 2>&1 | grep "No such file or directory"
ls apps/web/apps/spreadsheeteditor/ 2>&1 | grep "No such file or directory"
ls apps/web/apps/presentationeditor/ 2>&1 | grep "No such file or directory"
ls apps/web/apps/pdfeditor/ 2>&1 | grep "No such file or directory"
ls apps/web/apps/visioeditor/ 2>&1 | grep "No such file or directory"

# Verify workspace builds successfully
pnpm typecheck 2>&1 | tail -5
pnpm build 2>&1 | tail -10

# Verify no orphan references
grep -r "documenteditor/\|spreadsheeteditor/\|presentationeditor/" apps/web/apps/*-react/ 2>&1 | wc -l
# Expected: 0 matches

# Verify Rust backend unaffected
cargo test -p wo-docserver --lib 2>&1 | tail -10
```

### Final Checklist
- [ ] All 5 legacy editor directories deleted
- [ ] Documentation updated to reflect React-only architecture
- [ ] pnpm typecheck passes (0 errors, 0 warnings)
- [ ] pnpm build passes (all packages build successfully)
- [ ] No orphan references to legacy code in React editors
- [ ] All evidence files exist in .sisyphus/evidence/
- [ ] Rust backend tests pass (unaffected)
