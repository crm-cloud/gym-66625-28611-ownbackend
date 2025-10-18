import { Router } from 'express';
import { orderController } from '../controllers/order.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', authorize({ roles: ['super_admin', 'admin', 'manager', 'staff'] }), orderController.getOrders);
router.get('/:id', orderController.getOrder);
router.post('/', authorize({ roles: ['super_admin', 'admin', 'manager', 'staff'] }), orderController.createOrder);
router.put('/:id', authorize({ roles: ['super_admin', 'admin', 'manager'] }), orderController.updateOrder);

export default router;
