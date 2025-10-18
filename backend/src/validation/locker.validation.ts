import { z } from 'zod';

export const createLockerSchema = z.object({
  locker_number: z.string().min(1).max(50),
  status: z.enum(['available', 'occupied', 'maintenance']).optional(),
  rental_price: z.number().min(0).optional(),
  branch_id: z.string().uuid()
});

export const updateLockerSchema = z.object({
  locker_number: z.string().min(1).max(50).optional(),
  status: z.enum(['available', 'occupied', 'maintenance']).optional(),
  rental_price: z.number().min(0).optional()
});

export const assignLockerSchema = z.object({
  member_id: z.string().uuid(),
  start_date: z.string().datetime(),
  end_date: z.string().datetime(),
  rental_amount: z.number().positive()
});

export const lockerFiltersSchema = z.object({
  status: z.string().optional(),
  branch_id: z.string().uuid().optional(),
  member_id: z.string().uuid().optional(),
  page: z.string().optional(),
  limit: z.string().optional()
});
