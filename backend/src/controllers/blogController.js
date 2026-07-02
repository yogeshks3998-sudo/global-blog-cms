import { BLOG_STATUS, USER_ROLES } from '../constants/index.js';
import { Blog } from '../models/Blog.js';
import { Website } from '../models/Website.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { successResponse } from '../utils/apiResponse.js';
import { deleteUploadedFile } from '../utils/deleteFile.js';
import { getBlogFilters, getPagination } from '../utils/queryHelpers.js';
import { normalizeTags } from '../utils/normalizeTags.js';

const getVisibleWebsiteId = (req) => {
  if (req.user.role === USER_ROLES.CLIENT_ADMIN) {
    return req.user.websiteId;
  }

  return req.query.websiteId || req.body.websiteId;
};

const buildTenantFilter = (req, base = {}) => {
  const filter = { ...base };

  if (req.user.role === USER_ROLES.CLIENT_ADMIN) {
    filter.websiteId = req.user.websiteId;
    return filter;
  }

  if (req.query.websiteId) filter.websiteId = req.query.websiteId;
  return filter;
};

const findTenantBlogById = async (req) => {
  const filter = { _id: req.params.id };

  if (req.user.role === USER_ROLES.CLIENT_ADMIN) {
    filter.websiteId = req.user.websiteId;
  }

  const blog = await Blog.findOne(filter);

  if (!blog) {
    const error = new Error('Blog not found');
    error.statusCode = 404;
    throw error;
  }

  return blog;
};

const ensureWebsiteExists = async (websiteId) => {
  const website = await Website.findById(websiteId);

  if (!website) {
    const error = new Error('Website not found');
    error.statusCode = 404;
    throw error;
  }

  return website;
};

export const createBlog = asyncHandler(async (req, res) => {
  const websiteId = getVisibleWebsiteId(req);
  await ensureWebsiteExists(websiteId);

  const blog = await Blog.create({
    title: req.body.title,
    websiteId,
    authorName: req.body.authorName,
    authorEmail: req.body.authorEmail,
    category: req.body.category,
    content: req.body.content,
    tags: normalizeTags(req.body.tags),
    status: req.user.role === USER_ROLES.CLIENT_ADMIN ? BLOG_STATUS.PENDING : req.body.status || BLOG_STATUS.PENDING,
    featuredImage: req.file?.path || req.body.featuredImage || null
  });

  return successResponse(res, {
    statusCode: 201,
    message: 'Blog created successfully',
    data: { blog }
  });
});

export const updateBlog = asyncHandler(async (req, res) => {
  const blog = await findTenantBlogById(req);

  if (req.user.role === USER_ROLES.CLIENT_ADMIN && req.body.websiteId) {
    delete req.body.websiteId;
  }

  if (req.user.role === USER_ROLES.CLIENT_ADMIN && req.body.status) {
    delete req.body.status;
  }

  if (req.body.websiteId) {
    await ensureWebsiteExists(req.body.websiteId);
  }

  if (req.file?.path && blog.featuredImage) {
    await deleteUploadedFile(blog.featuredImage);
  }

  const editableFields = ['websiteId', 'title', 'authorName', 'authorEmail', 'category', 'content', 'status'];
  editableFields.forEach((field) => {
    if (req.body[field] !== undefined) blog[field] = req.body[field];
  });

  if (req.body.tags !== undefined) blog.tags = normalizeTags(req.body.tags);
  if (req.file?.path || req.body.featuredImage) {
    blog.featuredImage = req.file?.path || req.body.featuredImage;
  }

  await blog.save();

  return successResponse(res, {
    message: 'Blog updated successfully',
    data: { blog }
  });
});

export const permanentlyDeleteBlog = asyncHandler(async (req, res) => {
  const blog = await findTenantBlogById(req);

  await deleteUploadedFile(blog.featuredImage);
  await blog.deleteOne();

  return successResponse(res, {
    message: 'Blog permanently deleted'
  });
});

export const getBlog = asyncHandler(async (req, res) => {
  const filter = { _id: req.params.id };

  if (req.user.role === USER_ROLES.CLIENT_ADMIN) {
    filter.websiteId = req.user.websiteId;
  }

  const blog = await Blog.findOne(filter).populate('websiteId', 'websiteName websiteUrl status');

  if (!blog) {
    const error = new Error('Blog not found');
    error.statusCode = 404;
    throw error;
  }

  return successResponse(res, {
    message: 'Blog fetched successfully',
    data: { blog }
  });
});

export const getBlogs = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const baseFilter = buildTenantFilter(req);

  if (req.query.status) baseFilter.status = req.query.status;

  const filter = getBlogFilters(req.query, baseFilter);
  const [blogs, total] = await Promise.all([
    Blog.find(filter)
      .populate('websiteId', 'websiteName websiteUrl status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Blog.countDocuments(filter)
  ]);

  return successResponse(res, {
    message: 'Blogs fetched successfully',
    data: { blogs },
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
});

export const approveBlog = asyncHandler(async (req, res) => {
  const blog = await findTenantBlogById(req);

  if (blog.status !== BLOG_STATUS.PENDING) {
    const error = new Error('Only pending blogs can be approved');
    error.statusCode = 400;
    throw error;
  }

  blog.status = BLOG_STATUS.PUBLISHED;
  await blog.save();

  return successResponse(res, {
    message: 'Blog approved and published',
    data: { blog }
  });
});
