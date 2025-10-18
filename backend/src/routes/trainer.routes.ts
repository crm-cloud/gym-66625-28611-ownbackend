import { Router } from 'express';
import { trainerController } from '../controllers/trainer.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

const router = Router();

// All trainer routes require authentication
router.use(authenticate);

// Get all trainers
router.get('/', trainerController.getTrainers);

// Get single trainer
router.get('/:id', trainerController.getTrainerById);

// Get trainer schedule
router.get('/:id/schedule', trainerController.getTrainerSchedule);

// Create trainer
router.post('/', 
  authorize(['admin', 'manager']), 
  trainerController.createTrainer
);

// Update trainer
router.put('/:id', 
  authorize(['admin', 'manager']), 
  trainerController.updateTrainer
);

// Delete trainer
router.delete('/:id', 
  authorize(['admin', 'manager']), 
  trainerController.deleteTrainer
);

export default router;
