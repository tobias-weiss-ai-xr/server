
## ARCHITECTURE.md Rewrite (2026-04-03)

**Task**: Rewrite corrupted ARCHITECTURE.md (265 lines of dmdb garbage)

**Source Material**:
- .sisyphus/drafts/roadmap-architecture-map.md (240 lines, comprehensive draft)
- AGENTS.md (122 lines, \
Where
to
Look\ tables)

**Requirements**:
- File <= 500 lines
- Zero github.com URLs (only codeberg.org/Word-Office links)
- SPDX header present
- ASCII dependency graph showing all 22 repos
- 22-repo inventory table organized by tier
- Build order (topological sort)
- License compliance summary table
- \
Where
to
Look\ quick-reference table

**Key Corrections Applied**:
- sdkjs/ is NOT empty - actively maintained with 1287 files and commits from today
- word-office-opencloud/ is a 1-commit prototype/demo, NOT production
- documents-app-android/ has 850 Kotlin files, substantial code, but no Word Office specific changes yet
- plugin-aiautofill/ is entirely new Word Office code (not a fork)

**Outcome**:
- Final file: 200 lines (60% under 500-line limit)
- Clean ASCII dependency graph showing all 6 tiers
- All repos accurately described with correct state (Production/WIP/Fork/Original)
- Topological build order clearly separated into 7 phases
- License table properly categorized (AGPL-3.0, Apache-2.0, CC0-1.0, per-font)
- No github.com URLs (verified with grep)

**Structure Used**:
1. SPDX header
2. Brief intro (2-3 sentences)
3. ASCII dependency graph (all 22 repos)
4. Build order (7 phases)
5. Repository inventory (6 tiers)
6. License compliance table
7. \
Where
to
Look\ quick-reference table
