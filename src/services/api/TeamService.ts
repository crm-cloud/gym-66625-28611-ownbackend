import { BaseService } from './BaseService';
import { 
  TeamMember, 
  WorkShift, 
  CreateTeamMemberInput, 
  UpdateTeamMemberInput, 
  CreateShiftInput, 
  TeamQueryParams, 
  ShiftsQueryParams 
} from '@/types/team';

class TeamServiceClass extends BaseService<TeamMember> {
  constructor() {
    super('team');
  }

  // Team Members
  async createTeamMember(data: CreateTeamMemberInput): Promise<TeamMember> {
    const response = await this.post<{ member: TeamMember }>('/members', data);
    return response.member;
  }

  async getTeamMembers(params?: TeamQueryParams): Promise<{
    members: TeamMember[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    return this.get<any>('/members', params);
  }

  async getTeamMember(memberId: string): Promise<TeamMember> {
    return this.get<TeamMember>(`/members/${memberId}`);
  }

  async updateTeamMember(memberId: string, data: UpdateTeamMemberInput): Promise<TeamMember> {
    const response = await this.put<{ member: TeamMember }>(`/members/${memberId}`, data);
    return response.member;
  }

  async deleteTeamMember(memberId: string): Promise<void> {
    await this.delete(`/members/${memberId}`);
  }

  // Work Shifts
  async createShift(data: CreateShiftInput): Promise<WorkShift> {
    const response = await this.post<{ shift: WorkShift }>('/shifts', data);
    return response.shift;
  }

  async getShifts(params?: ShiftsQueryParams): Promise<{
    shifts: WorkShift[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    return this.get<any>('/shifts', params);
  }

  async updateShift(shiftId: string, data: Partial<CreateShiftInput>): Promise<WorkShift> {
    const response = await this.put<{ shift: WorkShift }>(`/shifts/${shiftId}`, data);
    return response.shift;
  }

  async deleteShift(shiftId: string): Promise<void> {
    await this.delete(`/shifts/${shiftId}`);
  }
}

export const TeamService = new TeamServiceClass();
