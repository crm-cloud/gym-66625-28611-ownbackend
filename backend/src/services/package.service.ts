import prisma from '../config/database';
import { ApiError } from '../middleware/errorHandler';
import { CreatePackageInput, UpdatePackageInput, PackageQueryInput } from '../validation/package.validation';

export class PackageService {
  /**
   * Create training package
   */
  async createPackage(data: CreatePackageInput) {
    const { member_id, trainer_id, sessions_total, validity_days, total_amount, payment_status, payment_id } = data;

    // Verify member exists
    const member = await prisma.members.findUnique({
      where: { id: member_id }
    });

    if (!member) {
      throw new ApiError('Member not found', 404);
    }

    // Verify trainer exists
    const trainer = await prisma.$queryRaw<any[]>`
      SELECT id FROM trainers WHERE id = ${trainer_id}::uuid LIMIT 1
    `;

    if (!trainer || trainer.length === 0) {
      throw new ApiError('Trainer not found', 404);
    }

    // Calculate expiry date
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + validity_days);

    // Create package
    const packageId = crypto.randomUUID();
    await prisma.$executeRaw`
      INSERT INTO training_packages (
        id, member_id, trainer_id, sessions_total, sessions_used,
        purchase_date, expiry_date, total_amount, status, payment_status, payment_id
      )
      VALUES (
        ${packageId}::uuid, ${member_id}::uuid, ${trainer_id}::uuid, ${sessions_total}, 0,
        NOW(), ${expiryDate}, ${total_amount}, 'active', ${payment_status}, ${payment_id || null}
      )
    `;

    return await this.getPackageById(packageId);
  }

  /**
   * Get packages with filters
   */
  async getPackages(query: PackageQueryInput) {
    const { member_id, trainer_id, status, payment_status, page = 1, limit = 50 } = query;

    let whereConditions: string[] = [];
    if (member_id) whereConditions.push(`tp.member_id = '${member_id}'::uuid`);
    if (trainer_id) whereConditions.push(`tp.trainer_id = '${trainer_id}'::uuid`);
    if (status) whereConditions.push(`tp.status = '${status}'`);
    if (payment_status) whereConditions.push(`tp.payment_status = '${payment_status}'`);

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    const offset = (page - 1) * limit;

    const [packages, totalResult] = await Promise.all([
      prisma.$queryRawUnsafe(`
        SELECT 
          tp.*,
          t.full_name as trainer_name,
          m.name as member_name,
          (tp.sessions_total - tp.sessions_used) as sessions_remaining
        FROM training_packages tp
        LEFT JOIN trainers t ON tp.trainer_id = t.id
        LEFT JOIN members m ON tp.member_id = m.id
        ${whereClause}
        ORDER BY tp.purchase_date DESC
        LIMIT ${limit} OFFSET ${offset}
      `),
      prisma.$queryRawUnsafe<any[]>(`
        SELECT COUNT(*)::int as total FROM training_packages tp ${whereClause}
      `)
    ]);

    return {
      data: packages,
      pagination: {
        page,
        limit,
        total: totalResult[0].total,
        totalPages: Math.ceil(totalResult[0].total / limit)
      }
    };
  }

  /**
   * Get package by ID
   */
  async getPackageById(id: string) {
    const pkg = await prisma.$queryRaw<any[]>`
      SELECT 
        tp.*,
        t.full_name as trainer_name,
        t.hourly_rate as trainer_rate,
        m.name as member_name,
        m.email as member_email,
        (tp.sessions_total - tp.sessions_used) as sessions_remaining
      FROM training_packages tp
      LEFT JOIN trainers t ON tp.trainer_id = t.id
      LEFT JOIN members m ON tp.member_id = m.id
      WHERE tp.id = ${id}::uuid
      LIMIT 1
    `;

    if (!pkg || pkg.length === 0) {
      throw new ApiError('Package not found', 404);
    }

    return pkg[0];
  }

  /**
   * Update package
   */
  async updatePackage(id: string, data: UpdatePackageInput) {
    await this.getPackageById(id);

    const updates: string[] = [];
    if (data.status) updates.push(`status = '${data.status}'`);
    if (data.payment_status) updates.push(`payment_status = '${data.payment_status}'`);
    if (data.payment_id) updates.push(`payment_id = '${data.payment_id}'`);
    updates.push(`updated_at = NOW()`);

    if (updates.length > 0) {
      await prisma.$executeRawUnsafe(`
        UPDATE training_packages 
        SET ${updates.join(', ')}
        WHERE id = '${id}'::uuid
      `);
    }

    return await this.getPackageById(id);
  }

  /**
   * Get package usage stats
   */
  async getPackageUsage(memberId: string) {
    const stats = await prisma.$queryRaw`
      SELECT 
        COUNT(*)::int as total_packages,
        SUM(sessions_total)::int as total_sessions_purchased,
        SUM(sessions_used)::int as total_sessions_used,
        SUM(sessions_total - sessions_used)::int as total_sessions_remaining,
        SUM(total_amount)::decimal as total_spent
      FROM training_packages
      WHERE member_id = ${memberId}::uuid
    `;

    return stats;
  }
}

export const packageService = new PackageService();
