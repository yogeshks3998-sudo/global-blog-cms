import express from 'express';
import { body, query } from 'express-validator';
import {
  getLatestBlogs,
  getPublishedBlog,
  getPublishedBlogs,
  submitBlog
} from '../controllers/publicBlogController.js';
import { requireWebsiteApiKey } from '../middleware/apiKeyMiddleware.js';
import { processBlogImage, uploadBlogImage } from '../middleware/uploadMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';

const router = express.Router();

router.use(requireWebsiteApiKey);

router.post(
  '/submit',
  uploadBlogImage,
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('authorName').trim().notEmpty().withMessage('Author name is required'),
    body('authorEmail').isEmail().withMessage('Valid author email is required'),
    body('category').trim().notEmpty().withMessage('Category is required'),
    body('content').trim().notEmpty().withMessage('Content is required')
  ],
  validateRequest,
  processBlogImage,
  submitBlog
);

router.get('/latest', query('limit').optional().isInt({ min: 1, max: 20 }), validateRequest, getLatestBlogs);
router.get('/', query('page').optional().isInt({ min: 1 }), validateRequest, getPublishedBlogs);
router.get('/:slug', getPublishedBlog);

export default router;
