# PortOS

## What This Is

PortOS is a self-hosted personal operating system that centralizes app management, AI agent orchestration, knowledge capture, digital identity modeling, and health tracking into a single dashboard — accessible anywhere via Tailscale VPN. With v1.0, genome data informs health insights, all data is backed up and restorable, Apple Health metrics are integrated, cross-domain patterns surface automatically, and any piece of information is one keystroke away via Cmd+K search.

## Core Value

A connected, protected, and searchable personal OS — where data flows between domains (genome, health, identity, taste) to surface insights, everything is backed up, and universal search makes any piece of information one keystroke away.

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
- ✓ Genome migration cleanup — fix stale digital-twin references — v1.0
- ✓ Data backup & recovery — scheduled incremental rsync with integrity verification and restore — v1.0
- ✓ Apple Health integration — JSON ingest, SAX XML import, health metric cards and correlations — v1.0
- ✓ Cross-domain insights — genome-to-health correlations, taste-to-identity themes, LLM narratives — v1.0
- ✓ Unified search (Cmd+K) — server fan-out, Spotlight-style overlay, keyboard navigation, deep linking — v1.0

### Active

(None — next milestone requirements TBD via `/gsd:new-milestone`)

### Out of Scope

- Semantic/vector search in Cmd+K — keyword-first for v1, semantic layers on later via existing BM25+vector infra
- Cloud backup targets — local external drive only, NAS/rsync can be added later
- Apple Health live sync setup — endpoint built, app not yet purchased
- Multi-modal identity capture (voice, video) — future tier
- Push notifications (M47) — deferred to next batch
- Dashboard customization / workspace contexts — Tier 4, later
- Content Calendar — Tier 2, later

## Context

PortOS has 44+ completed milestones with a mature Express.js + React + PM2 architecture. All data persists to JSON files in `./data/`. v1.0 shipped 5 phases (10 plans, 24 requirements) transforming siloed features into a connected system. The codebase is ~79K server LOC + ~55K client LOC (JavaScript/JSX).

**Shipped in v1.0:**
- Genome data reads from correct meatspace paths
- Incremental rsync backup with SHA-256 manifest, scheduler, dashboard widget, snapshot restore
- Apple Health JSON ingest with dedup + SAX XML import (500MB+ streaming) + health cards with correlation charts
- Cross-domain insights engine with 117 curated genome markers, LLM theme analysis, confidence levels
- Cmd+K unified search across Brain, Memory, Apps, History, Health with grouped results and deep linking

**Infrastructure available for next milestone:**
- Vector + BM25 hybrid search in memory system
- Socket.IO real-time updates
- Zod validation on all routes
- PM2 ecosystem managing 5+ processes
- `portos-ai-toolkit` for AI provider management
- Fan-out search architecture (easily extensible to new sources)

## Constraints

- **Tech stack**: Express.js backend, React/Vite frontend, JSON file persistence — no databases
- **Single user**: No auth, no multi-tenancy, private Tailscale network
- **Ports**: 5554-5560 allocated, define new ports in `ecosystem.config.cjs`
- **No hardcoded localhost**: Use `window.location.hostname` for all URLs
- **Backup target**: Local external drive (mounted path)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Keyword-first search for M46 | Ship faster, semantic search can layer on later via existing vector infra | ✓ Good — shipped in one session, keyword covers 90% of use cases |
| Local external drive for backup | Simplest reliable target, NAS/rsync can be added later | ✓ Good — works reliably, rsync incremental is fast |
| Genome→Health and Taste→Identity as priority insights | User's most-wanted cross-domain correlations | ✓ Good — 117 curated markers + LLM themes provide actionable insights |
| Build Apple Health endpoint before purchasing app | Endpoint + sample data testing first, real device later | ✓ Good — full pipeline tested with sample data |
| SAX streaming for Apple Health XML | 500MB+ files would OOM with DOM parsing | ✓ Good — processes large exports with constant memory |
| Portal rendering for Cmd+K overlay | z-index isolation above sidebar | ✓ Good — no stacking context issues |
| Promise.allSettled for search fan-out | Individual source failures shouldn't break entire search | ✓ Good — graceful degradation |
| Day-partitioned JSON for health data | Aligns with Health Auto Export's daily cadence, fast date-range queries | ✓ Good — simple, performant |

---
*Last updated: 2026-02-27 after v1.0 milestone*
