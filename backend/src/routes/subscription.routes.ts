import { Router } from 'express';
import { subscriptionController } from '../controllers/subscription.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Subscription management
router.post('/', authorize(['admin', 'manager', 'staff']), subscriptionController.createSubscription);
router.get('/', authorize(['admin', 'super_admin', 'manager', 'staff']), subscriptionController.getSubscriptions);
router.get('/stats', authorize(['admin', 'super_admin', 'manager']), subscriptionController.getSubscriptionStats);
router.get('/billing-report', authorize(['admin', 'super_admin', 'manager']), subscriptionController.getBillingCycleReport);
router.put('/:id', authorize(['admin', 'manager', 'staff']), subscriptionController.updateSubscription);

// Subscription actions
router.post('/:id/freeze', authorize(['admin', 'manager']), subscriptionController.freezeSubscription);
router.post('/:id/unfreeze', authorize(['admin', 'manager']), subscriptionController.unfreezeSubscription);
router.post('/:id/renew', authorize(['admin', 'manager', 'staff']), subscriptionController.renewSubscription);

export default router;
