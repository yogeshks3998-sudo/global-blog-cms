import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';
import { errorResponse } from '../utils/apiResponse.js';

export const apiLimiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  max: env.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) =>
    errorResponse(res, {
      statusCode: 429,
      message: 'Too many requests. Please try again later.'
    })
});
