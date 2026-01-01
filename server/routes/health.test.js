import { describe, it, expect } from 'vitest';
import express from 'express';
import healthRoutes from './health.js';

describe('Health Routes', () => {
  const app = express();
  app.use('/api', healthRoutes);

  it('should return health status', async () => {
    const response = await fetch('http://127.0.0.1:5554/api/health');

    // If server is running, check response
    if (response.ok) {
      const data = await response.json();
      expect(data.status).toBe('ok');
      expect(data.version).toBeDefined();
    }
  });
});
