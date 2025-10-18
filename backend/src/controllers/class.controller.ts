import { Request, Response } from 'express';
import { classService } from '../services/class.service';
import { createClassSchema, updateClassSchema, classQuerySchema } from '../validation/class.validation';
import { asyncHandler } from '../middleware/errorHandler';

export const classController = {
  /**
   * GET /api/classes
   */
  getClasses: asyncHandler(async (req: Request, res: Response) => {
    const query = classQuerySchema.parse(req.query);
    const { role, branchId } = req.user!;
    
    const classes = await classService.getClasses(query, role, branchId);
    res.status(200).json(classes);
  }),

  /**
   * GET /api/classes/:id
   */
  getClassById: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    
    const gymClass = await classService.getClassById(id);
    res.status(200).json(gymClass);
  }),

  /**
   * POST /api/classes
   */
  createClass: asyncHandler(async (req: Request, res: Response) => {
    const data = createClassSchema.parse(req.body);
    
    const gymClass = await classService.createClass(data);
    res.status(201).json(gymClass);
  }),

  /**
   * PUT /api/classes/:id
   */
  updateClass: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = updateClassSchema.parse(req.body);
    
    const gymClass = await classService.updateClass(id, data);
    res.status(200).json(gymClass);
  }),

  /**
   * DELETE /api/classes/:id
   */
  deleteClass: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    
    const result = await classService.deleteClass(id);
    res.status(200).json(result);
  }),

  /**
   * GET /api/classes/upcoming
   */
  getUpcomingClasses: asyncHandler(async (req: Request, res: Response) => {
    const { branchId } = req.user!;
    const queryBranchId = req.query.branch_id as string | undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    
    const classes = await classService.getUpcomingClasses(queryBranchId || branchId || undefined, limit);
    res.status(200).json(classes);
  })
};
