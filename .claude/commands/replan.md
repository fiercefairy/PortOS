# Replan Command

You are tasked with reviewing and updating the PLAN.md file to keep it clean, current, and action-oriented.

## Your Responsibilities

### 1. Review PLAN.md Structure
- Read the entire PLAN.md file
- Identify completed milestones (marked with [x]) that have detailed documentation
- Identify sections that should be moved to permanent documentation

### 2. Extract Documentation from Completed Work
For each completed milestone with substantial documentation:
- Determine the appropriate docs file (ARCHITECTURE.md, API.md, PM2.md, TROUBLESHOOTING.md, etc.)
- Extract the detailed documentation sections
- Move them to the appropriate docs file with proper formatting
- If creating a new docs file, follow the existing docs structure

**Files to consider:**
- `docs/ARCHITECTURE.md` - System design, data flow, services architecture
- `docs/API.md` - API endpoints, schemas, WebSocket events
- `docs/PM2.md` - PM2 patterns and process management
- `docs/PORTS.md` - Port allocation and conventions
- `docs/TROUBLESHOOTING.md` - Common issues and solutions
- `docs/features/*.md` - Individual feature documentation

### 3. Clean Up PLAN.md
After moving documentation:
- Replace detailed milestone documentation with a brief summary (1-3 sentences)
- Add a reference link to the docs file where details were moved
- Keep the milestone checklist status ([x] for completed)
- Remove redundant or outdated information
- Keep the Quick Reference section up to date

**Example transformation:**
```markdown
Before:
- [x] M16: Memory System

### Architecture
- **Memory Service** (`server/services/memory.js`): Core CRUD, search, and lifecycle operations
- **Embeddings Service** (`server/services/memoryEmbeddings.js`): LM Studio integration
[... 50 more lines of detailed docs ...]

After:
- [x] M16: Memory System - Semantic memory with vector embeddings for CoS agent context. See [Memory System](./docs/features/memory-system.md)
```

### 4. Update Documentation Index
- Ensure the Documentation section in PLAN.md lists all docs files
- Add any new docs files you created
- Verify all links are correct

### 5. Focus on Next Actions
At the end of PLAN.md:
- Add a "## Next Actions" section if it doesn't exist
- List 3-5 concrete next steps based on:
  - Incomplete milestones
  - Recent git commits
  - Areas that need attention
- Make these action items specific and actionable

### 6. Commit Your Changes
After reorganizing:
- Use `/gitup` to commit changes with a clear message like:
  ```
  docs: reorganize PLAN.md and extract completed work to docs

  - Moved M## documentation to docs/features/
  - Updated PLAN.md to focus on next actions
  - Added Next Actions section
  ```

## Guidelines

- **Be thorough**: Read all completed milestones and assess documentation value
- **Be surgical**: Only move substantial documentation (>20 lines), keep brief summaries in PLAN
- **Be organized**: Group related content in docs files with clear headings
- **Be consistent**: Match the style and format of existing docs files
- **Be helpful**: Make it easy to find information by adding clear references

## Example Output Structure

After running `/replan`, the PLAN.md should have:
```markdown
# Port OS - Implementation Plan

## Quick Reference
[... existing quick reference ...]

### Milestones
- [x] M0-M15: Core features complete - See [ARCHITECTURE.md](./docs/ARCHITECTURE.md)
- [x] M16: Memory System - See [Memory System](./docs/features/memory-system.md)
- [x] M17-M32: Advanced features - See respective docs
- [ ] M33: Next feature...

### Documentation
- [Architecture Overview](./docs/ARCHITECTURE.md)
- [API Reference](./docs/API.md)
- [Memory System](./docs/features/memory-system.md)
- [Brain System](./docs/features/brain-system.md)
- [...more docs...]

## Next Actions

1. **Feature X**: Brief description of what needs to be done
2. **Fix Y**: Brief description of issue to address
3. **Improve Z**: Brief description of enhancement
4. **Test A**: Brief description of testing needed
5. **Deploy B**: Brief description of deployment task
```

## Notes

- Don't delete information - move it to appropriate docs files
- Keep API endpoint tables consolidated in API.md
- Keep architectural diagrams and data flow in ARCHITECTURE.md
- Create feature-specific docs in docs/features/ for complex systems
- Preserve all historical information but organize it better
- Update CLAUDE.md if any commands or conventions changed
