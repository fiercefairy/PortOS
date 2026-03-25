---
description: Update slashdo commands to the latest version
---

# Update slashdo

Update the bundled slashdo submodule to the latest version.

## Steps

1. **Update the submodule**:
   ```bash
   git submodule update --remote lib/slashdo
   ```

2. **Show what changed**:
   - Run `git diff lib/slashdo` to see if the submodule pointer changed
   - If it changed, run `git log --oneline HEAD...$(git -C lib/slashdo rev-parse HEAD) -- .` inside the submodule to show new commits

3. **Commit if updated**:
   - If the submodule changed, stage and commit: `chore: update slashdo submodule`
   - If no changes, report that slashdo is already up to date

## Notes

- PortOS bundles slashdo as a git submodule at `lib/slashdo`
- Symlinks in `.claude/commands/do/` point into the submodule
- No npm install needed — the submodule provides commands directly
