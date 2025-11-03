import { Router } from 'express';
import { discountController } from '../controllers/discount.controller';
import { authenticate } from '../middleware/authenticate';

const router = Router();

router.use(authenticate);

// Validate discount code
router.post('/validate', discountController.validateCode);

// Get active discounts (for admins)
router.get('/active', discountController.getActiveDiscounts);

export default router;
