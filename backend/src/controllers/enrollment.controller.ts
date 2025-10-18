import { Request, Response, NextFunction } from 'express';
import { enrollmentService } from '../services/enrollment.service';
import { createEnrollmentSchema, updateEnrollmentSchema, enrollmentQuerySchema, markAttendanceSchema } from '../validation/enrollment.validation';

export class EnrollmentController {
  async createEnrollment(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createEnrollmentSchema.parse(req.body);
      const enrollment = await enrollmentService.createEnrollment(data);
      res.status(201).json({ message: 'Enrollment created successfully', enrollment });
    } catch (error) { next(error); }
  }

  async getEnrollments(req: Request, res: Response, next: NextFunction) {
    try {
      const query = enrollmentQuerySchema.parse({ ...req.query, page: Number(req.query.page) || 1, limit: Number(req.query.limit) || 50 });
      const result = await enrollmentService.getEnrollments(query);
      res.json(result);
    } catch (error) { next(error); }
  }

  async getEnrollmentById(req: Request, res: Response, next: NextFunction) {
    try {
      const enrollment = await enrollmentService.getEnrollmentById(req.params.id);
      res.json(enrollment);
    } catch (error) { next(error); }
  }

  async updateEnrollment(req: Request, res: Response, next: NextFunction) {
    try {
      const data = updateEnrollmentSchema.parse(req.body);
      const enrollment = await enrollmentService.updateEnrollment(req.params.id, data);
      res.json({ message: 'Enrollment updated successfully', enrollment });
    } catch (error) { next(error); }
  }

  async cancelEnrollment(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await enrollmentService.cancelEnrollment(req.params.id);
      res.json(result);
    } catch (error) { next(error); }
  }

  async markAttendance(req: Request, res: Response, next: NextFunction) {
    try {
      const data = markAttendanceSchema.parse(req.body);
      const result = await enrollmentService.markAttendance(data);
      res.json(result);
    } catch (error) { next(error); }
  }

  async getClassEnrollmentSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const summary = await enrollmentService.getClassEnrollmentSummary(req.params.classId);
      res.json(summary);
    } catch (error) { next(error); }
  }
}

export const enrollmentController = new EnrollmentController();
