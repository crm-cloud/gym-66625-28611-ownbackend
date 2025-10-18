import { Router } from 'express';
import { membershipController } from '../controllers/membership.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

const router = Router();

// All membership routes require authentication
router.use(authenticate);

// Get popular plans (before :id route)
router.get('/popular', membershipController.getPopularPlans);

// Get all membership plans (all users can view)
router.get('/', membershipController.getMembershipPlans);

// Get single membership plan
router.get('/:id', membershipController.getMembershipPlanById);

// Create membership plan
router.post('/', 
  authorize(['admin', 'manager']), 
  membershipController.createMembershipPlan
);

// Update membership plan
router.put('/:id', 
  authorize(['admin', 'manager']), 
  membershipController.updateMembershipPlan
);

// Delete membership plan
router.delete('/:id', 
  authorize(['admin', 'manager']), 
  membershipController.deleteMembershipPlan
);

export default router;
