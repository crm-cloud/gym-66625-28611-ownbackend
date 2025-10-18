import prisma from '../config/database';
import { ApiError } from '../middleware/errorHandler';
import { 
  CreateTrainerChangeInput, 
  ReviewChangeRequestInput,
  ChangeRequestQueryInput 
} from '../validation/trainer-change.validation';

export class TrainerChangeService {
  /**
   * Create trainer change request
   */
  async createChangeRequest(data: CreateTrainerChangeInput) {
    const { member_id, current_trainer_id, requested_trainer_id, reason, description, urgency } = data;

    // Verify member exists
    const member = await prisma.members.findUnique({
      where: { id: member_id }
    });

    if (!member) {
      throw new ApiError('Member not found', 404);
    }

    // Verify current trainer exists
    const trainer = await prisma.$queryRaw<any[]>`
      SELECT id FROM trainers WHERE id = ${current_trainer_id}::uuid LIMIT 1
    `;

    if (!trainer || trainer.length === 0) {
      throw new ApiError('Current trainer not found', 404);
    }

    // If requested trainer specified, verify it exists
    if (requested_trainer_id) {
      const requestedTrainer = await prisma.$queryRaw<any[]>`
        SELECT id FROM trainers WHERE id = ${requested_trainer_id}::uuid LIMIT 1
      `;

      if (!requestedTrainer || requestedTrainer.length === 0) {
        throw new ApiError('Requested trainer not found', 404);
      }
    }

    // Check for existing pending requests
    const existing = await prisma.$queryRaw<any[]>`
      SELECT id FROM trainer_change_requests
      WHERE member_id = ${member_id}::uuid 
        AND current_trainer_id = ${current_trainer_id}::uuid
        AND status = 'pending'
      LIMIT 1
    `;

    if (existing && existing.length > 0) {
      throw new ApiError('You already have a pending change request for this trainer', 400);
    }

    // Create request
    const requestId = crypto.randomUUID();
    await prisma.$executeRaw`
      INSERT INTO trainer_change_requests (
        id, member_id, current_trainer_id, requested_trainer_id,
        reason, description, urgency, status
      )
      VALUES (
        ${requestId}::uuid, ${member_id}::uuid, ${current_trainer_id}::uuid, ${requested_trainer_id || null}::uuid,
        ${reason}, ${description}, ${urgency}, 'pending'
      )
    `;

    return await this.getChangeRequestById(requestId);
  }

  /**
   * Get change requests with filters
   */
  async getChangeRequests(query: ChangeRequestQueryInput) {
    const { member_id, current_trainer_id, status, urgency, page = 1, limit = 50 } = query;

    let whereConditions: string[] = [];
    if (member_id) whereConditions.push(`tcr.member_id = '${member_id}'::uuid`);
    if (current_trainer_id) whereConditions.push(`tcr.current_trainer_id = '${current_trainer_id}'::uuid`);
    if (status) whereConditions.push(`tcr.status = '${status}'`);
    if (urgency) whereConditions.push(`tcr.urgency = '${urgency}'`);

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    const offset = (page - 1) * limit;

    const [requests, totalResult] = await Promise.all([
      prisma.$queryRawUnsafe(`
        SELECT 
          tcr.*,
          ct.full_name as current_trainer_name,
          rt.full_name as requested_trainer_name,
          nt.full_name as new_trainer_name,
          m.name as member_name,
          EXTRACT(days FROM (NOW() - tcr.created_at))::int as days_pending
        FROM trainer_change_requests tcr
        LEFT JOIN trainers ct ON tcr.current_trainer_id = ct.id
        LEFT JOIN trainers rt ON tcr.requested_trainer_id = rt.id
        LEFT JOIN trainers nt ON tcr.new_trainer_id = nt.id
        LEFT JOIN members m ON tcr.member_id = m.id
        ${whereClause}
        ORDER BY 
          CASE tcr.urgency 
            WHEN 'high' THEN 1 
            WHEN 'medium' THEN 2 
            WHEN 'low' THEN 3 
          END,
          tcr.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `),
      prisma.$queryRawUnsafe<any[]>(`
        SELECT COUNT(*)::int as total FROM trainer_change_requests tcr ${whereClause}
      `)
    ]);

    return {
      data: requests,
      pagination: {
        page,
        limit,
        total: totalResult[0].total,
        totalPages: Math.ceil(totalResult[0].total / limit)
      }
    };
  }

  /**
   * Get change request by ID
   */
  async getChangeRequestById(id: string) {
    const request = await prisma.$queryRaw<any[]>`
      SELECT 
        tcr.*,
        ct.full_name as current_trainer_name,
        rt.full_name as requested_trainer_name,
        nt.full_name as new_trainer_name,
        m.name as member_name,
        m.email as member_email
      FROM trainer_change_requests tcr
      LEFT JOIN trainers ct ON tcr.current_trainer_id = ct.id
      LEFT JOIN trainers rt ON tcr.requested_trainer_id = rt.id
      LEFT JOIN trainers nt ON tcr.new_trainer_id = nt.id
      LEFT JOIN members m ON tcr.member_id = m.id
      WHERE tcr.id = ${id}::uuid
      LIMIT 1
    `;

    if (!request || request.length === 0) {
      throw new ApiError('Change request not found', 404);
    }

    return request[0];
  }

  /**
   * Review change request (approve/reject)
   */
  async reviewChangeRequest(id: string, data: ReviewChangeRequestInput, reviewedBy: string) {
    const request = await this.getChangeRequestById(id);

    if (request.status !== 'pending') {
      throw new ApiError('Only pending requests can be reviewed', 400);
    }

    const { status, review_notes, new_trainer_id } = data;

    if (status === 'approved') {
      // If approved, assign new trainer
      const trainerId = new_trainer_id || request.requested_trainer_id;

      if (!trainerId) {
        throw new ApiError('New trainer ID is required for approval', 400);
      }

      // Update member's assigned trainer
      await prisma.members.update({
        where: { id: request.member_id },
        data: { assigned_trainer_id: trainerId }
      });

      // Update request
      await prisma.$executeRaw`
        UPDATE trainer_change_requests
        SET 
          status = 'approved',
          reviewed_by = ${reviewedBy}::uuid,
          reviewed_at = NOW(),
          review_notes = ${review_notes || null},
          new_trainer_id = ${trainerId}::uuid,
          reassignment_date = NOW(),
          updated_at = NOW()
        WHERE id = ${id}::uuid
      `;
    } else {
      // Reject
      await prisma.$executeRaw`
        UPDATE trainer_change_requests
        SET 
          status = 'rejected',
          reviewed_by = ${reviewedBy}::uuid,
          reviewed_at = NOW(),
          review_notes = ${review_notes || null},
          updated_at = NOW()
        WHERE id = ${id}::uuid
      `;
    }

    return await this.getChangeRequestById(id);
  }

  /**
   * Get change request statistics
   */
  async getChangeRequestStats() {
    const stats = await prisma.$queryRaw`
      SELECT 
        COUNT(*)::int as total,
        COUNT(*) FILTER (WHERE status = 'pending')::int as pending,
        COUNT(*) FILTER (WHERE status = 'approved')::int as approved,
        COUNT(*) FILTER (WHERE status = 'rejected')::int as rejected,
        COUNT(*) FILTER (WHERE urgency = 'high' AND status = 'pending')::int as high_priority_pending
      FROM trainer_change_requests
    `;

    return stats;
  }
}

export const trainerChangeService = new TrainerChangeService();
