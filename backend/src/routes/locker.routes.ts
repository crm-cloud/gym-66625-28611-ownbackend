import { Router } from 'express';
import { lockerController } from '../controllers/locker.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', lockerController.getLockers);
router.get('/:id', lockerController.getLocker);
router.post('/', authorize({ roles: ['super_admin', 'admin', 'manager'] }), lockerController.createLocker);
router.put('/:id', authorize({ roles: ['super_admin', 'admin', 'manager'] }), lockerController.updateLocker);
router.delete('/:id', authorize({ roles: ['super_admin', 'admin'] }), lockerController.deleteLocker);

// Locker assignments
router.post('/:id/assign', authorize({ roles: ['super_admin', 'admin', 'manager', 'staff'] }), lockerController.assignLocker);
router.delete('/:id/assignments/:assignmentId', authorize({ roles: ['super_admin', 'admin', 'manager', 'staff'] }), lockerController.releaseLocker);

export default router;
