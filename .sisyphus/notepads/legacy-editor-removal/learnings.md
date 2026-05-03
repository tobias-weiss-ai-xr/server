# Legacy Editor Removal - Notepad

## Conventions
- Each legacy editor deletion is one atomic commit
- Verification: pnpm install && pnpm typecheck && pnpm build after each deletion
- Shared infrastructure (api/, common/, vendor/, theme/, translation/) handled in Task 6
- React editors (*-react/) must NOT be modified

## Decisions
- User chose "Delete (Breaks Integrations)" for shared legacy infrastructure
- Task 6 deletes api/, common/, vendor/, theme/, translation/ (BREAKS all third-party integrations)

## Issues
- (none yet)

## Problems
- (none yet)
