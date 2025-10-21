import { Router } from 'express';
import { analyticsEventsController } from '../controllers/analytics-events.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

const router = Router();

router.use(authenticate);

router.post('/events', authorize(['admin', 'manager', 'staff']), analyticsEventsController.trackEvent);
router.get('/events', authorize(['admin', 'super_admin', 'manager']), analyticsEventsController.getEvents);
router.get('/:entityType/:entityId', authorize(['admin', 'super_admin', 'manager']), analyticsEventsController.getAnalytics);

export default router;
