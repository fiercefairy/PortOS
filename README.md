# Port OS

Local dev machine App OS portal for managing development web apps. Similar to Umbrel, but for active git repos and dev environments.

## Features

- **App Grid**: Dashboard with tiles showing status, ports, and quick actions
- **App Management**: Register repos, configure ports, start/stop/restart via PM2
- **Port Scanner**: Detect used ports and suggest available ranges
- **Log Viewer**: Tail and stream logs from PM2 processes (coming soon)
- **Dev Tools**: Process list, action history, command runner (coming soon)
- **AI Providers**: Run Claude Code, Codex CLI, Gemini CLI, or local LLMs (coming soon)

## Quick Start

```bash
# Install dependencies
npm run install:all

# Start development
npm run dev
```

- UI: http://localhost:5555
- API: http://localhost:5554

## Production with PM2

```bash
# Start with PM2
pm2 start ecosystem.config.cjs

# View status
pm2 status

# View logs
pm2 logs portos-server

# Stop
pm2 stop all
```

## Project Structure

```
PortOS/
├── client/           # React + Vite frontend (port 5555)
├── server/           # Express.js API (port 5554)
├── data/             # Runtime data (gitignored)
├── data.sample/      # Sample configurations
└── ecosystem.config.cjs  # PM2 configuration
```

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | /api/health | Health check |
| GET | /api/apps | List all registered apps |
| POST | /api/apps | Register new app |
| GET | /api/apps/:id | Get app details |
| PUT | /api/apps/:id | Update app |
| DELETE | /api/apps/:id | Delete app |
| POST | /api/apps/:id/start | Start app via PM2 |
| POST | /api/apps/:id/stop | Stop app |
| POST | /api/apps/:id/restart | Restart app |
| GET | /api/apps/:id/status | Get PM2 status |
| GET | /api/apps/:id/logs | Get process logs |
| GET | /api/ports/scan | Scan for used ports |

## Configuration

Apps are stored in `data/apps.json`. See `data.sample/` for example configurations.

## Security

- Binds to 127.0.0.1 by default (local-only)
- No external network access unless explicitly configured
- Command execution uses spawn with arg arrays (no shell injection)

## License

MIT
