import { Request, Response } from 'express';
import { memberService } from '../services/member.service';
import { createMemberSchema, updateMemberSchema, memberQuerySchema } from '../validation/member.validation';
import { asyncHandler } from '../middleware/errorHandler';

export const memberController = {
  /**
   * GET /api/members
   */
  getMembers: asyncHandler(async (req: Request, res: Response) => {
    const query = memberQuerySchema.parse(req.query);
    const { role, branchId } = req.user!;
    
    const result = await memberService.getMembers(query, role, branchId);
    res.status(200).json(result);
  }),

  /**
   * GET /api/members/:id
   */
  getMemberById: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { role, branchId } = req.user!;
    
    const member = await memberService.getMemberById(id, role, branchId);
    res.status(200).json(member);
  }),

  /**
   * POST /api/members
   */
  createMember: asyncHandler(async (req: Request, res: Response) => {
    const data = createMemberSchema.parse(req.body);

    // CRITICAL: Check subscription limit
    const { default: prisma } = await import('../config/database');
    const branch = await prisma.branches.findUnique({
      where: { id: data.branch_id },
      include: {
        gyms: {
          include: {
            subscription_plans: {
              select: {
                max_members: true,
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

    const maxMembers = gym.subscription_plans.max_members;
    if (!maxMembers) {
      const { ApiError } = await import('../middleware/errorHandler');
      throw new ApiError('Subscription plan does not specify member limit', 500);
    }

    // Count current members for this gym (across all branches)
    const currentMemberCount = await prisma.members.count({
      where: {
        branches: {
          gym_id: gym.id
        }
      }
    });

    if (currentMemberCount >= maxMembers) {
      const { ApiError } = await import('../middleware/errorHandler');
      throw new ApiError(
        `Member limit reached. Your "${gym.subscription_plans.name}" plan allows ${maxMembers} member(s). Please upgrade your subscription.`,
        403
      );
    }

    // Create member
    const member = await memberService.createMember(data);
    res.status(201).json(member);
  }),

  /**
   * PUT /api/members/:id
   */
  updateMember: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = updateMemberSchema.parse(req.body);
    const { role, branchId } = req.user!;
    
    const member = await memberService.updateMember(id, data, role, branchId);
    res.status(200).json(member);
  }),

  /**
   * DELETE /api/members/:id
   */
  deleteMember: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { role, branchId } = req.user!;
    
    const result = await memberService.deleteMember(id, role, branchId);
    res.status(200).json(result);
  }),

  /**
   * GET /api/members/stats
   */
  getMemberStats: asyncHandler(async (req: Request, res: Response) => {
    const { branchId } = req.user!;
    const queryBranchId = req.query.branch_id as string | undefined;
    
    const stats = await memberService.getMemberStats(queryBranchId || branchId || undefined);
    res.status(200).json(stats);
  })
};
