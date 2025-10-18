import { Router } from 'express';
import { trainerReviewController } from '../controllers/trainer-review.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

const router = Router();
router.use(authenticate);

router.post('/', trainerReviewController.createReview);
router.get('/', trainerReviewController.getReviews);
router.get('/trainer/:trainerId/summary', trainerReviewController.getTrainerReviewSummary);
router.get('/:id', trainerReviewController.getReviewById);
router.put('/:id', authorize(['admin', 'manager']), trainerReviewController.updateReview);
router.delete('/:id', authorize(['admin', 'super_admin']), trainerReviewController.deleteReview);

export default router;
