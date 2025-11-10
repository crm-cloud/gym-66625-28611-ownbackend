import { Request, Response } from 'express';
import { trainerService } from '../services/trainer.service';
import { createTrainerSchema, updateTrainerSchema, trainerQuerySchema } from '../validation/trainer.validation';
import { asyncHandler } from '../middleware/errorHandler';

export const trainerController = {
  /**
   * GET /api/trainers
   */
  getTrainers: asyncHandler(async (req: Request, res: Response) => {
    const query = trainerQuerySchema.parse(req.query);
    const { role, branchId } = req.user!;
    
    const trainers = await trainerService.getTrainers(query, role, branchId);
    res.status(200).json(trainers);
  }),

  /**
   * GET /api/trainers/:id
   */
  getTrainerById: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    
    const trainer = await trainerService.getTrainerById(id);
    res.status(200).json(trainer);
  }),

  /**
   * POST /api/trainers
   */
  createTrainer: asyncHandler(async (req: Request, res: Response) => {
    const data = createTrainerSchema.parse(req.body);

    // CRITICAL: Check subscription limit
    const { default: prisma } = await import('../config/database');
    const branch = await prisma.branches.findUnique({
      where: { id: data.branch_id },
      include: {
        gyms: {
          include: {
            subscription_plans: {
              select: {
                max_staff: true,
                name: true
              }
            }
          }
        }
      }
    });

    if (!branch) {
      const { ApiError } = await import('../middleware/errorHandler');
      throw new ApiError('Branch not found', 404);
    }

    const gym = branch.gyms;
    if (!gym.subscription_plan_id || !gym.subscription_plans) {
      const { ApiError } = await import('../middleware/errorHandler');
      throw new ApiError('No active subscription plan found for this gym', 403);
    }

    const maxStaff = gym.subscription_plans.max_staff;
    if (!maxStaff) {
      const { ApiError } = await import('../middleware/errorHandler');
      throw new ApiError('Subscription plan does not specify staff limit', 500);
    }

    // Count current trainers/staff for this gym (across all branches)
    const currentStaffCount = await prisma.trainer_profiles.count({
      where: {
        branches: {
          gym_id: gym.id
        }
      }
    });

    if (currentStaffCount >= maxStaff) {
      const { ApiError } = await import('../middleware/errorHandler');
      throw new ApiError(
        `Staff limit reached. Your "${gym.subscription_plans.name}" plan allows ${maxStaff} staff member(s). Please upgrade your subscription.`,
        403
      );
    }

    // Create trainer
    const trainer = await trainerService.createTrainer(data);
    res.status(201).json(trainer);
  }),

  /**
   * PUT /api/trainers/:id
   */
  updateTrainer: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = updateTrainerSchema.parse(req.body);
    
    const trainer = await trainerService.updateTrainer(id, data);
    res.status(200).json(trainer);
  }),

  /**
   * DELETE /api/trainers/:id
   */
  deleteTrainer: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    
    const result = await trainerService.deleteTrainer(id);
    res.status(200).json(result);
  }),

  /**
   * GET /api/trainers/:id/schedule
   */
  getTrainerSchedule: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { start_date, end_date } = req.query;
    
    const schedule = await trainerService.getTrainerSchedule(
      id,
      start_date as string,
      end_date as string
    );
    res.status(200).json(schedule);
  })
};
