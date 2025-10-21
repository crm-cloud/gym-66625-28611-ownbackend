import { BaseService } from './BaseService';

export interface Member {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  address?: any;
  emergency_contact?: any;
  medical_info?: any;
  branch_id: string;
  joined_date: string;
  membership_status: string;
  profile_picture_url?: string;
  created_at: string;
  updated_at: string;
}

export interface MemberFilters {
  branchId?: string;
  search?: string;
  membershipStatus?: string;
  gymId?: string;
}

/**
 * Member Service
 * Handles all member-related API operations
 */
class MemberServiceClass extends BaseService<Member> {
  constructor() {
    super('members');
  }

  /**
   * Get members with filters
   */
  async getMembers(filters?: MemberFilters): Promise<Member[]> {
    const params: Record<string, any> = {};
    
    if (filters?.branchId) params.branch_id = filters.branchId;
    if (filters?.search) params.search = filters.search;
    if (filters?.membershipStatus) params.status = filters.membershipStatus;
    if (filters?.gymId) params.gym_id = filters.gymId;

    return this.getAll(params);
  }

  /**
   * Get member by ID
   */
  async getMember(memberId: string): Promise<Member> {
    return this.getById(memberId);
  }

  /**
   * Create new member
   */
  async createMember(memberData: Partial<Member>): Promise<Member> {
    return this.create(memberData);
  }

  /**
   * Update member
   */
  async updateMember(memberId: string, data: Partial<Member>): Promise<Member> {
    return this.update(memberId, data);
  }

  /**
   * Delete member
   */
  async deleteMember(memberId: string): Promise<void> {
    return this.delete(memberId);
  }

  /**
   * Enable login for existing member
   */
  async enableLogin(memberId: string, password: string): Promise<any> {
    return this.post(`/${memberId}/enable-login`, { password });
  }

  /**
   * Get member statistics
   */
  async getMemberStats(memberId: string): Promise<any> {
    return this.get(`/${memberId}/stats`);
  }

  /**
   * Get member attendance
   */
  async getMemberAttendance(memberId: string, startDate?: string, endDate?: string): Promise<any> {
    return this.get(`/${memberId}/attendance`, { start_date: startDate, end_date: endDate });
  }

  /**
   * Get member subscriptions
   */
  async getMemberSubscriptions(memberId: string): Promise<any> {
    return this.get(`/${memberId}/subscriptions`);
  }
}

export const MemberService = new MemberServiceClass();
