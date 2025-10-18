import { z } from 'zod';

export const createAnnouncementSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  target_audience: z.enum(['all', 'members', 'trainers', 'staff']),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  is_published: z.boolean().optional(),
  publish_date: z.string().datetime().optional(),
  expiry_date: z.string().datetime().optional(),
  branch_id: z.string().uuid().optional() // null = all branches
});

export const updateAnnouncementSchema = createAnnouncementSchema.partial();

export const announcementFiltersSchema = z.object({
  target_audience: z.string().optional(),
  priority: z.string().optional(),
  is_published: z.boolean().optional(),
  branch_id: z.string().uuid().optional(),
  page: z.string().optional(),
  limit: z.string().optional()
});
