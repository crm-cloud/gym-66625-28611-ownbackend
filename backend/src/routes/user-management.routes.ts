import { Router } from 'express';
import { userManagementController } from '../controllers/user-management.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/authorize.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create user with role (admin only)
router.post(
  '/users',
  authorize({ roles: ['super_admin', 'admin'] }),
  userManagementController.createUser
);

// Enable member login
router.post(
  '/members/:memberId/enable-login',
  authorize({ roles: ['super_admin', 'admin', 'manager'] }),
  userManagementController.enableMemberLogin
);

// Generate temporary password
router.post(
  '/generate-temp-password',
  authorize({ roles: ['super_admin', 'admin'] }),
  userManagementController.generateTempPassword
);

export default router;
