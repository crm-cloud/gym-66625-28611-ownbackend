import { BaseService } from './BaseService';
import { Branch } from '@/types/branch';

export interface BranchFilters {
  gymId?: string;
  status?: string;
  search?: string;
}

/**
 * Branch Service
 * Handles all branch-related API operations
 */
class BranchServiceClass extends BaseService<Branch> {
  constructor() {
    super('branches');
  }

  /**
   * Get all branches with filters
   */
  async getBranches(filters?: BranchFilters): Promise<{ branches: Branch[] }> {
    const params: Record<string, any> = {};
    
    if (filters?.gymId) params.gym_id = filters.gymId;
    if (filters?.status) params.status = filters.status;
    if (filters?.search) params.search = filters.search;

    const data = await this.getAll(params);
    return { branches: Array.isArray(data) ? data : (data as any).branches || [] };
  }

  /**
   * Get branch by ID
   */
  async getBranch(branchId: string): Promise<Branch> {
    return this.getById(branchId);
  }

  /**
   * Create new branch
   */
  async createBranch(branchData: Partial<Branch>): Promise<Branch> {
    return this.create(branchData);
  }

  /**
   * Update branch
   */
  async updateBranch(branchId: string, data: Partial<Branch>): Promise<Branch> {
    return this.update(branchId, data);
  }

  /**
   * Delete branch
   */
  async deleteBranch(branchId: string): Promise<void> {
    return this.delete(branchId);
  }

  /**
   * Get branch statistics
   */
  async getBranchStats(branchId: string): Promise<any> {
    return this.get(`/${branchId}/stats`);
  }
}

export const BranchService = new BranchServiceClass();
