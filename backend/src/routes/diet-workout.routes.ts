import { Router } from 'express';
import { dietWorkoutController } from '../controllers/diet-workout.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Diet Plans
router.get('/diet-plans', dietWorkoutController.getDietPlans);
router.get('/diet-plans/:id', dietWorkoutController.getDietPlan);
router.post('/diet-plans', authorize({ roles: ['super_admin', 'admin', 'manager', 'trainer'] }), dietWorkoutController.createDietPlan);
router.put('/diet-plans/:id', authorize({ roles: ['super_admin', 'admin', 'manager', 'trainer'] }), dietWorkoutController.updateDietPlan);
router.delete('/diet-plans/:id', authorize({ roles: ['super_admin', 'admin', 'manager', 'trainer'] }), dietWorkoutController.deleteDietPlan);

// Workout Plans
router.get('/workout-plans', dietWorkoutController.getWorkoutPlans);
router.get('/workout-plans/:id', dietWorkoutController.getWorkoutPlan);
router.post('/workout-plans', authorize({ roles: ['super_admin', 'admin', 'manager', 'trainer'] }), dietWorkoutController.createWorkoutPlan);
router.put('/workout-plans/:id', authorize({ roles: ['super_admin', 'admin', 'manager', 'trainer'] }), dietWorkoutController.updateWorkoutPlan);
router.delete('/workout-plans/:id', authorize({ roles: ['super_admin', 'admin', 'manager', 'trainer'] }), dietWorkoutController.deleteWorkoutPlan);

export default router;
