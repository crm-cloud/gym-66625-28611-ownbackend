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

// Dashboard Stats Types
export interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  totalRevenue: number;
  monthlyRevenue: number;
  growthRate?: number;
  memberRetention?: number;
  classAttendance?: number;
  
  // Super Admin specific fields
  totalGyms?: number;
  activeGyms?: number;
  totalBranches?: number;
  totalTrainers?: number;
  recentGyms?: Array<{
    id: string;
    name: string;
    subscription_plan: string;
    created_at: string;
    branch_count: number;
    member_count: number;
  }>;
}

export interface RevenueAnalytics {
  data: Array<{
    month: string;
    membership_fees: number;
    personal_training: number;
    retail: number;
    total: number;
  }>;
}

export interface MembershipAnalytics {
  data: Array<{
    month: string;
    new_members: number;
    active_members: number;
    churned_members: number;
    retention_rate: number;
  }>;
}

export interface ClassPopularity {
  class_type: string;
  total_classes: number;
  total_attendees: number;
  avg_attendance: number;
  cancellation_rate: number;
}
