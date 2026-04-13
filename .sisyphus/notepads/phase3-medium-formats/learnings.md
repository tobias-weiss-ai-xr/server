# Phase 3 Learnings

## 2026-04-13 Plan Assessment
- Both wo-odf and wo-docx-renderer already had complete FormatRoundtrip implementations (roundtrip.rs + lib.rs exports)
- All 16 format crates have roundtrip.rs files implementing FormatRoundtrip trait
- wo-pdf has a known rustc 1.94.1 ICE that prevents compilation - documented in AGENTS.md
- Cumulative test: 15/16 crates pass all tests (excluding wo-pdf ICE)
- Test counts: wo-txt(23), wo-unicode(32), wo-fb2(13), wo-html(18), wo-epub(11), wo-rtf(41), wo-hwp(12), wo-djvu(11), wo-xps(14), wo-ofd(10), wo-msbinary(29), wo-ooxml(18), wo-x2t(13), wo-odf(15), wo-docx-renderer(25)
- No test corpus files exist for ODF or DOCX (tests use programmatically-created minimal files)
- AGENTS.md already documents "16 crates with FormatRoundtrip trait"

