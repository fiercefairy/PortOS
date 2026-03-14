# Port OS - Implementation Plan

See [GOALS.md](./GOALS.md) for project goals and direction.

---

## Milestones

### Completed

- [x] **M0-M3**: Bootstrap, app registry, PM2 integration, log viewer - Core infrastructure
- [x] **M4**: App Wizard - Register existing apps or create from templates. See [App Wizard](./docs/features/app-wizard.md)
- [x] **M5**: AI Providers - Multi-provider AI execution with headless Claude CLI
- [x] **M6**: Dev Tools - Command runner with history and execution tracking
- [x] **M8**: Prompt Manager - Customizable AI prompts with variables and stages. See [Prompt Manager](./docs/features/prompt-manager.md)
- [x] **M9**: Streaming Import - Real-time websocket updates during app detection
- [x] **M10**: Enhanced DevTools - Provider/model selection, screenshots, git status, usage metrics
- [x] **M11**: AI Agents Page - Process detection and management with colorful UI
- [x] **M12**: History Improvements - Expandable entries with runtime/output capture
- [x] **M13**: Autofixer - Autonomous crash detection and repair. See [Autofixer](./docs/features/autofixer.md)
- [x] **M14**: Chief of Staff - Autonomous agent manager with task orchestration. See [Chief of Staff](./docs/features/chief-of-staff.md)
- [x] **M15**: Error Handling - Graceful error handling with auto-fix. See [Error Handling](./docs/features/error-handling.md)
- [x] **M16**: Memory System - Semantic memory with LLM classification. See [Memory System](./docs/features/memory-system.md)
- [x] **M17**: PM2 Config Enhancement - Per-process port detection and CDP_PORT support
- [x] **M18**: PM2 Standardization - LLM-powered config refactoring
- [x] **M19**: CoS Agent Runner - Isolated PM2 process for agent spawning. See [CoS Agent Runner](./docs/features/cos-agent-runner.md)
- [x] **M20**: AI Error Handling - Enhanced error extraction and CoS integration
- [x] **M21**: Usage Metrics - Comprehensive AI usage tracking and mobile UI
- [x] **M22**: Orphan Auto-Retry - Automatic retry for orphaned agents
- [x] **M23**: Self-Improvement - Automated UI/security/code analysis with Playwright
- [x] **M24**: Goal-Driven Mode - COS-GOALS.md mission file and always-working behavior
- [x] **M25**: Task Learning - Completion tracking and success rate analysis
- [x] **M26**: Scheduled Scripts - Cron-based automation with agent triggering
- [x] **M27**: CoS Capability Enhancements - Dependency updates, performance tracking, learning insights
- [x] **M28**: Weekly Digest UI - Visual digest with insights and comparisons
- [x] **M29**: App Improvement - Comprehensive analysis extended to managed apps
- [x] **M30**: Configurable Intervals - Per-task-type scheduling (daily, weekly, once, on-demand)
- [x] **M31**: LLM Memory Classification - Intelligent memory extraction with quality filtering
- [x] **M32**: Brain System - Second-brain capture and classification. See [Brain System](./docs/features/brain-system.md)
- [x] **M33**: Soul System - Digital twin identity scaffold management. See [Soul System](./docs/features/soul-system.md)
- [x] **M34 P1-P2,P4**: Digital Twin - Quantitative personality modeling and confidence scoring. See [Digital Twin](./docs/features/digital-twin.md)
- [x] **M35**: Chief of Staff Enhancement - Proactive autonomous agent with hybrid memory, missions, LM Studio, thinking levels. See [CoS Enhancement](./docs/features/cos-enhancement.md)
- [x] **M35.1**: CoS UI - Added Arcane Sigil (3D) avatar style option alongside Cyberpunk 3D
- [x] **M36**: Browser Management - CDP/Playwright browser page with status, controls, config, and logs
- [x] **M37**: Autonomous Jobs - Recurring scheduled jobs that the CoS executes proactively using digital twin identity
- [x] **M38**: Agent Tools - AI content generation, feed browsing, and autonomous engagement for Moltbook agents
- [x] **M39**: Agent-Centric Drill-Down - Redesigned Agents section with agent-first hierarchy, deep-linkable URLs, and scoped sub-tabs
- [x] **M40**: Agent Skill System - Task-type-specific prompts, context compaction, negative routing examples, deterministic workflow skills. See [Agent Skills](./docs/features/agent-skills.md)
- [x] **M41**: CyberCity Immersive Overhaul - Procedural synthwave audio, enhanced post-processing, reflective wet-street ground, settings system
- [x] **M42 P1-P3**: Unified Digital Twin Identity System - Identity orchestrator, chronotype derivation, personalized taste prompting, behavioral feedback loop, mortality-aware goal tracking
- [x] **M42 P4**: Unified Digital Twin Identity System - Identity Tab UI dashboard with completeness header, 5 summary cards, derive actions
- [x] **M43**: Moltworld Platform Support - Second platform integration for AI agents in a shared voxel world
- [x] **M44 P1-P5**: MeatSpace - Health tracker with death clock, LEV 2045 tracker, alcohol logging, blood/body/epigenetic/eye tracking, lifestyle questionnaire, TSV import, dashboard widget, compact grid overview

- [x] **M51**: Memory System PostgreSQL Upgrade - PostgreSQL + pgvector backend with HNSW vector search, tsvector full-text search, federation sync, and pg_dump backup integration
- [x] **M44 P6**: MeatSpace - Genome/Epigenetic Migration cleanup (route comments updated to `/api/meatspace/genome/`, IdentityTab genome link points to `/meatspace/genome`)
- [x] **M53**: POST (Power On Self Test) - Daily cognitive self-test with mental math drills (P1) and LLM-powered wit & memory drills (P2).
- [x] **M44 P7**: MeatSpace - Apple Health Integration (live sync via Health Auto Export app + bulk XML import)
- [x] **M46**: Unified Search (Cmd+K) - Global search across brain, memory, history, agents, tasks, and apps
- [x] **GSD Tab**: Smart State Detection, One-Click Agent Spawn, Actionable Dashboard
- [x] **M55**: POST Enhancement — Memory builder, imagination drills, training mode, 5-min balanced sessions. See [POST](./docs/features/post.md)
- [x] **M54**: MeatSpace Life Calendar — "4000 Weeks" mortality-aware time mapping with responsive grid, goal-activity linking, and time feasibility analysis
- [x] **M45**: Data Backup & Recovery - Rsync-based incremental backup with SHA-256 manifests, PostgreSQL pg_dump, configurable cron schedule, restore with dry-run preview and selective subdirectory restore, Dashboard widget with health status
- [x] **M48 P1-P10**: Google Calendar Integration - MCP push sync, direct Google API via OAuth2, subcalendar management, goal-calendar linking, daily review, auto-configure via CDP, color-coded events, 15-min Day/Week views, Life Calendar consolidated under Calendar > Lifetime
- [x] **M49 P1**: Life Goals — Enhanced goal model with todos, progress percentage, velocity tracking, projected completion, time tracking aggregates
- [x] **M50 P1-P7**: Email Management - Outlook API+Playwright sync, AI triage with security hardening, draft generation, thread capture, per-action models, full Messages UI, Gmail API sync+send
- [x] **M52**: Update Detection - GitHub release polling with semver comparison, auto-check every 30 min, Socket.IO real-time notifications, Update tab UI with progress tracking, update executor with health polling
- [x] **M56**: Telegram Bot Integration - External notification channel via Telegram bot with conversational commands, goal check-in persistence. Replaces M47.

### Planned

- [ ] **M50 P8-P10**: Email Management - Digital Twin voice drafting, CoS automation & rules, auto-send with AI review gate
- [x] **M49 P2-P4**: Life Goals — AI phase planning, calendar time-blocking, automated weekly check-ins with status tracking
- [ ] **M34 P5-P7**: Digital Twin - Multi-modal capture, advanced testing, personas
- [ ] **M42 P5**: Unified Digital Twin Identity System - Cross-Insights Engine. See [Identity System](./docs/features/identity-system.md)

---

## Planned Feature Details

### M49: Life Goals & Todo Planning

Extends the existing goal system in `server/services/identity.js` and `data/digital-twin/goals.json`. Adds rich progress tracking, todo sub-tasks, calendar time-blocking, and AI-powered check-ins. Gets its own top-level Goals page (not buried under Digital Twin).

**Phases:**

- **P1: Enhanced Goal Model & Todos** *(Complete)* — Added `progress` (0-100), `progressHistory[]`, `todos[]` with priority/estimate/status to goal schema. Velocity (percent/month + trend) and projected completion computed at query time. Time tracking aggregated from progressLog. Progress bars in list view, todo CRUD in detail panel.
- **P2: Calendar Time-Blocking** *(Complete)* — Schedule time blocks on Google Calendar based on phase milestones and time block config (preferred days, time slot, session duration). Google Calendar OAuth upgraded from readonly to read-write scope with upgrade detection. Calendar event CRUD via googleapis.
- **P3: Check-in & Evaluation** *(Complete)* — Automated weekly goal check-ins via `job-goal-check-in` autonomous job with gate. Computes expected vs actual progress, determines on-track/behind/at-risk status, generates AI assessment and recommendations via LLM, sends Telegram notification. Check-in history displayed in goal detail panel.
- **P4: AI Phase Planning** *(Complete)* — AI-powered phase generation (3-7 milestones with target dates) via LLM. Editable proposed phases with reorder, add/remove. Accept to persist as milestones with description and order fields.

**Data:** Extended `data/digital-twin/goals.json` with `todos[]`, `progressHistory[]`, `velocity{}`, `checkIns[]`, `calendarConfig{}`, `timeTracking{}` per goal. `checkInSchedule{}` at root level.

**Routes:** Extend `/api/digital-twin/identity/goals` with: `PUT /:id/progress`, `POST /:id/check-in`, `POST /:id/todos`, `PUT /:id/todos/:tid`, `POST /:id/schedule`, `POST /evaluate`

**Nav:** Top-level sidebar item "Goals" (alphabetically between Digital Twin and Insights)

*Touches: server/services/identity.js (extend), new server/services/goalEvaluator.js, server/routes/identity.js (extend), client/src/pages/Goals.jsx, client/src/components/goals/tabs/, Layout.jsx, autonomousJobs.js*

### M50: Messages (Email Management)

Multi-provider email integration — Gmail via Google API (shared OAuth with Calendar), Outlook/Teams via CDP browser automation (Playwright). Unified Messages page with Inbox, Drafts, Sync, and Config sub-pages.

Always review before send — AI-generated drafts go to an outbox queue. The user reviews, edits, and approves each response before it's sent. No auto-send.

**Completed:** P1-P7 (Email sync, AI triage, reply generation, thread capture, config, per-action models, prompt injection hardening, per-message re-fetch, Gmail API sync+send).

**Remaining:**

- [ ] **P8: Digital Twin voice drafting** — Draft responses using Digital Twin voice/style (reads COMMUNICATION.md, PERSONALITY.md, VALUES.md + recent thread context)
- [ ] **P9: CoS Automation & Rules** — Automated classification on new emails via CoS job, rule-based pre-filtering, email-to-task pipeline, priority email notifications
- [ ] **P10: Auto-Send with AI Review Gate** — Configurable per-account trust level (manual → review-assisted → auto-send). Second LLM reviews drafts for prompt injection, tone drift, leaked instructions. See [Messages Security](./docs/features/messages-security.md)

**Data:** `data/messages/accounts.json`, `data/messages/cache/{accountId}.json`, `data/messages/selectors.json`, `settings.json` (messages key for AI config + templates)

**Routes:** `GET /api/messages/inbox`, `GET /api/messages/:accountId/:messageId`, `GET /api/messages/thread/:accountId/:threadId`, `POST /api/messages/sync/:accountId`, `POST /api/messages/:accountId/:messageId/refresh`, `POST /api/messages/fetch-full/:accountId`, `POST /api/messages/accounts/:id/cache/clear`, `POST /api/messages/evaluate`, `POST /api/messages/drafts/generate`, CRUD for accounts/drafts/selectors

**Nav:** Collapsible "Messages" sidebar section with Drafts, Inbox, Sync, Config sub-pages

### Tier 1: Identity Integration (aligns with M42 direction)

- **Chronotype-Aware Scheduling** — Chronotype derivation exists (M42 P1) but isn't applied to task scheduling yet. Use peak-focus windows from genome sleep markers to schedule deep-work tasks during peak hours, routine tasks during low-energy. Display energy curve on Schedule tab. *Touches: taskSchedule.js, genome.js, CoS Schedule tab*
- **Identity Context Injection** — Identity context is used for taste questions (M42 P2.5) but not yet injected as a system preamble for general AI calls. Build identity brief from EXISTENTIAL.md, taste, personality, autobiography; inject via toolkit. Per-task-type toggle. *Touches: portos-ai-toolkit, runner.js, CoS Config*

### Tier 2: Deeper Autonomy

- **Agent Confidence & Autonomy Levels** — Graduated autonomy tiers based on historical success rates and blast radius. System earns more autonomy over time. *Touches: cos.js, taskLearning.js, CoS Tasks UI*
- **Content Calendar** — Unified calendar view of planned content across platforms. CoS auto-schedules based on engagement patterns. Draft → review → published pipeline. *Touches: New ContentCalendar page/route*
- **Proactive Insight Alerts** — Real-time notifications when: brain captures connect to old memories, agent success rate drops, goals stall, costs spike. *Touches: notifications.js, brain.js, taskLearning.js*
- **Goal Decomposition Engine** — Auto-decompose new goals into task sequences with dependencies by analyzing codebase and capabilities. Goal → task → outcome lineage tracking. *Touches: cos.js, goalProgress.js, missions.js*

### Tier 3: Knowledge & Legacy

- **Knowledge Graph Visualization** — Interactive force-directed graph mapping connections between brain captures, memories, goals, agent outputs. Color-coded nodes, semantic link edges. *Touches: New visualization component, brain.js, memory.js*
- **Time Capsule Snapshots** — Periodic versioned archives of full digital twin state. "Then vs. Now" comparison view tracking identity evolution. *Touches: New timeCapsule service, digital-twin snapshots*
- **Autobiography Prompt Chains** — Themed prompt chains (childhood → education → career → turning points → hopes) that build on prior answers. LLM-generated follow-ups. *(Extends M34 P5)* *Touches: autobiography.js, Digital Twin UI*
- **Legacy Export Format** — Compile autobiography, personality, genome, taste, decisions, brain highlights into portable human-readable document (Markdown/PDF). *Touches: New export service*

### Tier 4: Developer Experience

- **Dashboard Customization** — Drag-and-drop widget reordering, show/hide toggles, named layouts ("morning briefing", "deep work"). *Touches: Dashboard.jsx, settings.js, dnd-kit*
- **Workspace Contexts** — Active project context that syncs shell, git, tasks, and browser to current project. Persists across navigation. *Touches: Settings state, Layout context, Shell/Git/Browser*
- **Inline Code Review Annotations** — Surface self-improvement findings as inline annotations in a code viewer. One-click "fix this" spawns CoS task. *Touches: New code viewer, selfImprovement.js*

### Tier 5: Multi-Modal & Future

- **Voice Capture for Brain** — Microphone button using Web Speech API for transcription. Feeds into brain classification pipeline. *Touches: Brain capture UI, Web Speech API*
- **RSS/Feed Ingestion** — Passive ingestion from subscribed feeds, LLM-classified by user interests. Brain becomes personalized research aggregator. *Touches: New feedIngestion service, Brain inbox*
- **Ambient Dashboard Mode** — Live status board for wall-mounted displays: tasks, agent activity, health, schedule, energy curve. Real-time WebSocket updates. *Touches: New AmbientDashboard page*
- **Dynamic Skill Marketplace** — Skills as JSON/YAML documents in data/skills/. CoS discovers and routes dynamically. Self-generates new skill templates from task patterns. *Touches: taskClassifier.js, Prompt Manager*

---

## Documentation

### Architecture & Guides
- [Architecture Overview](./docs/ARCHITECTURE.md) - System design, data flow
- [API Reference](./docs/API.md) - REST endpoints, WebSocket events
- [Contributing Guide](./docs/CONTRIBUTING.md) - Code guidelines, git workflow
- [GitHub Actions](./docs/GITHUB_ACTIONS.md) - CI/CD workflow patterns
- [PM2 Configuration](./docs/PM2.md) - PM2 patterns and best practices
- [Port Allocation](./docs/PORTS.md) - Port conventions and allocation
- [Security Audit](./docs/SECURITY_AUDIT.md) - 2025-02-19 hardening audit (all resolved)
- [Troubleshooting](./docs/TROUBLESHOOTING.md) - Common issues and solutions
- [Versioning & Releases](./docs/VERSIONING.md) - Version format, release process

### Feature Documentation
- [Agent Skills](./docs/features/agent-skills.md) - Task-type-specific prompt templates and routing
- [App Wizard](./docs/features/app-wizard.md) - Register apps and create from templates
- [Autofixer](./docs/features/autofixer.md) - Autonomous crash detection and repair
- [Brain System](./docs/features/brain-system.md) - Second-brain capture and classification
- [Browser Management](./docs/features/browser.md) - CDP/Playwright browser management
- [Chief of Staff](./docs/features/chief-of-staff.md) - Autonomous agent orchestration
- [CoS Agent Runner](./docs/features/cos-agent-runner.md) - Isolated agent process management
- [CoS Enhancement](./docs/features/cos-enhancement.md) - M35 hybrid memory, missions, thinking levels
- [Digital Twin](./docs/features/digital-twin.md) - Quantitative personality modeling
- [Error Handling](./docs/features/error-handling.md) - Graceful error handling with auto-fix
- [Identity System](./docs/features/identity-system.md) - Unified identity architecture (M42 spec)
- [JIRA Sprint Manager](./docs/features/jira-sprint-manager.md) - Autonomous JIRA triage and implementation
- [Memory System](./docs/features/memory-system.md) - Semantic memory with LLM classification
- [Messages Security](./docs/features/messages-security.md) - AI prompt injection threat model and defenses
- [POST](./docs/features/post.md) - Cognitive self-test and training system
- [Prompt Manager](./docs/features/prompt-manager.md) - Customizable AI prompts
- [Soul System](./docs/features/soul-system.md) - Digital twin identity scaffold

---

## Code Audits

See [Security Audit](./docs/SECURITY_AUDIT.md) for the 2025-02-19 security hardening (all 10 items resolved).

### Outstanding Audit Findings (2026-03-05)

Three audit passes identified remaining items across architecture, bugs, code quality, and test coverage. Resolved items from Passes 1-3 have been removed (fixed via PRs #67-72).

**Known low-severity:** pm2 ReDoS (GHSA-x5gf-qvw8-r2rm) — no upstream fix, not exploitable via PortOS routes.

#### Architecture & SOLID
- [ ] **[CRITICAL]** `server/services/cos.js` (~3800 lines) — God file with 40+ exports. Needs decomposition.
- [ ] **[CRITICAL]** `server/services/subAgentSpawner.js` (~3300 lines) — Mega service spanning model selection, spawning, worktrees, JIRA, git, memory.
- [ ] **[CRITICAL]** Circular dependency: `cos.js` ↔ `subAgentSpawner.js` via dynamic imports.
- [ ] **[HIGH]** `client/src/services/api.js` (1627 lines) — Monolithic API client mixing 20+ domains.
- [ ] **[HIGH]** `server/services/digital-twin.js` (2823 lines) — Mixed CRUD, LLM testing, enrichment, export.
- [ ] **[HIGH]** `server/routes/cos.js` (1253 lines) — Business logic mixed with HTTP handlers.
- [ ] **[HIGH]** `server/routes/scaffold.js` (1270 lines) — God route file.
- [ ] **[HIGH]** `server/routes/apps.js:68-77,126-135` — Duplicated app status computation.
- [ ] **[HIGH]** `client/src/pages/ChiefOfStaff.jsx` (864 lines) — 24 useState hooks.
- [ ] **[MEDIUM]** Inconsistent pagination patterns and error response envelope.

#### Bugs & Performance
- [ ] **[CRITICAL]** `server/services/cos.js` TOCTOU race: addTask/updateTask/deleteTask lack withStateLock mutex.
- [ ] **[CRITICAL]** `server/services/cosRunnerClient.js` — 12 fetch calls missing timeouts.
- [ ] **[HIGH]** `server/services/cosRunnerClient.js` — Socket.IO with infinite reconnection, no error handler.
- [ ] **[HIGH]** `server/services/memory.js` — Data race: loadMemory() outside withMemoryLock.
- [ ] **[HIGH]** `server/services/agentActionExecutor.js:137` — Unsafe array fallback may yield non-array.
- [ ] **[HIGH]** `client/src/pages/PromptManager.jsx` — Fetch calls missing response.ok check.
- [ ] **[MEDIUM]** `server/services/cos.js` — Migration rename fallback silently swallowed; agent index lazy-load race.
- [ ] **[MEDIUM]** `server/services/memory.js` — Sort comparison not type-safe for dates.

#### Code Quality
- [ ] **[HIGH]** `server/services/memorySync.js:156` + `server/lib/db.js:85` — Unsafe `rows[0]` access without bounds check.
- [ ] **[MEDIUM]** Hardcoded localhost in `server/services/lmStudioManager.js`, `server/services/memoryClassifier.js`.
- [ ] **[MEDIUM]** Empty `.catch(() => {})` in 5 client files (`client/src/pages/Browser.jsx`, `Shell.jsx`, `client/src/components/cos/TaskAddForm.jsx`, `client/src/hooks/useAgentFeedbackToast.jsx`, `client/src/components/meatspace/HealthCategorySection.jsx`).
- [ ] **[MEDIUM]** `client/src/pages/DevTools.jsx` — Stale closure risk.
- [ ] **[MEDIUM]** Silent catch blocks in `client/src/hooks/useTheme.js`, `server/services/runner.js`, `server/lib/db.js`, `client/src/pages/Settings.jsx`.

#### DRY
- [ ] **[HIGH]** Duplicate `getDateString` in `server/services/agentActivity.js` + `server/services/productivity.js`.
- [ ] **[HIGH]** Duplicate HOUR/DAY constants in `server/services/autonomousJobs.js` + `server/services/taskSchedule.js`.
- [ ] **[HIGH]** Duplicate DATA_DIR/path constants in 8+ files.
- [ ] **[MEDIUM]** Missing fetch timeouts in `server/integrations/moltworld/api.js` + `server/integrations/moltbook/api.js`.
- [ ] **[MEDIUM]** 39 instances of `mkdir({recursive:true})` vs centralized `ensureDir()`.

#### Test Coverage
- Overall: ~29% service coverage, ~12% route coverage
- Critical gaps: `server/services/cos.js`, `server/services/cosRunnerClient.js`, `server/services/agentActionExecutor.js`, `server/services/memorySync.js`
- High gaps: `server/services/autoFixer.js`, `server/services/digital-twin.js`, `server/services/memory.js`, `server/services/brain.js`, `server/services/pm2.js`, `server/services/shell.js`, `server/services/instances.js`

---

## Next Actions

1. **M50 P8**: Messages — Digital Twin voice drafting for email responses
2. **M42 P5**: Cross-Insights Engine — connect genome + taste + personality + goals into derived insights
4. **M34 P5-P7**: Digital Twin — Multi-modal capture, advanced testing, personas
