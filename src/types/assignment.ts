export interface Assignment {
  id: string;
  memberId?: string;  // Optional for global assignments
  memberName?: string; // Optional for global assignments
  planId: string;
  planName: string;
  planType: 'diet' | 'workout';
  startDate: string;
  endDate?: string;
  status: 'active' | 'completed' | 'pending' | 'expired';
  isGlobal: boolean;   // Indicates if this is a global assignment
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAssignmentDto {
  memberId?: string; // Optional for global assignments
  planId: string;
  planType: 'diet' | 'workout';
  startDate: string;
  endDate?: string;
  isGlobal?: boolean; // Defaults to false if not provided
  notes?: string;
}

export interface UpdateAssignmentDto extends Partial<CreateAssignmentDto> {
  status?: 'active' | 'completed' | 'pending' | 'expired';
}

export interface AssignmentFilters {
  memberId?: string;
  planType?: 'diet' | 'workout';
  status?: 'active' | 'completed' | 'pending' | 'expired';
  startDateFrom?: string;
  startDateTo?: string;
  isGlobal?: boolean; // Filter by global status
}

export interface AssignmentStats {
  total: number;
  active: number;
  completed: number;
  pending: number;
  expired: number;
}
