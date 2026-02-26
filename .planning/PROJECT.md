# PortOS — Next Actions Batch

## What This Is

PortOS is a self-hosted personal operating system that centralizes app management, AI agent orchestration, knowledge capture, digital identity modeling, and health tracking into a single dashboard — accessible anywhere via Tailscale VPN. This milestone batch focuses on cleanup, data protection, cross-domain intelligence, health integration, and universal search across the 44+ milestones of existing functionality.

## Core Value

Ship the five planned next actions that transform PortOS from a collection of powerful but siloed features into a connected, protected, and searchable system — where genome data informs health insights, all data is backed up, and any piece of information is one keystroke away.

## Requirements

### Validated

- ✓ Centralized app lifecycle management (PM2, logs, JIRA) — M0-M4
- ✓ Multi-provider AI orchestration with CoS agent system — M5, M14, M19, M35
- ✓ Brain capture and semantic memory with LLM classification — M16, M31, M32
- ✓ Digital twin identity modeling (soul, personality, taste, autobiography) — M33, M34, M42 P1-P4
- ✓ Developer toolkit (shell, git, browser, history, CyberCity) — M6, M10, M36, M41
- ✓ Self-improving intelligence (task learning, autonomous jobs) — M23-M27, M37
- ✓ Agent tools and platform support (Moltbook, Moltworld) — M38, M43
- ✓ MeatSpace health tracking (death clock, LEV, alcohol, blood, body, epigenetic, eye, genome, lifestyle) — M44 P1-P5
- ✓ Tailscale anywhere access with mobile-responsive UI — existing

### Active

- [ ] M44 P6: Genome/epigenetic migration cleanup — fix route comments and IdentityTab Genome card
- [ ] M42 P5: Cross-Insights Engine — genome-to-health correlations and taste-to-identity themes
- [ ] M45: Data Backup & Recovery — scheduled incremental backup to local external drive with restore
- [ ] M44 P7: Apple Health Integration — ingest endpoint for Health Auto Export app + bulk XML import
- [ ] M46: Unified Search (Cmd+K) — keyword search across all data sources from any page

### Out of Scope

- Semantic/vector search in Cmd+K — keyword-first for v1, semantic later
- Cloud backup targets — local external drive only for this batch
- Apple Health live sync setup — app not yet installed, build the endpoint first
- Multi-modal identity capture (voice, video) — future tier
- Push notifications (M47) — deferred to next batch
- Dashboard customization / workspace contexts — Tier 4, later
- Content Calendar — Tier 2, later

## Context

PortOS has 44+ completed milestones with a mature Express.js + React + PM2 architecture. All data persists to JSON files in `./data/` with zero redundancy — making M45 (backup) critical. The genome data was recently migrated from digital-twin routes to MeatSpace (M44 P5) but cleanup of old references remains (M44 P6). The Cross-Insights Engine (M42 P5) connects existing genome, taste, personality, and health data into derived insights. Apple Health integration (M44 P7) brings external health data into MeatSpace. Unified Search (M46) adds a cross-cutting Cmd+K overlay that searches brain, memory, history, agents, apps, and health.

**Existing infrastructure to leverage:**
- Vector + BM25 hybrid search already exists in memory system (for future semantic search extension)
- Socket.IO real-time updates throughout the app
- Zod validation on all routes
- PM2 ecosystem managing 5+ processes
- `portos-ai-toolkit` for AI provider management

## Constraints

- **Tech stack**: Express.js backend, React/Vite frontend, JSON file persistence — no databases
- **Single user**: No auth, no multi-tenancy, private Tailscale network
- **Ports**: 5554-5560 allocated, define new ports in `ecosystem.config.cjs`
- **No hardcoded localhost**: Use `window.location.hostname` for all URLs
- **Backup target**: Local external drive (mounted path)
- **Apple Health app**: Not yet purchased — build ingest endpoint, test with sample data

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Keyword-first search for M46 | Ship faster, semantic search can layer on later via existing vector infra | — Pending |
| Local external drive for backup | Simplest reliable target, NAS/rsync can be added later | — Pending |
| Genome→Health and Taste→Identity as priority insights | User's most-wanted cross-domain correlations | — Pending |
| Build Apple Health endpoint before purchasing app | Endpoint + sample data testing first, real device later | — Pending |

---
*Last updated: 2026-02-26 after initialization*
