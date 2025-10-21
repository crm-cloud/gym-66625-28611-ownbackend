import { api } from '@/lib/axios';

/**
 * Trainer Change Service
 * Handles trainer change request operations
 */
class TrainerChangeServiceClass {
  private readonly BASE_URL = '/api/v1/trainer-changes';

  /**
   * Get all change requests
   */
  async getChangeRequests(params?: {
    member_id?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const { data } = await api.get(this.BASE_URL, { params });
    return data.data;
  }

  /**
   * Get change request by ID
   */
  async getChangeRequestById(id: string) {
    const { data } = await api.get(`${this.BASE_URL}/${id}`);
    return data.data;
  }

  /**
   * Create change request
   */
  async createChangeRequest(requestData: {
    member_id: string;
    current_trainer_id: string;
    requested_trainer_id: string;
    reason: string;
    notes?: string;
  }) {
    const { data } = await api.post(this.BASE_URL, requestData);
    return data.data;
  }

  /**
   * Review change request
   */
  async reviewChangeRequest(
    id: string,
    reviewData: {
      status: 'approved' | 'rejected';
      admin_notes?: string;
    }
  ) {
    const { data } = await api.post(`${this.BASE_URL}/${id}/review`, reviewData);
    return data.data;
  }

  /**
   * Get change request stats
   */
  async getChangeRequestStats() {
    const { data } = await api.get(`${this.BASE_URL}/stats`);
    return data.data;
  }
}

export const TrainerChangeService = new TrainerChangeServiceClass();
