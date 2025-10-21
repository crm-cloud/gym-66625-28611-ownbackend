// Member Credits Types
export interface MemberCredits {
  member_id: string;
  balance: number;
  created_at: string;
  updated_at: string;
  member?: {
    id: string;
    full_name: string;
    email: string;
  };
}

export interface CreditTransaction {
  id: string;
  member_id: string;
  amount: number;
  transaction_type: 'purchase' | 'refund' | 'bonus' | 'adjustment' | 'redemption';
  balance_after: number;
  reference_id?: string;
  notes?: string;
  created_by: string;
  created_at: string;
  member?: {
    id: string;
    full_name: string;
    email: string;
  };
}

export interface AddCreditsInput {
  amount: number;
  transaction_type: 'purchase' | 'refund' | 'bonus' | 'adjustment';
  reference_id?: string;
  notes?: string;
}

export interface DeductCreditsInput {
  amount: number;
  transaction_type: 'purchase' | 'redemption' | 'adjustment';
  reference_id?: string;
  notes?: string;
}

export interface CreditsQueryParams {
  member_id?: string;
  transaction_type?: string;
  from_date?: string;
  to_date?: string;
  page?: number;
  limit?: number;
}

export interface CreditsSummary {
  total_credits: number;
  total_members: number;
  recent_transactions: number;
}
