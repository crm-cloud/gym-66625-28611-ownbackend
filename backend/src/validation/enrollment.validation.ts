import { z } from 'zod';

// Create class enrollment schema
export const createEnrollmentSchema = z.object({
  class_id: z.string().uuid('Invalid class ID'),
  member_id: z.string().uuid('Invalid member ID'),
  enrollment_date: z.string().optional(),
  status: z.enum(['enrolled', 'waitlist', 'cancelled']).default('enrolled')
});

// Update enrollment schema
export const updateEnrollmentSchema = z.object({
  status: z.enum(['enrolled', 'waitlist', 'cancelled', 'completed']),
  attendance_count: z.number().int().min(0).optional()
});

// Enrollment query schema
export const enrollmentQuerySchema = z.object({
  class_id: z.string().uuid().optional(),
  member_id: z.string().uuid().optional(),
  status: z.enum(['enrolled', 'waitlist', 'cancelled', 'completed']).optional(),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(50)
});

// Mark attendance schema
export const markAttendanceSchema = z.object({
  enrollment_id: z.string().uuid('Invalid enrollment ID'),
  attended: z.boolean(),
  attendance_date: z.string().optional(),
  notes: z.string().optional()
});

// Export types
export type CreateEnrollmentInput = z.infer<typeof createEnrollmentSchema>;
export type UpdateEnrollmentInput = z.infer<typeof updateEnrollmentSchema>;
export type EnrollmentQueryInput = z.infer<typeof enrollmentQuerySchema>;
export type MarkAttendanceInput = z.infer<typeof markAttendanceSchema>;
