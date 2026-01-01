import { Router } from 'express';
import * as portsService from '../services/ports.js';

const router = Router();

// GET /api/ports/scan - Scan for used ports
router.get('/scan', async (req, res, next) => {
  const scan = await portsService.scanPorts();
  res.json(scan);
});

// POST /api/ports/check - Check if specific ports are available
router.post('/check', async (req, res, next) => {
  const { ports } = req.body;

  if (!Array.isArray(ports) || ports.length === 0) {
    return res.status(400).json({
      error: 'ports must be a non-empty array of numbers',
      code: 'VALIDATION_ERROR'
    });
  }

  const results = await portsService.checkPortsAvailable(ports);
  res.json(results);
});

// POST /api/ports/allocate - Allocate available ports
router.post('/allocate', async (req, res, next) => {
  const count = parseInt(req.body.count) || 1;

  if (count < 1 || count > 10) {
    return res.status(400).json({
      error: 'count must be between 1 and 10',
      code: 'VALIDATION_ERROR'
    });
  }

  const ports = await portsService.allocatePorts(count);
  res.json({ allocated: ports });
});

export default router;
