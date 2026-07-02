import jwt from 'jsonwebtoken';
import { ACCOUNT_STATUS } from '../constants/index.js';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { successResponse } from '../utils/apiResponse.js';

const signToken = (user) =>
  jwt.sign(
    {
      id: user._id,
      role: user.role,
      websiteId: user.websiteId
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );

export const login = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;
  const identityFilters = [];

  if (email) identityFilters.push({ email: email.toLowerCase() });
  if (username) identityFilters.push({ username: username.toLowerCase() });

  const user = await User.findOne({ $or: identityFilters }).select('+password');

  if (!user || user.status !== ACCOUNT_STATUS.ACTIVE || !(await user.comparePassword(password))) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const token = signToken(user);

  return successResponse(res, {
    message: 'Login successful',
    data: {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        websiteId: user.websiteId,
        status: user.status
      }
    }
  });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const allowed = ['name', 'email', 'username'];
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) req.user[field] = req.body[field];
  });

  await req.user.save();

  return successResponse(res, {
    message: 'Profile updated successfully',
    data: { user: req.user }
  });
});

export const changePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.comparePassword(req.body.currentPassword))) {
    const error = new Error('Current password is incorrect');
    error.statusCode = 400;
    throw error;
  }

  user.password = req.body.newPassword;
  await user.save();

  return successResponse(res, {
    message: 'Password changed successfully'
  });
});

export const getProfile = asyncHandler(async (req, res) =>
  successResponse(res, {
    message: 'Profile fetched successfully',
    data: { user: req.user }
  })
);
