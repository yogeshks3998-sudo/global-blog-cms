import express from 'express';
import { body } from 'express-validator';
import { changePassword, getProfile, login, updateProfile } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';

const router = express.Router();

router.post(
  '/login',
  [
    body('email').custom((value, { req }) => {
      if (!value && !req.body.username) {
        throw new Error('Email or username is required');
      }
      return true;
    }),
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('username').optional().trim().notEmpty().withMessage('Username cannot be empty'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  validateRequest,
  login
);

router.get('/me', protect, getProfile);
router.patch(
  '/me',
  protect,
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
  protect,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
  ],
  validateRequest,
  changePassword
);

export default router;
