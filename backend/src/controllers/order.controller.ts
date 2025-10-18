import { Request, Response } from 'express';
import { orderService } from '../services/order.service';
import { createOrderSchema, updateOrderSchema, orderFiltersSchema } from '../validation/order.validation';

export const orderController = {
  async getOrders(req: Request, res: Response) {
    try {
      const filters = orderFiltersSchema.parse(req.query);
      const result = await orderService.getOrders(filters);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async getOrder(req: Request, res: Response) {
    try {
      const order = await orderService.getOrderById(req.params.id);
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      res.json(order);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async createOrder(req: Request, res: Response) {
    try {
      const data = createOrderSchema.parse(req.body);
      const order = await orderService.createOrder(req.user!.userId, data);
      res.status(201).json(order);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async updateOrder(req: Request, res: Response) {
    try {
      const data = updateOrderSchema.parse(req.body);
      const order = await orderService.updateOrder(req.params.id, data);
      res.json(order);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
};
