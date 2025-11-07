import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

const router = Router();
router.use(authenticate);

// Get profiles (super admin only)
router.get('/', authorize(['super_admin']), userController.getProfiles);

export default router;
