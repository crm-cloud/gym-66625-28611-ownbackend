import { z } from 'zod';

// Track event schema
export const trackEventSchema = z.object({
  event_type: z.string().min(2, 'Event type is required'),
  entity_type: z.enum(['member', 'trainer', 'branch', 'class', 'subscription', 'payment', 'other']).optional(),
  entity_id: z.string().uuid().optional(),
  member_id: z.string().uuid().optional(),
  branch_id: z.string().uuid().optional(),
  metadata: z.record(z.any()).optional(),
  value: z.number().optional()
});

// Query schema
export const eventsQuerySchema = z.object({
  event_type: z.string().optional(),
  entity_type: z.string().optional(),
  member_id: z.string().uuid().optional(),
  branch_id: z.string().uuid().optional(),
  from_date: z.string().optional(),
  to_date: z.string().optional(),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(50)
});

// Analytics query schema
export const analyticsQuerySchema = z.object({
  entity_type: z.enum(['member', 'branch', 'trainer']),
  entity_id: z.string().uuid(),
  from_date: z.string().optional(),
  to_date: z.string().optional()
});

export type TrackEventInput = z.infer<typeof trackEventSchema>;
export type EventsQueryInput = z.infer<typeof eventsQuerySchema>;
export type AnalyticsQueryInput = z.infer<typeof analyticsQuerySchema>;
