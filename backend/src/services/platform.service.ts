import prisma from '../config/database';

export class PlatformService {
  /**
   * Get platform-wide analytics
   */
  async getAnalytics(fromDate?: string, toDate?: string) {
    const dateFilter = fromDate && toDate 
      ? `WHERE created_at >= '${fromDate}' AND created_at <= '${toDate}'`
      : '';

    const [gymStats, memberStats, revenueStats, paymentStats] = await Promise.all([
      // Gym statistics
      prisma.$queryRaw<any[]>`
        SELECT 
          COUNT(*)::int as total_gyms,
          COUNT(*) FILTER (WHERE status = 'active')::int as active_gyms,
          COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days')::int as new_gyms_30d
        FROM gyms
      `,
      
      // Member statistics
      prisma.$queryRaw<any[]>`
        SELECT 
          COUNT(*)::int as total_members,
          COUNT(*) FILTER (WHERE status = 'active')::int as active_members,
          COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days')::int as new_members_30d
        FROM members
      `,
      
      // Revenue statistics
      prisma.$queryRawUnsafe<any[]>(`
        SELECT 
          SUM(amount) FILTER (WHERE status = 'success') as total_revenue,
          SUM(amount) FILTER (WHERE status = 'success' AND created_at >= NOW() - INTERVAL '30 days') as revenue_30d,
          AVG(amount) FILTER (WHERE status = 'success') as average_transaction
        FROM payments
        ${dateFilter}
      `),
      
      // Payment statistics
      prisma.$queryRawUnsafe<any[]>(`
        SELECT 
          COUNT(*)::int as total_transactions,
          COUNT(*) FILTER (WHERE status = 'success')::int as successful_transactions,
          (COUNT(*) FILTER (WHERE status = 'success')::decimal / NULLIF(COUNT(*), 0) * 100) as success_rate
        FROM payments
        ${dateFilter}
      `)
    ]);

    return {
      gyms: gymStats[0],
      members: memberStats[0],
      revenue: revenueStats[0],
      payments: paymentStats[0]
    };
  }

  /**
   * Get platform reports
   */
  async getReports(type: string, fromDate?: string, toDate?: string) {
    const dateFilter = fromDate && toDate 
      ? `WHERE created_at >= '${fromDate}' AND created_at <= '${toDate}'`
      : '';

    switch (type) {
      case 'revenue':
        return this.getRevenueReport(dateFilter);
      case 'membership':
        return this.getMembershipReport(dateFilter);
      case 'growth':
        return this.getGrowthReport(dateFilter);
      default:
        return this.getRevenueReport(dateFilter);
    }
  }

  /**
   * Get total revenue
   */
  async getTotalRevenue(fromDate?: string, toDate?: string) {
    const dateFilter = fromDate && toDate 
      ? `WHERE created_at >= '${fromDate}' AND created_at <= '${toDate}'`
      : '';

    const result = await prisma.$queryRawUnsafe<any[]>(`
      SELECT 
        SUM(amount) FILTER (WHERE status = 'success') as total_revenue,
        COUNT(*) FILTER (WHERE status = 'success')::int as total_transactions,
        AVG(amount) FILTER (WHERE status = 'success') as average_transaction_value
      FROM payments
      ${dateFilter}
    `);

    return result[0];
  }

  /**
   * Get total members
   */
  async getTotalMembers() {
    const result = await prisma.$queryRaw<any[]>`
      SELECT 
        COUNT(*)::int as total_members,
        COUNT(*) FILTER (WHERE status = 'active')::int as active_members,
        COUNT(*) FILTER (WHERE status = 'inactive')::int as inactive_members,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days')::int as new_members_30d,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days')::int as new_members_7d
      FROM members
    `;

    return result[0];
  }

  /**
   * Get all gyms with metrics
   */
  async getAllGymsWithMetrics() {
    const gyms = await prisma.$queryRaw<any[]>`
      SELECT 
        g.id,
        g.name,
        g.email,
        g.phone,
        g.city,
        g.status,
        g.subscription_plan,
        g.created_at,
        COUNT(DISTINCT m.id)::int as total_members,
        COUNT(DISTINCT b.id)::int as total_branches,
        COALESCE(SUM(p.amount) FILTER (WHERE p.status = 'success'), 0) as total_revenue
      FROM gyms g
      LEFT JOIN members m ON g.id = m.gym_id
      LEFT JOIN branches b ON g.id = b.gym_id
      LEFT JOIN payments p ON g.id = p.gym_id
      GROUP BY g.id
      ORDER BY g.created_at DESC
    `;

    return gyms;
  }

  /**
   * Private: Get revenue report
   */
  private async getRevenueReport(dateFilter: string) {
    return prisma.$queryRawUnsafe<any[]>(`
      SELECT 
        DATE(created_at) as date,
        SUM(amount) FILTER (WHERE status = 'success') as revenue,
        COUNT(*) FILTER (WHERE status = 'success')::int as transactions
      FROM payments
      ${dateFilter}
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);
  }

  /**
   * Private: Get membership report
   */
  private async getMembershipReport(dateFilter: string) {
    return prisma.$queryRawUnsafe<any[]>(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*)::int as new_members,
        COUNT(*) FILTER (WHERE status = 'active')::int as active_members
      FROM members
      ${dateFilter}
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);
  }

  /**
   * Private: Get growth report
   */
  private async getGrowthReport(dateFilter: string) {
    return prisma.$queryRawUnsafe<any[]>(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*)::int as new_gyms
      FROM gyms
      ${dateFilter}
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);
  }
}

export const platformService = new PlatformService();
