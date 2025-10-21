import { Router } from 'express';
import { membershipFreezeController } from '../controllers/membership-freeze.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get freeze statistics (admin/manager only)
router.get('/stats', authorize(['admin', 'super_admin', 'manager']), membershipFreezeController.getFreezeStats);

// Get all freeze requests
router.get('/', authorize(['admin', 'super_admin', 'manager', 'staff']), membershipFreezeController.getFreezeRequests);

// Request freeze
router.post('/', authorize(['admin', 'manager', 'staff']), membershipFreezeController.requestFreeze);

// Get single freeze request
router.get('/:requestId', authorize(['admin', 'super_admin', 'manager', 'staff']), membershipFreezeController.getFreezeRequest);

// Update freeze request (approve/reject)
router.put('/:requestId', authorize(['admin', 'manager']), membershipFreezeController.updateFreezeRequest);

// Cancel freeze request
router.delete('/:requestId', authorize(['admin', 'manager', 'staff']), membershipFreezeController.cancelFreezeRequest);

export default router;
