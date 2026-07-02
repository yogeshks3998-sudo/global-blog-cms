import { ACCOUNT_STATUS, USER_ROLES } from '../constants/index.js';
import { Blog } from '../models/Blog.js';
import { User } from '../models/User.js';
import { Website } from '../models/Website.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { successResponse } from '../utils/apiResponse.js';
import { deleteUploadedFile } from '../utils/deleteFile.js';
import { generateApiKey } from '../utils/generateApiKey.js';

const findWebsiteOrFail = async (id) => {
  const website = await Website.findById(id).populate('clientAdminId', 'name email username status');

  if (!website) {
    const error = new Error('Website not found');
    error.statusCode = 404;
    throw error;
  }

  return website;
};

export const createWebsite = asyncHandler(async (req, res) => {
  const clientAdmin = await User.findById(req.body.clientAdminId);

  if (!clientAdmin || clientAdmin.role !== USER_ROLES.CLIENT_ADMIN) {
    const error = new Error('Client admin not found');
    error.statusCode = 404;
    throw error;
  }

  if (clientAdmin.websiteId) {
    const error = new Error('Client admin already has an assigned website');
    error.statusCode = 409;
    throw error;
  }

  const website = await Website.create({
    websiteName: req.body.websiteName,
    websiteUrl: req.body.websiteUrl,
    logo: req.body.logo || null,
    clientAdminId: clientAdmin._id,
    status: req.body.status || ACCOUNT_STATUS.ACTIVE
  });

  clientAdmin.websiteId = website._id;
  await clientAdmin.save();

  return successResponse(res, {
    statusCode: 201,
    message: 'Website created successfully',
    data: { website }
  });
});

export const getWebsites = asyncHandler(async (req, res) => {
  const websites = await Website.find()
    .populate('clientAdminId', 'name email username status')
    .sort({ createdAt: -1 });

  return successResponse(res, {
    message: 'Websites fetched successfully',
    data: { websites }
  });
});

export const getWebsite = asyncHandler(async (req, res) => {
  const website = await findWebsiteOrFail(req.params.id);

  return successResponse(res, {
    message: 'Website fetched successfully',
    data: { website }
  });
});

export const updateWebsite = asyncHandler(async (req, res) => {
  const allowedFields = ['websiteName', 'websiteUrl', 'logo', 'status'];
  const updates = {};

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const website = await Website.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true
  }).populate('clientAdminId', 'name email username status');

  if (!website) {
    const error = new Error('Website not found');
    error.statusCode = 404;
    throw error;
  }

  return successResponse(res, {
    message: 'Website updated successfully',
    data: { website }
  });
});

export const regenerateWebsiteApiKey = asyncHandler(async (req, res) => {
  const website = await findWebsiteOrFail(req.params.id);
  website.apiKey = generateApiKey();
  await website.save();

  return successResponse(res, {
    message: 'API key regenerated successfully',
    data: { website }
  });
});

export const deleteWebsite = asyncHandler(async (req, res) => {
  const website = await Website.findById(req.params.id);

  if (!website) {
    const error = new Error('Website not found');
    error.statusCode = 404;
    throw error;
  }

  const blogs = await Blog.find({ websiteId: website._id }).select('featuredImage');
  await Promise.all(blogs.map((blog) => deleteUploadedFile(blog.featuredImage)));
  await Blog.deleteMany({ websiteId: website._id });
  await User.findByIdAndUpdate(website.clientAdminId, {
    websiteId: null,
    status: ACCOUNT_STATUS.DISABLED
  });
  await website.deleteOne();

  return successResponse(res, {
    message: 'Website deleted successfully'
  });
});
