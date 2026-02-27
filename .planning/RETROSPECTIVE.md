# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v1.14 — Next Actions Batch

**Shipped:** 2026-02-27
**Phases:** 5 | **Plans:** 10 | **Sessions:** ~5

### What Was Built
- Genome migration cleanup (stale digital-twin references fixed)
- Data backup & recovery (rsync, SHA-256 manifest, scheduler, dashboard widget, restore UI)
- Apple Health integration (JSON ingest + SAX XML import + health cards + correlation charts)
- Cross-domain insights engine (genome-health correlations, taste-identity themes, LLM narratives)
- Unified search Cmd+K (server fan-out, Spotlight overlay, keyboard nav, deep linking)

### What Worked
- Wave-based plan execution with parallel agents completed 10 plans in ~1.5 hours
- Research phase prevented zero-dependency additions — all 5 phases used existing libraries only
- Fan-out architecture (Promise.allSettled) made search gracefully degradable from day one
- Day-partitioned JSON storage for health data aligned naturally with Apple Health export cadence
- CONTEXT.md from discuss-phase locked decisions early — no mid-execution design debates
- SAX streaming decision (from research) prevented OOM on 500MB+ Apple Health XML files

### What Was Inefficient
- Some ROADMAP.md plan checkboxes fell out of sync during multi-phase execution (manual fix needed)
- Verification checkpoint for Phase 5 partially duplicated the Phase 5 verifier output
- Research agent sometimes explored files already well-documented in CLAUDE.md
- GSD milestone versioning defaulted to "v1.0" instead of reading package.json version — required manual fix

### Patterns Established
- Portal rendering for overlays (z-index isolation above sidebar) — CmdKSearch sets the pattern
- Correlation text summaries via pure data math (no LLM) for zero-latency deterministic display
- "Evidence" and "Risk Marker" language for genome correlations — never causation claims
- 14-day minimum data threshold before showing correlation insights
- multer diskStorage (not memoryStorage) for large file uploads
- Raw fetch() instead of request() helper when Content-Type needs to be multipart/form-data

### Key Lessons
1. Day-partitioned JSON files are a strong pattern for time-series data when the query pattern is date-range-based
2. Promise.allSettled is the right default for fan-out queries where partial results are acceptable
3. SAX streaming should be the default for any user-uploaded XML/JSON over 10MB
4. CONTEXT.md (from discuss-phase) is the highest-leverage step — it prevents 80% of mid-execution pivots
5. GSD milestone labels should match the project's actual semver (from package.json), not arbitrary "v1.0" labels

### Cost Observations
- Model mix: ~30% opus (orchestration, user interaction), ~70% sonnet (research, execution, verification)
- Sessions: ~5 (discuss + plan + execute per phase, some combined)
- Notable: Single-day milestone execution — all 5 phases shipped 2026-02-26

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Sessions | Phases | Key Change |
|-----------|----------|--------|------------|
| v1.14 | ~5 | 5 | First GSD milestone — established wave execution, discuss-phase context, fan-out patterns |

### Cumulative Quality

| Milestone | Tests | Coverage | Zero-Dep Additions |
|-----------|-------|----------|-------------------|
| v1.14 | existing | — | 5/5 phases (zero new npm dependencies) |

### Top Lessons (Verified Across Milestones)

1. Research before planning prevents unnecessary dependency additions
2. CONTEXT.md locks design decisions — downstream agents execute without asking the user
