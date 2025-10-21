import prisma from '../config/database';
import { TrackEventInput, EventsQueryInput, AnalyticsQueryInput } from '../validation/analytics-events.validation';

export class AnalyticsEventsService {
  async trackEvent(data: TrackEventInput) {
    const event = await prisma.analytics_events.create({
      data: {
        event_type: data.event_type,
        entity_type: data.entity_type,
        entity_id: data.entity_id,
        member_id: data.member_id,
        branch_id: data.branch_id,
        metadata: data.metadata as any,
        value: data.value
      }
    });

    return event;
  }

  async getEvents(query: EventsQueryInput) {
    const { event_type, entity_type, member_id, branch_id, from_date, to_date, page = 1, limit = 50 } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (event_type) where.event_type = event_type;
    if (entity_type) where.entity_type = entity_type;
    if (member_id) where.member_id = member_id;
    if (branch_id) where.branch_id = branch_id;
    if (from_date || to_date) {
      where.created_at = {};
      if (from_date) where.created_at.gte = new Date(from_date);
      if (to_date) where.created_at.lte = new Date(to_date);
    }

    const [events, total] = await Promise.all([
      prisma.analytics_events.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip,
        take: limit
      }),
      prisma.analytics_events.count({ where })
    ]);

    return {
      events,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getMemberAnalytics(query: AnalyticsQueryInput) {
    const { entity_id, from_date, to_date } = query;

    const where: any = { member_id: entity_id };
    if (from_date || to_date) {
      where.period_start = {};
      if (from_date) where.period_start.gte = new Date(from_date);
      if (to_date) where.period_start.lte = new Date(to_date);
    }

    const analytics = await prisma.member_analytics.findMany({
      where,
      orderBy: { period_start: 'desc' }
    });

    return analytics;
  }

  async getBranchAnalytics(query: AnalyticsQueryInput) {
    const { entity_id, from_date, to_date } = query;

    const where: any = { branch_id: entity_id };
    if (from_date || to_date) {
      where.period_start = {};
      if (from_date) where.period_start.gte = new Date(from_date);
      if (to_date) where.period_start.lte = new Date(to_date);
    }

    const analytics = await prisma.branch_analytics.findMany({
      where,
      orderBy: { period_start: 'desc' }
    });

    return analytics;
  }

  async getTrainerAnalytics(query: AnalyticsQueryInput) {
    const { entity_id, from_date, to_date } = query;

    const where: any = { trainer_id: entity_id };
    if (from_date || to_date) {
      where.period_start = {};
      if (from_date) where.period_start.gte = new Date(from_date);
      if (to_date) where.period_start.lte = new Date(to_date);
    }

    const analytics = await prisma.trainer_analytics.findMany({
      where,
      orderBy: { period_start: 'desc' }
    });

    return analytics;
  }
}

export const analyticsEventsService = new AnalyticsEventsService();
