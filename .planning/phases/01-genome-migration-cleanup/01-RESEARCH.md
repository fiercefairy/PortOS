# Phase 1: Genome Migration Cleanup - Research

**Researched:** 2026-02-26
**Domain:** Internal codebase migration — stale path references, data directory alignment
**Confidence:** HIGH

## Summary

This phase is a targeted cleanup of stale `digital-twin` path references left over from when genome data was under `data/digital-twin/`. The data and API surface have already been partially migrated: the server mounts the genome router at `/api/meatspace/genome` (server/index.js line 209), the client's `api.js` calls `/meatspace/genome/...` endpoints, and the Layout sidebar links to `/meatspace/genome`. However, three mismatches remain.

First, every route comment in `server/routes/genome.js` still says `// GET /api/digital-twin/genome/...` (18 occurrences). Second, `server/services/genome.js`, `server/services/clinvar.js`, and `server/services/epigenetic.js` all set their data directory to `PATHS.digitalTwin` — meaning genome files (`genome.json`, `genome-raw.txt`, `clinvar-index.json`, etc.) are read from and written to `data/digital-twin/`, not `data/meatspace/`. Third, `IdentityTab.jsx` has a "View Full Genome" button that navigates to `/digital-twin/genome` — a tab case that does not exist in the DigitalTwin page — making it a dead route.

The fix requires three precise edits: (1) update route comments, (2) switch three service files from `PATHS.digitalTwin` to `PATHS.meatspace`, (3) update the IdentityTab navigation target. The data files in `data/digital-twin/` (`genome.json`, `genome-raw.txt`, `clinvar-index.json`, `clinvar-meta.json`) must also be moved to `data/meatspace/`, or the service path change will cause genome data to appear missing on next startup.

**Primary recommendation:** Make all three code changes atomically with the data migration (move files from `data/digital-twin/` to `data/meatspace/`) in a single commit so the system is never in a broken state.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| GEN-01 | Route comments updated from `/api/digital-twin/genome/` to `/api/meatspace/genome/` | All 18 occurrences are in `server/routes/genome.js` lines 19-217; simple string replacement |
| GEN-02 | IdentityTab Genome card removed or redirected to `/meatspace/genome` | IdentityTab.jsx line 190: `navigate('/digital-twin/genome')` → `navigate('/meatspace/genome')`; the meatspace genome tab exists in MeatSpace.jsx |
| GEN-03 | genome.js reads data from `data/meatspace/` paths and returns valid genome data | Three service files use `PATHS.digitalTwin`; must switch to `PATHS.meatspace` and move existing data files |
</phase_requirements>

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Node.js `fs/promises` | (project runtime) | File I/O for genome data | Already used throughout all genome services |
| Express Router | (project runtime) | Route mounting | Already in use; no change needed |
| React Router `useNavigate` | (project runtime) | Client-side navigation | Already imported in IdentityTab.jsx |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `PATHS` from `server/lib/fileUtils.js` | internal | Centralized path constants | Already the sole source of truth for data dirs — change here propagates to all services |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Changing `PATHS.digitalTwin` in 3 service files | Add a `PATHS.genomeData` alias | Alias approach adds indirection with no benefit; direct use of `PATHS.meatspace` is cleaner and consistent with other meatspace services |
| Moving data files manually | Leave old files and add a migration shim | Migration shim is speculative complexity; a one-time file move is simpler and correct |

**Installation:** No new packages required.

## Architecture Patterns

### Recommended Project Structure

After migration, genome data lives in:
```
data/
├── digital-twin/           # Identity, chronotype, longevity, taste, goals (no genome files)
│   ├── chronotype.json
│   ├── goals.json
│   └── ...
└── meatspace/              # Physical health data including genome
    ├── genome.json         # (moved from data/digital-twin/)
    ├── genome-raw.txt      # (moved from data/digital-twin/)
    ├── clinvar-index.json  # (moved from data/digital-twin/)
    ├── clinvar-meta.json   # (moved from data/digital-twin/)
    ├── blood-tests.json
    └── ...
```

### Pattern 1: PATHS constant swap

**What:** Replace `PATHS.digitalTwin` with `PATHS.meatspace` in the three affected service files.

**When to use:** `PATHS.meatspace` already exists in `server/lib/fileUtils.js` (line 31) — no new constant needed.

**Example (server/services/genome.js):**
```javascript
// Before (line 7)
const GENOME_DIR = PATHS.digitalTwin;

// After
const GENOME_DIR = PATHS.meatspace;
```

Apply the same change to:
- `server/services/clinvar.js` line 9: `const GENOME_DIR = PATHS.digitalTwin;`
- `server/services/epigenetic.js` line 6: `const DATA_DIR = PATHS.digitalTwin;`

### Pattern 2: Route comment update

**What:** Replace all route comment path prefixes in `server/routes/genome.js`.

**When to use:** 18 comment lines follow the format `// [METHOD] /api/digital-twin/genome[/suffix]`.

**Example (routes/genome.js line 19):**
```javascript
// Before
// GET /api/digital-twin/genome — Summary

// After
// GET /api/meatspace/genome — Summary
```

All 18 occurrences are a string replace of `/api/digital-twin/genome` → `/api/meatspace/genome`.

### Pattern 3: IdentityTab navigation fix

**What:** Update the "View Full Genome" button to navigate to the correct meatspace route.

**Example (client/src/components/digital-twin/tabs/IdentityTab.jsx line 190):**
```javascript
// Before
onClick={() => navigate('/digital-twin/genome')}

// After
onClick={() => navigate('/meatspace/genome')}
```

The `/meatspace/genome` tab is confirmed to exist: `MeatSpace.jsx` has a `case 'genome': return <GenomeTab />;` at line 29, and `Layout.jsx` includes `{ to: '/meatspace/genome', label: 'Genome', icon: Dna }` at line 134.

### Anti-Patterns to Avoid

- **Partial migration:** Do not change service paths without moving data files, or genome data will silently appear missing (the service uses `readFile(...).catch(() => null)` which returns null on missing file, appearing as "not uploaded").
- **Leaving old files in digital-twin:** Old `data/digital-twin/genome.json` and `genome-raw.txt` will not be automatically cleaned up. They should be moved, not copied, to avoid confusing future debugging.
- **Changing the actual route mount:** The Express mount at `server/index.js` line 209 (`app.use('/api/meatspace/genome', genomeRoutes)`) is already correct. Do not touch it.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| File migration | Shell copy script | `fs.rename()` or git-tracked shell one-liner | Simple rename; no edge cases at this scale |
| Path aliasing | New PATHS constant | Directly use existing `PATHS.meatspace` | PATHS.meatspace already defined at fileUtils.js:31 |

**Key insight:** This phase contains zero new logic. Every change is a string substitution or constant swap in existing code. The risk is entirely operational: leaving the system in a state where data files are at the old path while code reads from the new path.

## Common Pitfalls

### Pitfall 1: Data files not moved with code change
**What goes wrong:** genome.js starts reading from `data/meatspace/` but `genome.json` and `genome-raw.txt` are still in `data/digital-twin/`. `getGenomeSummary()` returns `{ uploaded: false }`. All genome features appear broken until files are moved.
**Why it happens:** Code change and data migration are treated as separate steps and one gets forgotten.
**How to avoid:** Include the file move (`mv data/digital-twin/genome*.* data/meatspace/ && mv data/digital-twin/clinvar*.* data/meatspace/`) as part of the same plan, verified before commit.
**Warning signs:** After code deploy, genome page shows "Upload genome data to enable genetic analysis" despite data existing.

### Pitfall 2: Clinvar files missed
**What goes wrong:** `genome.json` and `genome-raw.txt` are moved but `clinvar-index.json` and `clinvar-meta.json` are left behind.
**Why it happens:** Clinvar is a separate service (`clinvar.js`) and its files are easily overlooked when focusing on `genome.js`.
**How to avoid:** Move all four files atomically: `genome.json`, `genome-raw.txt`, `clinvar-index.json`, `clinvar-meta.json`.
**Warning signs:** Genome summary loads but ClinVar scan returns "No ClinVar data downloaded" even though it was downloaded previously.

### Pitfall 3: Epigenetic data missed
**What goes wrong:** `epigenetic.js` uses `PATHS.digitalTwin` but there are already epigenetic data files in `data/digital-twin/` (e.g., `epigenetic-tests.json` is in `data/meatspace/` — this needs verification).
**Why it happens:** Assuming all three services read the same files.
**How to avoid:** Before migrating, list what files each service reads: `genome.js` → `genome.json`, `genome-raw.txt`; `clinvar.js` → `clinvar-*.json`; `epigenetic.js` → its own files (check the service). Verify each file exists in the old path and move only those.
**Warning signs:** Epigenetic tracker shows empty data after deploy.

### Pitfall 4: Digital Twin page genome tab still referenced
**What goes wrong:** If there are any other links to `/digital-twin/genome` that were not caught (e.g., in documentation, other tabs), they will silently route to the default Digital Twin tab (`/digital-twin/overview` via redirect) rather than showing an error.
**Why it happens:** The `<Route path="digital-twin/:tab">` catch-all in App.jsx renders `OverviewTab` as default for unknown tabs.
**How to avoid:** Search for all remaining occurrences of `/digital-twin/genome` in the client before marking GEN-02 complete.
**Warning signs:** No 404, but wrong page renders when navigating to that old URL.

## Code Examples

### Current state of affected lines (verified by direct inspection)

**server/routes/genome.js — 18 stale comment lines (lines 19-217):**
```javascript
// GET /api/digital-twin/genome — Summary       ← line 19
// POST /api/digital-twin/genome/upload          ← line 25
// POST /api/digital-twin/genome/scan            ← line 39
// POST /api/digital-twin/genome/search          ← line 52
// POST /api/digital-twin/genome/markers         ← line 59
// PUT /api/digital-twin/genome/markers/:id/notes ← line 66
// DELETE /api/digital-twin/genome/markers/:id   ← line 80
// GET /api/digital-twin/genome/clinvar/status   ← line 95
// POST /api/digital-twin/genome/clinvar/sync    ← line 101
// POST /api/digital-twin/genome/clinvar/scan    ← line 120
// DELETE /api/digital-twin/genome/clinvar       ← line 141
// GET /api/digital-twin/genome/epigenetic       ← line 149
// GET /api/digital-twin/genome/epigenetic/recommendations ← line 155
// GET /api/digital-twin/genome/epigenetic/compliance ← line 162
// POST /api/digital-twin/genome/epigenetic      ← line 169
// POST /api/digital-twin/genome/epigenetic/:id/log ← line 176
// PUT /api/digital-twin/genome/epigenetic/:id   ← line 190
// DELETE /api/digital-twin/genome/epigenetic/:id ← line 204
// DELETE /api/digital-twin/genome               ← line 217
```

**server/services/genome.js — data path (line 7):**
```javascript
const GENOME_DIR = PATHS.digitalTwin;  // reads/writes data/digital-twin/
```

**server/services/clinvar.js — data path (line 9):**
```javascript
const GENOME_DIR = PATHS.digitalTwin;  // reads/writes data/digital-twin/
```

**server/services/epigenetic.js — data path (line 6):**
```javascript
const DATA_DIR = PATHS.digitalTwin;    // reads/writes data/digital-twin/
```

**client/src/components/digital-twin/tabs/IdentityTab.jsx — dead route (line 190):**
```javascript
onClick={() => navigate('/digital-twin/genome')}  // tab does not exist in DigitalTwin.jsx
```

### Data files to migrate

Current location (`data/digital-twin/`):
- `genome.json` — upload metadata and saved markers
- `genome-raw.txt` — raw 23andMe TSV file
- `clinvar-index.json` — downloaded ClinVar index
- `clinvar-meta.json` — ClinVar sync metadata

Target location (`data/meatspace/`): same filenames.

Note: `data/meatspace/` already exists and contains `blood-tests.json`, `config.json`, `daily-log.json`, `epigenetic-tests.json`, `eyes.json`. The genome files do not yet exist there.

### PATHS.meatspace confirmation (fileUtils.js line 31)

```javascript
export const PATHS = {
  root: join(__lib_dirname, '../..'),
  data: join(__lib_dirname, '../../data'),
  // ...
  meatspace: join(__lib_dirname, '../../data/meatspace')  // ← already defined
};
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Genome data in `data/digital-twin/` | Genome data belongs in `data/meatspace/` | Partial migration already done (server mount, client API, Layout nav) | Phase 1 completes the migration by fixing services + IdentityTab |
| Route mounted at `/api/digital-twin/genome` | Route mounted at `/api/meatspace/genome` | Already done in server/index.js | Server mount is correct; only route file comments are stale |

**Deprecated/outdated:**
- `/api/digital-twin/genome` path: no longer the mount point; comments in routes/genome.js are wrong
- `navigate('/digital-twin/genome')` in IdentityTab: dead route — `/digital-twin/:tab` renders OverviewTab as default when tab is not recognized

## Open Questions

1. **Does epigenetic.js write its own separate files or share genome.json?**
   - What we know: `epigenetic.js` sets `const DATA_DIR = PATHS.digitalTwin` but `data/meatspace/` already has `epigenetic-tests.json`. It is possible epigenetic data is already being written to meatspace (if `epigenetic.js` uses a different path construction), or the epigenetic tests file is a sample/fixture.
   - What's unclear: Whether changing `epigenetic.js` to `PATHS.meatspace` would find existing data or new data.
   - Recommendation: Read `server/services/epigenetic.js` fully before writing the plan to confirm what filenames it uses and whether those files currently exist in `data/digital-twin/` vs `data/meatspace/`.

2. **Should the "Genome" status chip in IdentityTab's completeness header be removed or kept?**
   - What we know: The `sectionKeys` array includes `'genome'`, which drives the completeness header chips (line 101). The genome card itself (lines 152-196) has the dead navigation button.
   - What's unclear: GEN-02 says "removed or redirected." Redirecting the button is simpler and preserves the completeness indicator. Removing the card entirely is more work and changes the UX.
   - Recommendation: Default to redirecting the button (navigate to `/meatspace/genome`) rather than removing the card. The status chip in the completeness header should be kept as it reflects genome data status and drives the percentage counter.

## Sources

### Primary (HIGH confidence)
- Direct file inspection: `server/routes/genome.js` — 18 stale comment occurrences confirmed
- Direct file inspection: `server/services/genome.js` line 7 — `PATHS.digitalTwin` confirmed
- Direct file inspection: `server/services/clinvar.js` line 9 — `PATHS.digitalTwin` confirmed
- Direct file inspection: `server/services/epigenetic.js` line 6 — `PATHS.digitalTwin` confirmed
- Direct file inspection: `server/lib/fileUtils.js` line 31 — `PATHS.meatspace` confirmed present
- Direct file inspection: `server/index.js` line 209 — `app.use('/api/meatspace/genome', genomeRoutes)` confirmed
- Direct file inspection: `client/src/components/digital-twin/tabs/IdentityTab.jsx` line 190 — dead route confirmed
- Direct file inspection: `client/src/pages/DigitalTwin.jsx` — no `genome` case in switch, confirmed dead
- Direct file inspection: `client/src/pages/MeatSpace.jsx` line 29 — `case 'genome': return <GenomeTab />` confirmed live
- Direct file inspection: `client/src/services/api.js` lines 1183-1228 — all API calls use `/meatspace/genome/...` already
- Directory listing: `data/digital-twin/` contains `genome.json`, `genome-raw.txt`, `clinvar-index.json`, `clinvar-meta.json`
- Directory listing: `data/meatspace/` does NOT contain genome files

### Secondary (MEDIUM confidence)
- None required — all findings from direct code inspection

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new libraries; all changes use existing code patterns
- Architecture: HIGH — all files directly inspected, no guessing
- Pitfalls: HIGH — data migration risk is observable from directory inspection
- Open question on epigenetic.js: MEDIUM — file exists in meatspace already but the service code needs full read to confirm

**Research date:** 2026-02-26
**Valid until:** Indefinitely (internal migration, no external dependencies)
