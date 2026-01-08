# API Reference

PortOS exposes a REST API on port 5554 and WebSocket events via Socket.IO.

## Base URL

```
http://localhost:5554/api
```

## Authentication

No authentication is required. PortOS relies on network-level security (Tailscale) for access control.

## REST Endpoints

### Apps

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/apps` | List all registered apps |
| POST | `/apps` | Register a new app |
| GET | `/apps/:id` | Get app details |
| PUT | `/apps/:id` | Update app |
| DELETE | `/apps/:id` | Unregister app |
| POST | `/apps/:id/start` | Start app via PM2 |
| POST | `/apps/:id/stop` | Stop app via PM2 |
| POST | `/apps/:id/restart` | Restart app via PM2 |
| GET | `/apps/:id/status` | Get PM2 status |
| GET | `/apps/:id/logs` | Get recent logs |
| POST | `/apps/:id/refresh-config` | Re-parse ecosystem config |

### Processes & Logs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/logs/processes` | List all PM2 processes |
| GET | `/logs/:name` | Get logs for process |
| GET | `/ports/scan` | Scan for active ports |

### AI Providers

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/providers` | List all AI providers |
| POST | `/providers` | Add new provider |
| PUT | `/providers/:id` | Update provider |
| DELETE | `/providers/:id` | Delete provider |
| POST | `/providers/:id/test` | Test provider connectivity |
| PUT | `/providers/active` | Set active provider |

### AI Runs (DevTools)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/runs` | List run history |
| POST | `/runs` | Execute new AI run |
| GET | `/runs/:id` | Get run details |
| GET | `/runs/:id/output` | Get run output |
| POST | `/runs/:id/stop` | Stop active run |
| DELETE | `/runs/:id` | Delete run |

### AI Agents

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/agents` | List running AI agent processes |
| GET | `/agents/:pid` | Get agent process details |
| DELETE | `/agents/:pid` | Kill agent process |

### Command Execution

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/commands/execute` | Execute shell command |
| POST | `/commands/:id/stop` | Stop running command |
| GET | `/commands/allowed` | List allowed commands |
| GET | `/commands/processes` | List PM2 processes |

### History

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/history` | List action history |
| GET | `/history/stats` | Get history statistics |
| DELETE | `/history` | Clear history |

### Detection & Import

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/detect/ports` | Detect process on port |
| POST | `/detect/repo` | Validate repo path |
| POST | `/detect/ai` | AI-powered app detection |

### Templates

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/templates` | List available templates |
| POST | `/templates` | Add custom template |
| POST | `/templates/create` | Create app from template |
| DELETE | `/templates/:id` | Delete custom template |

### Prompts

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/prompts` | List all prompt stages |
| GET | `/prompts/:stage` | Get stage template |
| PUT | `/prompts/:stage` | Update stage/template |
| POST | `/prompts/:stage/preview` | Preview compiled prompt |
| GET | `/prompts/variables` | List all variables |
| PUT | `/prompts/variables/:key` | Update variable |
| POST | `/prompts/variables` | Create variable |
| DELETE | `/prompts/variables/:key` | Delete variable |

### Chief of Staff

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/cos` | Get CoS status |
| POST | `/cos/start` | Start daemon |
| POST | `/cos/stop` | Stop daemon |
| GET | `/cos/config` | Get configuration |
| PUT | `/cos/config` | Update configuration |
| GET | `/cos/tasks` | Get all tasks |
| POST | `/cos/evaluate` | Force task evaluation |
| GET | `/cos/health` | Get health status |
| POST | `/cos/health/check` | Run health check |
| GET | `/cos/agents` | List active agents |
| POST | `/cos/agents/:id/terminate` | Terminate agent |
| GET | `/cos/reports` | List reports |

### Memory System

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/memory` | List memories with filters |
| GET | `/memory/:id` | Get single memory |
| POST | `/memory` | Create memory |
| PUT | `/memory/:id` | Update memory |
| DELETE | `/memory/:id` | Delete (soft) memory |
| POST | `/memory/search` | Semantic search |
| GET | `/memory/categories` | List categories |
| GET | `/memory/tags` | List tags |
| GET | `/memory/timeline` | Timeline view data |
| GET | `/memory/graph` | Graph visualization data |
| GET | `/memory/stats` | Memory statistics |
| POST | `/memory/link` | Link two memories |
| POST | `/memory/consolidate` | Merge similar memories |
| POST | `/memory/decay` | Apply importance decay |
| DELETE | `/memory/expired` | Clear expired memories |
| GET | `/memory/embeddings/status` | LM Studio connection status |

### PM2 Standardization

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/standardize/analyze` | Analyze app for standardization |
| POST | `/standardize/apply` | Apply standardization changes |
| GET | `/standardize/template` | Get PM2 template reference |
| POST | `/standardize/backup` | Create git backup |

### Usage Metrics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/usage` | Get usage statistics |
| GET | `/usage/daily` | Get daily activity |
| GET | `/usage/hourly` | Get hourly activity |

## WebSocket Events

Connect to Socket.IO at `http://localhost:5554`.

### Log Streaming

```javascript
// Subscribe to process logs
socket.emit('logs:subscribe', { processName: 'portos-server', lines: 100 });

// Receive log lines
socket.on('logs:line', ({ processName, line }) => {
  console.log(`[${processName}] ${line}`);
});

// Unsubscribe
socket.emit('logs:unsubscribe', { processName: 'portos-server' });
```

### Error Notifications

```javascript
// Subscribe to errors
socket.emit('errors:subscribe');

// Receive error events
socket.on('error:occurred', (error) => {
  console.error('Server error:', error.message, error.code);
});

// Unsubscribe
socket.emit('errors:unsubscribe');
```

### Chief of Staff Events

```javascript
// CoS status updates
socket.on('cos:status', (status) => {
  console.log('CoS running:', status.running);
});

// Agent activity
socket.on('cos:agent:started', (agent) => {
  console.log('Agent started:', agent.id, agent.task);
});

socket.on('cos:agent:completed', (agent) => {
  console.log('Agent completed:', agent.id, agent.success);
});

// Task updates
socket.on('cos:task:updated', (task) => {
  console.log('Task updated:', task.id, task.status);
});

// Logs from CoS
socket.on('cos:log', (entry) => {
  console.log(`[CoS] ${entry.level}: ${entry.message}`);
});
```

### Memory Events

```javascript
socket.on('cos:memory:created', (memory) => {
  console.log('Memory created:', memory.id);
});

socket.on('cos:memory:updated', (memory) => {
  console.log('Memory updated:', memory.id);
});
```

### App Detection (Streaming)

```javascript
// Start streaming detection
socket.emit('detect:stream', { path: '/path/to/repo' });

// Receive discovery steps
socket.on('detect:step', (step) => {
  console.log('Discovered:', step.field, step.value);
});

// Detection complete
socket.on('detect:complete', (appData) => {
  console.log('Detection complete:', appData);
});
```

## Request Examples

### Register an App

```bash
curl -X POST http://localhost:5554/api/apps \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My App",
    "repoPath": "/path/to/repo",
    "uiPort": 3000,
    "apiPort": 3001,
    "pm2ProcessNames": ["myapp-server", "myapp-client"]
  }'
```

### Execute AI Run

```bash
curl -X POST http://localhost:5554/api/runs \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "List all files in the current directory",
    "workspacePath": "/path/to/workspace"
  }'
```

### Get PM2 Process Logs

```bash
curl http://localhost:5554/api/logs/portos-server?lines=50
```

## Error Responses

All errors return JSON with consistent structure:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "timestamp": 1704067200000,
  "context": {}
}
```

Common error codes:
- `NOT_FOUND` - Resource not found
- `VALIDATION_ERROR` - Invalid request data
- `COMMAND_NOT_ALLOWED` - Shell command not in allowlist
- `INTERNAL_ERROR` - Server error
