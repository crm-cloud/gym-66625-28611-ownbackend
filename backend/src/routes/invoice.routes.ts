import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Placeholder for invoice routes (to be implemented with PDF generation)
router.get('/', authorize(['admin', 'super_admin', 'manager']), (req, res) => {
  res.json({ message: 'Invoice routes - to be implemented' });
});

export default router;
