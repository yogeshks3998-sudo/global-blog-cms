import express from 'express';
import { body } from 'express-validator';
import { changePassword, getProfile, updateProfile } from '../controllers/authController.js';
import { validateRequest } from '../middleware/validateRequest.js';

const router = express.Router();

router
  .route('/')
  .get(getProfile)
  .patch(
    [
      body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
      body('email').optional().isEmail().withMessage('Valid email is required'),
      body('username').optional().trim().notEmpty().withMessage('Username cannot be empty')
    ],
    validateRequest,
    updateProfile
  );

router.patch(
  '/change-password',
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
  ],
  validateRequest,
  changePassword
);

export default router;
