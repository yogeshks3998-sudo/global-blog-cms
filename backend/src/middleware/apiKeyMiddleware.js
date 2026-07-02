import { Website } from '../models/Website.js';
import { ACCOUNT_STATUS } from '../constants/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const requireWebsiteApiKey = asyncHandler(async (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;
  const websiteId = req.headers['x-website-id'] || req.query.websiteId || req.body.websiteId;

  if (!apiKey && !websiteId) {
    const error = new Error('Website API key or website ID is required');
    error.statusCode = 401;
    throw error;
  }

  const website = await Website.findOne({
    ...(apiKey ? { apiKey } : { _id: websiteId }),
    status: ACCOUNT_STATUS.ACTIVE
  });

  if (!website) {
    const error = new Error('Invalid or inactive website');
    error.statusCode = 401;
    throw error;
  }

  req.website = website;
  next();
});
