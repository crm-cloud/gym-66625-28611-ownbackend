import { api } from '@/lib/axios';

/**
 * Trainer Review Service
 * Handles trainer review operations
 */
class TrainerReviewServiceClass {
  private readonly BASE_URL = '/api/v1/trainer-reviews';

  /**
   * Get all reviews
   */
  async getReviews(params?: {
    trainer_id?: string;
    member_id?: string;
    rating?: number;
    is_verified?: boolean;
    is_featured?: boolean;
    page?: number;
    limit?: number;
  }) {
    const { data } = await api.get(this.BASE_URL, { params });
    return data.data;
  }

  /**
   * Get review by ID
   */
  async getReviewById(id: string) {
    const { data } = await api.get(`${this.BASE_URL}/${id}`);
    return data.data;
  }

  /**
   * Create review
   */
  async createReview(reviewData: {
    trainer_id: string;
    member_id: string;
    rating: number;
    title: string;
    comment: string;
    is_anonymous?: boolean;
  }) {
    const { data } = await api.post(this.BASE_URL, reviewData);
    return data.data;
  }

  /**
   * Update review
   */
  async updateReview(id: string, updateData: {
    rating?: number;
    title?: string;
    comment?: string;
    is_verified?: boolean;
    is_featured?: boolean;
    admin_response?: string;
  }) {
    const { data } = await api.put(`${this.BASE_URL}/${id}`, updateData);
    return data.data;
  }

  /**
   * Delete review
   */
  async deleteReview(id: string) {
    const { data } = await api.delete(`${this.BASE_URL}/${id}`);
    return data.data;
  }

  /**
   * Get trainer review summary
   */
  async getTrainerReviewSummary(trainerId: string) {
    const { data } = await api.get(`${this.BASE_URL}/trainer/${trainerId}/summary`);
    return data.data;
  }
}

export const TrainerReviewService = new TrainerReviewServiceClass();
