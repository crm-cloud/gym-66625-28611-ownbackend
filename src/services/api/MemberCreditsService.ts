import { BaseService } from './BaseService';
import { 
  MemberCredits, 
  CreditTransaction, 
  AddCreditsInput, 
  DeductCreditsInput, 
  CreditsQueryParams,
  CreditsSummary 
} from '@/types/credits';

class MemberCreditsServiceClass extends BaseService<MemberCredits> {
  constructor() {
    super('member-credits');
  }

  /**
   * Get member's credit balance
   */
  async getBalance(memberId: string): Promise<MemberCredits> {
    return this.get<MemberCredits>(`/${memberId}`);
  }

  /**
   * Add credits to member
   */
  async addCredits(memberId: string, data: AddCreditsInput): Promise<{ credits: MemberCredits; transaction: CreditTransaction }> {
    return this.post<{ credits: MemberCredits; transaction: CreditTransaction }>(`/${memberId}/add`, data);
  }

  /**
   * Deduct credits from member
   */
  async deductCredits(memberId: string, data: DeductCreditsInput): Promise<{ credits: MemberCredits; transaction: CreditTransaction }> {
    return this.post<{ credits: MemberCredits; transaction: CreditTransaction }>(`/${memberId}/deduct`, data);
  }

  /**
   * Get transaction history
   */
  async getTransactions(params?: CreditsQueryParams): Promise<{
    transactions: CreditTransaction[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    return this.get<any>('/transactions', params);
  }

  /**
   * Get credits summary
   */
  async getCreditsSummary(branchId?: string): Promise<CreditsSummary> {
    return this.get<CreditsSummary>('/summary', branchId ? { branch_id: branchId } : undefined);
  }
}

export const MemberCreditsService = new MemberCreditsServiceClass();
