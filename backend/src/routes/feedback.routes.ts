import { Router } from 'express';
import { feedbackController } from '../controllers/feedback.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', authorize({ roles: ['super_admin', 'admin', 'manager'] }), feedbackController.getFeedback);
router.get('/:id', feedbackController.getFeedbackById);
router.post('/', feedbackController.createFeedback); // Any authenticated user can submit feedback
router.put('/:id', authorize({ roles: ['super_admin', 'admin', 'manager'] }), feedbackController.updateFeedback);

export default router;
