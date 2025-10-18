import prisma from '../config/database';
import { ApiError } from '../middleware/errorHandler';
import { 
  CreateEnrollmentInput, 
  UpdateEnrollmentInput,
  EnrollmentQueryInput,
  MarkAttendanceInput 
} from '../validation/enrollment.validation';

export class EnrollmentService {
  /**
   * Create class enrollment
   */
  async createEnrollment(data: CreateEnrollmentInput) {
    const { class_id, member_id, enrollment_date, status } = data;

    // Verify class exists and get capacity
    const classData = await prisma.classes.findUnique({
      where: { id: class_id }
    });

    if (!classData) {
      throw new ApiError('Class not found', 404);
    }

    // Verify member exists
    const member = await prisma.members.findUnique({
      where: { id: member_id }
    });

    if (!member) {
      throw new ApiError('Member not found', 404);
    }

    // Check if already enrolled
    const existing = await prisma.$queryRaw<any[]>`
      SELECT id FROM class_enrollments
      WHERE class_id = ${class_id}::uuid 
        AND member_id = ${member_id}::uuid
        AND status IN ('enrolled', 'waitlist')
      LIMIT 1
    `;

    if (existing && existing.length > 0) {
      throw new ApiError('Member is already enrolled in this class', 400);
    }

    // Check capacity
    const enrolledCount = await prisma.$queryRaw<any[]>`
      SELECT COUNT(*)::int as count
      FROM class_enrollments
      WHERE class_id = ${class_id}::uuid AND status = 'enrolled'
    `;

    const currentEnrolled = enrolledCount[0].count;
    const isFull = classData.capacity && currentEnrolled >= classData.capacity;

    // Auto-assign to waitlist if full
    const enrollmentStatus = isFull ? 'waitlist' : (status || 'enrolled');

    // Create enrollment
    const enrollmentId = crypto.randomUUID();
    await prisma.$executeRaw`
      INSERT INTO class_enrollments (
        id, class_id, member_id, enrollment_date, status
      )
      VALUES (
        ${enrollmentId}::uuid, ${class_id}::uuid, ${member_id}::uuid,
        ${enrollment_date ? new Date(enrollment_date) : new Date()},
        ${enrollmentStatus}
      )
    `;

    return await this.getEnrollmentById(enrollmentId);
  }

  /**
   * Get enrollments with filters
   */
  async getEnrollments(query: EnrollmentQueryInput) {
    const { class_id, member_id, status, page = 1, limit = 50 } = query;

    let whereConditions: string[] = [];
    if (class_id) whereConditions.push(`ce.class_id = '${class_id}'::uuid`);
    if (member_id) whereConditions.push(`ce.member_id = '${member_id}'::uuid`);
    if (status) whereConditions.push(`ce.status = '${status}'`);

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    const offset = (page - 1) * limit;

    const [enrollments, totalResult] = await Promise.all([
      prisma.$queryRawUnsafe(`
        SELECT 
          ce.*,
          c.name as class_name,
          c.schedule as class_schedule,
          m.name as member_name,
          m.email as member_email
        FROM class_enrollments ce
        LEFT JOIN classes c ON ce.class_id = c.id
        LEFT JOIN members m ON ce.member_id = m.id
        ${whereClause}
        ORDER BY ce.enrollment_date DESC
        LIMIT ${limit} OFFSET ${offset}
      `),
      prisma.$queryRawUnsafe<any[]>(`
        SELECT COUNT(*)::int as total FROM class_enrollments ce ${whereClause}
      `)
    ]);

    return {
      data: enrollments,
      pagination: {
        page,
        limit,
        total: totalResult[0].total,
        totalPages: Math.ceil(totalResult[0].total / limit)
      }
    };
  }

  /**
   * Get enrollment by ID
   */
  async getEnrollmentById(id: string) {
    const enrollment = await prisma.$queryRaw<any[]>`
      SELECT 
        ce.*,
        c.name as class_name,
        c.schedule as class_schedule,
        c.capacity as class_capacity,
        m.name as member_name,
        m.email as member_email
      FROM class_enrollments ce
      LEFT JOIN classes c ON ce.class_id = c.id
      LEFT JOIN members m ON ce.member_id = m.id
      WHERE ce.id = ${id}::uuid
      LIMIT 1
    `;

    if (!enrollment || enrollment.length === 0) {
      throw new ApiError('Enrollment not found', 404);
    }

    return enrollment[0];
  }

  /**
   * Update enrollment
   */
  async updateEnrollment(id: string, data: UpdateEnrollmentInput) {
    await this.getEnrollmentById(id);

    const updates: string[] = [];
    if (data.status) updates.push(`status = '${data.status}'`);
    if (data.attendance_count !== undefined) updates.push(`attendance_count = ${data.attendance_count}`);
    updates.push(`updated_at = NOW()`);

    if (updates.length > 0) {
      await prisma.$executeRawUnsafe(`
        UPDATE class_enrollments 
        SET ${updates.join(', ')}
        WHERE id = '${id}'::uuid
      `);
    }

    return await this.getEnrollmentById(id);
  }

  /**
   * Cancel enrollment
   */
  async cancelEnrollment(id: string) {
    const enrollment = await this.getEnrollmentById(id);

    await prisma.$executeRaw`
      UPDATE class_enrollments
      SET status = 'cancelled', updated_at = NOW()
      WHERE id = ${id}::uuid
    `;

    // If this was an enrolled member, promote first waitlisted member
    if (enrollment.status === 'enrolled') {
      await this.promoteFromWaitlist(enrollment.class_id);
    }

    return { message: 'Enrollment cancelled successfully' };
  }

  /**
   * Mark attendance for enrolled member
   */
  async markAttendance(data: MarkAttendanceInput) {
    const { enrollment_id, attended, attendance_date, notes } = data;

    const enrollment = await this.getEnrollmentById(enrollment_id);

    if (enrollment.status !== 'enrolled') {
      throw new ApiError('Can only mark attendance for enrolled members', 400);
    }

    // Increment attendance count if attended
    if (attended) {
      await prisma.$executeRaw`
        UPDATE class_enrollments
        SET 
          attendance_count = COALESCE(attendance_count, 0) + 1,
          updated_at = NOW()
        WHERE id = ${enrollment_id}::uuid
      `;
    }

    return {
      message: 'Attendance marked successfully',
      enrollment_id,
      attended,
      date: attendance_date || new Date().toISOString()
    };
  }

  /**
   * Get class enrollment summary
   */
  async getClassEnrollmentSummary(classId: string) {
    const summary = await prisma.$queryRaw<any[]>`
      SELECT 
        c.capacity,
        COUNT(*) FILTER (WHERE ce.status = 'enrolled')::int as enrolled_count,
        COUNT(*) FILTER (WHERE ce.status = 'waitlist')::int as waitlist_count,
        COUNT(*) FILTER (WHERE ce.status = 'cancelled')::int as cancelled_count
      FROM classes c
      LEFT JOIN class_enrollments ce ON c.id = ce.class_id
      WHERE c.id = ${classId}::uuid
      GROUP BY c.id, c.capacity
    `;

    if (!summary || summary.length === 0) {
      return {
        capacity: 0,
        enrolled_count: 0,
        waitlist_count: 0,
        cancelled_count: 0,
        available_spots: 0
      };
    }

    const data = summary[0];
    return {
      ...data,
      available_spots: data.capacity ? Math.max(0, data.capacity - data.enrolled_count) : null
    };
  }

  /**
   * Helper: Promote first member from waitlist
   */
  private async promoteFromWaitlist(classId: string) {
    const waitlisted = await prisma.$queryRaw<any[]>`
      SELECT id FROM class_enrollments
      WHERE class_id = ${classId}::uuid AND status = 'waitlist'
      ORDER BY enrollment_date ASC
      LIMIT 1
    `;

    if (waitlisted && waitlisted.length > 0) {
      await prisma.$executeRaw`
        UPDATE class_enrollments
        SET status = 'enrolled', updated_at = NOW()
        WHERE id = ${waitlisted[0].id}::uuid
      `;
    }
  }
}

export const enrollmentService = new EnrollmentService();
