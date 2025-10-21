import { BaseService } from './BaseService';

export interface Gym {
  id: string;
  name: string;
  billing_email?: string;
  status: string;
  subscription_plan?: string;
  max_branches?: number;
  max_trainers?: number;
  max_members?: number;
  created_at: string;
  updated_at: string;
}

export interface GymFilters {
  status?: string;
  search?: string;
}

/**
 * Gym Service
 * Handles all gym-related API operations
 */
class GymServiceClass extends BaseService<Gym> {
  constructor() {
    super('gyms');
  }

  /**
   * Get all gyms with filters
   */
  async getGyms(filters?: GymFilters): Promise<{ gyms: Gym[] }> {
    const params: Record<string, any> = {};
    
    if (filters?.status) params.status = filters.status;
    if (filters?.search) params.search = filters.search;

    const data = await this.getAll(params);
    return { gyms: Array.isArray(data) ? data : (data as any).gyms || [] };
  }

  /**
   * Get gym by ID
   */
  async getGym(gymId: string): Promise<Gym> {
    return this.getById(gymId);
  }

  /**
   * Create new gym
   */
  async createGym(gymData: Partial<Gym>): Promise<Gym> {
    return this.create(gymData);
  }

  /**
   * Update gym
   */
  async updateGym(gymId: string, data: Partial<Gym>): Promise<Gym> {
    return this.update(gymId, data);
  }

  /**
   * Delete gym
   */
  async deleteGym(gymId: string): Promise<void> {
    return this.delete(gymId);
  }

  /**
   * Get gym statistics
   */
  async getGymStats(): Promise<any> {
    return this.get('/stats');
  }

  /**
   * Get gym analytics
   */
  async getGymAnalytics(gymId: string): Promise<any> {
    return this.get(`/${gymId}/analytics`);
  }

  /**
   * Get gym usage statistics
   */
  async getGymUsage(): Promise<any> {
    return this.get('/usage');
  }
}

export const GymService = new GymServiceClass();
