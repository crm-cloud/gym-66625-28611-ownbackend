import prisma from '../config/database';
import { RequestFreezeInput, UpdateFreezeRequestInput, FreezeQueryInput } from '../validation/membership-freeze.validation';

export class MembershipFreezeService {
  /**
   * Request membership freeze
   */
  async requestFreeze(data: RequestFreezeInput, createdBy: string) {
    // Verify member exists
    const member = await prisma.members.findUnique({
      where: { id: data.member_id },
      include: {
        branch: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!member) {
      throw new Error('Member not found');
    }

    // Check for overlapping freeze requests
    const existingRequest = await prisma.membership_freeze_requests.findFirst({
      where: {
        member_id: data.member_id,
        status: { in: ['pending', 'approved'] },
        OR: [
          {
            freeze_from: { lte: new Date(data.freeze_to) },
            freeze_to: { gte: new Date(data.freeze_from) }
          }
        ]
      }
    });

    if (existingRequest) {
      throw new Error('Member already has an active or pending freeze request for this period');
    }

    const freezeRequest = await prisma.membership_freeze_requests.create({
      data: {
        member_id: data.member_id,
        freeze_from: new Date(data.freeze_from),
        freeze_to: new Date(data.freeze_to),
        reason: data.reason,
        notes: data.notes,
        status: 'pending',
        created_by: createdBy
      },
      include: {
        member: {
          select: {
            id: true,
            full_name: true,
            email: true,
            branch_id: true
          }
        }
      }
    });

    return freezeRequest;
  }

  /**
   * Get freeze requests
   */
  async getFreezeRequests(query: FreezeQueryInput) {
    const { member_id, branch_id, status, from_date, to_date, page = 1, limit = 50 } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (member_id) where.member_id = member_id;
    if (status) where.status = status;
    if (branch_id) {
      where.member = { branch_id };
    }
    if (from_date || to_date) {
      where.freeze_from = {};
      if (from_date) where.freeze_from.gte = new Date(from_date);
      if (to_date) where.freeze_from.lte = new Date(to_date);
    }

    const [requests, total] = await Promise.all([
      prisma.membership_freeze_requests.findMany({
        where,
        include: {
          member: {
            select: {
              id: true,
              full_name: true,
              email: true,
              branch_id: true
            }
          }
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit
      }),
      prisma.membership_freeze_requests.count({ where })
    ]);

    return {
      requests,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get single freeze request
   */
  async getFreezeRequest(requestId: string) {
    const request = await prisma.membership_freeze_requests.findUnique({
      where: { id: requestId },
      include: {
        member: {
          select: {
            id: true,
            full_name: true,
            email: true,
            phone: true,
            branch_id: true
          }
        }
      }
    });

    if (!request) {
      throw new Error('Freeze request not found');
    }

    return request;
  }

  /**
   * Update freeze request (approve/reject)
   */
  async updateFreezeRequest(requestId: string, data: UpdateFreezeRequestInput, updatedBy: string) {
    const existingRequest = await prisma.membership_freeze_requests.findUnique({
      where: { id: requestId },
      include: { member: true }
    });

    if (!existingRequest) {
      throw new Error('Freeze request not found');
    }

    if (existingRequest.status !== 'pending') {
      throw new Error(`Cannot update freeze request with status: ${existingRequest.status}`);
    }

    const result = await prisma.$transaction(async (tx) => {
      // Update freeze request
      const updatedRequest = await tx.membership_freeze_requests.update({
        where: { id: requestId },
        data: {
          status: data.status,
          admin_notes: data.admin_notes,
          fee_amount: data.fee_amount,
          processed_at: data.status === 'approved' || data.status === 'rejected' ? new Date() : null,
          processed_by: data.status === 'approved' || data.status === 'rejected' ? updatedBy : null
        },
        include: {
          member: true
        }
      });

      // If approved, update member's subscription
      if (data.status === 'approved') {
        const freezeDays = Math.ceil(
          (new Date(existingRequest.freeze_to).getTime() - new Date(existingRequest.freeze_from).getTime()) / (1000 * 60 * 60 * 24)
        );

        // Find active subscription and extend it
        const activeSubscription = await tx.subscriptions.findFirst({
          where: {
            member_id: existingRequest.member_id,
            status: 'active'
          }
        });

        if (activeSubscription && activeSubscription.end_date) {
          await tx.subscriptions.update({
            where: { id: activeSubscription.id },
            data: {
              end_date: new Date(new Date(activeSubscription.end_date).getTime() + freezeDays * 24 * 60 * 60 * 1000),
              status: 'frozen'
            }
          });
        }
      }

      return updatedRequest;
    });

    return result;
  }

  /**
   * Cancel freeze request
   */
  async cancelFreezeRequest(requestId: string, memberId: string) {
    const request = await prisma.membership_freeze_requests.findUnique({
      where: { id: requestId }
    });

    if (!request) {
      throw new Error('Freeze request not found');
    }

    if (request.member_id !== memberId) {
      throw new Error('Unauthorized to cancel this request');
    }

    if (request.status !== 'pending') {
      throw new Error(`Cannot cancel freeze request with status: ${request.status}`);
    }

    const cancelled = await prisma.membership_freeze_requests.update({
      where: { id: requestId },
      data: { status: 'cancelled' }
    });

    return cancelled;
  }

  /**
   * Get freeze statistics
   */
  async getFreezeStats(branchId?: string) {
    const where: any = {};
    if (branchId) {
      where.member = { branch_id: branchId };
    }

    const [totalRequests, pending, approved, rejected] = await Promise.all([
      prisma.membership_freeze_requests.count({ where }),
      prisma.membership_freeze_requests.count({ where: { ...where, status: 'pending' } }),
      prisma.membership_freeze_requests.count({ where: { ...where, status: 'approved' } }),
      prisma.membership_freeze_requests.count({ where: { ...where, status: 'rejected' } })
    ]);

    return {
      total_requests: totalRequests,
      pending,
      approved,
      rejected
    };
  }
}

export const membershipFreezeService = new MembershipFreezeService();
