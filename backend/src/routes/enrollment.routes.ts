import { Router } from 'express';
import { enrollmentController } from '../controllers/enrollment.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

const router = Router();
router.use(authenticate);

router.post('/', authorize(['admin', 'manager', 'staff', 'member']), enrollmentController.createEnrollment);
router.get('/', enrollmentController.getEnrollments);
router.get('/class/:classId/summary', enrollmentController.getClassEnrollmentSummary);
router.get('/:id', enrollmentController.getEnrollmentById);
router.put('/:id', authorize(['admin', 'manager', 'staff']), enrollmentController.updateEnrollment);
router.post('/:id/cancel', enrollmentController.cancelEnrollment);
router.post('/attendance', authorize(['admin', 'manager', 'staff', 'trainer']), enrollmentController.markAttendance);

export default router;
