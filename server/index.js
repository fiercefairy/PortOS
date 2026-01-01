import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import healthRoutes from './routes/health.js';
import appsRoutes from './routes/apps.js';
import portsRoutes from './routes/ports.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5554;
const HOST = process.env.HOST || '127.0.0.1';

// Middleware
app.use(cors({
  origin: ['http://localhost:5555', 'http://127.0.0.1:5555'],
  credentials: true
}));
app.use(express.json());

// API Routes
app.use('/api', healthRoutes);
app.use('/api/apps', appsRoutes);
app.use('/api/ports', portsRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    code: err.code || 'INTERNAL_ERROR'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    code: 'NOT_FOUND'
  });
});

app.listen(PORT, HOST, () => {
  console.log(`PortOS server running at http://${HOST}:${PORT}`);
});
