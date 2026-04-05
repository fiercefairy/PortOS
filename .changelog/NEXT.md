## Fixed

- Submodule status API (`/api/git/submodules/status`) always returned empty array — `stdout.trim()` was stripping the leading space status character from `git submodule status` output, causing the regex parser to fail
- CoS agents page crash: pipe characters (`|`) in task descriptions triggered infinite loop in markdown parser — non-table pipes now treated as normal text with safety fallback
- CoS agents API returned full output arrays (600KB+) for all agents in listing — output now stripped from listing response and loaded on demand
