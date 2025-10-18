import { Request, Response, NextFunction } from 'express';
import { assignmentService } from '../services/assignment.service';
import { createAssignmentSchema, updateAssignmentSchema, completeAssignmentSchema, assignmentQuerySchema, autoAssignmentSchema } from '../validation/assignment.validation';

export class AssignmentController {
  async createAssignment(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createAssignmentSchema.parse(req.body);
      const assignment = await assignmentService.createAssignment(data, req.user!.userId);
      res.status(201).json({ message: 'Assignment created successfully', assignment });
    } catch (error) { next(error); }
  }

  async getAssignments(req: Request, res: Response, next: NextFunction) {
    try {
      const query = assignmentQuerySchema.parse({ ...req.query, page: Number(req.query.page) || 1, limit: Number(req.query.limit) || 50 });
      const result = await assignmentService.getAssignments(query);
      res.json(result);
    } catch (error) { next(error); }
  }

  async getAssignmentById(req: Request, res: Response, next: NextFunction) {
    try {
      const assignment = await assignmentService.getAssignmentById(req.params.id);
      res.json(assignment);
    } catch (error) { next(error); }
  }

  async updateAssignment(req: Request, res: Response, next: NextFunction) {
    try {
      const data = updateAssignmentSchema.parse(req.body);
      const assignment = await assignmentService.updateAssignment(req.params.id, data);
      res.json({ message: 'Assignment updated successfully', assignment });
    } catch (error) { next(error); }
  }

  async completeAssignment(req: Request, res: Response, next: NextFunction) {
    try {
      const data = completeAssignmentSchema.parse(req.body);
      const assignment = await assignmentService.completeAssignment(req.params.id, data);
      res.json({ message: 'Assignment completed successfully', assignment });
    } catch (error) { next(error); }
  }

  async cancelAssignment(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await assignmentService.cancelAssignment(req.params.id, req.body.reason);
      res.json(result);
    } catch (error) { next(error); }
  }

  async autoAssign(req: Request, res: Response, next: NextFunction) {
    try {
      const data = autoAssignmentSchema.parse(req.body);
      const assignment = await assignmentService.autoAssignTrainer(data);
      res.status(201).json({ message: 'Trainer auto-assigned successfully', assignment });
    } catch (error) { next(error); }
  }

  async getTrainerSchedule(req: Request, res: Response, next: NextFunction) {
    try {
      const { trainerId } = req.params;
      const { from_date, to_date } = req.query;
      const schedule = await assignmentService.getTrainerSchedule(trainerId, from_date as string, to_date as string);
      res.json(schedule);
    } catch (error) { next(error); }
  }
}

export const assignmentController = new AssignmentController();
