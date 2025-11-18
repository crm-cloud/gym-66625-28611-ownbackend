import { Router } from 'express';
import { memberController } from '../controllers/member.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { enforceSubscriptionLimits } from '../middleware/subscription-limits';

const router = Router();

// All member routes require authentication
router.use(authenticate);

// Get member stats (before :id route to avoid conflict)
router.get('/stats', 
  authorize(['admin', 'manager', 'staff']), 
  memberController.getMemberStats
);

// Get all members
router.get('/', 
  authorize(['admin', 'manager', 'staff', 'trainer']), 
  memberController.getMembers
);

// Get single member
router.get('/:id', 
  authorize(['admin', 'manager', 'staff', 'trainer']), 
  memberController.getMemberById
);

// Create member
router.post('/', 
  authorize(['admin', 'manager', 'staff']),
  enforceSubscriptionLimits('member'),
  memberController.createMember
);

// Update member
router.put('/:id', 
  authorize(['admin', 'manager', 'staff']), 
  memberController.updateMember
);

// Delete member
router.delete('/:id', 
  authorize(['admin', 'manager']), 
  memberController.deleteMember
);

export default router;
