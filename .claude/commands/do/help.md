---
description: List all available slashdo commands
---

# slashdo Commands

List all available `/do:*` commands with their descriptions.

## Steps

1. **List commands**: Print a table of all available slashdo commands:

| Command | Description |
|---|---|
| `/do:better` | Unified DevSecOps audit, remediation, per-category PRs, CI verification, and Copilot review loop |
| `/do:better-swift` | SwiftUI-optimized DevSecOps audit with multi-platform coverage (iOS, macOS, watchOS, tvOS, visionOS) |
| `/do:fpr` | Commit, push to fork, and open a PR against the upstream repo |
| `/do:goals` | Scan codebase to infer project goals, clarify with user, and generate GOALS.md |
| `/do:help` | List all available slashdo commands |
| `/do:omd` | Audit and optimize markdown files (CLAUDE.md, README.md, etc.) against best practices |
| `/do:pr` | Commit, push, and open a PR against the repo's default branch |
| `/do:push` | Commit and push all work with changelog |
| `/do:release` | Create a release PR using the project's documented release workflow |
| `/do:replan` | Review and clean up PLAN.md, extract docs from completed work |
| `/do:review` | Deep code review of changed files against best practices |
| `/do:rpr` | Resolve PR review feedback with parallel agents |
| `/do:update` | Update slashdo submodule to the latest version |

2. **Check for updates**: Run `git -C lib/slashdo log --oneline -1` to show the current slashdo commit, and check if the submodule is behind remote with `git submodule status lib/slashdo`.

## Notes

- PortOS bundles slashdo as a git submodule at `lib/slashdo`
- Commands are symlinked from `lib/slashdo/commands/do/` into `.claude/commands/do/`
- To update: `git submodule update --remote lib/slashdo`
- For more info, see https://github.com/atomantic/slashdo
