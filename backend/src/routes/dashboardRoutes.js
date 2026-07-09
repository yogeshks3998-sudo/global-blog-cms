import express from 'express';
import { USER_ROLES } from '../constants/index.js';
import { getClientDashboard, getSuperAdminDashboard } from '../controllers/dashboardController.js';
import { authorizeRoles, protect, requireClientWebsite } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/admin', protect, authorizeRoles(USER_ROLES.SUPER_ADMIN), getSuperAdminDashboard);
router.get('/admin/dashboard', protect, authorizeRoles(USER_ROLES.SUPER_ADMIN), getSuperAdminDashboard);

const clientDashboardHandlers = [
  protect,
  authorizeRoles(USER_ROLES.CLIENT_ADMIN),
  requireClientWebsite,
  getClientDashboard
];

router.get('/client', ...clientDashboardHandlers);
router.get('/client/dashboard', ...clientDashboardHandlers);
router.get('/client/dashboad', ...clientDashboardHandlers);

export default router;
