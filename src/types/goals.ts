// Member Goals Types
export interface MemberGoal {
  id: string;
  member_id: string;
  goal_type: 'weight_loss' | 'weight_gain' | 'muscle_gain' | 'endurance' | 'flexibility' | 'general_fitness' | 'custom';
  title: string;
  description?: string;
  target_value?: number;
  current_value?: number;
  unit?: string;
  start_date: string;
  target_date: string;
  status: 'active' | 'completed' | 'cancelled';
  created_by: string;
  created_at: string;
  updated_at: string;
  member?: {
    id: string;
    full_name: string;
    email: string;
  };
}

export interface ProgressEntry {
  id: string;
  goal_id: string;
  value: number;
  notes?: string;
  recorded_at: string;
  created_at: string;
}

export interface CreateGoalInput {
  member_id: string;
  goal_type: 'weight_loss' | 'weight_gain' | 'muscle_gain' | 'endurance' | 'flexibility' | 'general_fitness' | 'custom';
  title: string;
  description?: string;
  target_value?: number;
  current_value?: number;
  unit?: string;
  start_date: string;
  target_date: string;
  status?: 'active' | 'completed' | 'cancelled';
}

export interface UpdateGoalInput {
  title?: string;
  description?: string;
  target_value?: number;
  current_value?: number;
  target_date?: string;
  status?: 'active' | 'completed' | 'cancelled';
}

export interface LogProgressInput {
  value: number;
  notes?: string;
  recorded_at?: string;
}

export interface GoalsQueryParams {
  member_id?: string;
  goal_type?: string;
  status?: 'active' | 'completed' | 'cancelled';
  page?: number;
  limit?: number;
}
