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
  },

  // Referral Bonuses
  async getReferralBonuses(filters: any) {
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 50;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters.referral_id) where.referral_id = filters.referral_id;
    if (filters.user_id) where.user_id = filters.user_id;
    if (filters.status) where.status = filters.status;

    const [bonuses, total] = await Promise.all([
      prisma.referral_bonuses.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          referrals: true,
          profiles: true
        }
      }),
      prisma.referral_bonuses.count({ where })
    ]);

    return { bonuses, total, page, limit };
  },

  async processReferralBonus(referralId: string, amount: number, bonusType: string) {
    const referral = await prisma.referrals.findUnique({
      where: { id: referralId }
    });

    if (!referral) {
      throw new Error('Referral not found');
    }

    if (referral.status !== 'active') {
      throw new Error('Referral must be active to process bonus');
    }

    const bonus = await prisma.referral_bonuses.create({
      data: {
        referral_id: referralId,
        user_id: referral.referrer_id,
        bonus_type: bonusType,
        amount,
        status: 'pending',
        earned_date: new Date()
      }
    });

    return bonus;
  },

  async approveBonus(bonusId: string) {
    return await prisma.referral_bonuses.update({
      where: { id: bonusId },
      data: { 
        status: 'approved',
        paid_date: new Date()
      }
    });
  },

  async rejectBonus(bonusId: string, reason?: string) {
    return await prisma.referral_bonuses.update({
      where: { id: bonusId },
      data: { 
        status: 'rejected',
        notes: reason
      }
    });
  }
};
