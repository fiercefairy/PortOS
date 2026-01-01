# Port OS - Implementation Plan

See full plan at: `~/.claude/plans/mutable-inventing-eagle.md`

## Quick Reference

### Tech Stack
- Frontend: React + Tailwind CSS + Vite (port 5555)
- Backend: Express.js (port 5554)
- Process Manager: PM2
- Data Storage: JSON files in `./data/`

### Commands
```bash
# Install all dependencies
npm run install:all

# Start development (both client and server)
npm run dev

# Start with PM2
pm2 start ecosystem.config.cjs

# View PM2 logs
pm2 logs
```

### Milestones
- [x] M0: Bootstrap (ports, basic UI shell)
- [x] M1: App registry + grid
- [x] M2: PM2 integration (start/stop/restart/status)
- [ ] M3: Log viewer (streaming)
- [ ] M4: Create new app wizard
- [ ] M5: Dev tools (history, command runner)
- [ ] M6: AI providers + headless executor

### API Endpoints
| Route | Description |
|-------|-------------|
| GET /api/health | Health check |
| GET/POST /api/apps | List/create apps |
| GET/PUT/DELETE /api/apps/:id | App CRUD |
| POST /api/apps/:id/start | Start via PM2 |
| POST /api/apps/:id/stop | Stop via PM2 |
| POST /api/apps/:id/restart | Restart via PM2 |
| GET /api/apps/:id/status | PM2 status |
| GET /api/apps/:id/logs | Get logs |
| GET /api/ports/scan | Scan ports |
