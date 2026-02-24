# Port OS - Implementation Plan

See [GOALS.md](./GOALS.md) for project goals and direction.

## Quick Reference

### Tech Stack
- Frontend: React + Tailwind CSS + Vite (port 5555)
- Backend: Express.js (port 5554)
- Process Manager: PM2
- Data Storage: JSON files in `./data/`

### Commands
```bash
# Install all dependencies
npm run install:all

# Start development (both client and server)
npm run dev

# Start with PM2
pm2 start ecosystem.config.cjs

# View PM2 logs
pm2 logs
```

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
- [x] **M43**: Moltworld Platform Support - Second platform integration for AI agents in a shared voxel world

### Planned

- [ ] **M34 P3,P5-P7**: Digital Twin - Behavioral feedback loop, multi-modal capture, advanced testing, personas
- [ ] **M42**: Unified Digital Twin Identity System - See [Identity System](./docs/features/identity-system.md)

---

## Planned Feature Details

## Documentation

### Architecture & Guides
- [Architecture Overview](./docs/ARCHITECTURE.md) - System design, data flow
- [API Reference](./docs/API.md) - REST endpoints, WebSocket events
- [Contributing Guide](./docs/CONTRIBUTING.md) - Code guidelines, git workflow
- [PM2 Configuration](./docs/PM2.md) - PM2 patterns and best practices
- [Port Allocation](./docs/PORTS.md) - Port conventions and allocation
- [Versioning & Releases](./docs/VERSIONING.md) - Version format, release process
- [GitHub Actions](./docs/GITHUB_ACTIONS.md) - CI/CD workflow patterns
- [Troubleshooting](./docs/TROUBLESHOOTING.md) - Common issues and solutions

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
- [Memory System](./docs/features/memory-system.md) - Semantic memory with LLM classification
- [Prompt Manager](./docs/features/prompt-manager.md) - Customizable AI prompts
- [Soul System](./docs/features/soul-system.md) - Digital twin identity scaffold

---

## Security Hardening (from audit 2025-02-19)

PortOS is an internal/VPN app so auth, CORS, rate limiting, and HTTPS are out of scope. These items address real bugs, crash risks, and secret leaks that matter regardless of network posture.

### ~~S1: Patch npm dependency CVEs~~ ✅ RESOLVED
- ~~Run `npm audit fix` in server/ and client/~~
- Fixed: All actionable CVEs resolved. Remaining: 1 low-severity pm2 ReDoS (GHSA-x5gf-qvw8-r2rm, CVSS 4.3) — no fix published by maintainers, not exploitable via PortOS routes
- Client: 0 vulnerabilities

### ~~S2: Sanitize provider API responses~~ ✅ COMPLETE
- ~~Strip `apiKey` and `secretEnvVars` from all provider GET endpoints~~
- Fixed: `sanitizeProvider()` in `server/routes/providers.js` strips `apiKey`, redacts `secretEnvVars` values to `'***'`, returns `hasApiKey: boolean`
- All GET endpoints use sanitization

### ~~S3: Whitelist env vars in PTY shell spawn~~ ✅ COMPLETE
- ~~Replace `...process.env` spread with explicit allowlist~~
- Fixed: `buildSafeEnv()` in `server/services/shell.js` uses `SAFE_ENV_PREFIXES` allowlist — no `...process.env` spread

### ~~S4: Fix mutex lock bug + extract shared utility~~ ✅ COMPLETE
- ~~`cos.js` `withStateLock` is missing `try/finally`~~
- Fixed: `createMutex()` in `server/lib/asyncMutex.js` with proper `try/finally`. Used by both `cos.js` and `memory.js`

### ~~S5: Add Zod validation to Socket.IO events~~ ✅ COMPLETE
- ~~Socket events accept raw input~~
- Fixed: `server/lib/socketValidation.js` has Zod schemas for all socket events. `validateSocketData()` helper used in `socket.js`

### ~~S6: Sanitize error context in Socket.IO broadcasts~~ ✅ COMPLETE
- ~~Error handler broadcasts full `context` object which may contain secrets~~
- Fixed: `sanitizeContext()` in `server/lib/errorHandler.js` strips sensitive fields (apikey, token, secret, password, etc.) with circular-reference protection

### ~~S7: Guard unprotected JSON.parse calls~~ ✅
- ~~10+ locations call `JSON.parse` on external/file data without try-catch~~
- Fixed: replaced bare `JSON.parse` with `safeJSONParse` from `lib/fileUtils.js` in 7 files (8 call sites): `agentContentGenerator.js`, `pm2Standardizer.js`, `automationScheduler.js`, `git.js` (2), `aiDetect.js`, `memoryClassifier.js`, `clinvar.js`
- `digital-twin.js` and `cos.js` were already using `safeJSONParse`

### ~~S8: Add iteration limit to cron parser~~ ✅ COMPLETE
- ~~`eventScheduler.js` loops minute-by-minute for up to 2 years — invalid cron expressions cause CPU spin~~
- Fixed: `MAX_CRON_ITERATIONS = 525960` iteration counter, `validateCronFieldRange()` upfront validation, early `null` return on invalid expressions
- **File:** `server/services/eventScheduler.js`

### ~~S9: Extract validation boilerplate to helper~~ ✅ COMPLETE
- ~~Same 6-line validation-error block duplicated 74+ times across all route files~~
- Fixed: `validateRequest(schema, data)` helper in `lib/validation.js` now used across 80 call sites in 12 route files
- **Files:** `server/lib/validation.js`, all `server/routes/*.js`

### ~~S10: Fix parseInt missing radix~~ ✅ COMPLETE (v0.18.x)
- ~~Several parseInt calls lack explicit radix 10~~
- Fixed 45+ call sites across 18 files (routes, services, client, tests)
- **Complexity:** Simple

---

## Next Actions

1. **M42 P1: Identity Orchestrator & Chronotype** - Create identity.json, chronotype.json, identity service, derive chronotype from 5 genome sleep markers. See [Identity System](./docs/features/identity-system.md)
2. **M42 P2.5: Personalized Taste Prompting** - Enhance TasteTab with twin-aware follow-up questions using identity context from existing documents
3. **M7: App Templates** - Implement template management UI and app scaffolding from templates
4. **M34 P3: Behavioral Feedback Loop** - Add "sounds like me" response validation and adaptive weighting
5. **M42 P3: Mortality-Aware Goal Tracking** - Birth date + genome longevity markers for urgency-scored goals
