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
