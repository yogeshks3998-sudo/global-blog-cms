import { BLOG_STATUS, USER_ROLES } from '../constants/index.js';
import { Blog } from '../models/Blog.js';
import { User } from '../models/User.js';
import { Website } from '../models/Website.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { successResponse } from '../utils/apiResponse.js';
import { getTodayRange } from '../utils/queryHelpers.js';

export const getSuperAdminDashboard = asyncHandler(async (req, res) => {
  const [totalWebsites, totalClients, pendingBlogs, publishedBlogs, recentClients, recentBlogs] =
    await Promise.all([
      Website.countDocuments(),
      User.countDocuments({ role: USER_ROLES.CLIENT_ADMIN }),
      Blog.countDocuments({ status: BLOG_STATUS.PENDING }),
      Blog.countDocuments({ status: BLOG_STATUS.PUBLISHED }),
      User.find({ role: USER_ROLES.CLIENT_ADMIN })
        .select('-password')
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('websiteId', 'websiteName websiteUrl status'),
      Blog.find()
        .populate('websiteId', 'websiteName websiteUrl')
        .sort({ createdAt: -1 })
        .limit(5)
    ]);

  return successResponse(res, {
    message: 'Dashboard fetched successfully',
    data: {
      cards: {
        totalWebsites,
        totalClients,
        pendingBlogs,
        publishedBlogs
      },
      recentClients,
      recentBlogs
    }
  });
});

export const getClientDashboard = asyncHandler(async (req, res) => {
  const { start, end } = getTodayRange();
  const websiteId = req.user.websiteId;

  const [pendingBlogs, publishedBlogs, todaysBlogs, recentSubmissions] = await Promise.all([
    Blog.countDocuments({ websiteId, status: BLOG_STATUS.PENDING }),
    Blog.countDocuments({ websiteId, status: BLOG_STATUS.PUBLISHED }),
    Blog.countDocuments({ websiteId, createdAt: { $gte: start, $lt: end } }),
    Blog.find({ websiteId }).sort({ createdAt: -1 }).limit(5)
  ]);

  return successResponse(res, {
    message: 'Dashboard fetched successfully',
    data: {
      cards: {
        pendingBlogs,
        publishedBlogs,
        todaysBlogs
      },
      recentSubmissions
    }
  });
});
