import { Router } from 'express';
import { classController } from '../controllers/class.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

const router = Router();

// All class routes require authentication
router.use(authenticate);

// Get upcoming classes (before :id route)
router.get('/upcoming', classController.getUpcomingClasses);

// Get all classes
router.get('/', classController.getClasses);

// Get single class
router.get('/:id', classController.getClassById);

// Create class
router.post('/', 
  authorize(['admin', 'manager', 'trainer']), 
  classController.createClass
);

// Update class
router.put('/:id', 
  authorize(['admin', 'manager', 'trainer']), 
  classController.updateClass
);

// Delete class
router.delete('/:id', 
  authorize(['admin', 'manager']), 
  classController.deleteClass
);

export default router;
