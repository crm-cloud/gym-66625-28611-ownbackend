import { Router } from 'express';
import { aiPlanGeneratorController } from '../controllers/ai-plan-generator.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Generate plans
router.post('/diet', authorize(['admin', 'trainer', 'manager']), aiPlanGeneratorController.generateDietPlan);
router.post('/workout', authorize(['admin', 'trainer', 'manager']), aiPlanGeneratorController.generateWorkoutPlan);

// Get suggestions
router.get('/suggestions/:member_id', authorize(['admin', 'trainer', 'manager']), aiPlanGeneratorController.getSuggestions);

// Refine plan
router.post('/refine/:plan_id', authorize(['admin', 'trainer', 'manager']), aiPlanGeneratorController.refinePlan);

export default router;
