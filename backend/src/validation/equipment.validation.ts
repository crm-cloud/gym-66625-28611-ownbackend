import { z } from 'zod';

export const createEquipmentSchema = z.object({
  name: z.string().min(1).max(200),
  category: z.string().min(1),
  status: z.enum(['operational', 'maintenance', 'out_of_service']).optional(),
  purchase_date: z.string().datetime().optional(),
  warranty_expiry: z.string().datetime().optional(),
  last_maintenance: z.string().datetime().optional(),
  next_maintenance: z.string().datetime().optional(),
  notes: z.string().optional(),
  branch_id: z.string().uuid()
});

export const updateEquipmentSchema = createEquipmentSchema.partial();

export const equipmentFiltersSchema = z.object({
  category: z.string().optional(),
  status: z.string().optional(),
  branch_id: z.string().uuid().optional(),
  search: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional()
});
