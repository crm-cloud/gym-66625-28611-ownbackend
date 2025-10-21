import { BaseService } from './BaseService';
import { 
  MemberGoal, 
  ProgressEntry, 
  CreateGoalInput, 
  UpdateGoalInput, 
  LogProgressInput, 
  GoalsQueryParams 
} from '@/types/goals';

class MemberGoalsServiceClass extends BaseService<MemberGoal> {
  constructor() {
    super('member-goals');
  }

  /**
   * Create goal
   */
  async createGoal(data: CreateGoalInput): Promise<MemberGoal> {
    const response = await this.post<{ goal: MemberGoal }>('', data);
    return response.goal;
  }

  /**
   * Get goals
   */
  async getGoals(params?: GoalsQueryParams): Promise<{
    goals: MemberGoal[];
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
   * Get single goal
   */
  async getGoal(goalId: string): Promise<MemberGoal> {
    return this.getById(goalId);
  }

  /**
   * Update goal
   */
  async updateGoal(goalId: string, data: UpdateGoalInput): Promise<MemberGoal> {
    const response = await this.put<{ goal: MemberGoal }>(`/${goalId}`, data);
    return response.goal;
  }

  /**
   * Delete goal
   */
  async deleteGoal(goalId: string): Promise<void> {
    await this.delete(goalId);
  }

  /**
   * Log progress
   */
  async logProgress(goalId: string, data: LogProgressInput): Promise<ProgressEntry> {
    const response = await this.post<{ progress: ProgressEntry }>(`/${goalId}/progress`, data);
    return response.progress;
  }

  /**
   * Get progress history
   */
  async getProgress(goalId: string): Promise<ProgressEntry[]> {
    return this.get<ProgressEntry[]>(`/${goalId}/progress`);
  }
}

export const MemberGoalsService = new MemberGoalsServiceClass();
