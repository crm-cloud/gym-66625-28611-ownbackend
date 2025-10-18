import { Router } from 'express';
import { memberProgressController } from '../controllers/member-progress.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { uploadSingle } from '../middleware/upload';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Measurement History Routes
router.post(
  '/measurements',
  authorize(['admin', 'manager', 'trainer', 'staff']),
  memberProgressController.createMeasurement.bind(memberProgressController)
);

router.get(
  '/measurements/member/:memberId',
  authorize(['admin', 'manager', 'trainer', 'staff', 'member']),
  memberProgressController.getMemberMeasurements.bind(memberProgressController)
);

router.get(
  '/measurements/:id',
  authorize(['admin', 'manager', 'trainer', 'staff', 'member']),
  memberProgressController.getMeasurementById.bind(memberProgressController)
);

router.put(
  '/measurements/:id',
  authorize(['admin', 'manager', 'trainer', 'staff']),
  memberProgressController.updateMeasurement.bind(memberProgressController)
);

router.delete(
  '/measurements/:id',
  authorize(['admin', 'manager']),
  memberProgressController.deleteMeasurement.bind(memberProgressController)
);

// Member Goals Routes
router.post(
  '/goals',
  authorize(['admin', 'manager', 'trainer', 'member']),
  memberProgressController.createGoal.bind(memberProgressController)
);

router.get(
  '/goals/member/:memberId',
  authorize(['admin', 'manager', 'trainer', 'staff', 'member']),
  memberProgressController.getMemberGoals.bind(memberProgressController)
);

router.get(
  '/goals/:id',
  authorize(['admin', 'manager', 'trainer', 'staff', 'member']),
  memberProgressController.getGoalById.bind(memberProgressController)
);

router.put(
  '/goals/:id',
  authorize(['admin', 'manager', 'trainer', 'member']),
  memberProgressController.updateGoal.bind(memberProgressController)
);

router.patch(
  '/goals/:id/progress',
  authorize(['admin', 'manager', 'trainer', 'member']),
  memberProgressController.updateGoalProgress.bind(memberProgressController)
);

router.delete(
  '/goals/:id',
  authorize(['admin', 'manager', 'trainer', 'member']),
  memberProgressController.deleteGoal.bind(memberProgressController)
);

// Progress Summary
router.get(
  '/summary/member/:memberId',
  authorize(['admin', 'manager', 'trainer', 'staff', 'member']),
  memberProgressController.getProgressSummary.bind(memberProgressController)
);

// Progress Photos Routes
router.post(
  '/photos',
  authorize(['admin', 'manager', 'trainer', 'staff']),
  uploadSingle('photo'),
  memberProgressController.uploadProgressPhoto.bind(memberProgressController)
);

router.get(
  '/photos/member/:memberId',
  authorize(['admin', 'manager', 'trainer', 'staff', 'member']),
  memberProgressController.getMemberProgressPhotos.bind(memberProgressController)
);

router.delete(
  '/photos/:id',
  authorize(['admin', 'manager', 'trainer', 'staff']),
  memberProgressController.deleteProgressPhoto.bind(memberProgressController)
);

export default router;
