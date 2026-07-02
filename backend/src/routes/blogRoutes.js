import express from 'express';
import { body, query } from 'express-validator';
import { BLOG_STATUS, USER_ROLES } from '../constants/index.js';
import {
  approveBlog,
  createBlog,
  getBlog,
  getBlogs,
  permanentlyDeleteBlog,
  updateBlog
} from '../controllers/blogController.js';
import { authorizeRoles, protect, requireClientWebsite } from '../middleware/authMiddleware.js';
import { processBlogImage, uploadBlogImage } from '../middleware/uploadMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';

const router = express.Router();

const commonBlogValidators = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('authorName').trim().notEmpty().withMessage('Author name is required'),
  body('authorEmail').isEmail().withMessage('Valid author email is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('content').trim().notEmpty().withMessage('Content is required'),
  body('status').optional().isIn(Object.values(BLOG_STATUS)).withMessage('Invalid status')
];

const adminCreateValidators = [
  body('websiteId').notEmpty().withMessage('Website ID is required'),
  ...commonBlogValidators
];

const blogQueryValidators = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive number'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(Object.values(BLOG_STATUS)).withMessage('Invalid status')
];

router.use(protect);

router
  .route('/admin/blogs')
  .post(
    authorizeRoles(USER_ROLES.SUPER_ADMIN),
    uploadBlogImage,
    adminCreateValidators,
    validateRequest,
    processBlogImage,
    createBlog
  )
  .get(authorizeRoles(USER_ROLES.SUPER_ADMIN), blogQueryValidators, validateRequest, getBlogs);

router
  .route('/client/blogs')
  .post(
    authorizeRoles(USER_ROLES.CLIENT_ADMIN),
    requireClientWebsite,
    uploadBlogImage,
    commonBlogValidators,
    validateRequest,
    processBlogImage,
    createBlog
  )
  .get(authorizeRoles(USER_ROLES.CLIENT_ADMIN), requireClientWebsite, blogQueryValidators, validateRequest, getBlogs);

router.get('/admin/blogs/:id', authorizeRoles(USER_ROLES.SUPER_ADMIN), getBlog);
router.patch(
  '/admin/blogs/:id',
  authorizeRoles(USER_ROLES.SUPER_ADMIN),
  uploadBlogImage,
  validateRequest,
  processBlogImage,
  updateBlog
);
router.delete('/admin/blogs/:id/permanent', authorizeRoles(USER_ROLES.SUPER_ADMIN), permanentlyDeleteBlog);

router.get('/client/blogs/:id', authorizeRoles(USER_ROLES.CLIENT_ADMIN), requireClientWebsite, getBlog);
router.patch(
  '/client/blogs/:id',
  authorizeRoles(USER_ROLES.CLIENT_ADMIN),
  requireClientWebsite,
  uploadBlogImage,
  validateRequest,
  processBlogImage,
  updateBlog
);
router.patch('/client/blogs/:id/approve', authorizeRoles(USER_ROLES.CLIENT_ADMIN), requireClientWebsite, approveBlog);
router.delete('/client/blogs/:id', authorizeRoles(USER_ROLES.CLIENT_ADMIN), requireClientWebsite, permanentlyDeleteBlog);

export default router;
