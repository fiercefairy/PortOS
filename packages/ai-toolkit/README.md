# @portos/ai-toolkit

Shared AI provider, model, and prompt template patterns for PortOS-style applications.

## Installation

```bash
npm install @portos/ai-toolkit
```

## Usage

### Server (Express)

```javascript
import express from 'express';
import { createAIToolkit } from '@portos/ai-toolkit/server';

const app = express();

const aiToolkit = createAIToolkit({
  dataDir: './data',
  providersFile: 'providers.json',
  runsDir: 'runs',
  promptsDir: 'prompts',
  io: socketIOInstance // optional
});

// Mount all routes
aiToolkit.mountRoutes(app, '/api');

// Or mount individual routes
app.use('/api/providers', aiToolkit.routes.providers);
app.use('/api/runs', aiToolkit.routes.runs);
app.use('/api/prompts', aiToolkit.routes.prompts);

// Access services directly
const providers = await aiToolkit.services.providers.getAllProviders();
```

### Client (React)

```javascript
import { createApiClient, useProviders, useRuns, ProviderDropdown } from '@portos/ai-toolkit/client';

// Create API client
const api = createApiClient({
  baseUrl: '/api',
  onError: (error) => toast.error(error)
});

// Use hooks
function MyComponent() {
  const {
    providers,
    activeProvider,
    isLoading,
    setActive,
    testProvider
  } = useProviders(api);

  const { runs, createRun } = useRuns(api);

  return (
    <div>
      <ProviderDropdown
        providers={providers}
        value={activeProvider}
        onChange={setActive}
      />
    </div>
  );
}
```

## API

### Server

#### `createAIToolkit(config)`

Creates a complete AI toolkit instance with services and routes.

**Config options:**
- `dataDir` - Data directory path (default: './data')
- `providersFile` - Providers JSON filename (default: 'providers.json')
- `runsDir` - Runs directory name (default: 'runs')
- `promptsDir` - Prompts directory name (default: 'prompts')
- `screenshotsDir` - Screenshots directory path (default: './data/screenshots')
- `sampleProvidersFile` - Sample providers file path (optional)
- `io` - Socket.IO instance for real-time updates (optional)
- `asyncHandler` - Express async error handler wrapper (optional)
- `hooks` - Lifecycle event hooks (optional)
- `maxConcurrentRuns` - Max concurrent runs (default: 5)

### Client

#### `createApiClient(config)`

Creates an API client for making requests to the AI toolkit server.

**Config options:**
- `baseUrl` - Base API URL (default: '/api')
- `onError` - Error handler function (optional)

#### `useProviders(apiClient, options)`

React hook for managing AI providers.

**Returns:**
- `providers` - Array of providers
- `activeProvider` - Currently active provider ID
- `isLoading` - Loading state
- `error` - Error message
- `refetch` - Function to reload providers
- `setActive` - Function to set active provider
- `createProvider` - Function to create provider
- `updateProvider` - Function to update provider
- `deleteProvider` - Function to delete provider
- `testProvider` - Function to test provider
- `refreshModels` - Function to refresh API models

#### `useRuns(apiClient, options)`

React hook for managing AI runs.

**Returns:**
- `runs` - Array of runs
- `total` - Total runs count
- `isLoading` - Loading state
- `error` - Error message
- `refetch` - Function to reload runs
- `createRun` - Function to create run
- `stopRun` - Function to stop run
- `deleteRun` - Function to delete run
- `deleteFailedRuns` - Function to delete all failed runs
- `getRunOutput` - Function to get run output
- `getRunPrompt` - Function to get run prompt

## License

MIT
