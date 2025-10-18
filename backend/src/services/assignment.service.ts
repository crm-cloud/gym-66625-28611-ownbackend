import prisma from '../config/database';
import { ApiError } from '../middleware/errorHandler';
import { 
  CreateAssignmentInput, 
  UpdateAssignmentInput,
  CompleteAssignmentInput,
  AssignmentQueryInput,
  AutoAssignmentInput
} from '../validation/assignment.validation';

export class AssignmentService {
  /**
   * Create trainer assignment
   */
  async createAssignment(data: CreateAssignmentInput, createdBy: string) {
    const { trainer_id, member_id, session_type, package_id, scheduled_date, duration, session_specialty, notes, amount, payment_method, assigned_by } = data;

    // Verify trainer exists
    const trainer = await prisma.$queryRaw<any[]>`
      SELECT id, status FROM trainers WHERE id = ${trainer_id}::uuid LIMIT 1
    `;

    if (!trainer || trainer.length === 0) {
      throw new ApiError('Trainer not found', 404);
    }

    if (trainer[0].status !== 'active') {
      throw new ApiError('Trainer is not active', 400);
    }

    // Verify member exists
    const member = await prisma.members.findUnique({
      where: { id: member_id }
    });

    if (!member) {
      throw new ApiError('Member not found', 404);
    }

    // If package session, verify package exists and has remaining sessions
    if (session_type === 'package' && package_id) {
      const pkg = await prisma.$queryRaw<any[]>`
        SELECT sessions_total, sessions_used, status FROM training_packages 
        WHERE id = ${package_id}::uuid LIMIT 1
      `;

      if (!pkg || pkg.length === 0) {
        throw new ApiError('Training package not found', 404);
      }

      if (pkg[0].status !== 'active') {
        throw new ApiError('Training package is not active', 400);
      }

      if (pkg[0].sessions_used >= pkg[0].sessions_total) {
        throw new ApiError('No remaining sessions in package', 400);
      }
    }

    // Create assignment
    const assignmentId = crypto.randomUUID();
    await prisma.$executeRaw`
      INSERT INTO trainer_assignments (
        id, trainer_id, member_id, session_type, package_id,
        scheduled_date, duration, session_specialty, notes,
        status, is_paid, amount, payment_method, assigned_by
      )
      VALUES (
        ${assignmentId}::uuid, ${trainer_id}::uuid, ${member_id}::uuid, ${session_type}, ${package_id || null}::uuid,
        ${new Date(scheduled_date)}, ${duration}, ${session_specialty}, ${notes || null},
        'scheduled', false, ${amount}, ${payment_method || null}, ${assigned_by}
      )
    `;

    return await this.getAssignmentById(assignmentId);
  }

  /**
   * Get assignments with filters
   */
  async getAssignments(query: AssignmentQueryInput) {
    const { trainer_id, member_id, status, from_date, to_date, session_type, page = 1, limit = 50 } = query;

    let whereConditions: string[] = [];
    if (trainer_id) whereConditions.push(`trainer_id = '${trainer_id}'::uuid`);
    if (member_id) whereConditions.push(`member_id = '${member_id}'::uuid`);
    if (status) whereConditions.push(`status = '${status}'`);
    if (session_type) whereConditions.push(`session_type = '${session_type}'`);
    if (from_date) whereConditions.push(`scheduled_date >= '${from_date}'::timestamptz`);
    if (to_date) whereConditions.push(`scheduled_date <= '${to_date}'::timestamptz`);

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    const offset = (page - 1) * limit;

    const [assignments, totalResult] = await Promise.all([
      prisma.$queryRawUnsafe(`
        SELECT 
          ta.*,
          t.full_name as trainer_name,
          m.name as member_name
        FROM trainer_assignments ta
        LEFT JOIN trainers t ON ta.trainer_id = t.id
        LEFT JOIN members m ON ta.member_id = m.id
        ${whereClause}
        ORDER BY ta.scheduled_date DESC
        LIMIT ${limit} OFFSET ${offset}
      `),
      prisma.$queryRawUnsafe<any[]>(`
        SELECT COUNT(*)::int as total FROM trainer_assignments ${whereClause}
      `)
    ]);

    return {
      data: assignments,
      pagination: {
        page,
        limit,
        total: totalResult[0].total,
        totalPages: Math.ceil(totalResult[0].total / limit)
      }
    };
  }

  /**
   * Get assignment by ID
   */
  async getAssignmentById(id: string) {
    const assignment = await prisma.$queryRaw<any[]>`
      SELECT 
        ta.*,
        t.full_name as trainer_name,
        t.hourly_rate as trainer_rate,
        m.name as member_name,
        m.email as member_email
      FROM trainer_assignments ta
      LEFT JOIN trainers t ON ta.trainer_id = t.id
      LEFT JOIN members m ON ta.member_id = m.id
      WHERE ta.id = ${id}::uuid
      LIMIT 1
    `;

    if (!assignment || assignment.length === 0) {
      throw new ApiError('Assignment not found', 404);
    }

    return assignment[0];
  }

  /**
   * Update assignment
   */
  async updateAssignment(id: string, data: UpdateAssignmentInput) {
    await this.getAssignmentById(id);

    const updates: string[] = [];
    if (data.scheduled_date) updates.push(`scheduled_date = '${new Date(data.scheduled_date)}'::timestamptz`);
    if (data.duration) updates.push(`duration = ${data.duration}`);
    if (data.notes !== undefined) updates.push(`notes = ${data.notes ? `'${data.notes}'` : 'NULL'}`);
    if (data.status) updates.push(`status = '${data.status}'`);
    if (data.trainer_notes !== undefined) updates.push(`trainer_notes = ${data.trainer_notes ? `'${data.trainer_notes}'` : 'NULL'}`);
    updates.push(`updated_at = NOW()`);

    if (updates.length > 0) {
      await prisma.$executeRawUnsafe(`
        UPDATE trainer_assignments 
        SET ${updates.join(', ')}
        WHERE id = '${id}'::uuid
      `);
    }

    return await this.getAssignmentById(id);
  }

  /**
   * Complete assignment
   */
  async completeAssignment(id: string, data: CompleteAssignmentInput) {
    const assignment = await this.getAssignmentById(id);

    if (assignment.status === 'completed') {
      throw new ApiError('Assignment already completed', 400);
    }

    await prisma.$executeRaw`
      UPDATE trainer_assignments 
      SET 
        status = 'completed',
        completed_at = NOW(),
        trainer_notes = ${data.trainer_notes || null},
        member_rating = ${data.member_rating || null}::int,
        member_feedback = ${data.member_feedback || null},
        updated_at = NOW()
      WHERE id = ${id}::uuid
    `;

    return await this.getAssignmentById(id);
  }

  /**
   * Cancel assignment
   */
  async cancelAssignment(id: string, reason?: string) {
    await this.getAssignmentById(id);

    await prisma.$executeRaw`
      UPDATE trainer_assignments 
      SET 
        status = 'cancelled',
        notes = ${reason || null},
        updated_at = NOW()
      WHERE id = ${id}::uuid
    `;

    return { message: 'Assignment cancelled successfully' };
  }

  /**
   * Auto-assign trainer
   */
  async autoAssignTrainer(data: AutoAssignmentInput) {
    const { member_id, session_specialty, scheduled_date, duration, preferences } = data;

    // Find best matching trainer based on preferences
    let conditions: string[] = [
      `status = 'active'`,
      `'${session_specialty}' = ANY(specialties)` // Trainer has the required specialty
    ];

    if (preferences?.min_rating) {
      conditions.push(`rating >= ${preferences.min_rating}`);
    }

    if (preferences?.max_hourly_rate) {
      conditions.push(`hourly_rate <= ${preferences.max_hourly_rate}`);
    }

    const whereClause = conditions.join(' AND ');

    const trainers = await prisma.$queryRawUnsafe<any[]>(`
      SELECT id, full_name, hourly_rate, rating
      FROM trainers
      WHERE ${whereClause}
      ORDER BY rating DESC, total_sessions ASC
      LIMIT 5
    `);

    if (!trainers || trainers.length === 0) {
      throw new ApiError('No matching trainers found', 404);
    }

    // Select first trainer (highest rated, least busy)
    const selectedTrainer = trainers[0];

    // Create assignment
    return await this.createAssignment({
      trainer_id: selectedTrainer.id,
      member_id,
      session_type: 'single',
      scheduled_date,
      duration,
      session_specialty,
      amount: selectedTrainer.hourly_rate * (duration / 60),
      assigned_by: 'auto',
      notes: `Auto-assigned based on specialty: ${session_specialty}`
    }, 'system');
  }

  /**
   * Get trainer schedule
   */
  async getTrainerSchedule(trainerId: string, fromDate: string, toDate: string) {
    const assignments = await prisma.$queryRaw`
      SELECT 
        id, scheduled_date, duration, status, session_specialty,
        member_id
      FROM trainer_assignments
      WHERE trainer_id = ${trainerId}::uuid
        AND scheduled_date >= ${new Date(fromDate)}::timestamptz
        AND scheduled_date <= ${new Date(toDate)}::timestamptz
        AND status IN ('scheduled', 'in_progress')
      ORDER BY scheduled_date ASC
    `;

    return assignments;
  }
}

export const assignmentService = new AssignmentService();
