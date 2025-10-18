import { z } from 'zod';

export const createTransactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  category: z.string().min(1),
  amount: z.number().positive(),
  description: z.string().min(1),
  transaction_date: z.string().datetime(),
  payment_method: z.string().optional(),
  reference_id: z.string().optional(),
  branch_id: z.string().uuid()
});

export const updateTransactionSchema = createTransactionSchema.partial();

export const transactionFiltersSchema = z.object({
  type: z.enum(['income', 'expense']).optional(),
  category: z.string().optional(),
  branch_id: z.string().uuid().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional()
});

export const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(['income', 'expense']),
  description: z.string().optional(),
  is_active: z.boolean().optional()
});

export const updateCategorySchema = createCategorySchema.partial();
