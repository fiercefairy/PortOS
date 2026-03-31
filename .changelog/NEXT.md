# Unreleased Changes

## Added
- AI-powered narrative summaries for JIRA weekly status reports (tries each API provider until one succeeds)

## Changed
- JIRA reports now filter to current user's tickets only via `currentUser()` JQL
- Status report UI simplified to personal weekly status format with copy-to-clipboard
- Ticket keys rendered as clickable JIRA links anywhere in report text

## Changed
- Pin all npm dependencies to exact versions across all packages (no more `^` or `~` ranges) to prevent supply chain attacks
- Heavy-mode dependency audit — 15 packages flagged for removal, full replacement plan saved to PLAN.md
- Replace `axios` with owned `server/lib/httpClient.js` (fetch-based, AbortSignal.timeout, self-signed TLS via https.Agent)
- Replace `multer` with owned `server/lib/multipart.js` (streaming multipart parser, no memory buffering, safe for 500MB+ files)
- Replace `unzipper` with owned `server/lib/zipStream.js` (streaming ZIP parser via zlib.createInflateRaw, DEFLATE + stored entries)
- Remove `cors` package from scaffold-generated project templates; generated code now uses inline CORS middleware

## Fixed
- JIRA report provider discovery now tries all available API providers instead of failing on first unreachable one
