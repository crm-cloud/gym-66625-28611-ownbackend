import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  category: z.enum(['supplement', 'equipment', 'apparel', 'accessories', 'food']),
  price: z.number().positive(),
  stock_quantity: z.number().int().min(0).optional(),
  image_url: z.string().url().optional(),
  is_active: z.boolean().optional(),
  branch_id: z.string().uuid().optional()
});

export const updateProductSchema = createProductSchema.partial();

export const productFiltersSchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
  branch_id: z.string().uuid().optional(),
  is_active: z.boolean().optional(),
  page: z.string().optional(),
  limit: z.string().optional()
});
