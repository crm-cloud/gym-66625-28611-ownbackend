import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AnalyticsService {
  async getDashboardStats(
    gymId?: string, 
    branchId?: string, 
    startDate?: Date, 
    endDate?: Date,
    userRole?: string
  ) {
    // Super admin gets platform-wide stats
    if (userRole === 'super_admin' && !gymId && !branchId) {
      return await this.getPlatformDashboardStats(startDate, endDate);
    }

    const where: any = {};
    
    if (branchId) {
      where.branch_id = branchId;
    } else if (gymId) {
      where.branches = { gym_id: gymId };
    }

    if (startDate || endDate) {
      where.created_at = {};
      if (startDate) where.created_at.gte = startDate;
      if (endDate) where.created_at.lte = endDate;
    }

    // Get member counts
    const totalMembers = await prisma.members.count({ where });
    const activeMembers = await prisma.members.count({
      where: {
        ...where,
        status: 'active'
      }
    });

    // Get revenue
    const transactions = await prisma.transactions.aggregate({
      where: {
        ...where,
        status: 'success'
      },
      _sum: {
        amount: true
      }
    });

    // Get class attendance
    const attendance = await prisma.attendance.count({
      where: {
        ...where,
        status: 'present'
      }
    });

    const totalClasses = await prisma.gym_classes.count({ where });
    const classAttendanceRate = totalClasses > 0 ? (attendance / totalClasses) * 100 : 0;

    // Calculate retention (members who stayed vs churned)
    const churnedMembers = await prisma.members.count({
      where: {
        ...where,
        status: 'inactive'
      }
    });
    const memberRetention = totalMembers > 0 ? ((totalMembers - churnedMembers) / totalMembers) * 100 : 0;

    return {
      totalMembers,
      activeMembers,
      monthlyRevenue: transactions._sum.amount || 0,
      classAttendance: Math.round(classAttendanceRate),
      memberRetention: Math.round(memberRetention * 10) / 10,
      growthRate: 3.3 // TODO: Calculate actual growth
    };
  }

  async getRevenueAnalytics(gymId?: string, branchId?: string, startDate?: Date, endDate?: Date) {
    const where: any = {
      status: 'success'
    };

    if (branchId) where.branch_id = branchId;
    if (startDate || endDate) {
      where.created_at = {};
      if (startDate) where.created_at.gte = startDate;
      if (endDate) where.created_at.lte = endDate;
    }

    const transactions = await prisma.transactions.findMany({
      where,
      select: {
        amount: true,
        transaction_type: true,
        created_at: true
      },
      orderBy: {
        created_at: 'asc'
      }
    });

    // Group by month
    const monthlyRevenue = transactions.reduce((acc: any, t) => {
      const month = new Date(t.created_at).toLocaleDateString('en-US', { month: 'short' });
      if (!acc[month]) {
        acc[month] = { month, membership: 0, personal: 0, retail: 0, total: 0 };
      }

      const amount = Number(t.amount);
      if (t.transaction_type === 'membership_fee') {
        acc[month].membership += amount;
      } else if (t.transaction_type === 'trainer_package') {
        acc[month].personal += amount;
      } else {
        acc[month].retail += amount;
      }
      acc[month].total += amount;

      return acc;
    }, {});

    return Object.values(monthlyRevenue);
  }

  async getMembershipAnalytics(gymId?: string, branchId?: string, startDate?: Date, endDate?: Date) {
    const where: any = {};
    if (branchId) where.branch_id = branchId;
    if (startDate || endDate) {
      where.created_at = {};
      if (startDate) where.created_at.gte = startDate;
      if (endDate) where.created_at.lte = endDate;
    }

    const members = await prisma.members.findMany({
      where,
      select: {
        status: true,
        created_at: true
      },
      orderBy: {
        created_at: 'asc'
      }
    });

    // Group by month
    const monthlyStats = members.reduce((acc: any, m) => {
      const month = new Date(m.created_at).toLocaleDateString('en-US', { month: 'short' });
      if (!acc[month]) {
        acc[month] = { month, active: 0, new: 0, churned: 0, retention: 0 };
      }

      acc[month].new += 1;
      if (m.status === 'active') {
        acc[month].active += 1;
      } else {
        acc[month].churned += 1;
      }

      return acc;
    }, {});

    // Calculate retention
    Object.keys(monthlyStats).forEach(month => {
      const total = monthlyStats[month].active + monthlyStats[month].churned;
      monthlyStats[month].retention = total > 0 ? (monthlyStats[month].active / total) * 100 : 0;
    });

    return Object.values(monthlyStats);
  }

  async getAttendanceAnalytics(gymId?: string, branchId?: string, startDate?: Date, endDate?: Date) {
    const where: any = {
      status: 'present'
    };

    if (branchId) where.branch_id = branchId;
    if (startDate || endDate) {
      where.check_in_time = {};
      if (startDate) where.check_in_time.gte = startDate;
      if (endDate) where.check_in_time.lte = endDate;
    }

    const attendance = await prisma.attendance.findMany({
      where,
      select: {
        check_in_time: true
      },
      orderBy: {
        check_in_time: 'asc'
      }
    });

    // Group by date and find peak hours
    const dailyStats = attendance.reduce((acc: any, a) => {
      const date = new Date(a.check_in_time).toLocaleDateString();
      const hour = new Date(a.check_in_time).getHours();

      if (!acc[date]) {
        acc[date] = { date, checkins: 0, classAttendance: 0, peakHour: '', hourCounts: {} };
      }

      acc[date].checkins += 1;
      acc[date].hourCounts[hour] = (acc[date].hourCounts[hour] || 0) + 1;

      return acc;
    }, {});

    // Calculate peak hour for each day
    Object.keys(dailyStats).forEach(date => {
      const hourCounts = dailyStats[date].hourCounts;
      const peakHour = Object.keys(hourCounts).reduce((a, b) => 
        hourCounts[a] > hourCounts[b] ? a : b
      );
      dailyStats[date].peakHour = `${peakHour}:00`;
      delete dailyStats[date].hourCounts;
    });

    return Object.values(dailyStats);
  }

  async getClassPopularity(gymId?: string, branchId?: string, startDate?: Date, endDate?: Date) {
    const where: any = {};
    if (branchId) where.branch_id = branchId;
    if (startDate || endDate) {
      where.start_time = {};
      if (startDate) where.start_time.gte = startDate;
      if (endDate) where.start_time.lte = endDate;
    }

    const classes = await prisma.gym_classes.findMany({
      where,
      include: {
        class_enrollments: true
      }
    });

    // Group by class type
    const classStats = classes.reduce((acc: any, c) => {
      const type = c.class_type || 'Other';
      if (!acc[type]) {
        acc[type] = { name: type, value: 0, attendance: 0, cancelled: 0, total: 0 };
      }

      acc[type].total += 1;
      acc[type].attendance += c.class_enrollments.length;
      if (c.status === 'cancelled') {
        acc[type].cancelled += 1;
      }

      return acc;
    }, {});

    // Calculate percentages and cancellation rates
    const totalClasses = classes.length;
    Object.keys(classStats).forEach(type => {
      classStats[type].value = totalClasses > 0 ? (classStats[type].total / totalClasses) * 100 : 0;
      classStats[type].cancellationRate = classStats[type].total > 0 
        ? (classStats[type].cancelled / classStats[type].total) * 100 
        : 0;
      delete classStats[type].cancelled;
      delete classStats[type].total;
    });

    return Object.values(classStats);
  }

  /**
   * Get platform-wide dashboard stats for super admin
   */
  private async getPlatformDashboardStats(startDate?: Date, endDate?: Date) {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const dateFilter = startDate || thirtyDaysAgo;

    const [
      totalGyms,
      activeGyms,
      totalBranches,
      totalMembers,
      activeMembers,
      totalTrainers,
      revenueResult
    ] = await Promise.all([
      prisma.gyms.count(),
      prisma.gyms.count({ where: { is_active: true } }),
      prisma.branches.count(),
      prisma.members.count(),
      prisma.members.count({ where: { status: 'active' } }),
      prisma.profiles.count({ where: { role: 'trainer', is_active: true } }),
      prisma.payments.aggregate({
        where: { 
          status: 'success',
          created_at: { gte: dateFilter }
        },
        _sum: { amount: true }
      })
    ]);

    // Get recent gyms for display
    const recentGyms = await prisma.gyms.findMany({
      take: 5,
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        name: true,
        subscription_plan: true,
        created_at: true,
        _count: {
          select: {
            branches: true,
            members: true
          }
        }
      }
    });

    return {
      totalMembers,
      activeMembers,
      totalRevenue: revenueResult._sum.amount || 0,
      monthlyRevenue: revenueResult._sum.amount || 0,
      totalGyms,
      activeGyms,
      totalBranches,
      totalTrainers,
      recentGyms: recentGyms.map(gym => ({
        ...gym,
        branch_count: gym._count.branches,
        member_count: gym._count.members
      })),
      growthRate: 0, // Calculate if needed
      memberRetention: 0, // Calculate if needed
      classAttendance: 0 // Calculate if needed
    };
  }
}

export const analyticsService = new AnalyticsService();
