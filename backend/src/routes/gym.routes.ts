import { Router } from 'express';
import { gymController } from '../controllers/gym.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

const router = Router();
router.use(authenticate);

// GET routes - super_admin and admin can view
router.get('/', authorize(['super_admin', 'admin']), gymController.getGyms);
router.get('/stats', authorize(['super_admin']), gymController.getGymStats);
router.get('/usage', authorize(['super_admin']), gymController.getGymUsage);
router.get('/:id', authorize(['super_admin', 'admin']), gymController.getGymById);
router.get('/:id/analytics', authorize(['super_admin', 'admin']), gymController.getGymAnalytics);

// POST route - ONLY admin can create (super_admin blocked by authorize middleware)
router.post('/', authorize(['admin']), gymController.createGym);

// PUT/DELETE - super_admin only (admin can't modify after creation)
router.put('/:id', authorize(['super_admin']), gymController.updateGym);
router.delete('/:id', authorize(['super_admin']), gymController.deleteGym);

export default router;
