import prisma from '../config/database';
import { AddCreditsInput, DeductCreditsInput, CreditsQueryInput } from '../validation/member-credits.validation';

export class MemberCreditsService {
  /**
   * Get member's credit balance
   */
  async getBalance(memberId: string) {
    let credits = await prisma.member_credits.findUnique({
      where: { member_id: memberId },
      include: {
        member: {
          select: {
            id: true,
            full_name: true,
            email: true
          }
        }
      }
    });

    // Create credits record if it doesn't exist
    if (!credits) {
      credits = await prisma.member_credits.create({
        data: {
          member_id: memberId,
          balance: 0
        },
        include: {
          member: {
            select: {
              id: true,
              full_name: true,
              email: true
            }
          }
        }
      });
    }

    return credits;
  }

  /**
   * Add credits to member's account
   */
  async addCredits(memberId: string, data: AddCreditsInput, createdBy: string) {
    const result = await prisma.$transaction(async (tx) => {
      // Get or create credits record
      let credits = await tx.member_credits.findUnique({
        where: { member_id: memberId }
      });

      if (!credits) {
        credits = await tx.member_credits.create({
          data: {
            member_id: memberId,
            balance: 0
          }
        });
      }

      // Update balance
      const updatedCredits = await tx.member_credits.update({
        where: { member_id: memberId },
        data: {
          balance: { increment: data.amount }
        }
      });

      // Create transaction record
      const transaction = await tx.credit_transactions.create({
        data: {
          member_id: memberId,
          amount: data.amount,
          transaction_type: data.transaction_type,
          balance_after: updatedCredits.balance,
          reference_id: data.reference_id,
          notes: data.notes,
          created_by: createdBy
        }
      });

      return { credits: updatedCredits, transaction };
    });

    return result;
  }

  /**
   * Deduct credits from member's account
   */
  async deductCredits(memberId: string, data: DeductCreditsInput, createdBy: string) {
    const credits = await prisma.member_credits.findUnique({
      where: { member_id: memberId }
    });

    if (!credits) {
      throw new Error('Member has no credits account');
    }

    if (credits.balance < data.amount) {
      throw new Error(`Insufficient credits. Available: ${credits.balance}, Required: ${data.amount}`);
    }

    const result = await prisma.$transaction(async (tx) => {
      // Update balance
      const updatedCredits = await tx.member_credits.update({
        where: { member_id: memberId },
        data: {
          balance: { decrement: data.amount }
        }
      });

      // Create transaction record
      const transaction = await tx.credit_transactions.create({
        data: {
          member_id: memberId,
          amount: -data.amount,
          transaction_type: data.transaction_type,
          balance_after: updatedCredits.balance,
          reference_id: data.reference_id,
          notes: data.notes,
          created_by: createdBy
        }
      });

      return { credits: updatedCredits, transaction };
    });

    return result;
  }

  /**
   * Get transaction history
   */
  async getTransactions(query: CreditsQueryInput) {
    const { member_id, transaction_type, from_date, to_date, page = 1, limit = 50 } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (member_id) where.member_id = member_id;
    if (transaction_type) where.transaction_type = transaction_type;
    if (from_date || to_date) {
      where.created_at = {};
      if (from_date) where.created_at.gte = new Date(from_date);
      if (to_date) where.created_at.lte = new Date(to_date);
    }

    const [transactions, total] = await Promise.all([
      prisma.credit_transactions.findMany({
        where,
        include: {
          member: {
            select: {
              id: true,
              full_name: true,
              email: true
            }
          }
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit
      }),
      prisma.credit_transactions.count({ where })
    ]);

    return {
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get credits summary for branch or all
   */
  async getCreditsSummary(branchId?: string) {
    const where: any = {};
    if (branchId) {
      where.member = { branch_id: branchId };
    }

    const [totalCredits, totalMembers, recentTransactions] = await Promise.all([
      prisma.member_credits.aggregate({
        where,
        _sum: { balance: true }
      }),
      prisma.member_credits.count({ where }),
      prisma.credit_transactions.count({
        where: {
          created_at: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          },
          ...(branchId ? { member: { branch_id: branchId } } : {})
        }
      })
    ]);

    return {
      total_credits: totalCredits._sum.balance || 0,
      total_members: totalMembers,
      recent_transactions: recentTransactions
    };
  }
}

export const memberCreditsService = new MemberCreditsService();
