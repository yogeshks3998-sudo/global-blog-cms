import express from 'express';
import { body } from 'express-validator';
import { ACCOUNT_STATUS, USER_ROLES } from '../constants/index.js';
import {
  createClient,
  deleteClient,
  getClient,
  getClients,
  resetClientPassword,
  updateClient
} from '../controllers/clientController.js';
import { authorizeRoles, protect } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';

const router = express.Router();

router.use(protect, authorizeRoles(USER_ROLES.SUPER_ADMIN));

router
  .route('/')
  .post(
    [
      body('name').trim().notEmpty().withMessage('Name is required'),
      body('email').isEmail().withMessage('Valid email is required'),
      body('username').trim().notEmpty().withMessage('Username is required'),
      body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
      body('websiteName').trim().notEmpty().withMessage('Website name is required'),
      body('websiteUrl').trim().isURL().withMessage('Valid website URL is required'),
      body('status').optional().isIn(Object.values(ACCOUNT_STATUS)).withMessage('Invalid status'),
      body('websiteStatus').optional().isIn(Object.values(ACCOUNT_STATUS)).withMessage('Invalid website status')
    ],
    validateRequest,
    createClient
  )
  .get(getClients);

router.patch(
  '/:id/reset-password',
  [body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')],
  validateRequest,
  resetClientPassword
);

router
  .route('/:id')
  .get(getClient)
  .patch(
    [
      body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
      body('email').optional().isEmail().withMessage('Valid email is required'),
      body('username').optional().trim().notEmpty().withMessage('Username cannot be empty'),
      body('status').optional().isIn(Object.values(ACCOUNT_STATUS)).withMessage('Invalid status')
    ],
    validateRequest,
    updateClient
  )
  .delete(deleteClient);

export default router;
