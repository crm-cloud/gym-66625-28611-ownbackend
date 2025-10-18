import { z } from 'zod';

const orderItemSchema = z.object({
  product_id: z.string().uuid(),
  quantity: z.number().int().positive(),
  unit_price: z.number().positive()
});

export const createOrderSchema = z.object({
  user_id: z.string().uuid().optional(), // Optional - can use current user
  order_items: z.array(orderItemSchema).min(1),
  payment_method: z.string().min(1),
  cash_amount: z.number().min(0).optional(),
  credit_used: z.number().min(0).optional(),
  payment_reference: z.string().optional(),
  notes: z.string().optional(),
  branch_id: z.string().uuid().optional()
});

export const updateOrderSchema = z.object({
  status: z.enum(['pending', 'completed', 'cancelled', 'refunded']),
  payment_reference: z.string().optional(),
  notes: z.string().optional()
});

export const orderFiltersSchema = z.object({
  user_id: z.string().uuid().optional(),
  status: z.string().optional(),
  branch_id: z.string().uuid().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional()
});
