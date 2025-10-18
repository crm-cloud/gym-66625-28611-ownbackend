import { Router } from 'express';
import { gymController } from '../controllers/gym.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

const router = Router();
router.use(authenticate);
router.use(authorize(['super_admin'])); // All gym routes are super admin only

router.post('/', gymController.createGym);
router.get('/', gymController.getGyms);
router.get('/stats', gymController.getGymStats);
router.get('/:id', gymController.getGymById);
router.get('/:id/analytics', gymController.getGymAnalytics);
router.put('/:id', gymController.updateGym);
router.delete('/:id', gymController.deleteGym);

export default router;
