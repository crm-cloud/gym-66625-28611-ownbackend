// Analytics Types
export interface AnalyticsEvent {
  id: string;
  event_type: string;
  entity_type?: 'member' | 'trainer' | 'branch' | 'class' | 'subscription' | 'payment' | 'other';
  entity_id?: string;
  member_id?: string;
  branch_id?: string;
  metadata?: Record<string, any>;
  value?: number;
  created_at: string;
}

export interface TrackEventInput {
  event_type: string;
  entity_type?: 'member' | 'trainer' | 'branch' | 'class' | 'subscription' | 'payment' | 'other';
  entity_id?: string;
  member_id?: string;
  branch_id?: string;
  metadata?: Record<string, any>;
  value?: number;
}

export interface EventsQueryParams {
  event_type?: string;
  entity_type?: string;
  member_id?: string;
  branch_id?: string;
  from_date?: string;
  to_date?: string;
  page?: number;
  limit?: number;
}

export interface MemberAnalytics {
  id: string;
  member_id: string;
  period_start: string;
  period_end: string;
  attendance_count: number;
  classes_attended: number;
  workout_sessions: number;
  total_duration_minutes: number;
  calories_burned?: number;
  created_at: string;
  updated_at: string;
}

export interface BranchAnalytics {
  id: string;
  branch_id: string;
  period_start: string;
  period_end: string;
  total_members: number;
  active_members: number;
  new_members: number;
  revenue: number;
  attendance_rate: number;
  created_at: string;
  updated_at: string;
}

export interface TrainerAnalytics {
  id: string;
  trainer_id: string;
  period_start: string;
  period_end: string;
  total_sessions: number;
  total_clients: number;
  average_rating?: number;
  revenue_generated: number;
  created_at: string;
  updated_at: string;
}
