import jwt from 'jsonwebtoken';
import { ACCOUNT_STATUS } from '../constants/index.js';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const error = new Error('Unauthorized');
    error.statusCode = 401;
    throw error;
  }

  const token = authHeader.split(' ')[1];
  const decoded = jwt.verify(token, env.jwtSecret);
  const user = await User.findById(decoded.id).select('-password');

  if (!user || user.status !== ACCOUNT_STATUS.ACTIVE) {
    const error = new Error('Unauthorized');
    error.statusCode = 401;
    throw error;
  }

  req.user = user;
  next();
});

export const authorizeRoles = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    const error = new Error('Forbidden');
    error.statusCode = 403;
    return next(error);
  }

  return next();
};

export const requireClientWebsite = (req, res, next) => {
  if (!req.user?.websiteId) {
    const error = new Error('Client admin is not assigned to a website');
    error.statusCode = 403;
    return next(error);
  }

  return next();
};
