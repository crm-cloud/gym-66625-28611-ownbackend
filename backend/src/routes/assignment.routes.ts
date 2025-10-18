import { Router } from 'express';
import { assignmentController } from '../controllers/assignment.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

const router = Router();
router.use(authenticate);

router.post('/', authorize(['admin', 'manager', 'staff']), assignmentController.createAssignment);
router.post('/auto-assign', authorize(['admin', 'manager']), assignmentController.autoAssign);
router.get('/', assignmentController.getAssignments);
router.get('/trainer/:trainerId/schedule', assignmentController.getTrainerSchedule);
router.get('/:id', assignmentController.getAssignmentById);
router.put('/:id', authorize(['admin', 'manager', 'trainer']), assignmentController.updateAssignment);
router.post('/:id/complete', authorize(['trainer', 'admin']), assignmentController.completeAssignment);
router.post('/:id/cancel', authorize(['admin', 'manager']), assignmentController.cancelAssignment);

export default router;
