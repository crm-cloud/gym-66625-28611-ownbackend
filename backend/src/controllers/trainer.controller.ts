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
