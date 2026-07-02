import express from 'express';
import { successResponse } from '../utils/apiResponse.js';

const router = express.Router();

router.get('/', (req, res) =>
  successResponse(res, {
    message: 'Global Blog CMS API is running',
    data: {
      health: '/api/health',
      timestamp: new Date().toISOString()
    }
  })
);

router.get('/health', (req, res) =>
  successResponse(res, {
    message: 'Backend is healthy',
    data: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    }
  })
);

export default router;
