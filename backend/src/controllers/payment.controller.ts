import { Request, Response, NextFunction } from 'express';
import { paymentService } from '../services/payment.service';
import { 
  paymentGatewayConfigSchema,
  createPaymentOrderSchema,
  verifyPaymentSchema,
  createPaymentLinkSchema,
  createRefundSchema,
  paymentQuerySchema
} from '../validation/payment.validation';

export class PaymentController {
  /**
   * Get payment gateway configurations
   */
  async getGatewayConfigs(req: Request, res: Response, next: NextFunction) {
    try {
      const configs = await paymentService.getGatewayConfigs();
      res.json(configs);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update gateway configuration
   */
  async updateGatewayConfig(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = paymentGatewayConfigSchema.partial().parse(req.body);
      const result = await paymentService.updateGatewayConfig(id, data);

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create payment order
   */
  async createPaymentOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createPaymentOrderSchema.parse(req.body);
      const order = await paymentService.createPaymentOrder(data, req.user!.userId);

      res.status(201).json(order);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify payment
   */
  async verifyPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const data = verifyPaymentSchema.parse(req.body);
      const result = await paymentService.verifyPayment(data);

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create payment link
   */
  async createPaymentLink(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createPaymentLinkSchema.parse(req.body);
      const link = await paymentService.createPaymentLink(data, req.user!.userId);

      res.status(201).json(link);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Process refund
   */
  async processRefund(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createRefundSchema.parse(req.body);
      const result = await paymentService.processRefund(data, req.user!.userId);

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get payments
   */
  async getPayments(req: Request, res: Response, next: NextFunction) {
    try {
      const query = paymentQuerySchema.parse({
        ...req.query,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 50
      });

      const result = await paymentService.getPayments(query);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get payment analytics
   */
  async getPaymentAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const { from_date, to_date } = req.query;
      
      if (!from_date || !to_date) {
        return res.status(400).json({ error: 'from_date and to_date are required' });
      }

      const analytics = await paymentService.getPaymentAnalytics(
        from_date as string,
        to_date as string
      );

      res.json(analytics);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Payment webhook handler
   */
  async handleWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const { gateway } = req.params;
      const signature = req.headers['x-razorpay-signature'] || req.headers['x-webhook-signature'];

      // Verify and process webhook
      const result = await paymentService.verifyPayment({
        payment_id: req.body.payload?.payment?.entity?.order_id || req.body.order_id,
        gateway_response: req.body,
        signature: signature as string
      });

      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }
}

export const paymentController = new PaymentController();
