import { Router } from 'express';
import { referralController } from '../controllers/referral.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Referrals
router.get('/', referralController.getReferrals);
router.get('/:id', referralController.getReferral);
router.post('/', referralController.createReferral); // Members can create referrals
router.put('/:id', authorize({ roles: ['super_admin', 'admin', 'manager'] }), referralController.updateReferral);

// Rewards
router.get('/rewards/list', referralController.getRewards);
router.get('/rewards/:id', referralController.getReward);
router.post('/rewards', authorize({ roles: ['super_admin', 'admin', 'manager'] }), referralController.createReward);
router.put('/rewards/:id', referralController.updateReward); // Users can claim their own rewards

export default router;
