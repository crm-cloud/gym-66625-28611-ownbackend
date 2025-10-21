import { Request, Response, NextFunction } from 'express';
import { aiPlanGeneratorService } from '../services/ai-plan-generator.service';
import { ApiError } from '../middleware/errorHandler';

/**
 * AI Plan Generator Controller
 * Handles AI-powered diet and workout plan generation
 */
class AIPlanGeneratorController {
  /**
   * Generate AI diet plan
   */
  async generateDietPlan(req: Request, res: Response, next: NextFunction) {
    try {
      const { member_id, duration, preferences, goals } = req.body;

      if (!member_id || !duration) {
        throw new ApiError('Member ID and duration are required', 400);
      }

      const plan = await aiPlanGeneratorService.generateDietPlan({
        member_id,
        duration,
        preferences: preferences || {},
        goals: goals || [],
      });

      res.json({
        success: true,
        data: plan,
        message: 'Diet plan generated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Generate AI workout plan
   */
  async generateWorkoutPlan(req: Request, res: Response, next: NextFunction) {
    try {
      const { member_id, duration, fitness_level, goals, available_equipment } = req.body;

      if (!member_id || !duration) {
        throw new ApiError('Member ID and duration are required', 400);
      }

      const plan = await aiPlanGeneratorService.generateWorkoutPlan({
        member_id,
        duration,
        fitness_level: fitness_level || 'intermediate',
        goals: goals || [],
        available_equipment: available_equipment || [],
      });

      res.json({
        success: true,
        data: plan,
        message: 'Workout plan generated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get AI suggestions based on member data
   */
  async getSuggestions(req: Request, res: Response, next: NextFunction) {
    try {
      const { member_id } = req.params;

      if (!member_id) {
        throw new ApiError('Member ID is required', 400);
      }

      const suggestions = await aiPlanGeneratorService.getSuggestions(member_id);

      res.json({
        success: true,
        data: suggestions,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Refine existing plan with AI
   */
  async refinePlan(req: Request, res: Response, next: NextFunction) {
    try {
      const { plan_id } = req.params;
      const { feedback, adjustments } = req.body;

      if (!plan_id) {
        throw new ApiError('Plan ID is required', 400);
      }

      const refinedPlan = await aiPlanGeneratorService.refinePlan(
        plan_id,
        feedback,
        adjustments
      );

      res.json({
        success: true,
        data: refinedPlan,
        message: 'Plan refined successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const aiPlanGeneratorController = new AIPlanGeneratorController();
