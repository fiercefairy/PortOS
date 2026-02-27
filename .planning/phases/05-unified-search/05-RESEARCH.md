# Phase 5: Unified Search (Cmd+K) - Research

**Researched:** 2026-02-26
**Domain:** Global keyboard shortcut overlay, server-side fan-out search, React keyboard event handling, deep-link navigation
**Confidence:** HIGH

## Summary

Phase 5 adds a Spotlight/Raycast-style Cmd+K search overlay that fans out keyword queries to all PortOS data sources server-side and navigates to deep-linked results. The core technology challenge is trivially solved by existing PortOS infrastructure: BM25 keyword search already exists in `memoryBM25.js`, all data services expose list/query functions that can be text-filtered, and React Router already provides the deep-link URLs for every page. There is zero new library dependency required.

The overlay UI is a straightforward React portal with a global `keydown` listener on `document`, debounced input, and result rendering. The server-side route is a single `GET /api/search?q=...` endpoint that fans out to five source adapters using `Promise.allSettled` for fault isolation. Each adapter performs case-insensitive substring matching against the relevant service data, returning up to 3 results with a `url` deep-link field the client navigates to with `react-router-dom`'s `useNavigate`.

**Primary recommendation:** Build one new route file (`server/routes/search.js`), one new service file (`server/services/search.js`), one overlay component (`client/src/components/CmdKSearch.jsx`), and one custom hook (`client/src/hooks/useCmdKSearch.js`). Wire the overlay into `Layout.jsx` using a portal. Total new code is under 400 lines.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Overlay appearance**
- Spotlight-style centered modal (like macOS Spotlight / VS Code Cmd+P)
- ~800px wide for comfortable snippet display
- Semi-transparent dark backdrop — click backdrop to dismiss
- Subtle fade+scale animation (~150ms) on open/close

**Result presentation**
- Results grouped by source under section headers (Brain, Memory, Apps, History, Health, etc.)
- Top 3 results per source category, with "Show more" to expand
- Each result row: source icon + title (bold) + 1-line text snippet with keyword highlighted
- Categories with zero results are hidden entirely

**Search interaction**
- Full keyboard navigation: arrow keys move highlight, Enter navigates, Escape closes
- Search-as-you-type after 2+ characters with 300ms debounce
- Before typing: empty results area with placeholder hint ("Search Brain, Memory, Health...")
- No-results state: subtle centered "No results for 'xyz'" message

### Claude's Discretion
- Deep-link navigation behavior (close overlay on click, scroll-to-item, cross-page handling)
- Loading/spinner state while results are fetching
- Exact source icons per category
- Result highlight/hover styling
- Which existing service search functions to fan out to

### Deferred Ideas (OUT OF SCOPE)
- Semantic/vector search layered on keyword search (SRC-05, v2)
- Recent searches and search history (SRC-06, v2)
- Quick actions or recent items shown before typing
- Source filtering tabs or toggles
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| SRC-01 | Cmd+K / Ctrl+K opens search overlay from any page | Global `keydown` listener in `Layout.jsx` via custom hook; React portal for overlay rendering above all page content |
| SRC-02 | Server-side `/api/search` endpoint fans out keyword queries to existing service search functions | `GET /api/search?q=` route with `Promise.allSettled` fan-out to adapters wrapping brain, memory, apps, history, and health services |
| SRC-03 | Results categorized by source with icons and snippets | Server returns `{ sources: [{ id, label, icon, results: [{id, title, snippet, url}] }] }`; client renders grouped sections using Lucide icons already imported in Layout |
| SRC-04 | Click result navigates to deep-linked location | Each result carries a `url` field; client calls `navigate(url)` from `react-router-dom` and closes overlay |
</phase_requirements>

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React 18 | ^18.3.1 (installed) | Overlay component, hooks, portal | Already in project |
| react-router-dom | ^7.1.1 (installed) | `useNavigate` for deep-link navigation | Already in project |
| lucide-react | ^0.562.0 (installed) | Source icons per category | Already in project |
| Zod | installed | Validate `q` query param in search route | Already used throughout server |
| Vitest + supertest | installed | Unit tests for search service and route | Already in project (`cd server && npm test`) |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `react-hot-toast` | ^2.6.0 (installed) | Error toasts if search API fails | Already in project |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom keyword filter functions | Fuse.js / MiniSearch | No new dependency needed; substring match is sufficient for v1 keyword search |
| React portal | Modal inside page tree | Portal ensures overlay renders above sidebar/header z-index without CSS escalation |
| `Promise.allSettled` | `Promise.all` | `allSettled` prevents one failing source from hiding all others |

**Installation:**
```bash
# No new dependencies required — all libraries already installed
```

---

## Architecture Patterns

### Recommended Project Structure
```
server/
├── routes/search.js          # GET /api/search?q= — fan-out route (NEW)
├── services/search.js        # Source adapters with keyword matching (NEW)
└── lib/validation.js         # Add searchQuerySchema (existing file, add export)

client/src/
├── components/CmdKSearch.jsx # Overlay modal component (NEW)
├── hooks/useCmdKSearch.js    # Keyboard shortcut + open/close state (NEW)
├── services/api.js           # Add search() function (existing file, add export)
└── components/Layout.jsx     # Mount <CmdKSearch /> + call useCmdKSearch (existing file, add lines)
```

### Pattern 1: Server Fan-out with Promise.allSettled

**What:** A single endpoint calls all source adapters in parallel. Each adapter returns `{ id, label, icon, results }`. Failed adapters return empty results, not errors.

**When to use:** When querying heterogeneous sources that may have independent failure modes.

**Example:**
```js
// server/services/search.js
export async function fanOutSearch(query) {
  const adapters = [
    searchBrainInbox(query),
    searchBrainEntities(query),
    searchMemory(query),
    searchApps(query),
    searchHistory(query),
    searchHealth(query),
  ];
  const settled = await Promise.allSettled(adapters);
  return settled
    .map((r, i) => r.status === 'fulfilled' ? r.value : { ...EMPTY_SOURCE[i] })
    .filter(s => s.results.length > 0);
}
```

### Pattern 2: Keyword Snippet Extraction

**What:** Extract a 80-100 char snippet around the first keyword match, bolding the matched term client-side.

**When to use:** For all text fields where a result title alone lacks context.

**Example:**
```js
// server/services/search.js
function extractSnippet(text, query, maxLen = 100) {
  if (!text) return '';
  const lower = text.toLowerCase();
  const idx = lower.indexOf(query.toLowerCase());
  if (idx === -1) return text.substring(0, maxLen);
  const start = Math.max(0, idx - 30);
  const end = Math.min(text.length, start + maxLen);
  const snippet = text.substring(start, end);
  return (start > 0 ? '...' : '') + snippet + (end < text.length ? '...' : '');
}
```

### Pattern 3: React Portal Overlay with Global Keydown

**What:** Mount overlay via `createPortal(document.body)` so it renders above sidebar z-index. Register a single `keydown` listener on `document` in a hook.

**When to use:** Global keyboard shortcut modals that must render above all page structure.

**Example:**
```jsx
// client/src/hooks/useCmdKSearch.js
import { useState, useEffect } from 'react';

export function useCmdKSearch() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(prev => !prev);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return { open, setOpen };
}
```

```jsx
// client/src/components/CmdKSearch.jsx (mount point in Layout.jsx)
import { createPortal } from 'react-dom';
// ... render portal into document.body
```

### Pattern 4: Keyword Highlight in React

**What:** Split result snippet on the search query and wrap matched spans with highlight styling.

**When to use:** All result snippet display.

**Example:**
```jsx
// Highlight component — no external library needed
function Highlight({ text, query }) {
  if (!query || !text) return <span>{text}</span>;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part)
          ? <mark key={i} className="bg-port-accent/30 text-white rounded px-0.5">{part}</mark>
          : <span key={i}>{part}</span>
      )}
    </span>
  );
}
```

### Pattern 5: Keyboard Navigation in Result List

**What:** Track `focusedIndex` state; ArrowDown/ArrowUp increment/decrement; Enter calls `navigate(results[focusedIndex].url)`.

**When to use:** Command palette-style overlays.

**Example:**
```jsx
const [focusedIndex, setFocusedIndex] = useState(0);

const handleKeyDown = (e) => {
  const total = flatResults.length;
  if (e.key === 'ArrowDown') { e.preventDefault(); setFocusedIndex(i => Math.min(i + 1, total - 1)); }
  if (e.key === 'ArrowUp')   { e.preventDefault(); setFocusedIndex(i => Math.max(i - 1, 0)); }
  if (e.key === 'Enter' && flatResults[focusedIndex]) {
    navigate(flatResults[focusedIndex].url);
    setOpen(false);
  }
  if (e.key === 'Escape') setOpen(false);
};
```

### Anti-Patterns to Avoid
- **Mounting overlay inside a page component:** Results in z-index battles with sidebar and header. Always use a portal.
- **Using `window.location.href` for navigation:** Violates CLAUDE.md (no hardcoded localhost). Use `useNavigate()` and relative paths.
- **`Promise.all` for fan-out:** One failing service throws, swallowing all results. Use `Promise.allSettled`.
- **Showing raw IDs as titles:** Health data (day-partitioned files) has no "title" — synthesize a title from metric name + date.
- **Firing search on every keystroke:** Debounce 300ms after 2+ chars per CONTEXT.md decision.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| BM25 keyword scoring for memory | Custom text search | `memoryBM25.searchBM25()` already in `server/services/memoryBM25.js` | Full BM25 implementation with inverted index already exists |
| Deep-link URL construction | Custom URL builder | Existing route patterns from `App.jsx` (e.g., `/brain/inbox`, `/cos/memory`) | All routes are already documented in the existing router |
| Overlay animation | CSS transition library | Tailwind `transition transform duration-150` classes | No animation library needed; project already uses Tailwind |
| Fuzzy matching | Fuse.js | Simple `toLowerCase().includes()` | v1 uses keyword match per CONTEXT.md; semantic search is deferred |

**Key insight:** Every required primitive already exists in the codebase. This phase is purely assembly work.

---

## Common Pitfalls

### Pitfall 1: Forgetting `inputRef.focus()` when overlay opens
**What goes wrong:** User presses Cmd+K, overlay appears, but focus is still on the previous element — user starts typing and nothing happens.
**Why it happens:** The input doesn't auto-focus on mount.
**How to avoid:** `useEffect(() => { if (open) inputRef.current?.focus(); }, [open])` in the overlay component.
**Warning signs:** Manual tab-to-input required after opening.

### Pitfall 2: Body scroll not locked when overlay is open
**What goes wrong:** User can scroll the page behind the overlay, causing disorientation.
**Why it happens:** Overlay doesn't set `document.body.style.overflow = 'hidden'`.
**How to avoid:** `useEffect(() => { document.body.style.overflow = open ? 'hidden' : ''; return () => { document.body.style.overflow = ''; }; }, [open])`.
**Warning signs:** Background page scrolls when user presses arrow keys in overlay.

### Pitfall 3: Health data has no "item title" for deep-linking
**What goes wrong:** Health data is partitioned by date file (`data/health/YYYY-MM-DD.json`); there are no individual "health entries" with IDs to navigate to.
**Why it happens:** Health is metric-series data, not document data.
**How to avoid:** Health search results deep-link to `/meatspace/health` (the tab) with the metric name as context, not to a specific entry. Title = "{MetricName} on {date}". URL = `/meatspace/health` (or the closest tab with that data visible).
**Warning signs:** Attempting to navigate to a non-existent `/health/entry/:id` route.

### Pitfall 4: Memory search returns IDs; need full content for snippets
**What goes wrong:** `memoryBM25.searchBM25(query)` returns `[{id, score}]` — no content for snippet display.
**Why it happens:** BM25 index stores only document IDs and inverted index terms, not original content.
**How to avoid:** After BM25 returns IDs, fetch memory content from `memory.getMemory(id)` or from the index (which stores `summary` but not full content). Use `summary` field from the memory index as the snippet — it's already truncated to 150 chars.
**Warning signs:** Blank snippets in Memory results.

### Pitfall 5: Arrow key navigation must reset `focusedIndex` on new query
**What goes wrong:** User types query, navigates to index 5, types more, but focused item is still index 5 even though results changed.
**Why it happens:** `focusedIndex` isn't reset when `results` change.
**How to avoid:** `useEffect(() => { setFocusedIndex(0); }, [results])`.
**Warning signs:** Enter navigates to wrong result after editing the search query.

### Pitfall 6: Cmd+K fires inside `<input>` or `<textarea>` elements
**What goes wrong:** User presses Cmd+K while typing in Brain capture or a form field and the search overlay interrupts their work.
**Why it happens:** Global `keydown` listener doesn't check the event target.
**How to avoid:** In the handler, skip if `e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable` — OR check if the user has the QuickBrainCapture input focused. VS Code and Raycast do NOT suppress Cmd+K in inputs; it is a reasonable tradeoff to open the overlay anyway for consistency. Either approach is valid; document the choice.
**Warning signs:** Unexpected overlay opening during form interaction.

---

## Code Examples

Verified patterns from project codebase:

### Existing BM25 search (server/services/memoryBM25.js)
```js
// Already exists — call directly from search adapter
const memoryIds = await searchBM25(query, { limit: 20, threshold: 0.1 });
// Returns: [{ id: string, score: number }]
// Then load summary from memory index for snippet
```

### Existing brain entities (server/services/brainStorage.js)
```js
// All entity stores exposed via storage functions
const people  = await storage.getPeople();    // { records: { [id]: {..., name, notes} } }
const projects = await storage.getProjects(); // { records: { [id]: {..., name, description} } }
const ideas    = await storage.getIdeas();    // { records: { [id]: {..., title, description} } }
// Inline keyword filter:
const q = query.toLowerCase();
const matches = Object.values(store.records)
  .filter(r => r.name?.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q));
```

### Existing history service (server/services/history.js)
```js
// getHistory already returns entries array — just filter client-side in the adapter
const { entries } = await getHistory({ limit: 500 });
const matches = entries.filter(e =>
  e.targetName?.toLowerCase().includes(q) || e.action?.toLowerCase().includes(q)
);
// Deep-link: /devtools/history (no per-entry deep link exists — link to history page)
```

### Existing apps service (server/services/apps.js)
```js
const apps = await getAllApps({ includeArchived: false });
const matches = apps.filter(a =>
  a.name?.toLowerCase().includes(q) || a.description?.toLowerCase().includes(q)
);
// Deep-link: /apps (no per-app route exists without app ID in URL param)
```

### Server route registration pattern (server/index.js)
```js
// Pattern to follow when adding search route:
import searchRoutes from './routes/search.js';
// ...
app.use('/api/search', searchRoutes);
```

### API service client pattern (client/src/services/api.js)
```js
// Pattern to follow for search() function:
export const search = (q) => request(`/search?q=${encodeURIComponent(q)}`);
```

### Layout.jsx portal mount point
```jsx
// Layout.jsx already imports hooks and renders children via <Outlet />
// Add CmdKSearch just before </div> that wraps the main content area:
import CmdKSearch from './CmdKSearch';
// ...inside Layout return:
<CmdKSearch />  {/* renders via portal, no layout impact */}
```

---

## Source Adapter Map

This is the complete map of data sources, their search functions, and their deep-link URLs:

| Source | Category Label | Icon | Service Function | Filter Strategy | Deep-Link URL Pattern |
|--------|---------------|------|-----------------|----------------|----------------------|
| Brain Inbox | Brain | `Brain` | `brainStorage.getInboxLog({ limit: 200 })` | filter on `text` field | `/brain/inbox` |
| Brain People | Brain | `Brain` | `brainStorage.getPeople()` | filter on `name`, `notes` | `/brain/inbox` (no per-person route in current App.jsx) |
| Brain Projects | Brain | `Brain` | `brainStorage.getProjects()` | filter on `name`, `description` | `/brain/inbox` (no per-project route) |
| Brain Ideas | Brain | `Brain` | `brainStorage.getIdeas()` | filter on `title`, `description` | `/brain/inbox` (no per-idea route) |
| Brain Links | Brain | `Brain` | `brainStorage.getLinks()` | filter on `title`, `url`, `description` | `/brain/inbox` |
| CoS Memory | Memory | `Brain` (or `Cpu`) | `memoryBM25.searchBM25(q, {limit: 10})` then `memory.getMemory(id)` for summary | BM25 scoring | `/cos/memory` |
| Apps | Apps | `Package` | `apps.getAllApps({includeArchived: false})` | substring on `name`, `description` | `/apps` |
| History | History | `History` | `history.getHistory({limit: 500})` | substring on `targetName`, `action` | `/devtools/history` |
| Health | Health | `HeartPulse` | `appleHealthQuery.listDayFiles()` then filter by metric names in day files | metric name match | `/meatspace/health` |

**Note:** Brain People/Projects/Ideas/Links all fall under the "Brain" category header and share the icon. The deep-link for all brain sub-entities currently routes to `/brain/inbox` since the Brain page uses tab-based routing but no per-entity URL scheme (items are modal-less, opened inline within lists). This is correct per CLAUDE.md ("Linkable routes for all views" — but the entities don't currently have per-item deep URLs).

---

## Data Structures

### Server response shape for `GET /api/search?q=foo`
```json
{
  "query": "foo",
  "sources": [
    {
      "id": "brain",
      "label": "Brain",
      "icon": "Brain",
      "results": [
        {
          "id": "abc-123",
          "title": "Project: Foo App",
          "snippet": "...working on foo app to solve...",
          "url": "/brain/inbox",
          "type": "project"
        }
      ]
    },
    {
      "id": "memory",
      "label": "Memory",
      "icon": "Cpu",
      "results": [...]
    }
  ]
}
```

### Zod validation for search route
```js
// server/lib/validation.js (add to existing file)
export const searchQuerySchema = z.object({
  q: z.string().min(2).max(200).trim()
});
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Client-side search index | Server fan-out | Per REQUIREMENTS.md decision (2026-02-26) | Simpler, consistent with data living server-side; per Out of Scope: "Client-side search indexing: Data lives server-side; server fan-out is simpler and consistent" |
| Semantic/vector search | Keyword-first (BM25 + substring) | Per REQUIREMENTS.md decision (2026-02-26) | Ships faster; semantic layers on later via existing infra |

**Deprecated/outdated:**
- None applicable to this phase.

---

## Open Questions

1. **Brain entity deep-links: currently no per-item routes in App.jsx**
   - What we know: Brain page (`/brain/:tab`) uses tab-based routing. Individual inbox entries, people, projects, ideas are expanded/edited inline within the tab, not at unique URLs.
   - What's unclear: Should a brain search result link to `/brain/inbox?id=abc-123` (a new URL pattern we'd need to support in Brain.jsx) or just `/brain/inbox`?
   - Recommendation: For v1, link all brain results to `/brain/inbox` (no per-item URL). The user lands on Brain Inbox and can search there. If deep-linking to specific items is desired, that's a Brain page enhancement orthogonal to this phase.

2. **Memory results: summary vs full content for snippets**
   - What we know: `memoryBM25.searchBM25(q)` returns `[{id, score}]`. The memory index stores `summary` (150 char truncated) per item but the full content requires loading the per-item file.
   - What's unclear: Whether loading 3-10 full memory files per search is acceptable latency.
   - Recommendation: Use `summary` from the index. It's already 150 chars and purpose-built for preview display. No extra file reads needed.

3. **Health search semantics: no text content to match**
   - What we know: Health data is numeric time-series. Day files contain metric name strings (e.g., `step_count`, `heart_rate`).
   - What's unclear: What query would a user type to find health data? Probably the metric name or a synonym.
   - Recommendation: Match the query against known metric names (`step_count`, `heart_rate`, `sleep_analysis`, `hrv`). Return one result per matched metric name, linking to `/meatspace/health`. This is a simple hardcoded metric name list or dynamic from `listDayFiles()` scanning.

---

## Validation Architecture

> `workflow.nyquist_validation` is not set to `true` in `.planning/config.json` — this section is omitted.

---

## Sources

### Primary (HIGH confidence)
- Direct codebase inspection — `server/services/memoryBM25.js`, `server/services/brain.js`, `server/services/memory.js`, `server/services/history.js`, `server/services/apps.js`, `server/services/appleHealthQuery.js` — confirmed existing search/list functions and data structures
- `client/src/App.jsx` — confirmed all deep-link URL patterns
- `client/src/components/Layout.jsx` — confirmed icon imports, hook patterns, portal mount approach
- `server/index.js` — confirmed route registration pattern
- `client/src/services/api.js` — confirmed client API helper pattern
- `client/package.json` — confirmed React 18, react-router-dom 7, lucide-react, tailwindcss versions

### Secondary (MEDIUM confidence)
- React 18 `createPortal` pattern for global overlays — standard React docs pattern, widely verified
- `document.addEventListener('keydown', handler)` for global Cmd+K — standard browser API, no verification needed

### Tertiary (LOW confidence)
- None — all findings verified against live codebase

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries already installed, versions confirmed from package.json
- Architecture: HIGH — all service functions confirmed via direct file reads, patterns match existing project conventions
- Pitfalls: HIGH — identified from actual data structure constraints (BM25 returns IDs not content, health has no entity URLs, etc.)

**Research date:** 2026-02-26
**Valid until:** 2026-03-28 (stable — no fast-moving dependencies)
