import { Router } from 'express';
import { adminSubscriptionController } from '../controllers/admin-subscription.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

const router = Router();
router.use(authenticate);
router.use(authorize(['super_admin']));

router.get('/', adminSubscriptionController.getAllSubscriptions);
router.get('/:id', adminSubscriptionController.getSubscriptionById);
router.post('/', adminSubscriptionController.assignSubscription);
router.put('/:id', adminSubscriptionController.updateSubscription);
router.delete('/:id', adminSubscriptionController.cancelSubscription);
router.post('/:id/renew', adminSubscriptionController.renewSubscription);

export default router;
