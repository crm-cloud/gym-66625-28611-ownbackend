import { Router } from 'express';
import { gymSubscriptionController } from '../controllers/gym-subscription.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

const router = Router();
router.use(authenticate);
router.use(authorize(['super_admin'])); // Only super admin can manage subscription plans

router.get('/', gymSubscriptionController.getAll);
router.get('/:id', gymSubscriptionController.getById);
router.post('/', gymSubscriptionController.create);
router.patch('/:id', gymSubscriptionController.update);
router.delete('/:id', gymSubscriptionController.delete);

export default router;
