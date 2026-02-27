---
phase: 03-apple-health-integration
plan: "01"
subsystem: health-ingest
tags: [apple-health, ingest, validation, zod, day-partitioned-storage, query-service]
dependency_graph:
  requires: []
  provides:
    - POST /api/health/ingest (Health Auto Export JSON ingest with dedup)
    - GET /api/health/metrics/:name (metric summary by date range)
    - GET /api/health/metrics/:name/daily (daily aggregated values)
    - GET /api/health/range (available data date range)
    - GET /api/health/correlation (merged HRV+alcohol+steps+blood data)
    - GET /api/system/health (renamed from /api/health)
    - GET /api/system/health/details (renamed from /api/health/system)
  affects:
    - client/src/services/api.js (checkHealth, getSystemHealth paths updated; Apple Health API functions added)
    - 03-02-PLAN.md (XML import can now call ingestHealthData)
    - 03-03-PLAN.md (dashboard cards use getAppleHealthMetrics, getAppleHealthSummary)
tech_stack:
  added: []
  patterns:
    - Day-partitioned JSON files at data/health/YYYY-MM-DD.json
    - Deduplication by metric name + full date string (Set-based O(1) lookup)
    - substring(0,10) for timezone-safe date extraction from Apple Health timestamps
    - passthrough() on Zod schemas for future Health Auto Export field compatibility
key_files:
  created:
    - server/lib/appleHealthValidation.js
    - server/services/appleHealthIngest.js
    - server/services/appleHealthQuery.js
    - server/routes/appleHealth.js
  modified:
    - server/lib/fileUtils.js (added PATHS.health)
    - server/index.js (systemHealthRoutes at /api/system, appleHealthRoutes at /api/health)
    - client/src/services/api.js (checkHealth/getSystemHealth paths + 5 Apple Health functions)
    - server/routes/systemHealth.js (renamed from health.js via git mv, /health/system -> /health/details)
    - server/routes/health.test.js (updated to import systemHealth.js, use /api/system/health)
decisions:
  - "Extracted YYYY-MM-DD using substring(0,10) not Date() to prevent timezone shift on Apple Health timestamps"
  - "Used passthrough() on healthDataPointSchema and data object to support future Health Auto Export fields"
  - "Dedup key is the full date string (not extracted date) to distinguish multiple readings on same day"
  - "Renamed /health/system to /health/details inside systemHealth.js to avoid redundancy with /api/system mount point"
  - "getDailyAggregates uses per-metric strategy: step_count sums qty, heart_rate averages Avg, sleep_analysis takes totalSleep, default averages qty"
metrics:
  duration: 210s
  tasks_completed: 3
  files_created: 4
  files_modified: 5
  completed_date: "2026-02-26"
---

# Phase 03 Plan 01: Apple Health Ingest Pipeline Summary

**One-liner:** Zod-validated Health Auto Export JSON ingest with timezone-safe dedup into day-partitioned files, REST query API, correlation endpoint, and system health namespace relocation to /api/system.

## What Was Built

### Task 1: System Health Route Relocation
Freed the `/api/health` namespace by moving system health endpoints:
- `server/routes/health.js` renamed to `server/routes/systemHealth.js` via `git mv`
- Route `/health/system` renamed to `/health/details` inside the file (avoids redundancy with mount at `/api/system`)
- `server/index.js`: `app.use('/api/system', systemHealthRoutes)` replaces `app.use('/api', healthRoutes)`
- `client/src/services/api.js`: `checkHealth` now calls `/system/health`, `getSystemHealth` calls `/system/health/details`
- Test updated to import `systemHealth.js` and use new path

### Task 2: Validation Schemas and Ingest Service
- `server/lib/appleHealthValidation.js`: `healthDataPointSchema` (passthrough for future fields), `healthMetricSchema`, `healthIngestSchema`
- `server/lib/fileUtils.js`: added `PATHS.health = data/health/`
- `server/services/appleHealthIngest.js`:
  - `extractDateStr()`: uses `substring(0,10)` to avoid timezone conversion (research pitfall 5)
  - `dedupKey()`: produces `metricName::dateString` composite key
  - `readDayFile()` / `writeDayFile()`: reads/writes `data/health/YYYY-MM-DD.json`
  - `mergeIntoDay()`: deduplicates by building Set of existing date strings, appends only unique points
  - `ingestHealthData()`: groups all metric data points by day, calls mergeIntoDay, returns `{ metricsProcessed, recordsIngested, recordsSkipped, daysAffected }`

### Task 3: Query Service, REST Routes, and Client Functions
- `server/services/appleHealthQuery.js`:
  - `listDayFiles()`: reads health dir, filters/sorts YYYY-MM-DD.json files
  - `getAvailableDateRange()`: returns `{ from, to, totalDays }` or null
  - `getMetrics()`: flat array of all data points for a metric in date range
  - `getMetricSummary()`: count, latest, average (qty or Avg), plus raw dataPoints
  - `getDailyAggregates()`: per-metric strategy (step_count sums, heart_rate averages Avg, HRV averages qty, sleep takes totalSleep, others average qty)
  - `getCorrelationData()`: merges HRV + steps + alcohol (from meatspaceAlcohol) + blood tests (from meatspaceHealth)
- `server/routes/appleHealth.js`: 5 REST endpoints using asyncHandler + validateRequest pattern
- `server/index.js`: registered `app.use('/api/health', appleHealthRoutes)` before `/api/instances`
- `client/src/services/api.js`: added `ingestAppleHealth`, `getAppleHealthMetrics`, `getAppleHealthSummary`, `getAppleHealthRange`, `getAppleHealthCorrelation`

## Decisions Made

1. **Timezone-safe date extraction** — `substring(0,10)` instead of `new Date()` to avoid timezone shift on Apple Health timestamps like `"2024-01-15 08:30:00 -0800"`. `new Date()` would convert to UTC, shifting dates near midnight to the wrong day.

2. **passthrough() on schemas** — `healthDataPointSchema` and the `data` object use `.passthrough()` so future fields added by Health Auto Export app updates don't break validation.

3. **Full date string as dedup key** — Dedup uses the full date string from the data point (e.g., `"2024-01-15 08:30:00 -0800"`), not just the extracted YYYY-MM-DD. This correctly distinguishes multiple readings on the same calendar day (e.g., two heart rate readings at different times).

4. **Route rename from /health/system to /health/details** — When mounting at `/api/system`, the route `/health/system` would produce `/api/system/health/system` which is redundant. Renamed to `/health/details` for `/api/system/health/details`.

5. **Per-metric daily aggregation strategies** — Different metrics require different aggregation: step_count needs a sum (not average) of all steps in a day; heart_rate uses the `Avg` field not `qty`; sleep_analysis has `totalSleep` not `qty`. Hardcoded per-metric strategies with a sensible default.

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

Verified:
- `server/lib/appleHealthValidation.js` exists and healthIngestSchema validates test payload
- `server/services/appleHealthIngest.js` loads, extractDateStr returns `2024-01-15` from `"2024-01-15 08:30:00 -0800"`
- `server/services/appleHealthQuery.js` loads, getMetrics and getDailyAggregates are functions
- `server/routes/appleHealth.js` loads, router exported
- All 1192 tests pass (42 test files, 0 regressions)
- Commits: 7c2a592 (Task 1), 200a0d2 (Task 2), 2cd855f (Task 3)
