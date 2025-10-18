import { Request, Response } from 'express';
import { membershipService } from '../services/membership.service';
import { createMembershipPlanSchema, updateMembershipPlanSchema, membershipPlanQuerySchema } from '../validation/membership.validation';
import { asyncHandler } from '../middleware/errorHandler';

export const membershipController = {
  /**
   * GET /api/membership-plans
   */
  getMembershipPlans: asyncHandler(async (req: Request, res: Response) => {
    const query = membershipPlanQuerySchema.parse(req.query);
    
    const plans = await membershipService.getMembershipPlans(query);
    res.status(200).json(plans);
  }),

  /**
   * GET /api/membership-plans/:id
   */
  getMembershipPlanById: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    
    const plan = await membershipService.getMembershipPlanById(id);
    res.status(200).json(plan);
  }),

  /**
   * POST /api/membership-plans
   */
  createMembershipPlan: asyncHandler(async (req: Request, res: Response) => {
    const data = createMembershipPlanSchema.parse(req.body);
    
    const plan = await membershipService.createMembershipPlan(data);
    res.status(201).json(plan);
  }),

  /**
   * PUT /api/membership-plans/:id
   */
  updateMembershipPlan: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = updateMembershipPlanSchema.parse(req.body);
    
    const plan = await membershipService.updateMembershipPlan(id, data);
    res.status(200).json(plan);
  }),

  /**
   * DELETE /api/membership-plans/:id
   */
  deleteMembershipPlan: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    
    const result = await membershipService.deleteMembershipPlan(id);
    res.status(200).json(result);
  }),

  /**
   * GET /api/membership-plans/popular
   */
  getPopularPlans: asyncHandler(async (req: Request, res: Response) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
    
    const plans = await membershipService.getPopularPlans(limit);
    res.status(200).json(plans);
  })
};
