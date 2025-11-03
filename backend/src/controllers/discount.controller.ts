import { Request, Response, NextFunction } from 'express';
import { discountService } from '../services/discount.service';
import { z } from 'zod';

const validateDiscountSchema = z.object({
  code: z.string(),
  userId: z.string(),
  purchaseType: z.enum(['membership', 'pos', 'training', 'class_booking']),
  amount: z.number().positive()
});

export class DiscountController {
  /**
   * Validate discount code
   */
  async validateCode(req: Request, res: Response, next: NextFunction) {
    try {
      const data = validateDiscountSchema.parse(req.body);
      const result = await discountService.validateCode(
        data.code,
        data.userId,
        data.purchaseType,
        data.amount
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get active discounts
   */
  async getActiveDiscounts(req: Request, res: Response, next: NextFunction) {
    try {
      const discounts = await discountService.getActiveDiscounts();
      res.json(discounts);
    } catch (error) {
      next(error);
    }
  }
}

export const discountController = new DiscountController();
