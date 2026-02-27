# Phase 4: Cross-Domain Insights Engine - Research

**Researched:** 2026-02-26
**Domain:** LLM-driven analytics UI — genome-health correlation display, taste-to-identity theme analysis, insights dashboard with tabbed deep-linked routing
**Confidence:** HIGH (codebase patterns verified; LLM prompt strategy MEDIUM; diff display LOW — library selection open)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Correlation Display**
- Card-based layout grouped by health domain (Cardiovascular, Metabolism, Pharmacogenomics, Cancer Risk, Nutrigenomics, etc.)
- Each card shows: genome variant + actual health value + correlation strength
- Color-coded confidence badges: green (strong evidence), yellow (moderate), red (weak/preliminary) — hover for study source details
- Expandable provenance section per card (collapsed by default): study name, publication year, database source (ClinVar, PharmGKB, etc.)
- 117 curated markers grouped by clinical category into card groups

**Taste-Identity Themes**
- Theme cards with narrative: title (e.g., "Comfort-Seeking Explorer"), short narrative paragraph, list of supporting preferences
- All available preference data feeds the analysis (music, food, aesthetics, media, travel, etc.) — LLM finds patterns across whatever's available
- Supporting evidence list under each theme card (collapsible): which preferences contributed and why they map to this theme
- Analytical and neutral tone — third-person, research-flavored: "The data indicates a pattern of..."

**Insights Dashboard**
- Tabbed by domain: Genome-Health, Taste-Identity, Cross-Domain Patterns — deep-linkable routes (/insights/genome-health, etc.)
- Landing view shows domain summary cards: key stat, top insight, confidence indicator per domain — click to enter domain tab
- Inline source tags on each card/insight: "23andMe", "Apple Health", "Spotify", etc.
- Gentle empty states for domains with no data: "No health data imported yet" with link to relevant import

**Narrative Summaries**
- 2-3 paragraph summaries of cross-domain patterns — concise but substantive, readable in under a minute
- Refresh button with diff: re-analysis shows what changed since last generation (new patterns, confidence changes)
- Analytical with personal framing tone: neutral, evidence-based but framed around "your data shows..."
- Cross-domain narratives live in the dedicated Cross-Domain Patterns tab

### Claude's Discretion
- Exact card dimensions, spacing, and responsive breakpoints
- LLM prompt engineering for theme analysis and narrative generation
- Caching strategy for LLM-generated content
- Loading states and skeleton designs during LLM processing
- How to handle edge cases where genome and health data have no meaningful correlation

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| INS-01 | Rule-based genome-to-health correlations using curated 117 markers against actual blood/body data | `scanCuratedMarkers()` in `genome.js` already classifies all 117 markers with status+category; `getBloodTests()` in `meatspaceHealth.js` returns blood test history; mapping logic is server-side pure function work |
| INS-02 | LLM-generated taste-to-identity theme analysis connecting preferences to preference identity patterns | `getTasteProfile()` from `taste-questionnaire.js` returns section summaries and responses; `callProviderAISimple()` pattern in same service is the established LLM call pattern; needs new `insightsService.js` with `generateThemeAnalysis()` |
| INS-03 | Insights dashboard UI with confidence levels, source attribution, and domain grouping | New `/insights` route + `Insights.jsx` page + three sub-components; follows MeatSpace/:tab and DigitalTwin/:tab pattern (useParams, useNavigate, deep-linked routes); sidebar nav entry added to Layout.jsx |
| INS-04 | LLM narrative summaries of cross-domain patterns refreshable on demand | New `generateCrossDomainNarrative()` in insightsService; persisted to `data/insights/narrative.json` with `generatedAt` timestamp; diff display compares current vs previous narrative text |
</phase_requirements>

---

## Summary

Phase 4 builds an Insights Engine that surfaces two classes of analysis: (1) rule-based genome-health correlations that match the 117 curated SNP markers already classified by `scanCuratedMarkers()` against the blood/body data already persisted by `meatspaceHealth.js`, and (2) LLM-generated taste-to-identity theme analysis that reads the completed taste profile sections and produces personality theme cards. Both classes feed a new `/insights` dashboard that follows established PortOS routing and component conventions exactly.

The entire data layer for this phase is already in place. Genome markers are classified with `status` (beneficial/typical/concern/major_concern), `category`, `gene`, `description`, and `implications`. Blood tests are stored in `data/meatspace/blood-tests.json` with `date`, test name, and value. Apple Health data is queryable by metric and date range. The insights engine is fundamentally a correlation + formatting layer on top of these existing data sources — no new data pipelines are needed.

LLM work in this phase (INS-02, INS-04) follows the established `callProviderAISimple()` pattern from `taste-questionnaire.js` and `digital-twin.js`: get active provider, call `/chat/completions` directly with a structured prompt, store result in a JSON file under `data/insights/`. Caching is file-based with a `generatedAt` timestamp — the UI shows when last generated and provides a Refresh button.

**Primary recommendation:** Build the phase as two parallel workstreams — (A) backend service `insightsService.js` with four functions: `getGenomeHealthCorrelations()`, `generateThemeAnalysis()`, `getCrossDomainNarrative()`, `refreshCrossDomainNarrative()`; and (B) frontend `Insights.jsx` page with three sub-tabs following the MeatSpace/:tab pattern. The genome-health correlation function requires no LLM — it is pure rule matching.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Express.js Router | (project: ^4.21.2) | `/api/insights` route module | All PortOS routes follow this pattern |
| Zod | (project: ^3.24.1) | Route input validation via `lib/validation.js` | CLAUDE.md mandate: Zod validation on all route inputs |
| React Router v6 | (project version) | `/insights/:tab` deep-linked tabs | CLAUDE.md mandate: linkable routes, not local state |
| Tailwind CSS | (project version) | Card layout, badges, spacing | Project design token system |
| Lucide React | (project version) | Icons in cards and tabs | Established icon library across all components |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `diff` (npm) | ^7.0.0 | Text diff for narrative comparison before/after refresh | When rendering the narrative diff view |
| `react-diff-viewer` | ^3.1.1 | React component for before/after text diff display | Narrative diff display; lightweight, no heavy deps |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `react-diff-viewer` | `@hackler/react-diff-viewer` | Actively maintained fork but adds complexity — standard package is sufficient for 2-3 paragraph diffs |
| File-based cache (`data/insights/`) | In-memory cache | In-memory is lost on restart; file-based is consistent with ALL other PortOS data storage |
| `callProviderAISimple()` inline | `buildPrompt()` stage templates | Stage templates are great for multi-stage pipelines; single-shot narrative generation does not need the overhead |

**Installation (new deps only):**
```bash
cd client && npm install react-diff-viewer
```

The `diff` package may already be a transitive dependency — verify with `npm ls diff` before installing separately. No new server-side npm packages needed.

---

## Architecture Patterns

### Recommended Project Structure

```
server/
├── routes/insights.js          # GET /api/insights/genome-health
│                               # GET /api/insights/themes
│                               # GET /api/insights/narrative
│                               # POST /api/insights/narrative/refresh
│
├── services/insightsService.js # Four functions: correlations, themes, narrative, refresh
│
data/
└── insights/
    ├── themes.json             # { themes: [...], generatedAt, model }
    └── narrative.json          # { text: "...", previousText: "...", generatedAt, model }

client/src/
├── pages/Insights.jsx          # Route: /insights/:tab — three tabs
├── components/insights/
│   ├── GenomeHealthTab.jsx     # INS-01: card groups by clinical domain
│   ├── TasteIdentityTab.jsx    # INS-02: theme cards + evidence lists
│   └── CrossDomainTab.jsx      # INS-04: narrative + diff display
│   └── InsightCard.jsx         # Shared card shell with confidence badge
│   └── ConfidenceBadge.jsx     # Green/yellow/red badge with hover tooltip
│   └── ProvenancePanel.jsx     # Collapsible provenance section
│   └── EmptyState.jsx          # Gentle empty state with navigation link
```

### Pattern 1: Genome-Health Correlation (Pure Rule-Based, No LLM)

**What:** Match each saved genome marker's `status` and `category` to corresponding blood test values. Produce correlation objects with strength indicator.

**When to use:** INS-01. No LLM call needed — this is deterministic mapping.

**Data sources that already exist:**
- Genome: `genomeService.getGenomeSummary()` returns `savedMarkers` (object keyed by UUID) — each marker has `rsid`, `gene`, `category`, `status`, `name`, `description`, `implications`, `references`
- Blood tests: `meatspaceHealth.getBloodTests()` returns `{ tests: [], referenceRanges: {} }` — each test has `date`, and test-specific fields
- Body composition: `meatspaceHealth.getBodyHistory()` returns daily entries with weight/body fat

**Mapping approach:** The `MARKER_CATEGORIES` in `curatedGenomeMarkers.js` already defines clinical groupings (cardiovascular, iron, methylation, nutrient, pharmacogenomics, etc.). Map each marker category to its corresponding blood panel analyte.

**Example correlation mapping (implemented in `insightsService.js`):**
```javascript
// Source: codebase analysis of curatedGenomeMarkers.js + meatspaceHealth.js

// Category-to-blood-analyte mapping (partial examples)
const CATEGORY_BLOOD_MAP = {
  cardiovascular: ['total_cholesterol', 'ldl', 'hdl', 'triglycerides', 'homocysteine'],
  iron:           ['ferritin', 'serum_iron', 'transferrin_saturation', 'tibc'],
  methylation:    ['homocysteine', 'b12', 'folate'],
  diabetes:       ['fasting_glucose', 'hba1c', 'insulin'],
  thyroid:        ['tsh', 't3', 't4'],
  nutrient:       ['vitamin_d', 'b12', 'folate', 'magnesium', 'zinc']
};

export async function getGenomeHealthCorrelations() {
  const [summary, bloodData] = await Promise.all([
    genomeService.getGenomeSummary(),
    meatspaceHealth.getBloodTests()
  ]);

  if (!summary.uploaded) return { available: false, reason: 'no_genome' };

  const markers = Object.values(summary.savedMarkers || {});
  const latestBlood = getLatestBloodValues(bloodData.tests); // map analyte → latest value

  return groupMarkersByCategory(markers, latestBlood, CATEGORY_BLOOD_MAP);
}
```

**Confidence badge mapping from marker status:**
```javascript
const CONFIDENCE_FROM_STATUS = {
  beneficial:    { level: 'strong',      color: 'green',  label: 'Strong Evidence' },
  typical:       { level: 'moderate',    color: 'yellow', label: 'Moderate Evidence' },
  concern:       { level: 'weak',        color: 'red',    label: 'Elevated Risk Marker' },
  major_concern: { level: 'significant', color: 'red',    label: 'Significant Risk Marker' },
  not_found:     { level: 'unknown',     color: 'gray',   label: 'Not in Dataset' }
};
```

### Pattern 2: LLM Taste-to-Identity Theme Analysis

**What:** Pass all taste profile section summaries to the LLM, request structured theme cards with title, narrative paragraph, and supporting evidence list.

**When to use:** INS-02. Only runs when taste sections have completed summaries.

**Established LLM call pattern (from `taste-questionnaire.js` lines 636-688):**
```javascript
// Source: server/services/taste-questionnaire.js generateSectionSummary()

export async function generateThemeAnalysis(providerId, model) {
  const tasteProfile = await tasteQuestionnaireService.getTasteProfile();
  const sections = tasteProfile.sections.filter(s => s.summary);

  if (sections.length === 0) {
    return { available: false, reason: 'no_taste_data' };
  }

  const provider = providerId
    ? await getProviderById(providerId)
    : await getActiveProvider();
  if (!provider) throw new Error('No AI provider available');

  const modelId = model || provider.defaultModel;

  // Build context from all completed section summaries
  const profileContext = sections
    .map(s => `## ${s.label}\n${s.summary}`)
    .join('\n\n');

  const prompt = `Analyze the following taste and aesthetic preference profiles and identify 3-5 distinct identity themes that emerge from the patterns across all domains.

## Preference Data
${profileContext}

## Output Requirements

Respond with a JSON array. Each theme object must have:
- "title": string — a concise evocative label (e.g., "Comfort-Seeking Explorer", "Analytical Aesthete")
- "narrative": string — 2-3 sentences, analytical third-person tone: "The data indicates a pattern of..."
- "evidence": array of objects: { "preference": string, "domain": string, "connection": string }
- "strength": "strong" | "moderate" | "tentative"

Return ONLY the JSON array, no markdown wrapping.`;

  const result = await callProviderAISimple(provider, modelId, prompt, {
    temperature: 0.4,
    max_tokens: 2000
  });

  if (result.error) throw new Error(`Theme analysis failed: ${result.error}`);

  const themes = JSON.parse(result.text.trim());

  // Persist to data/insights/themes.json
  await writeFile(
    join(PATHS.data, 'insights/themes.json'),
    JSON.stringify({ themes, generatedAt: new Date().toISOString(), model: modelId }, null, 2)
  );

  console.log(`🧠 Taste-identity themes generated: ${themes.length} themes`);
  return { themes, generatedAt: new Date().toISOString() };
}
```

### Pattern 3: Cross-Domain Narrative with Diff

**What:** Generate 2-3 paragraph narrative. On refresh, store previous text, generate new text, return both so client can diff.

**Storage schema (`data/insights/narrative.json`):**
```json
{
  "text": "Your data indicates a distinctive...",
  "previousText": "...",
  "generatedAt": "2026-02-26T12:00:00Z",
  "previousGeneratedAt": "2026-02-10T08:00:00Z",
  "model": "claude-3-5-sonnet"
}
```

**Refresh endpoint pattern:**
```javascript
// POST /api/insights/narrative/refresh
router.post('/narrative/refresh', asyncHandler(async (req, res) => {
  const result = await insightsService.refreshCrossDomainNarrative();
  res.json(result);
}));
```

### Pattern 4: Tabbed Page Component (matches existing MeatSpace/:tab pattern)

**What:** New `Insights.jsx` page using `useParams`/`useNavigate` with three deep-linkable tabs.

**Route structure (`App.jsx` additions):**
```jsx
// Source: client/src/App.jsx existing MeatSpace pattern
<Route path="insights" element={<Navigate to="/insights/overview" replace />} />
<Route path="insights/:tab" element={<Insights />} />
```

**Tab IDs and routes:**
- `/insights/overview` — landing with domain summary cards
- `/insights/genome-health` — INS-01 genome-health correlations
- `/insights/taste-identity` — INS-02 theme cards
- `/insights/cross-domain` — INS-04 narrative + diff

**Sidebar nav entry (`Layout.jsx` — alphabetically ordered in top-level nav):**
```jsx
// Alphabetically: Insights comes after Instances, before MeatSpace
{ to: '/insights/overview', label: 'Insights', icon: Lightbulb, single: true }
// OR as expandable section if sub-navigation desired:
{
  label: 'Insights',
  icon: Lightbulb,
  children: [
    { to: '/insights/cross-domain', label: 'Cross-Domain', icon: Link2 },
    { to: '/insights/genome-health', label: 'Genome-Health', icon: Dna },
    { to: '/insights/overview', label: 'Overview', icon: LayoutDashboard },
    { to: '/insights/taste-identity', label: 'Taste & Identity', icon: Palette }
  ]
}
```

### Anti-Patterns to Avoid

- **Calling LLM on every page load:** LLM results are expensive. Cache in `data/insights/*.json`. Return cached results immediately; refresh only on explicit user action.
- **Rendering all 117 marker cards flat:** Group by `category` using `MARKER_CATEGORIES` from `curatedGenomeMarkers.js`. Each category becomes a collapsible section or tab within the Genome-Health view.
- **Modal without URL for tabs:** CLAUDE.md prohibits this. All three Insights tabs MUST be URL-parameterized routes.
- **Using `window.alert` for errors:** CLAUDE.md prohibition. Use existing toast notification pattern via `useErrorNotifications` hook.
- **Hardcoding localhost in fetch calls:** CLAUDE.md prohibition. All API calls go through `client/src/services/api.js` `request()` helper which uses `window.location.hostname`.
- **Claiming causation from genome markers:** REQUIREMENTS.md out-of-scope note: "Insights show correlations with confidence, never claim causation."

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Text diff display | Custom before/after diff renderer | `react-diff-viewer` npm package | Handles word-level diff, highlight, split/unified modes — complex to replicate correctly |
| LLM provider routing | New provider call mechanism | `callProviderAISimple()` pattern from `taste-questionnaire.js` | Already handles API key headers, timeout, abort controller, error extraction |
| SNP status classification | Re-implement marker logic | `classifyGenotype()` + `CURATED_MARKERS` from `curatedGenomeMarkers.js` | Already handles 117 markers with all rules — data is in `meta.savedMarkers` post-scan |
| Blood test data access | New DB or parsing | `getBloodTests()` from `meatspaceHealth.js` | Already returns structured blood test history |
| Apple Health data access | New file scanning | `getDailyAggregates()` / `getCorrelationData()` from `appleHealthQuery.js` | Already handles day-partitioned health files |
| Route validation | Manual validation | Zod + `validateRequest()` from `lib/validation.js` | CLAUDE.md mandate |
| Toast notifications | Custom error UI | `useErrorNotifications` hook + centralized error middleware | Errors bubble to middleware per CLAUDE.md convention |

**Key insight:** The genome and health data layers are complete. Phase 4 is a presentation and analysis layer, not a data layer. The most complex work is the blood-test-to-genome-category mapping table and the LLM prompt engineering for themes.

---

## Common Pitfalls

### Pitfall 1: Empty Blood Data Breaking Correlation Display
**What goes wrong:** User has genome data but no blood tests yet. Correlation cards try to show "Actual value: N/A" but the absence breaks the card layout or renders cryptically.
**Why it happens:** `getBloodTests()` returns `{ tests: [], referenceRanges: {} }` when no tests exist. Code that tries to find the latest value will return `undefined`.
**How to avoid:** Implement `getLatestBloodValues()` that returns an empty Map when no tests exist. Cards for markers with no matching blood data show "No blood test on record" with a link to `/meatspace/blood`. Use the `EmptyState` component pattern.
**Warning signs:** `undefined` showing in rendered card values during development.

### Pitfall 2: LLM JSON Parse Failure for Theme Analysis
**What goes wrong:** LLM returns markdown-wrapped JSON (```json ... ```) despite the prompt saying "Return ONLY the JSON array." This breaks `JSON.parse()`.
**Why it happens:** Many LLMs include code fencing even when instructed not to. The `callProviderAISimple()` pattern has no JSON extraction step.
**How to avoid:** Strip markdown code fences before parsing:
```javascript
const raw = result.text.trim();
const cleaned = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
const themes = JSON.parse(cleaned);
```
**Warning signs:** `SyntaxError: Unexpected token` in server logs when themes generate.

### Pitfall 3: Treating "not_found" Markers as Meaningful Correlations
**What goes wrong:** Many markers will have `status: 'not_found'` if the genome file doesn't include those rsids. Showing these as correlation cards produces noise.
**Why it happens:** `scanCuratedMarkers()` returns all 117 markers, including those not in the dataset.
**How to avoid:** Filter `savedMarkers` to exclude `status === 'not_found'` before grouping into correlation cards. Show a category-level "N markers not found in your dataset" count instead.
**Warning signs:** Cards showing "Not in Dataset" outnumber informative cards.

### Pitfall 4: Stale Theme Data Displayed as Current
**What goes wrong:** User adds more taste profile sections after themes were generated. The cached `themes.json` reflects old data but shows no indication it's stale.
**Why it happens:** File-based cache has no invalidation signal.
**How to avoid:** Compare `themes.json` `generatedAt` against `tasteProfile.updatedAt`. If `updatedAt` is newer, show a "Data updated since last analysis — refresh to regenerate" notice above the theme cards.
**Warning signs:** User reports theme cards don't reflect recent questionnaire answers.

### Pitfall 5: Diff Display for Identical Narratives Confusing Users
**What goes wrong:** User refreshes narrative when no meaningful new data has arrived. Diff shows no changes, which looks like a failure.
**Why it happens:** LLM narrative text changes slightly on every generation even with same input (temperature > 0). Or no new data means nearly identical output.
**How to avoid:** If `previousText` equals `text` after trimming, show "No significant changes detected" instead of a diff view. Also show `generatedAt` timestamp prominently so users understand recency.
**Warning signs:** Empty diff being reported as an error.

### Pitfall 6: Nav Entry Alphabetical Order in Layout.jsx
**What goes wrong:** Insights nav entry added at the bottom or out of alphabetical order, violating CLAUDE.md alphabetical nav mandate.
**Why it happens:** Developer appends to the nav array without checking order.
**How to avoid:** Check CLAUDE.md: "sidebar nav items in Layout.jsx are alphabetically ordered after the Dashboard+CyberCity top section and separator." Current order: CoS → Dev Tools → Digital Twin → Instances → **Insights** → MeatSpace → Security → Shell → Social Agents → Uploads.
**Warning signs:** PR review catching the ordering issue.

---

## Code Examples

Verified patterns from existing codebase:

### Loading Taste Profile Data (existing API)
```javascript
// Source: server/services/taste-questionnaire.js getTasteProfile()
// Returns: { sections: [{ id, label, status, summary, progress }], completedCount, profileSummary }
const tasteProfile = await getTasteProfile();
const completedSections = tasteProfile.sections.filter(s => s.summary);
```

### Accessing All Saved Genome Markers (existing API)
```javascript
// Source: server/services/genome.js getGenomeSummary()
// Returns: { uploaded: bool, savedMarkers: { [uuid]: { rsid, category, status, gene, name, description, implications } } }
const summary = await getGenomeSummary();
const markers = Object.values(summary.savedMarkers || {});
const classified = markers.filter(m => m.status !== 'not_found');
```

### Writing Insights Cache to Disk
```javascript
// Source: pattern from server/services/appleHealthIngest.js writeDayFile()
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { PATHS, ensureDir } from '../lib/fileUtils.js';

const INSIGHTS_DIR = join(PATHS.data, 'insights');

async function saveNarrative(text, previousText, model) {
  await ensureDir(INSIGHTS_DIR);
  const data = {
    text,
    previousText: previousText ?? null,
    generatedAt: new Date().toISOString(),
    previousGeneratedAt: null, // set from previous file if exists
    model
  };
  await writeFile(join(INSIGHTS_DIR, 'narrative.json'), JSON.stringify(data, null, 2));
  console.log(`🔮 Cross-domain narrative generated (${text.length} chars)`);
}
```

### Reading Cached Insights
```javascript
// Source: pattern from server/lib/fileUtils.js readJSONFile()
import { readJSONFile } from '../lib/fileUtils.js';

async function getNarrative() {
  return readJSONFile(join(INSIGHTS_DIR, 'narrative.json'), null);
}
```

### Insights Route Module (Express pattern)
```javascript
// Source: server/routes/appleHealth.js structure
import { Router } from 'express';
import { asyncHandler } from '../lib/errorHandler.js';
import * as insightsService from '../services/insightsService.js';

const router = Router();

// GET /api/insights/genome-health
router.get('/genome-health', asyncHandler(async (req, res) => {
  const data = await insightsService.getGenomeHealthCorrelations();
  res.json(data);
}));

// GET /api/insights/themes
router.get('/themes', asyncHandler(async (req, res) => {
  const data = await insightsService.getThemeAnalysis();
  res.json(data);
}));

// POST /api/insights/themes/refresh
router.post('/themes/refresh', asyncHandler(async (req, res) => {
  const result = await insightsService.generateThemeAnalysis();
  res.json(result);
}));

// GET /api/insights/narrative
router.get('/narrative', asyncHandler(async (req, res) => {
  const data = await insightsService.getCrossDomainNarrative();
  res.json(data);
}));

// POST /api/insights/narrative/refresh
router.post('/narrative/refresh', asyncHandler(async (req, res) => {
  const result = await insightsService.refreshCrossDomainNarrative();
  res.json(result);
}));

export default router;
```

### Confidence Badge Component (Tailwind pattern matching project tokens)
```jsx
// Source: pattern from existing StatusBadge.jsx + project design tokens
const BADGE_STYLES = {
  strong:      'bg-port-success/20 text-port-success border-port-success/30',
  moderate:    'bg-port-warning/20 text-port-warning border-port-warning/30',
  weak:        'bg-port-error/20 text-port-error border-port-error/30',
  significant: 'bg-port-error/30 text-port-error border-port-error/50',
  unknown:     'bg-gray-800 text-gray-400 border-gray-700'
};

function ConfidenceBadge({ level, label, sources }) {
  return (
    <span
      title={sources?.join(', ')}
      className={`text-xs px-2 py-0.5 rounded border ${BADGE_STYLES[level]}`}
    >
      {label}
    </span>
  );
}
```

### Diff Display (react-diff-viewer integration)
```jsx
// Source: react-diff-viewer npm package (github.com/praneshravi/react-diff-viewer)
import ReactDiffViewer from 'react-diff-viewer-continued'; // maintained fork

function NarrativeDiff({ previousText, currentText }) {
  if (!previousText) return null;
  return (
    <div className="rounded-lg overflow-hidden border border-port-border">
      <ReactDiffViewer
        oldValue={previousText}
        newValue={currentText}
        splitView={false}
        useDarkTheme
        hideLineNumbers
      />
    </div>
  );
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Modal-based multi-step insight views | Deep-linked route tabs (/insights/:tab) | PortOS convention (CLAUDE.md) | Every view is bookmarkable and sharable |
| LLM calls on every render | File-cached generation with explicit refresh | PortOS convention (taste-questionnaire, digital-twin) | Avoids repeated LLM costs; predictable latency |
| Flat list of all markers | Grouped by clinical category (MARKER_CATEGORIES from curatedGenomeMarkers.js) | Phase 1 groundwork | Clinically meaningful organization already exists |
| Free-text genome implications | Structured status field + implications string per status | Phase 1 groundwork | Machine-readable for correlation logic |

**Deprecated/outdated:**
- `/api/digital-twin/genome/`: Renamed to `/api/meatspace/genome/` in Phase 1 — do not reference old path.

---

## Open Questions

1. **Blood test analyte naming conventions**
   - What we know: `getBloodTests()` returns `{ tests: [] }` but analyte field names are user-entered (no schema enforcement currently)
   - What's unclear: Whether blood test analytes have consistent names across users' manually entered data (e.g., "LDL", "ldl", "LDL Cholesterol" all for the same thing)
   - Recommendation: Implement loose matching with normalization (lowercase, trim, common abbreviations) in `getLatestBloodValues()`. Show marker-to-blood pairing debug info during development.

2. **Apple Health data availability for Phase 4**
   - What we know: Phase 3 (HLT-03 through HLT-06) are Pending — XML import, health dashboard cards, and HRV correlation aren't complete yet
   - What's unclear: At planning time for Phase 4 plans, how much Apple Health data will be in `data/health/`
   - Recommendation: Genome-health correlation (INS-01) should degrade gracefully if no Apple Health data exists — only show blood test correlations if that's all that's available. Apple Health data can be layered in as Phase 3 completes.

3. **Optimal temperature for identity theme generation**
   - What we know: `taste-questionnaire.js` uses temperature 0.3 for section summaries
   - What's unclear: Identity theme generation is more creative — higher temperature (0.5-0.6) may produce richer themes but less consistent JSON structure
   - Recommendation: Default to 0.4 with the JSON fence-stripping safeguard. Make temperature a service-level constant that can be adjusted.

4. **React diff viewer package choice**
   - What we know: `react-diff-viewer` (praneshravi) exists but has maintenance concerns; `react-diff-viewer-continued` is the maintained community fork
   - What's unclear: Whether either is actively maintained in 2026
   - Recommendation: Use `react-diff-viewer-continued` (npm: `react-diff-viewer-continued`) — verify install and dark theme support before committing to it in the plan. Alternative: hand-roll a simple word-level highlighter using the `diff` npm package since narratives are short (2-3 paragraphs).

---

## Sources

### Primary (HIGH confidence)
- Codebase: `server/lib/curatedGenomeMarkers.js` — 117 markers with MARKER_CATEGORIES, status rules, implications
- Codebase: `server/services/genome.js` — `scanCuratedMarkers()`, `getGenomeSummary()`, `savedMarkers` schema
- Codebase: `server/services/meatspaceHealth.js` — `getBloodTests()`, `getBodyHistory()` APIs
- Codebase: `server/services/appleHealthQuery.js` — `getDailyAggregates()`, `getCorrelationData()`
- Codebase: `server/services/taste-questionnaire.js` — `getTasteProfile()`, `callProviderAISimple()` LLM pattern
- Codebase: `client/src/App.jsx` — route structure, MeatSpace/:tab pattern confirmed
- Codebase: `client/src/components/Layout.jsx` — nav entry order and structure confirmed
- Codebase: `server/lib/fileUtils.js` — PATHS constants, `readJSONFile()`, `ensureDir()`
- CLAUDE.md — Tailwind design tokens, alphabetical nav, no-try/catch, no-window.alert, linkable routes mandates
- `.planning/REQUIREMENTS.md` — INS-01 through INS-04 definitions and out-of-scope (no causation claims)
- `.planning/phases/04-cross-domain-insights-engine/04-CONTEXT.md` — locked decisions

### Secondary (MEDIUM confidence)
- WebSearch: `react-diff-viewer-continued` (maintained fork of `react-diff-viewer`) — multiple npm references, dark theme support documented
- WebSearch: LLM JSON code fence stripping pattern — widely documented community workaround for prompt non-compliance

### Tertiary (LOW confidence)
- WebSearch: `react-diff-viewer` maintenance status in 2026 — unverified, may need manual npm check at planning time

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all dependencies verified in package.json or existing service patterns
- Architecture: HIGH — all patterns traced to existing PortOS code; no speculative additions
- Pitfalls: HIGH for codebase-sourced (empty data, not_found markers, alphabetical nav); MEDIUM for LLM behavior (JSON fencing widely documented but not verified in this specific provider setup)
- Diff display: MEDIUM — react-diff-viewer-continued identified but not verified against current npm registry

**Research date:** 2026-02-26
**Valid until:** 2026-04-26 (stable stack, 60 days)
