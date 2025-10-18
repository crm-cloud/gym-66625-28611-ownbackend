import { Router } from 'express';
import { trainerChangeController } from '../controllers/trainer-change.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

const router = Router();
router.use(authenticate);

router.post('/', trainerChangeController.createChangeRequest);
router.get('/', authorize(['admin', 'manager', 'trainer']), trainerChangeController.getChangeRequests);
router.get('/stats', authorize(['admin', 'manager']), trainerChangeController.getChangeRequestStats);
router.get('/:id', trainerChangeController.getChangeRequestById);
router.post('/:id/review', authorize(['admin', 'manager']), trainerChangeController.reviewChangeRequest);

export default router;
