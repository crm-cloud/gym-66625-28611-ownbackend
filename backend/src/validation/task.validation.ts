import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  task_type: z.enum(['maintenance', 'cleaning', 'equipment', 'member_support', 'admin', 'other']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).default('pending'),
  assigned_to: z.string().uuid().optional(),
  branch_id: z.string().uuid(),
  due_date: z.string().datetime().optional(),
  estimated_duration: z.number().int().positive().optional(), // in minutes
  attachments: z.array(z.string()).optional(),
});

export const updateTaskSchema = createTaskSchema.partial().extend({
  id: z.string().uuid(),
});

export const updateTaskStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']),
  completion_notes: z.string().max(1000).optional(),
});

export const assignTaskSchema = z.object({
  id: z.string().uuid(),
  assigned_to: z.string().uuid(),
});

export const addTaskCommentSchema = z.object({
  task_id: z.string().uuid(),
  comment: z.string().min(1).max(1000),
});
