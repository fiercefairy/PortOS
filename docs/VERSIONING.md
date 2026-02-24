# Versioning & Release Process

## Version Format

PortOS uses semantic versioning: **Major.Minor.Patch**

| Component | Description | When Incremented |
|-----------|-------------|------------------|
| **Major** | Breaking changes | Manual — in commit |
| **Minor** | New features | Manual — in commit |
| **Patch** | Bug fixes, refactors | Manual — in commit |

Example progression: `0.22.0` → `0.22.1` (fix) → `0.23.0` (feature) → `1.0.0` (breaking)

## Branches

| Branch | Purpose |
|--------|---------|
| `main` | Production releases only |
| `dev` | Active development |

## Workflow

### Version Bumping (Manual)

Version bumps happen in the same commit as the code change:

```bash
# Bump version (choose one)
npm version patch --no-git-tag-version   # bug fix
npm version minor --no-git-tag-version   # new feature
npm version major --no-git-tag-version   # breaking change

# Stage version files along with your code changes
git add package.json package-lock.json [other files]
git commit -m "feat: add new feature"
```

### On Push to `dev`

CI runs tests and linting. No version changes.

### On Merge `dev` → `main`

1. Release workflow triggers
2. Creates git tag with current version (e.g., `v0.23.0`)
3. Generates GitHub release with changelog from `.changelog/v{major}.{minor}.x.md`
4. Archives the changelog (renames `v0.23.x.md` → `v0.23.0.md`)
5. Merges `main` back into `dev` to share the changelog archive commit

## Manual Steps

### Regular Development

```bash
git checkout dev
git pull

# Make changes, bump version, commit, push
npm version patch --no-git-tag-version
git add package.json package-lock.json [changed files]
git commit -m "fix: resolve issue"
git pull --rebase --autostash && git push
```

### Creating a Release

```bash
git checkout dev
git pull

# Create PR from dev to main
gh pr create --base main --head dev --title "Release v0.23.x"

# After PR is merged:
# - GitHub creates tag v0.23.0
# - GitHub creates release with changelog
# - Changelog archived on main, merged back to dev
```

## CI Skip

Use `[skip ci]` in commit messages to prevent CI from running (used by automation for changelog archives and merges).
