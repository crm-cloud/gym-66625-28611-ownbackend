import { Router } from 'express';
import { memberGoalsController } from '../controllers/member-goals.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

const router = Router();

router.use(authenticate);

router.post('/', authorize(['admin', 'manager', 'staff']), memberGoalsController.createGoal);
router.get('/', authorize(['admin', 'super_admin', 'manager', 'staff']), memberGoalsController.getGoals);
router.get('/:goalId', authorize(['admin', 'super_admin', 'manager', 'staff']), memberGoalsController.getGoal);
router.put('/:goalId', authorize(['admin', 'manager', 'staff']), memberGoalsController.updateGoal);
router.delete('/:goalId', authorize(['admin', 'manager']), memberGoalsController.deleteGoal);
router.post('/:goalId/progress', authorize(['admin', 'manager', 'staff']), memberGoalsController.logProgress);
router.get('/:goalId/progress', authorize(['admin', 'super_admin', 'manager', 'staff']), memberGoalsController.getProgress);

export default router;
