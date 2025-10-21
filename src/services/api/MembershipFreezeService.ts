import { BaseService } from './BaseService';
import { 
  MembershipFreezeRequest, 
  RequestFreezeInput, 
  UpdateFreezeRequestInput, 
  FreezeQueryParams,
  FreezeStats 
} from '@/types/freeze';

class MembershipFreezeServiceClass extends BaseService<MembershipFreezeRequest> {
  constructor() {
    super('membership-freeze');
  }

  /**
   * Request membership freeze
   */
  async requestFreeze(data: RequestFreezeInput): Promise<MembershipFreezeRequest> {
    const response = await this.post<{ request: MembershipFreezeRequest }>('', data);
    return response.request;
  }

  /**
   * Get freeze requests
   */
  async getFreezeRequests(params?: FreezeQueryParams): Promise<{
    requests: MembershipFreezeRequest[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    return this.get<any>('', params);
  }

  /**
   * Get single freeze request
   */
  async getFreezeRequest(requestId: string): Promise<MembershipFreezeRequest> {
    return this.getById(requestId);
  }

  /**
   * Update freeze request (approve/reject)
   */
  async updateFreezeRequest(requestId: string, data: UpdateFreezeRequestInput): Promise<MembershipFreezeRequest> {
    const response = await this.put<{ request: MembershipFreezeRequest }>(`/${requestId}`, data);
    return response.request;
  }

  /**
   * Cancel freeze request
   */
  async cancelFreezeRequest(requestId: string, memberId: string): Promise<void> {
    await this.delete(`/${requestId}`);
  }

  /**
   * Get freeze statistics
   */
  async getFreezeStats(branchId?: string): Promise<FreezeStats> {
    return this.get<FreezeStats>('/stats', branchId ? { branch_id: branchId } : undefined);
  }
}

export const MembershipFreezeService = new MembershipFreezeServiceClass();
