import { Request, Response, NextFunction } from 'express';
import { memberCreditsService } from '../services/member-credits.service';
import { 
  addCreditsSchema,
  deductCreditsSchema,
  creditsQuerySchema
} from '../validation/member-credits.validation';

export class MemberCreditsController {
  /**
   * Get member's credit balance
   */
  async getBalance(req: Request, res: Response, next: NextFunction) {
    try {
      const { memberId } = req.params;
      const credits = await memberCreditsService.getBalance(memberId);

      res.json(credits);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Add credits to member
   */
  async addCredits(req: Request, res: Response, next: NextFunction) {
    try {
      const { memberId } = req.params;
      const data = addCreditsSchema.parse(req.body);
      const result = await memberCreditsService.addCredits(memberId, data, req.user!.userId);

      res.status(201).json({
        message: 'Credits added successfully',
        ...result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Deduct credits from member
   */
  async deductCredits(req: Request, res: Response, next: NextFunction) {
    try {
      const { memberId } = req.params;
      const data = deductCreditsSchema.parse(req.body);
      const result = await memberCreditsService.deductCredits(memberId, data, req.user!.userId);

      res.json({
        message: 'Credits deducted successfully',
        ...result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get transaction history
   */
  async getTransactions(req: Request, res: Response, next: NextFunction) {
    try {
      const query = creditsQuerySchema.parse({
        ...req.query,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 50
      });

      const result = await memberCreditsService.getTransactions(query);

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get credits summary
   */
  async getCreditsSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const { branch_id } = req.query;
      const summary = await memberCreditsService.getCreditsSummary(branch_id as string);

      res.json(summary);
    } catch (error) {
      next(error);
    }
  }
}

export const memberCreditsController = new MemberCreditsController();
