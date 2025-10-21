import { z } from 'zod';

// Create team member schema
export const createTeamMemberSchema = z.object({
  user_id: z.string().uuid('Invalid user ID'),
  branch_id: z.string().uuid('Invalid branch ID'),
  position: z.string().min(2, 'Position is required'),
  employment_type: z.enum(['full_time', 'part_time', 'contract', 'intern']),
  hire_date: z.string(),
  salary: z.number().min(0).optional(),
  is_active: z.boolean().default(true)
});

// Update team member schema
export const updateTeamMemberSchema = createTeamMemberSchema.partial();

// Create shift schema
export const createShiftSchema = z.object({
  team_member_id: z.string().uuid('Invalid team member ID'),
  branch_id: z.string().uuid('Invalid branch ID'),
  shift_date: z.string(),
  start_time: z.string(),
  end_time: z.string(),
  shift_type: z.enum(['opening', 'closing', 'mid', 'night', 'custom']).optional(),
  notes: z.string().optional()
});

// Update shift schema
export const updateShiftSchema = createShiftSchema.partial();

// Query schemas
export const teamQuerySchema = z.object({
  branch_id: z.string().uuid().optional(),
  position: z.string().optional(),
  employment_type: z.string().optional(),
  is_active: z.boolean().optional(),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(50)
});

export const shiftsQuerySchema = z.object({
  team_member_id: z.string().uuid().optional(),
  branch_id: z.string().uuid().optional(),
  from_date: z.string().optional(),
  to_date: z.string().optional(),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(50)
});

export type CreateTeamMemberInput = z.infer<typeof createTeamMemberSchema>;
export type UpdateTeamMemberInput = z.infer<typeof updateTeamMemberSchema>;
export type CreateShiftInput = z.infer<typeof createShiftSchema>;
export type UpdateShiftInput = z.infer<typeof updateShiftSchema>;
export type TeamQueryInput = z.infer<typeof teamQuerySchema>;
export type ShiftsQueryInput = z.infer<typeof shiftsQuerySchema>;
