import { Router } from 'express';
import { memberCreditsController } from '../controllers/member-credits.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get credits summary (admin/manager only)
router.get('/summary', authorize(['admin', 'super_admin', 'manager']), memberCreditsController.getCreditsSummary);

// Get transaction history
router.get('/transactions', authorize(['admin', 'super_admin', 'manager', 'staff']), memberCreditsController.getTransactions);

// Get member's credit balance
router.get('/:memberId', authorize(['admin', 'super_admin', 'manager', 'staff']), memberCreditsController.getBalance);

// Add credits to member
router.post('/:memberId/add', authorize(['admin', 'manager', 'staff']), memberCreditsController.addCredits);

// Deduct credits from member
router.post('/:memberId/deduct', authorize(['admin', 'manager', 'staff']), memberCreditsController.deductCredits);

export default router;
