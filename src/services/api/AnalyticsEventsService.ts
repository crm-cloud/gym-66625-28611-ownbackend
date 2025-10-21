import { BaseService } from './BaseService';
import { 
  AnalyticsEvent, 
  TrackEventInput, 
  EventsQueryParams, 
  MemberAnalytics, 
  BranchAnalytics, 
  TrainerAnalytics 
} from '@/types/analytics';

class AnalyticsEventsServiceClass extends BaseService<AnalyticsEvent> {
  constructor() {
    super('analytics');
  }

  /**
   * Track analytics event
   */
  async trackEvent(data: TrackEventInput): Promise<AnalyticsEvent> {
    const response = await this.post<{ event: AnalyticsEvent }>('/events', data);
    return response.event;
  }

  /**
   * Get analytics events
   */
  async getEvents(params?: EventsQueryParams): Promise<{
    events: AnalyticsEvent[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    return this.get<any>('/events', params);
  }

  /**
   * Get member analytics
   */
  async getMemberAnalytics(memberId: string, params?: { from_date?: string; to_date?: string }): Promise<MemberAnalytics[]> {
    return this.get<MemberAnalytics[]>(`/member/${memberId}`, params);
  }

  /**
   * Get branch analytics
   */
  async getBranchAnalytics(branchId: string, params?: { from_date?: string; to_date?: string }): Promise<BranchAnalytics[]> {
    return this.get<BranchAnalytics[]>(`/branch/${branchId}`, params);
  }

  /**
   * Get trainer analytics
   */
  async getTrainerAnalytics(trainerId: string, params?: { from_date?: string; to_date?: string }): Promise<TrainerAnalytics[]> {
    return this.get<TrainerAnalytics[]>(`/trainer/${trainerId}`, params);
  }
}

export const AnalyticsEventsService = new AnalyticsEventsServiceClass();
