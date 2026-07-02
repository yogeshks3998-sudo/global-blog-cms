import express from 'express';
import { successResponse } from '../utils/apiResponse.js';

const router = express.Router();

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
