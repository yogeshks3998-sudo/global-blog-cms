import { Blog } from '../models/Blog.js';
import { BLOG_STATUS } from '../constants/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { successResponse } from '../utils/apiResponse.js';
import { getBlogFilters, getPagination } from '../utils/queryHelpers.js';
import { normalizeTags } from '../utils/normalizeTags.js';

export const submitBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.create({
    ...req.body,
    websiteId: req.website._id,
    tags: normalizeTags(req.body.tags),
    status: BLOG_STATUS.PENDING,
    featuredImage: req.file?.path || req.body.featuredImage || req.body.image || null
  });

  return successResponse(res, {
    statusCode: 201,
    message: 'Blog submitted successfully and is pending approval',
    data: { blog }
  });
});

export const getLatestBlogs = asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 5, 20);
  const blogs = await Blog.find({
    websiteId: req.website._id,
    status: BLOG_STATUS.PUBLISHED
  })
    .sort({ createdAt: -1 })
    .limit(limit);

  return successResponse(res, {
    message: 'Latest blogs fetched successfully',
    data: { blogs }
  });
});

export const getPublishedBlogs = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = getBlogFilters(req.query, {
    websiteId: req.website._id,
    status: BLOG_STATUS.PUBLISHED
  });

  const [blogs, total] = await Promise.all([
    Blog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Blog.countDocuments(filter)
  ]);

  return successResponse(res, {
    message: 'Published blogs fetched successfully',
    data: { blogs },
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
});

export const getPublishedBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findOne({
    websiteId: req.website._id,
    slug: req.params.slug,
    status: BLOG_STATUS.PUBLISHED
  });

  if (!blog) {
    const error = new Error('Blog not found');
    error.statusCode = 404;
    throw error;
  }

  return successResponse(res, {
    message: 'Published blog fetched successfully',
    data: { blog }
  });
});
