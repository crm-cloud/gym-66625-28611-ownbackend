import { z } from 'zod';

export const createAttendanceSchema = z.object({
  member_id: z.string().uuid(),
  check_in_time: z.string().datetime(),
  check_out_time: z.string().datetime().optional(),
  device_id: z.string().optional(),
  notes: z.string().optional(),
  branch_id: z.string().uuid()
});

export const updateAttendanceSchema = z.object({
  check_out_time: z.string().datetime().optional(),
  notes: z.string().optional()
});

export const attendanceFiltersSchema = z.object({
  member_id: z.string().uuid().optional(),
  branch_id: z.string().uuid().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional()
});

export const createDeviceSchema = z.object({
  device_name: z.string().min(1).max(100),
  device_type: z.enum(['rfid', 'biometric', 'qr_scanner', 'manual']),
  device_id: z.string().min(1),
  is_active: z.boolean().optional(),
  branch_id: z.string().uuid()
});

export const updateDeviceSchema = createDeviceSchema.partial();
