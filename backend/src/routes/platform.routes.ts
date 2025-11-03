import { Router } from 'express';
import { platformController } from '../controllers/platform.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

const router = Router();

router.use(authenticate);
router.use(authorize(['super_admin'])); // All platform routes restricted to super admin

// Platform-wide analytics
router.get('/analytics', platformController.getAnalytics);
router.get('/reports', platformController.getReports);
router.get('/revenue', platformController.getRevenue);
router.get('/members', platformController.getMembers);
router.get('/gyms', platformController.getGyms);

export default router;
