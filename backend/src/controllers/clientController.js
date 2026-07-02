import mongoose from 'mongoose';
import { ACCOUNT_STATUS, USER_ROLES } from '../constants/index.js';
import { User } from '../models/User.js';
import { Website } from '../models/Website.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { successResponse } from '../utils/apiResponse.js';

const clientSelect = '-password';

export const createClient = asyncHandler(async (req, res) => {
  const clientId = new mongoose.Types.ObjectId();
  const websiteId = new mongoose.Types.ObjectId();

  const client = await User.create({
    _id: clientId,
    name: req.body.name,
    email: req.body.email,
    username: req.body.username,
    password: req.body.password,
    role: USER_ROLES.CLIENT_ADMIN,
    websiteId,
    status: req.body.status || ACCOUNT_STATUS.ACTIVE
  });

  let website;

  try {
    website = await Website.create({
      _id: websiteId,
      websiteName: req.body.websiteName,
      websiteUrl: req.body.websiteUrl,
      logo: req.body.logo || null,
      clientAdminId: clientId,
      status: req.body.websiteStatus || ACCOUNT_STATUS.ACTIVE
    });
  } catch (error) {
    await client.deleteOne();
    throw error;
  }

  return successResponse(res, {
    statusCode: 201,
    message: 'Client and website created successfully',
    data: { client, website }
  });
});

export const getClients = asyncHandler(async (req, res) => {
  const clients = await User.find({ role: USER_ROLES.CLIENT_ADMIN })
    .select(clientSelect)
    .populate('websiteId', 'websiteName websiteUrl status apiKey')
    .sort({ createdAt: -1 });

  return successResponse(res, {
    message: 'Clients fetched successfully',
    data: { clients }
  });
});

export const getClient = asyncHandler(async (req, res) => {
  const client = await User.findOne({
    _id: req.params.id,
    role: USER_ROLES.CLIENT_ADMIN
  })
    .select(clientSelect)
    .populate('websiteId', 'websiteName websiteUrl status apiKey');

  if (!client) {
    const error = new Error('Client not found');
    error.statusCode = 404;
    throw error;
  }

  return successResponse(res, {
    message: 'Client fetched successfully',
    data: { client }
  });
});

export const updateClient = asyncHandler(async (req, res) => {
  const allowedFields = ['name', 'email', 'username', 'status'];
  const updates = {};

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const client = await User.findOneAndUpdate(
    { _id: req.params.id, role: USER_ROLES.CLIENT_ADMIN },
    updates,
    { new: true, runValidators: true }
  )
    .select(clientSelect)
    .populate('websiteId', 'websiteName websiteUrl status apiKey');

  if (!client) {
    const error = new Error('Client not found');
    error.statusCode = 404;
    throw error;
  }

  return successResponse(res, {
    message: 'Client updated successfully',
    data: { client }
  });
});

export const resetClientPassword = asyncHandler(async (req, res) => {
  const client = await User.findOne({
    _id: req.params.id,
    role: USER_ROLES.CLIENT_ADMIN
  }).select('+password');

  if (!client) {
    const error = new Error('Client not found');
    error.statusCode = 404;
    throw error;
  }

  client.password = req.body.password;
  await client.save();

  return successResponse(res, {
    message: 'Client password reset successfully'
  });
});

export const deleteClient = asyncHandler(async (req, res) => {
  const client = await User.findOneAndUpdate(
    {
      _id: req.params.id,
      role: USER_ROLES.CLIENT_ADMIN
    },
    { status: ACCOUNT_STATUS.DISABLED },
    { new: true, runValidators: true }
  ).select(clientSelect);

  if (!client) {
    const error = new Error('Client not found');
    error.statusCode = 404;
    throw error;
  }

  await Website.findOneAndUpdate({ clientAdminId: client._id }, { status: ACCOUNT_STATUS.DISABLED });

  return successResponse(res, {
    message: 'Client disabled successfully'
  });
});
