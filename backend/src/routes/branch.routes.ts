import { Router } from 'express';
import { branchController } from '../controllers/branch.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { enforceSubscriptionLimits } from '../middleware/subscription-limits';

const router = Router();

// All branch routes require authentication
router.use(authenticate);

// Get all branches (all authenticated users can view)
router.get('/', branchController.getBranches);

// Get single branch
router.get('/:id', branchController.getBranchById);

// Get branch stats
router.get('/:id/stats', 
  authorize(['admin', 'manager']), 
  branchController.getBranchStats
);

// Create branch - ONLY admin (gym owners) can create branches
router.post('/', 
  authorize(['admin']),
  enforceSubscriptionLimits('branch'),
  branchController.createBranch
);

// Update branch (admin only)
router.put('/:id', 
  authorize(['admin', 'super_admin']), 
  branchController.updateBranch
);

// Delete branch (admin only)
router.delete('/:id', 
  authorize(['admin', 'super_admin']), 
  branchController.deleteBranch
);

export default router;
