import { Router } from 'express';
import { adminManagementController } from '../controllers/admin-management.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Super Admin creates Admin account
router.post(
  '/create-admin',
  authorize(['super_admin']),
  adminManagementController.createAdmin
);

// Admin creates their gym
router.post(
  '/create-gym',
  authorize(['admin']),
  adminManagementController.createGym
);

// Admin views their subscription
router.get(
  '/subscription',
  authorize(['admin']),
  adminManagementController.getSubscription
);

export default router;
