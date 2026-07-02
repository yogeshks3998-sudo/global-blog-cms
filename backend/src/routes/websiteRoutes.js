import express from 'express';
import { body } from 'express-validator';
import { ACCOUNT_STATUS, USER_ROLES } from '../constants/index.js';
import {
  createWebsite,
  deleteWebsite,
  getWebsite,
  getWebsites,
  regenerateWebsiteApiKey,
  updateWebsite
} from '../controllers/websiteController.js';
import { authorizeRoles, protect } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';

const router = express.Router();

router.use(protect, authorizeRoles(USER_ROLES.SUPER_ADMIN));

router
  .route('/')
  .post(
    [
      body('websiteName').trim().notEmpty().withMessage('Website name is required'),
      body('websiteUrl').trim().isURL().withMessage('Valid website URL is required'),
      body('clientAdminId').notEmpty().withMessage('Client admin is required'),
      body('status').optional().isIn(Object.values(ACCOUNT_STATUS)).withMessage('Invalid status')
    ],
    validateRequest,
    createWebsite
  )
  .get(getWebsites);

router.patch('/:id/regenerate-api-key', regenerateWebsiteApiKey);

router
  .route('/:id')
  .get(getWebsite)
  .patch(
    [
      body('websiteName').optional().trim().notEmpty().withMessage('Website name cannot be empty'),
      body('websiteUrl').optional().trim().isURL().withMessage('Valid website URL is required'),
      body('status').optional().isIn(Object.values(ACCOUNT_STATUS)).withMessage('Invalid status')
    ],
    validateRequest,
    updateWebsite
  )
  .delete(deleteWebsite);

export default router;
