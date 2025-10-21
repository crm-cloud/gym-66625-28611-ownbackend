import { Request, Response, NextFunction } from 'express';
import { membershipFreezeService } from '../services/membership-freeze.service';
import { 
  requestFreezeSchema,
  updateFreezeRequestSchema,
  freezeQuerySchema
} from '../validation/membership-freeze.validation';

export class MembershipFreezeController {
  /**
   * Request membership freeze
   */
  async requestFreeze(req: Request, res: Response, next: NextFunction) {
    try {
      const data = requestFreezeSchema.parse(req.body);
      const freezeRequest = await membershipFreezeService.requestFreeze(data, req.user!.userId);

      res.status(201).json({
        message: 'Freeze request created successfully',
        request: freezeRequest
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get freeze requests
   */
  async getFreezeRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const query = freezeQuerySchema.parse({
        ...req.query,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 50
      });

      const result = await membershipFreezeService.getFreezeRequests(query);

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get single freeze request
   */
  async getFreezeRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const { requestId } = req.params;
      const request = await membershipFreezeService.getFreezeRequest(requestId);

      res.json(request);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update freeze request (approve/reject)
   */
  async updateFreezeRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const { requestId } = req.params;
      const data = updateFreezeRequestSchema.parse(req.body);
      const result = await membershipFreezeService.updateFreezeRequest(requestId, data, req.user!.userId);

      res.json({
        message: 'Freeze request updated successfully',
        request: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cancel freeze request
   */
  async cancelFreezeRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const { requestId } = req.params;
      const { member_id } = req.body;
      const result = await membershipFreezeService.cancelFreezeRequest(requestId, member_id);

      res.json({
        message: 'Freeze request cancelled successfully',
        request: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get freeze statistics
   */
  async getFreezeStats(req: Request, res: Response, next: NextFunction) {
    try {
      const { branch_id } = req.query;
      const stats = await membershipFreezeService.getFreezeStats(branch_id as string);

      res.json(stats);
    } catch (error) {
      next(error);
    }
  }
}

export const membershipFreezeController = new MembershipFreezeController();
