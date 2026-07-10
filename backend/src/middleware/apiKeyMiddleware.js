import { Website } from '../models/Website.js';
import { ACCOUNT_STATUS } from '../constants/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const getRequestOrigin = (req) => {
  const origin = req.get('origin');
  if (origin) return origin;

  const referer = req.get('referer');
  if (!referer) return '';

  try {
    return new URL(referer).origin;
  } catch {
    return '';
  }
};

const normalizeOrigin = (value) => {
  try {
    return new URL(value).origin.toLowerCase();
  } catch {
    return '';
  }
};

const ensureWebsiteOriginAllowed = (req, website) => {
  const requestOrigin = normalizeOrigin(getRequestOrigin(req));
  const websiteOrigin = normalizeOrigin(website.websiteUrl);

  if (!requestOrigin || !websiteOrigin || requestOrigin !== websiteOrigin) {
    const error = new Error('This website is not allowed to use this CMS API key');
    error.statusCode = 403;
    throw error;
  }
};

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

  ensureWebsiteOriginAllowed(req, website);

  req.website = website;
  next();
});
