import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const referralService = {
  async getReferrals(filters: any) {
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters.referrer_id) where.referrer_id = filters.referrer_id;
    if (filters.status) where.status = filters.status;

    const [referrals, total] = await Promise.all([
      prisma.referrals.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          profiles_referrals_referrer_idToprofiles: true,
          profiles_referrals_referred_member_idToprofiles: true
        }
      }),
      prisma.referrals.count({ where })
    ]);

    return { referrals, total, page, limit };
  },

  async getReferralById(id: string) {
    return await prisma.referrals.findUnique({
      where: { id },
      include: {
        profiles_referrals_referrer_idToprofiles: true,
        profiles_referrals_referred_member_idToprofiles: true
      }
    });
  },

  async createReferral(data: any) {
    return await prisma.referrals.create({ data });
  },

  async updateReferral(id: string, data: any) {
    return await prisma.referrals.update({ where: { id }, data });
  },

  async getRewards(userId?: string) {
    const where: any = {};
    if (userId) where.user_id = userId;
    return await prisma.rewards.findMany({
      where,
      orderBy: { created_at: 'desc' },
      include: { profiles: true }
    });
  },

  async getRewardById(id: string) {
    return await prisma.rewards.findUnique({
      where: { id },
      include: { profiles: true }
    });
  },

  async createReward(data: any) {
    return await prisma.rewards.create({ data });
  },

  async updateReward(id: string, data: any) {
    return await prisma.rewards.update({ where: { id }, data });
  }
};
