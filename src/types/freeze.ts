// Membership Freeze Types
export interface MembershipFreezeRequest {
  id: string;
  member_id: string;
  freeze_from: string;
  freeze_to: string;
  reason?: string;
  notes?: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  fee_amount?: number;
  admin_notes?: string;
  created_by: string;
  processed_by?: string;
  processed_at?: string;
  created_at: string;
  updated_at: string;
  member?: {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
    branch_id: string;
  };
}

export interface RequestFreezeInput {
  member_id: string;
  freeze_from: string;
  freeze_to: string;
  reason?: string;
  notes?: string;
}

export interface UpdateFreezeRequestInput {
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  admin_notes?: string;
  fee_amount?: number;
}

export interface FreezeQueryParams {
  member_id?: string;
  branch_id?: string;
  status?: 'pending' | 'approved' | 'rejected' | 'cancelled';
  from_date?: string;
  to_date?: string;
  page?: number;
  limit?: number;
}

export interface FreezeStats {
  total_requests: number;
  pending: number;
  approved: number;
  rejected: number;
}
