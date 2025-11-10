import { Request, Response } from 'express';
import { branchService } from '../services/branch.service';
import { createBranchSchema, updateBranchSchema, branchQuerySchema } from '../validation/branch.validation';
import { asyncHandler } from '../middleware/errorHandler';

export const branchController = {
  /**
   * GET /api/branches
   */
  getBranches: asyncHandler(async (req: Request, res: Response) => {
    const query = branchQuerySchema.parse(req.query);
    
    const branches = await branchService.getBranches(query);
    res.status(200).json(branches);
  }),

  /**
   * GET /api/branches/:id
   */
  getBranchById: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    
    const branch = await branchService.getBranchById(id);
    res.status(200).json(branch);
  }),

  /**
   * POST /api/branches
   */
  createBranch: asyncHandler(async (req: Request, res: Response) => {
    const data = createBranchSchema.parse(req.body);
    const gymId = req.user?.gymId || data.gym_id;

    if (!gymId) {
      const { ApiError } = await import('../middleware/errorHandler');
      throw new ApiError('gym_id is required', 400);
    }

    // CRITICAL: Check subscription limit
    const { default: prisma } = await import('../config/database');
    const gym = await prisma.gyms.findUnique({
      where: { id: gymId },
      include: {
        subscription_plans: {
          select: {
            max_branches: true,
            name: true
          }
        }
      }
    });

    if (!gym) {
      const { ApiError } = await import('../middleware/errorHandler');
      throw new ApiError('Gym not found', 404);
    }

    if (!gym.subscription_plan_id || !gym.subscription_plans) {
      const { ApiError } = await import('../middleware/errorHandler');
      throw new ApiError('No active subscription plan found for this gym', 403);
    }

    const maxBranches = gym.subscription_plans.max_branches;
    if (!maxBranches) {
      const { ApiError } = await import('../middleware/errorHandler');
      throw new ApiError('Subscription plan does not specify branch limit', 500);
    }

    // Count current branches for this gym
    const currentBranchCount = await prisma.branches.count({
      where: { gym_id: gymId }
    });

    if (currentBranchCount >= maxBranches) {
      const { ApiError } = await import('../middleware/errorHandler');
      throw new ApiError(
        `Branch limit reached. Your "${gym.subscription_plans.name}" plan allows ${maxBranches} branch(es). Please upgrade your subscription.`,
        403
      );
    }

    // Create branch
    const branch = await branchService.createBranch(data);
    res.status(201).json(branch);
  }),

  /**
   * PUT /api/branches/:id
   */
  updateBranch: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = updateBranchSchema.parse(req.body);
    
    const branch = await branchService.updateBranch(id, data);
    res.status(200).json(branch);
  }),

  /**
   * DELETE /api/branches/:id
   */
  deleteBranch: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    
    const result = await branchService.deleteBranch(id);
    res.status(200).json(result);
  }),

  /**
   * GET /api/branches/:id/stats
   */
  getBranchStats: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    
    const stats = await branchService.getBranchStats(id);
    res.status(200).json(stats);
  })
};
