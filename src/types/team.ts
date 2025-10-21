// Team Management Types
export interface TeamMember {
  id: string;
  user_id: string;
  branch_id: string;
  position: string;
  employment_type: 'full_time' | 'part_time' | 'contract' | 'intern';
  hire_date: string;
  salary?: number;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    email: string;
    full_name: string;
  };
  branch?: {
    id: string;
    name: string;
  };
}

export interface WorkShift {
  id: string;
  team_member_id: string;
  branch_id: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  shift_type?: 'opening' | 'closing' | 'mid' | 'night' | 'custom';
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  team_member?: {
    id: string;
    user?: {
      id: string;
      full_name: string;
    };
  };
}

export interface CreateTeamMemberInput {
  user_id: string;
  branch_id: string;
  position: string;
  employment_type: 'full_time' | 'part_time' | 'contract' | 'intern';
  hire_date: string;
  salary?: number;
  is_active?: boolean;
}

export interface UpdateTeamMemberInput {
  user_id?: string;
  branch_id?: string;
  position?: string;
  employment_type?: 'full_time' | 'part_time' | 'contract' | 'intern';
  hire_date?: string;
  salary?: number;
  is_active?: boolean;
}

export interface CreateShiftInput {
  team_member_id: string;
  branch_id: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  shift_type?: 'opening' | 'closing' | 'mid' | 'night' | 'custom';
  notes?: string;
}

export interface TeamQueryParams {
  branch_id?: string;
  position?: string;
  employment_type?: string;
  is_active?: boolean;
  page?: number;
  limit?: number;
}

export interface ShiftsQueryParams {
  team_member_id?: string;
  branch_id?: string;
  from_date?: string;
  to_date?: string;
  page?: number;
  limit?: number;
}
