import { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller';
import { authenticate } from '../middleware/authenticate';

const router = Router();
router.use(authenticate);

router.get('/dashboard', analyticsController.getDashboardStats);
router.get('/revenue', analyticsController.getRevenueAnalytics);
router.get('/memberships', analyticsController.getMembershipAnalytics);
router.get('/attendance', analyticsController.getAttendanceAnalytics);
router.get('/classes', analyticsController.getClassPopularity);

export default router;
